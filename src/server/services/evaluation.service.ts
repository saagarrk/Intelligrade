import { db, SubmissionEntity, UserEntity } from '../database/inMemoryDb';
import { auditRepository } from '../repositories/audit.repository';
import { examRepository } from '../repositories/exam.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../common/errors';
import {
  EvaluationResponseDto,
  EvaluationStatusType,
  UpdateTeacherEvaluationDto,
  AcceptAiSuggestionDto,
  ModifyMarksDto,
  FinalizeEvaluationDto
} from '../dtos/evaluation.dto';

/**
 * Normalizes internal status to strictly one of the 3 required states:
 * - AI_SUGGESTED
 * - TEACHER_REVIEWED
 * - FINALIZED
 */
export function normalizeEvaluationStatus(rawStatus: string | undefined, isTeacherReviewed?: boolean, finalMarks?: number | null): EvaluationStatusType {
  if (!rawStatus) {
    if (finalMarks !== null && finalMarks !== undefined) return 'FINALIZED';
    if (isTeacherReviewed) return 'TEACHER_REVIEWED';
    return 'AI_SUGGESTED';
  }

  const s = rawStatus.toUpperCase().trim();
  if (s === 'FINALIZED' || s === 'TEACHER_FINALIZED' || s === 'COMPLETED') {
    return 'FINALIZED';
  }
  if (s === 'TEACHER_REVIEWED' || s === 'REVIEWED' || s === 'MODIFIED') {
    return 'TEACHER_REVIEWED';
  }
  if (s === 'AI_SUGGESTED' || s === 'PENDING_TEACHER_REVIEW' || s === 'UNDER_REVIEW' || s === 'SUGGESTED') {
    return isTeacherReviewed ? 'TEACHER_REVIEWED' : 'AI_SUGGESTED';
  }

  return isTeacherReviewed ? 'TEACHER_REVIEWED' : 'AI_SUGGESTED';
}

interface FoundEvaluationLocation {
  submission: SubmissionEntity;
  evaluation: any;
  evalIndex: number;
}

export class EvaluationService {
  /**
   * Helper to locate an evaluation either by:
   * 1. Evaluation ID (e.g., eval_xxx)
   * 2. Question ID (e.g., q1, q_os_01)
   * 3. Question Number
   * 4. Submission ID (returns first evaluation or matches question param)
   */
  private findEvaluation(identifier: string, questionNumber?: number): FoundEvaluationLocation {
    const submissions = db.getAllSubmissions();

    // 1. Try finding by direct evaluation ID or questionId in any submission
    for (const sub of submissions) {
      const evals = sub.evaluations || (sub as any).questionEvaluations || [];
      for (let i = 0; i < evals.length; i++) {
        const ev = evals[i];
        if (ev.id === identifier || ev.evaluationId === identifier || ev.questionId === identifier) {
          return { submission: sub, evaluation: ev, evalIndex: i };
        }
      }
    }

    // 2. Try finding by submission ID
    const subById = db.getSubmissionById(identifier);
    if (subById) {
      const evals = subById.evaluations || (subById as any).questionEvaluations || [];
      if (evals.length > 0) {
        if (questionNumber !== undefined && questionNumber !== null) {
          const idx = evals.findIndex((e: any) => e.questionNumber === questionNumber);
          if (idx !== -1) {
            return { submission: subById, evaluation: evals[idx], evalIndex: idx };
          }
        }
        return { submission: subById, evaluation: evals[0], evalIndex: 0 };
      }
    }

    throw new NotFoundError(`Evaluation with identifier '${identifier}' not found.`);
  }

