import { submissionRepository, SubmissionFilters } from '../repositories/submission.repository';
import { examRepository } from '../repositories/exam.repository';
import { auditRepository } from '../repositories/audit.repository';
import { db, SubmissionEntity, ExamEntity, SecureFileRecord, UserEntity } from '../database/inMemoryDb';
import {
  SubmissionResponseDto,
  toSubmissionResponseDto,
  GradeOverrideDto
} from '../dtos/submission.dto';
import { PaginationParams, PaginatedResult } from '../common/pagination';
import { NotFoundError, BadRequestError, ForbiddenError } from '../common/errors';
import { executeStructuredPipeline, createInitialPipelineExecution } from '../../backend/handwrittenPipelineEngine';
import { getGenAIClient } from '../../backend/geminiOcrService';

export class SubmissionService {
  async getSubmissions(
    filters: SubmissionFilters,
    pagination?: PaginationParams,
    currentUser?: UserEntity
  ): Promise<PaginatedResult<SubmissionResponseDto> | SubmissionResponseDto[]> {
    // Role-based Access Control: Enforce data isolation for students
    if (currentUser && currentUser.role === 'student') {
      if (currentUser.rollNumber) {
        filters.studentRollNo = currentUser.rollNumber;
      } else if (currentUser.id) {
        filters.studentId = currentUser.id;
      } else {
        filters.studentName = currentUser.name;
      }
    }

    const exams = await examRepository.findAll({}) as ExamEntity[];
    const examMap = new Map<string, ExamEntity>(exams.map(e => [e.id, e]));

    if (!pagination) {
      const subs = await submissionRepository.findAll(filters) as SubmissionEntity[];
      return subs.map(sub => toSubmissionResponseDto(sub, examMap.get(sub.examId)));
    }

    const res = await submissionRepository.findAll(filters, pagination) as PaginatedResult<SubmissionEntity>;
    return {
      items: res.items.map(sub => toSubmissionResponseDto(sub, examMap.get(sub.examId))),
      meta: res.meta
    };
  }

  async getSubmissionById(id: string, currentUser?: UserEntity): Promise<SubmissionResponseDto & { pages: any[]; evaluations: any[] }> {
    const sub = await submissionRepository.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${id}' not found.`);
    }

    // Role-based Access Control / IDOR defense
    if (currentUser && currentUser.role === 'student') {
      const isOwner =
        (currentUser.id && sub.studentId === currentUser.id) ||
        (currentUser.rollNumber && sub.studentRollNo?.toLowerCase() === currentUser.rollNumber.toLowerCase()) ||
        (currentUser.name && sub.studentName?.toLowerCase() === currentUser.name.toLowerCase());

      if (!isOwner) {
        throw new ForbiddenError('Access denied: You are not authorized to view this student submission.');
      }
    }

    const exam = await examRepository.findById(sub.examId);
    const dto = toSubmissionResponseDto(sub, exam || undefined);

