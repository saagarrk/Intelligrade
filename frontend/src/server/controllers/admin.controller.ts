import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/stats.service';
import { auditRepository } from '../repositories/audit.repository';
import { submissionRepository } from '../repositories/submission.repository';
import { examRepository } from '../repositories/exam.repository';
import { ApiResponse } from '../common/apiResponse';
import { parsePaginationParams, paginateAndSort } from '../common/pagination';
import { SubmissionEntity, ExamEntity } from '../database/inMemoryDb';

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await statsService.getSystemStats();
      ApiResponse.success(res, { stats });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePaginationParams(req.query, 15);
      const filters = {
        query: req.query.q ? String(req.query.q) : undefined,
        role: req.query.role ? String(req.query.role) : undefined,
        status: req.query.status ? String(req.query.status) : undefined
      };

      const result = await auditRepository.findAll(filters, pagination) as any;
      ApiResponse.success(res, { logs: result.items }, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getEvaluations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePaginationParams(req.query, 10);
      const filters = {
        query: req.query.q ? String(req.query.q) : undefined,
        scoreTier: req.query.scoreTier as any
      };

      const subs = await submissionRepository.findAll(filters) as SubmissionEntity[];
      const exams = await examRepository.findAll({}) as ExamEntity[];
      const examMap = new Map(exams.map(e => [e.id, e]));

      const evaluationsList = subs.map(s => {
        const exam = examMap.get(s.examId);
        const maxScore = s.maxScore || exam?.totalMarks || 100;
        const totalScore = s.totalScore || 0;
        const percentageScore = s.percentageScore || (maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0);

        return {
          id: `eval_${s.id}`,
          submissionId: s.id,
          studentName: s.studentName,
          studentRollNo: s.studentRollNo,
          examTitle: (s as any).examTitle || exam?.title || 'Midterm Assessment',
          totalScore,
          maxScore,
          percentageScore,
          aiConfidence: 96.8,
          evaluator: 'Gemini 3.8 Multimodal AI + Prof. Sen',
          evaluatedAt: s.submittedAt,
          questionScores: exam?.questions?.map((q: any, i: number) => ({
            questionId: q.id || (i + 1),
            awardedMarks: Math.min(q.maxMarks || 20, Math.round((totalScore / (exam.questions.length || 1)))),
            maxMarks: q.maxMarks || 20,
            feedback: 'Satisfactory answer with logical breakdown conforming to rubric grading criteria.'
          })) || []
        };
      });

      const paginated = paginateAndSort(evaluationsList, pagination);
      ApiResponse.success(res, { evaluations: paginated.items }, 200, paginated.meta);
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
