import { Request, Response, NextFunction } from 'express';
import { submissionService } from '../services/submission.service';
import { ApiResponse } from '../common/apiResponse';
import { parsePaginationParams } from '../common/pagination';

export class SubmissionController {
  async getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = {
        query: req.query.q ? String(req.query.q) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
        examId: req.query.examId ? String(req.query.examId) : undefined,
        studentId: req.query.studentId ? String(req.query.studentId) : undefined,
        scoreTier: req.query.scoreTier as any
      };

      if (req.query.page || req.query.limit) {
        const pagination = parsePaginationParams(req.query, 10);
        const result = await submissionService.getSubmissions(filters, pagination, req.user) as any;
        ApiResponse.success(res, { submissions: result.items }, 200, result.meta);
      } else {
        const submissions = await submissionService.getSubmissions(filters, undefined, req.user) as any[];
        ApiResponse.success(res, { submissions });
      }
    } catch (err) {
      next(err);
    }
  }

  async getSubmissionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submission = await submissionService.getSubmissionById(req.params.id, req.user);
      ApiResponse.success(res, { submission });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const submission = await submissionService.updateStatus(req.params.id, req.body.status, actorEmail);
      ApiResponse.success(res, { submission, message: `Submission status updated to ${req.body.status}` });
    } catch (err) {
      next(err);
    }
  }

  async reevaluate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const submissionId = req.params.submissionId || req.params.id;
      const submission = await submissionService.reevaluate(submissionId, actorEmail);
      ApiResponse.success(res, { submission, message: 'Institutional paper re-evaluation scheduled successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async overrideScore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'teacher@intelligrade.edu';
      const submission = await submissionService.overrideScore(req.params.id, req.body, actorEmail);
      ApiResponse.success(res, { submission, message: 'Grade override applied successfully' });
    } catch (err) {
      next(err);
    }
  }

  async deleteSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      await submissionService.deleteSubmission(req.params.id, actorEmail);
      ApiResponse.success(res, { message: 'Submission deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async createSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'student@intelligrade.edu';
      const submission = await submissionService.createSubmission(req.body, actorEmail, req.user);
      ApiResponse.created(res, { submission, message: 'Submission uploaded successfully' });
    } catch (err) {
      next(err);
    }
  }

  async checkDuplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const examId = String(req.query.examId || '');
      const studentRollNumber = String(req.query.studentRollNumber || req.query.rollNumber || '');
      const result = await submissionService.checkDuplicate(examId, studentRollNumber);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async processPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'system@intelligrade.edu';
      const result = await submissionService.processPipeline(req.params.id, req.body, actorEmail);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await submissionService.getPipeline(req.params.id);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async retryPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'user@intelligrade.edu';
      const result = await submissionService.retryPipeline(req.params.id, actorEmail);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async testOcrFailure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'user@intelligrade.edu';
      const { failureType = 'unreadable' } = req.body || {};
      const result = await submissionService.testOcrFailure(req.params.id, failureType, actorEmail);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async batchProcessPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'system@intelligrade.edu';
      const result = await submissionService.batchProcessPending(actorEmail);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getSecureFilePage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId, pageNumber } = req.params;
      const pageNum = parseInt(pageNumber, 10) || 1;
      const page = submissionService.getSecureFilePage(fileId, pageNum, req.user);

      const match = page.dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', mime);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, max-age=86400');
        res.send(buffer);
        return;
      }

      ApiResponse.success(res, { pageNumber: page.pageNumber, dataUrl: page.dataUrl });
    } catch (err) {
      next(err);
    }
  }

  async getSecureFileMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const metadata = submissionService.getSecureFileMetadata(fileId, req.user);
      ApiResponse.success(res, metadata);
    } catch (err) {
      next(err);
    }
  }
}

export const submissionController = new SubmissionController();