    return {
      ...dto,
      pages: sub.pages || [],
      evaluations: sub.evaluations || []
    };
  }

  async updateStatus(id: string, status: any, actorEmail: string): Promise<SubmissionResponseDto> {
    const sub = await submissionRepository.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${id}' not found.`);
    }

    const updated = await submissionRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundError(`Failed to update status for submission '${id}'.`);
    }

    const exam = await examRepository.findById(sub.examId);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_UPDATE_SUBMISSION_STATUS',
      resource: `Submission: ${sub.studentName} -> ${status}`,
      status: 'Success'
    });

    return toSubmissionResponseDto(updated, exam || undefined);
  }

  async reevaluate(id: string, actorEmail: string): Promise<SubmissionResponseDto> {
    const sub = await submissionRepository.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${id}' not found.`);
    }

    // Schedule official re-evaluation
    const updated = await submissionRepository.update(id, {
      status: 'UNDER_REVIEW',
      isFlagged: true
    });

    const exam = await examRepository.findById(sub.examId);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_REEVALUATE_PAPER',
      resource: `Submission: ${sub.studentName} (${sub.studentRollNo})`,
      status: 'Success'
    });

    return toSubmissionResponseDto(updated || sub, exam || undefined);
  }

  async overrideScore(id: string, dto: GradeOverrideDto, actorEmail: string): Promise<SubmissionResponseDto> {
    const sub = await submissionRepository.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${id}' not found.`);
    }

    const maxScore = sub.maxScore || 100;
    const percentage = Number(((dto.awardedMarks / maxScore) * 100).toFixed(1));
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'F';

    const updated = await submissionRepository.update(id, {
      totalScore: dto.awardedMarks,
      percentageScore: percentage,
      gradeAwarded: grade,
      status: 'COMPLETED'
    });

    const exam = await examRepository.findById(sub.examId);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'teacher',
      action: 'TEACHER_GRADE_OVERRIDE',
      resource: `Submission: ${sub.studentName} Marks: ${dto.awardedMarks}/${maxScore} (${dto.rationale})`,
      status: 'Success'
    });

    return toSubmissionResponseDto(updated || sub, exam || undefined);
  }

  async deleteSubmission(id: string, actorEmail: string): Promise<void> {
    const sub = await submissionRepository.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with id '${id}' not found.`);
    }

    await submissionRepository.delete(id);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_DELETE_SUBMISSION',
      resource: `Submission: ${sub.studentName} (${sub.studentRollNo})`,
      status: 'Success'
    });
  }

  async createSubmission(payload: any, actorEmail: string, currentUser?: UserEntity): Promise<SubmissionResponseDto> {
    const exam = await examRepository.findById(payload.examId);
    if (!exam) {
      throw new BadRequestError(`Referenced exam '${payload.examId}' does not exist.`);
    }

    // Role-aware identity binding and mass-assignment prevention
    const studentName = currentUser?.role === 'student' ? currentUser.name : (payload.studentName || 'Student');
    const studentRollNo = currentUser?.role === 'student'
      ? (currentUser.rollNumber || payload.studentRollNo || `CS-2026-${Math.floor(100 + Math.random() * 900)}`)
      : (payload.studentRollNo || payload.studentRollNumber || `CS-2026-${Math.floor(100 + Math.random() * 900)}`);
    const studentId = currentUser?.role === 'student' ? currentUser.id : payload.studentId;

    const newSub: SubmissionEntity = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId: payload.examId,
      studentId,
      studentName,
      studentRollNo,
      submittedAt: new Date().toISOString(),
      status: 'UPLOADED',
      maxScore: exam.totalMarks || 100,
      totalScore: 0,
      percentageScore: 0,
      gradeAwarded: 'Pending',
      isFlagged: false,
      pages: Array.isArray(payload.pages)
        ? payload.pages.map((p: any, idx: number) => ({
            pageNumber: p.pageNumber || idx + 1,
            dataUrl: p.dataUrl || p.imageUrl,
            imageUrl: p.imageUrl || p.dataUrl,
            ocrText: p.ocrText
          }))
        : []
    };

    const created = await submissionRepository.create(newSub);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: currentUser?.role || 'student',
      action: 'STUDENT_SUBMIT_EXAM',
      resource: `Submission: ${created.id} for Exam ${exam.title}`,
      status: 'Success'
    });

    return toSubmissionResponseDto(created, exam);
  }

  async checkDuplicate(examId: string, studentRollNumber: string): Promise<{ hasDuplicate: boolean; existingSubmission: any }> {
    if (!examId || !studentRollNumber) {
      return { hasDuplicate: false, existingSubmission: null };
    }
    const cleanRoll = studentRollNumber.toLowerCase().trim();
    const all = await submissionRepository.findAll({ examId });
    const list = Array.isArray(all) ? all : all.items;
    const found = list.find(s => s.studentRollNo && s.studentRollNo.toLowerCase().trim() === cleanRoll);
    if (found) {
      const exam = await examRepository.findById(examId);
      return {
        hasDuplicate: true,
        existingSubmission: toSubmissionResponseDto(found, exam || undefined)
      };
    }
    return {
      hasDuplicate: false,
      existingSubmission: null
    };
  }

  async processPipeline(id: string, options: { forceOcrFailure?: boolean; simulateBlur?: boolean; simulateBlankPage?: boolean } = {}, actorEmail: string) {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError(`Submission with id '${id}' not found`);
    }

    const exam = (await examRepository.findById(submission.examId)) || (await examRepository.findAll({}))[0];
    const ai = getGenAIClient();

    const result = await executeStructuredPipeline(submission as any, exam as any, {
      forceOcrFailure: options.forceOcrFailure === true,
      simulateBlur: options.simulateBlur === true,
      simulateBlankPage: options.simulateBlankPage === true,
      targetExam: exam as any,
      client: ai
    });

    await submissionRepository.update(id, result.submission as any);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'system',
      action: result.success ? 'PIPELINE_COMPLETED' : 'PIPELINE_FAILED',
      resource: `Submission: ${submission.id} [${result.pipelineExecution.overallStatus}]`,
      status: result.success ? 'Success' : 'Failure',
      details: { stage: result.pipelineExecution.currentStage }
    });

    return {
      success: result.success,
      overallStatus: result.pipelineExecution.overallStatus,
      pipelineExecution: result.pipelineExecution,
      submission: result.submission,
      message: result.success
        ? `Pipeline completed successfully with ${result.pipelineExecution.averageOcrConfidence}% average OCR confidence.`
        : `Pipeline failed at stage '${result.pipelineExecution.currentStage}'. ${result.pipelineExecution.error?.message}`
    };
  }

  async getPipeline(id: string) {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundError(`Submission with id '${id}' not found`);
    }

    const exam = (await examRepository.findById(submission.examId)) || (await examRepository.findAll({}))[0];
    const pipeline = (submission as any).pipelineExecution || createInitialPipelineExecution(submission as any, exam as any);

    return {
      submissionId: submission.id,
      studentRollNumber: submission.studentRollNo,
      studentName: submission.studentName,
      status: submission.status,
      processingStatus: (submission as any).processingStatus || (submission.status === 'UPLOADED' ? 'WAITING' : submission.status === 'COMPLETED' ? 'COMPLETED' : 'PROCESSING'),
      pipeline,
      originalFile: pipeline.originalFile,
      pages: pipeline.pages,
      ocrConfidence: pipeline.averageOcrConfidence,
      detectedQuestions: pipeline.detectedQuestions,
      segmentedAnswers: pipeline.segmentedAnswers,
      questionMappings: pipeline.questionMappings,
      error: pipeline.error || null
    };
  }

  async retryPipeline(id: string, actorEmail: string) {
    return this.processPipeline(id, { forceOcrFailure: false, simulateBlur: false, simulateBlankPage: false }, actorEmail);
  }

  async testOcrFailure(id: string, failureType: string, actorEmail: string) {
    return this.processPipeline(id, {
      forceOcrFailure: failureType === 'unreadable',
      simulateBlur: failureType === 'blur',
      simulateBlankPage: failureType === 'blank'
    }, actorEmail);
  }

  async batchProcessPending(actorEmail: string) {
    const all = await submissionRepository.findAll({});
    const pending = (Array.isArray(all) ? all : all.items).filter(s => s.status === 'UPLOADED' || (s as any).status === 'WAITING');
    const results = [];

    for (const sub of pending) {
      const resExec = await this.processPipeline(sub.id, {}, actorEmail);
      results.push({
        submissionId: sub.id,
        rollNumber: sub.studentRollNo,
        status: resExec.overallStatus,
        durationMs: resExec.pipelineExecution?.durationMs || 0
      });
    }

    return {
      processedCount: results.length,
      results
    };
  }

  getSecureFilePage(fileId: string, pageNumber: number, currentUser?: UserEntity) {
    const record = submissionRepository.getSecureFile(fileId);
    if (!record) {
      throw new NotFoundError('Secure document not found.');
    }

    if (currentUser && currentUser.role === 'student') {
      const allSubs = db.getAllSubmissions();
      const associatedSub = allSubs.find(s =>
        (s as any).fileId === fileId ||
        s.pages?.some(p => p.imageUrl?.includes(fileId) || p.dataUrl?.includes(fileId))
      );
      if (associatedSub) {
        const isOwner =
          associatedSub.studentId === currentUser.id ||
          associatedSub.studentRollNo?.toLowerCase() === currentUser.rollNumber?.toLowerCase() ||
          associatedSub.studentName?.toLowerCase() === currentUser.name?.toLowerCase();
        if (!isOwner) {
          throw new ForbiddenError('Access denied: You do not have permission to view this document.');
        }
      }
    }

    const page = record.pages.find(p => p.pageNumber === pageNumber) || record.pages[0];
    if (!page || !page.dataUrl) {
      throw new NotFoundError(`Page ${pageNumber} not found in document.`);
    }

    return page;
  }

  getSecureFileMetadata(fileId: string, currentUser?: UserEntity) {
    const record = submissionRepository.getSecureFile(fileId);
    if (!record) {
      throw new NotFoundError('Document not found.');
    }

    if (currentUser && currentUser.role === 'student') {
      const allSubs = db.getAllSubmissions();
      const associatedSub = allSubs.find(s =>
        (s as any).fileId === fileId ||
        s.pages?.some(p => p.imageUrl?.includes(fileId) || p.dataUrl?.includes(fileId))
      );
      if (associatedSub) {
        const isOwner =
          associatedSub.studentId === currentUser.id ||
          associatedSub.studentRollNo?.toLowerCase() === currentUser.rollNumber?.toLowerCase() ||
          associatedSub.studentName?.toLowerCase() === currentUser.name?.toLowerCase();
        if (!isOwner) {
          throw new ForbiddenError('Access denied: You do not have permission to access document metadata.');
        }
      }
    }

    return {
      fileId: record.fileId,
      originalFileName: record.originalFileName,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      pageCount: record.pageCount,
      createdAt: record.createdAt,
      pageUrls: record.pages.map(p => `/api/v1/submissions/files/${record.fileId}/pages/${p.pageNumber}`)
    };
  }
}

export const submissionService = new SubmissionService();