  /**
   * Transforms raw internal evaluation into standardized EvaluationResponseDto
   */
  public toEvaluationResponseDto(ev: any, sub: SubmissionEntity): EvaluationResponseDto {
    const status = normalizeEvaluationStatus(ev.evaluationStatus, ev.isReviewedByTeacher || ev.isTeacherReviewed, ev.finalMarks);
    const maxMarks = ev.maxMarks ?? 10;
    const aiMarks = ev.aiSuggestedMarks ?? ev.awardedMarks ?? 0;
    const teacherMarks = ev.teacherAdjustedMarks !== undefined ? ev.teacherAdjustedMarks : null;
    const finalMarks = ev.finalMarks !== undefined ? ev.finalMarks : (status === 'FINALIZED' ? (teacherMarks ?? aiMarks) : null);

    return {
      id: ev.id || ev.evaluationId || `eval_${sub.id}_${ev.questionNumber || ev.questionId || '1'}`,
      submissionId: sub.id,
      questionId: ev.questionId || `q_${ev.questionNumber || 1}`,
      questionNumber: ev.questionNumber ?? 1,
      questionText: ev.questionText || `Question ${ev.questionNumber || 1}`,
      studentAnswer: ev.studentAnswer || ev.studentAnswerText || 'No student answer recorded.',
      modelAnswer: ev.modelAnswer || ev.modelAnswerText || '',
      maxMarks,
      aiSuggestedMarks: Number(aiMarks),
      aiConfidence: ev.confidenceScore !== undefined ? (ev.confidenceScore > 1 ? ev.confidenceScore / 100 : ev.confidenceScore) : 0.92,
      aiFeedback: ev.evaluationFeedback || ev.feedback || 'Automated AI evaluation completed based on rubric keywords.',
      semanticSimilarityScore: ev.semanticSimilarityScore ?? 85,
      teacherAdjustedMarks: teacherMarks !== null ? Number(teacherMarks) : null,
      finalMarks: finalMarks !== null ? Number(finalMarks) : null,
      evaluationStatus: status,
      isTeacherReviewed: status === 'TEACHER_REVIEWED' || status === 'FINALIZED' || Boolean(ev.isTeacherReviewed || ev.isReviewedByTeacher),
      reviewedBy: ev.teacherReviewedBy || ev.reviewedBy || null,
      teacherNotes: ev.teacherNotes || ev.teacherComment || null,
      teacherComment: ev.teacherComment || null,
      finalizedAt: ev.finalizedAt || (status === 'FINALIZED' ? ev.teacherReviewedAt || ev.updatedTimestamp : null),
      finalizedBy: ev.finalizedBy || (status === 'FINALIZED' ? ev.teacherReviewedBy || ev.reviewedBy : null),
      createdTimestamp: ev.createdTimestamp || sub.submittedAt || new Date().toISOString(),
      updatedTimestamp: ev.updatedTimestamp || new Date().toISOString(),
      criteria: ev.rubricBreakdown || ev.conceptMatches || ev.criteria || [],
      feedbacks: ev.feedbacks || [],
      strengths: ev.strengths || [],
      weaknesses: ev.weaknesses || [],
      deductions: ev.deductions || []
    };
  }

  /**
   * Recalculates total score, percentage, and grade for the parent submission
   */
  private recalculateSubmissionScores(sub: SubmissionEntity): void {
    const evals = sub.evaluations || (sub as any).questionEvaluations || [];
    if (evals.length === 0) return;

    let totalMarks = 0;
    let maxMarks = 0;
    let allFinalized = true;

    for (const ev of evals) {
      const qMax = ev.maxMarks || 10;
      maxMarks += qMax;

      const normStatus = normalizeEvaluationStatus(ev.evaluationStatus, ev.isReviewedByTeacher || ev.isTeacherReviewed, ev.finalMarks);
      if (normStatus !== 'FINALIZED') {
        allFinalized = false;
      }

      const mark = ev.finalMarks !== null && ev.finalMarks !== undefined
        ? ev.finalMarks
        : (ev.teacherAdjustedMarks !== null && ev.teacherAdjustedMarks !== undefined
          ? ev.teacherAdjustedMarks
          : (ev.aiSuggestedMarks || 0));

      totalMarks += Number(mark);
    }

    sub.totalScore = Number(totalMarks.toFixed(1));
    sub.maxScore = maxMarks;
    sub.percentageScore = maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(1)) : 0;
    const pct = sub.percentageScore;
    sub.gradeAwarded = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';

    if (allFinalized) {
      sub.status = 'COMPLETED';
      (sub as any).pipelineStatus = 'FINALIZED';
      (sub as any).evaluationStatus = 'FINALIZED';
    } else {
      (sub as any).evaluationStatus = 'TEACHER_REVIEWED';
    }

