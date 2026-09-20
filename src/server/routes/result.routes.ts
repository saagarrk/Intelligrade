import { Router, Request, Response, NextFunction } from 'express';
import { submissionRepository } from '../repositories/submission.repository';
import { examRepository } from '../repositories/exam.repository';
import { SubmissionEntity } from '../database/inMemoryDb';
import { ApiResponse } from '../common/apiResponse';
import { NotFoundError, ForbiddenError } from '../common/errors';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

/**
 * Result APIs:
 * Dedicated endpoints for retrieving student marks, question-level scores,
 * grade breakdowns, and institutional class score distribution summaries.
 */

/**
 * GET /api/v1/results/student/:studentRollNo
 * Retrieve all exam results for a specific student
 * Protected: Students can only view their own roll number; Teachers and Admins can view any.
 */
router.get('/student/:studentRollNo', requireAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentRollNo } = req.params;
    const currentUser = req.user;

    // Student authorization check
    if (currentUser?.role === 'student' && currentUser.rollNumber && currentUser.rollNumber !== studentRollNo) {
      throw new ForbiddenError(`Access denied: You are only authorized to view your own exam results.`);
    }

    const rawSubmissions = await submissionRepository.findAll({ studentRollNo });
    const submissions: SubmissionEntity[] = Array.isArray(rawSubmissions) ? rawSubmissions : rawSubmissions.items;
    const results = submissions.map((sub: SubmissionEntity) => ({
      submissionId: sub.id,
      examId: sub.examId,
      examTitle: sub.examTitle,
      courseCode: sub.courseCode,
      studentRollNo: sub.studentRollNo,
      studentName: sub.studentName,
      status: sub.status,
      totalScore: sub.totalScore,
      maxMarks: sub.maxMarks,
      percentageScore: sub.percentageScore,
      gradeAwarded: sub.gradeAwarded,
      isFlagged: sub.isFlagged,
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt,
      evaluations: (sub.evaluations || []).map((e: any) => ({
        questionId: e.questionId,
        questionNumber: e.questionNumber,
        awardedMarks: e.teacherAdjustedMarks !== undefined ? e.teacherAdjustedMarks : (e.awardedMarks || 0),
        maxMarks: e.maxMarks,
        aiSuggestedMarks: e.aiSuggestedMarks,
        feedback: e.feedback,
        confidenceScore: e.confidenceScore
      }))
    }));

    ApiResponse.success(res, {
      studentRollNo,
      totalExamsTaken: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/results/submission/:submissionId
 * Retrieve detailed mark calculation and itemized rubric results for a submission
 * Protected: Student can only view own submission; Teachers & Admins can view all.
 */
router.get('/submission/:submissionId', requireAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { submissionId } = req.params;
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) {
      throw new NotFoundError(`Submission with id '${submissionId}' not found.`);
    }

    const currentUser = req.user;
    if (currentUser?.role === 'student' && currentUser.rollNumber && submission.studentRollNo !== currentUser.rollNumber) {
      throw new ForbiddenError(`Access denied: You are not authorized to inspect another student's graded script.`);
    }

    const exam = await examRepository.findById(submission.examId);
    const evaluations = submission.evaluations || [];

    // Calculate marks verification breakdown
    const rawTotal = evaluations.reduce((acc: number, e: any) => {
      const marks = e.teacherAdjustedMarks !== undefined ? e.teacherAdjustedMarks : (e.awardedMarks || 0);
      return acc + marks;
    }, 0);
    const maxMarks = submission.maxMarks || (exam ? exam.totalMarks : 100);
    const calculatedPercentage = maxMarks > 0 ? Math.min(100, Math.round((rawTotal / maxMarks) * 100)) : 0;

    ApiResponse.success(res, {
      result: {
        submissionId: submission.id,
        examId: submission.examId,
        examTitle: submission.examTitle || exam?.title,
        courseCode: submission.courseCode || exam?.courseCode,
        studentName: submission.studentName,
        studentRollNo: submission.studentRollNo,
        status: submission.status,
        markSummary: {
          totalAwardedMarks: rawTotal,
          maxTotalMarks: maxMarks,
          percentageScore: calculatedPercentage,
          gradeAwarded: submission.gradeAwarded,
          passed: calculatedPercentage >= 40
        },
        questionBreakdown: evaluations.map((e: any) => ({
          questionNumber: e.questionNumber,
          questionText: e.questionText,
          awardedMarks: e.teacherAdjustedMarks !== undefined ? e.teacherAdjustedMarks : (e.awardedMarks || 0),
          maxMarks: e.maxMarks,
          semanticSimilarity: e.semanticSimilarity,
          keywordCoverage: e.keywordCoverage,
          feedback: e.feedback,
          teacherComments: e.teacherComments
        })),
        audit: {
          submittedAt: submission.submittedAt,
          gradedAt: submission.gradedAt,
          isFlagged: submission.isFlagged,
          flagReason: submission.flagReason
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/results/exam/:examId/analytics
 * Retrieve aggregated grade distribution and stats for an exam
 * Protected: Teachers and Admins only
 */
router.get('/exam/:examId/analytics', requireAuth(['teacher', 'admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { examId } = req.params;
    const exam = await examRepository.findById(examId);
    if (!exam) {
      throw new NotFoundError(`Exam with id '${examId}' not found.`);
    }

    const rawSubmissions = await submissionRepository.findAll({ examId });
    const submissions: SubmissionEntity[] = Array.isArray(rawSubmissions) ? rawSubmissions : rawSubmissions.items;
    const graded = submissions.filter((s: SubmissionEntity) => s.status === 'GRADED' || s.status === 'COMPLETED' || s.status === 'REVIEWED');

    const scores = graded.map((s: any) => s.percentageScore || 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    const passCount = scores.filter((score: number) => score >= 40).length;
    const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

    const gradeDistribution = {
      'A+ (90-100)': scores.filter((s: number) => s >= 90).length,
      'A (80-89)': scores.filter((s: number) => s >= 80 && s < 90).length,
      'B (70-79)': scores.filter((s: number) => s >= 70 && s < 80).length,
      'C (60-69)': scores.filter((s: number) => s >= 60 && s < 70).length,
      'D (40-59)': scores.filter((s: number) => s >= 40 && s < 60).length,
      'F (<40)': scores.filter((s: number) => s < 40).length
    };

    ApiResponse.success(res, {
      examId,
      examTitle: exam.title,
      totalSubmissions: submissions.length,
      gradedSubmissions: graded.length,
      analytics: {
        averageScore: avgScore,
        highestScore,
        lowestScore,
        passRate,
        passCount,
        failCount: graded.length - passCount,
        gradeDistribution
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
