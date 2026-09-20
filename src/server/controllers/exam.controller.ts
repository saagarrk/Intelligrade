import { Request, Response, NextFunction } from 'express';
import { examService } from '../services/exam.service';
import { ApiResponse } from '../common/apiResponse';
import { parsePaginationParams } from '../common/pagination';

export class ExamController {
  async getExams(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        query: req.query.q ? String(req.query.q) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
        subject: req.query.subject ? String(req.query.subject) : undefined
      };

      // Support optional pagination: if page or limit provided, paginate; else return full array
      if (req.query.page || req.query.limit) {
        const pagination = parsePaginationParams(req.query, 10);
        const result = await examService.getExams(filters, pagination) as any;
        ApiResponse.success(res, { examinations: result.items, exams: result.items }, 200, result.meta);
      } else {
        const exams = await examService.getExams(filters) as any[];
        ApiResponse.success(res, { examinations: exams, exams });
      }
    } catch (err) {
      next(err);
    }
  }

  async getExamById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exam = await examService.getExamById(req.params.id);
      ApiResponse.success(res, { exam });
    } catch (err) {
      next(err);
    }
  }

  async createExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'teacher@intelligrade.edu';
      const exam = await examService.createExam(req.body, actorEmail);
      ApiResponse.created(res, { exam, message: 'Examination created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'teacher@intelligrade.edu';
      const exam = await examService.updateExam(req.params.id, req.body, actorEmail);
      ApiResponse.success(res, { exam, message: 'Examination updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const exam = await examService.updateExamStatus(req.params.id, req.body.status, actorEmail);
      ApiResponse.success(res, { exam, message: `Exam status changed to ${req.body.status}` });
    } catch (err) {
      next(err);
    }
  }

  async deleteExam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      await examService.deleteExam(req.params.id, actorEmail);
      ApiResponse.success(res, { message: 'Examination deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const examController = new ExamController();