    db.saveSubmission(sub);
  }

  /**
   * GET evaluation
   * - Students can only access their own submissions/evaluations.
   * - Teachers/Admins can view any evaluation.
   */
  async getEvaluation(identifier: string, currentUser?: UserEntity, questionNumber?: number): Promise<EvaluationResponseDto> {
    const { submission, evaluation } = this.findEvaluation(identifier, questionNumber);

    // IDOR protection: Students cannot view other students' evaluations
    if (currentUser && currentUser.role === 'student') {
      const isOwner =
        (currentUser.id && submission.studentId === currentUser.id) ||
        (currentUser.rollNumber && submission.studentRollNo?.toLowerCase() === currentUser.rollNumber.toLowerCase()) ||
        (currentUser.name && submission.studentName?.toLowerCase() === currentUser.name.toLowerCase());

      if (!isOwner) {
        throw new ForbiddenError('Access denied: You are not authorized to view evaluation results for other students.');
      }
    }

    return this.toEvaluationResponseDto(evaluation, submission);
  }

  /**
   * GET all evaluations for a submission
   */
  async getEvaluationsForSubmission(submissionId: string, currentUser?: UserEntity): Promise<EvaluationResponseDto[]> {
    const sub = db.getSubmissionById(submissionId);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${submissionId}' not found.`);
    }

    if (currentUser && currentUser.role === 'student') {
      const isOwner =
        (currentUser.id && sub.studentId === currentUser.id) ||
        (currentUser.rollNumber && sub.studentRollNo?.toLowerCase() === currentUser.rollNumber.toLowerCase()) ||
        (currentUser.name && sub.studentName?.toLowerCase() === currentUser.name.toLowerCase());

      if (!isOwner) {
        throw new ForbiddenError('Access denied: You are not authorized to view evaluation results for other students.');
      }
    }

    const evals = sub.evaluations || (sub as any).questionEvaluations || [];
    return evals.map((ev: any) => this.toEvaluationResponseDto(ev, sub));
  }

  /**
   * PUT/update teacher evaluation
   * Mandatory: Students can NEVER modify evaluation results.
   * Only authorized teachers/admins.
   */
  async updateTeacherEvaluation(
    identifier: string,
    payload: UpdateTeacherEvaluationDto,
    actor?: UserEntity,
    questionNumber?: number
  ): Promise<EvaluationResponseDto> {
    // Strict Role Enforcement
    if (!actor || actor.role === 'student') {
      throw new ForbiddenError('Access denied: Students are strictly prohibited from reviewing or modifying evaluation results.');
    }

    const { submission, evaluation, evalIndex } = this.findEvaluation(identifier, questionNumber);

    // If already finalized, block unless admin
    const currentStatus = normalizeEvaluationStatus(evaluation.evaluationStatus, evaluation.isTeacherReviewed, evaluation.finalMarks);
    if (currentStatus === 'FINALIZED' && actor.role !== 'admin') {
      throw new BadRequestError('This evaluation has already been FINALIZED and locked against standard modification.');
    }

    const maxMarks = evaluation.maxMarks || 10;
    const rawMarks = payload.teacherAdjustedMarks !== undefined ? payload.teacherAdjustedMarks : payload.awardedMarks;

    if (rawMarks !== undefined && rawMarks !== null) {
      if (rawMarks < 0 || rawMarks > maxMarks) {
        throw new BadRequestError(`Teacher adjusted marks (${rawMarks}) must be between 0 and maximum marks (${maxMarks}).`);
      }
      evaluation.teacherAdjustedMarks = Number(rawMarks);
      evaluation.awardedMarks = Number(rawMarks);
    }

    if (payload.teacherComment !== undefined) {
      evaluation.teacherComment = payload.teacherComment;
    }
    if (payload.teacherNotes !== undefined) {
      evaluation.teacherNotes = payload.teacherNotes;
    }
    if (payload.feedback !== undefined) {
      evaluation.evaluationFeedback = payload.feedback;
      evaluation.feedback = payload.feedback;
    }

    // Set distinguished status
    evaluation.evaluationStatus = 'TEACHER_REVIEWED';
    evaluation.isTeacherReviewed = true;
    evaluation.isReviewedByTeacher = true;
    evaluation.teacherReviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.reviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.teacherReviewedAt = new Date().toISOString();
    evaluation.updatedTimestamp = new Date().toISOString();

    // Persist changes
    const evals = submission.evaluations || (submission as any).questionEvaluations || [];
    evals[evalIndex] = evaluation;
    submission.evaluations = evals;
    (submission as any).questionEvaluations = evals;
    (submission as any).evaluationStatus = 'TEACHER_REVIEWED';
    db.saveSubmission(submission);

    this.recalculateSubmissionScores(submission);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actor.email,
      userRole: actor.role,
      action: 'TEACHER_UPDATE_EVALUATION',
      resource: `Evaluation: Q${evaluation.questionNumber || evaluation.questionId} for ${submission.studentName}`,
      status: 'Success',
      details: { adjustedMarks: evaluation.teacherAdjustedMarks, comment: evaluation.teacherComment }
    });

    return this.toEvaluationResponseDto(evaluation, submission);
  }

  /**
   * POST accept AI suggestion
   * One-click accepts AI marks, transitions status to TEACHER_REVIEWED.
   * Only authorized teachers/admins.
   */
  async acceptAiSuggestion(
    identifier: string,
    payload: AcceptAiSuggestionDto = {},
    actor?: UserEntity,
    questionNumber?: number
  ): Promise<EvaluationResponseDto> {
    // Strict Role Enforcement
    if (!actor || actor.role === 'student') {
      throw new ForbiddenError('Access denied: Students are strictly prohibited from reviewing or accepting evaluation suggestions.');
    }

    const { submission, evaluation, evalIndex } = this.findEvaluation(identifier, questionNumber);

    const currentStatus = normalizeEvaluationStatus(evaluation.evaluationStatus, evaluation.isTeacherReviewed, evaluation.finalMarks);
    if (currentStatus === 'FINALIZED' && actor.role !== 'admin') {
      throw new BadRequestError('This evaluation has already been FINALIZED and locked.');
    }

    const aiMarks = evaluation.aiSuggestedMarks !== undefined && evaluation.aiSuggestedMarks !== null
      ? Number(evaluation.aiSuggestedMarks)
      : (evaluation.awardedMarks || 0);

    // Accept AI suggestion: copy AI marks into teacher adjusted marks
    evaluation.teacherAdjustedMarks = aiMarks;
    evaluation.awardedMarks = aiMarks;
    evaluation.evaluationStatus = 'TEACHER_REVIEWED';
    evaluation.isTeacherReviewed = true;
    evaluation.isReviewedByTeacher = true;
    evaluation.teacherComment = payload.teacherComment || 'Accepted AI suggested marks after instructor review.';
    evaluation.teacherNotes = payload.teacherNotes || 'AI suggestion accepted.';
    evaluation.teacherReviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.reviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.teacherReviewedAt = new Date().toISOString();
    evaluation.updatedTimestamp = new Date().toISOString();

    const evals = submission.evaluations || (submission as any).questionEvaluations || [];
    evals[evalIndex] = evaluation;
    submission.evaluations = evals;
    (submission as any).questionEvaluations = evals;
    (submission as any).evaluationStatus = 'TEACHER_REVIEWED';
    db.saveSubmission(submission);

    this.recalculateSubmissionScores(submission);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actor.email,
      userRole: actor.role,
      action: 'TEACHER_ACCEPT_AI_SUGGESTION',
      resource: `Evaluation: Q${evaluation.questionNumber || evaluation.questionId} for ${submission.studentName}`,
      status: 'Success',
      details: { acceptedMarks: aiMarks }
    });

    return this.toEvaluationResponseDto(evaluation, submission);
  }

  /**
   * POST modify marks
   * Adjusts marks for a question, transitions status to TEACHER_REVIEWED.
   * Only authorized teachers/admins.
   */
  async modifyMarks(
    identifier: string,
    payload: ModifyMarksDto,
    actor?: UserEntity,
    questionNumber?: number
  ): Promise<EvaluationResponseDto> {
    // Strict Role Enforcement
    if (!actor || actor.role === 'student') {
      throw new ForbiddenError('Access denied: Students are strictly prohibited from modifying evaluation marks.');
    }

    const { submission, evaluation, evalIndex } = this.findEvaluation(identifier, questionNumber);

    const currentStatus = normalizeEvaluationStatus(evaluation.evaluationStatus, evaluation.isTeacherReviewed, evaluation.finalMarks);
    if (currentStatus === 'FINALIZED' && actor.role !== 'admin') {
      throw new BadRequestError('This evaluation has already been FINALIZED and locked.');
    }

    const maxMarks = evaluation.maxMarks || 10;
    const targetMarks = payload.marks !== undefined
      ? payload.marks
      : (payload.awardedMarks !== undefined ? payload.awardedMarks : payload.teacherAdjustedMarks);

    if (targetMarks === undefined || targetMarks === null || isNaN(targetMarks)) {
      throw new BadRequestError('New marks value must be provided.');
    }

    if (targetMarks < 0 || targetMarks > maxMarks) {
      throw new BadRequestError(`Marks (${targetMarks}) must be between 0 and maximum marks (${maxMarks}).`);
    }

    const boundedMarks = Number(targetMarks.toFixed(1));
    evaluation.teacherAdjustedMarks = boundedMarks;
    evaluation.awardedMarks = boundedMarks;
    evaluation.teacherOverrideMarks = boundedMarks;
    evaluation.evaluationStatus = 'TEACHER_REVIEWED';
    evaluation.isTeacherReviewed = true;
    evaluation.isReviewedByTeacher = true;
    evaluation.teacherComment = payload.teacherComment || payload.reason || 'Marks adjusted during teacher review.';
    evaluation.teacherNotes = payload.teacherNotes || payload.reason || '';
    evaluation.teacherReviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.reviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.teacherReviewedAt = new Date().toISOString();
    evaluation.updatedTimestamp = new Date().toISOString();

    const evals = submission.evaluations || (submission as any).questionEvaluations || [];
    evals[evalIndex] = evaluation;
    submission.evaluations = evals;
    (submission as any).questionEvaluations = evals;
    (submission as any).evaluationStatus = 'TEACHER_REVIEWED';
    db.saveSubmission(submission);

    this.recalculateSubmissionScores(submission);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actor.email,
      userRole: actor.role,
      action: 'TEACHER_MODIFY_MARKS',
      resource: `Evaluation: Q${evaluation.questionNumber || evaluation.questionId} for ${submission.studentName}`,
      status: 'Success',
      details: { modifiedMarks: boundedMarks, reason: payload.reason }
    });

    return this.toEvaluationResponseDto(evaluation, submission);
  }

  /**
   * POST finalize evaluation
   * Sets official finalMarks and locks status to FINALIZED.
   * Only authorized teachers/admins.
   */
  async finalizeEvaluation(
    identifier: string,
    payload: FinalizeEvaluationDto = {},
    actor?: UserEntity,
    questionNumber?: number
  ): Promise<EvaluationResponseDto> {
    // Strict Role Enforcement
    if (!actor || actor.role === 'student') {
      throw new ForbiddenError('Access denied: Students are strictly prohibited from finalizing evaluations. Only authorized teachers and administrators can finalize evaluations.');
    }

    const { submission, evaluation, evalIndex } = this.findEvaluation(identifier, questionNumber);

    const maxMarks = evaluation.maxMarks || 10;
    let chosenFinal = payload.finalMarks;

    if (chosenFinal === undefined || chosenFinal === null) {
      if (evaluation.teacherAdjustedMarks !== null && evaluation.teacherAdjustedMarks !== undefined) {
        chosenFinal = evaluation.teacherAdjustedMarks;
      } else if (evaluation.aiSuggestedMarks !== null && evaluation.aiSuggestedMarks !== undefined) {
        chosenFinal = evaluation.aiSuggestedMarks;
      } else {
        chosenFinal = evaluation.awardedMarks ?? 0;
      }
    }

    if (chosenFinal < 0 || chosenFinal > maxMarks) {
      throw new BadRequestError(`Final marks (${chosenFinal}) must be between 0 and maximum marks (${maxMarks}).`);
    }

    const finalMarksBounded = Number(chosenFinal.toFixed(1));
    evaluation.finalMarks = finalMarksBounded;
    evaluation.awardedMarks = finalMarksBounded;
    evaluation.teacherAdjustedMarks = finalMarksBounded;
    evaluation.evaluationStatus = 'FINALIZED';
    evaluation.isTeacherReviewed = true;
    evaluation.isReviewedByTeacher = true;
    evaluation.finalizedAt = new Date().toISOString();
    evaluation.finalizedBy = payload.finalizedBy || actor.name || actor.email || 'Teacher';
    evaluation.teacherReviewedBy = actor.name || actor.email || 'Teacher';
    evaluation.reviewedBy = actor.name || actor.email || 'Teacher';
    if (payload.teacherComment) {
      evaluation.teacherComment = payload.teacherComment;
    }
    if (payload.teacherNotes) {
      evaluation.teacherNotes = payload.teacherNotes;
    }
    evaluation.updatedTimestamp = new Date().toISOString();

    const evals = submission.evaluations || (submission as any).questionEvaluations || [];
    evals[evalIndex] = evaluation;
    submission.evaluations = evals;
    (submission as any).questionEvaluations = evals;
    db.saveSubmission(submission);

    this.recalculateSubmissionScores(submission);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actor.email,
      userRole: actor.role,
      action: 'TEACHER_FINALIZE_EVALUATION',
      resource: `Evaluation: Q${evaluation.questionNumber || evaluation.questionId} for ${submission.studentName}`,
      status: 'Success',
      details: { finalMarks: finalMarksBounded, status: 'FINALIZED' }
    });

    return this.toEvaluationResponseDto(evaluation, submission);
  }
}

export const evaluationService = new EvaluationService();
