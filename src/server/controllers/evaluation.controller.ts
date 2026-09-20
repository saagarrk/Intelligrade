import { Request, Response, NextFunction } from 'express';
import { evaluationService } from '../services/evaluation.service';
import { ApiResponse } from '../common/apiResponse';
import { ForbiddenError, BadRequestError } from '../common/errors';
import {
  UpdateTeacherEvaluationSchema,
  AcceptAiSuggestionSchema,
  ModifyMarksSchema,
  FinalizeEvaluationSchema
} from '../dtos/evaluation.dto';

export class EvaluationController {
  /**
   * GET evaluation
   * Fetches single question evaluation or submission evaluation.
   * Access: Authenticated users (Students can only view their own; Teachers/Admins can view any).
   */
  async getEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const questionNumber = req.query.questionNumber ? parseInt(req.query.questionNumber as string, 10) : undefined;
      const submissionId = req.query.submissionId as string | undefined;

      const identifier = id || submissionId;
      if (!identifier) {
        throw new BadRequestError('Evaluation ID or Submission ID is required.');
      }

      const result = await evaluationService.getEvaluation(identifier, req.user, questionNumber);
      ApiResponse.success(res, result, 200, undefined, { message: 'Evaluation retrieved successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET all evaluations (or by submission)
   */
  async getEvaluations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const submissionId = req.query.submissionId as string;
      if (submissionId) {
        const results = await evaluationService.getEvaluationsForSubmission(submissionId, req.user);
        ApiResponse.success(res, results, 200, undefined, { message: 'Submission evaluations retrieved successfully' });
        return;
      }

      // If no specific submission, return first evaluation or empty list
      ApiResponse.success(res, [], 200, undefined, { message: 'Evaluations retrieved' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT/update teacher evaluation
   * Modifies teacher marks, notes, feedback, and rubric criteria.
   * Transitions status to TEACHER_REVIEWED.
   * STRICT SECURITY: Students are never allowed. Only teachers/admins.
   */
  async updateTeacherEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role === 'student') {
        throw new ForbiddenError('Access denied: Students are not permitted to modify or review evaluation results.');
      }

      const { id } = req.params;
      const questionNumber = req.query.questionNumber ? parseInt(req.query.questionNumber as string, 10) : undefined;
      const parsedBody = UpdateTeacherEvaluationSchema.parse(req.body);

      const result = await evaluationService.updateTeacherEvaluation(id, parsedBody, req.user, questionNumber);
      ApiResponse.success(res, result, 200, undefined, { message: 'Teacher evaluation updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST accept AI suggestion
   * Accepts AI suggested marks as the teacher-approved marks.
   * Transitions status to TEACHER_REVIEWED.
   * STRICT SECURITY: Students are never allowed. Only teachers/admins.
   */
  async acceptAiSuggestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role === 'student') {
        throw new ForbiddenError('Access denied: Students are not permitted to review or accept evaluation suggestions.');
      }

      const { id } = req.params;
      const questionNumber = req.query.questionNumber ? parseInt(req.query.questionNumber as string, 10) : undefined;
      const parsedBody = AcceptAiSuggestionSchema.parse(req.body || {});

      const result = await evaluationService.acceptAiSuggestion(id, parsedBody, req.user, questionNumber);
      ApiResponse.success(res, result, 200, undefined, { message: 'AI suggested marks accepted successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST modify marks
   * Updates awarded marks with teacher comment/reason.
   * Transitions status to TEACHER_REVIEWED.
   * STRICT SECURITY: Students are never allowed. Only teachers/admins.
   */
  async modifyMarks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role === 'student') {
        throw new ForbiddenError('Access denied: Students are not permitted to modify evaluation marks.');
      }

      const { id } = req.params;
      const questionNumber = req.query.questionNumber ? parseInt(req.query.questionNumber as string, 10) : undefined;
      const parsedBody = ModifyMarksSchema.parse(req.body);

      const result = await evaluationService.modifyMarks(id, parsedBody, req.user, questionNumber);
      ApiResponse.success(res, result, 200, undefined, { message: 'Evaluation marks modified successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST finalize evaluation
   * Locks evaluation score and sets status to FINALIZED.
   * STRICT SECURITY: Students are never allowed. Only teachers/admins.
   */
  async finalizeEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role === 'student') {
        throw new ForbiddenError('Access denied: Students are not permitted to finalize evaluations. Only authorized teachers and administrators can finalize evaluations.');
      }

      const { id } = req.params;
      const questionNumber = req.query.questionNumber ? parseInt(req.query.questionNumber as string, 10) : undefined;
      const parsedBody = FinalizeEvaluationSchema.parse(req.body || {});

      const result = await evaluationService.finalizeEvaluation(id, parsedBody, req.user, questionNumber);
      ApiResponse.success(res, result, 200, undefined, { message: 'Evaluation finalized successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const evaluationController = new EvaluationController();
