import { Router } from 'express';
import { z } from 'zod';
import { gradeController } from '../controllers/grade.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const GradeEvaluateSchema = z.object({
  questions: z.array(z.any()).min(1, 'Questions list must not be empty'),
  studentAnswers: z.array(z.any()).default([]),
  studentName: z.string().optional()
});

const ReviewAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  teacherAdjustedMarks: z.number().nonnegative('Marks must be greater than or equal to 0'),
  teacherComment: z.string().optional(),
  finalize: z.boolean().optional()
});

const FinalizeSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  evaluations: z.array(z.any()).min(1, 'Evaluations array must not be empty')
});

router.post(
  '/evaluate',
  requireAuth(['teacher', 'admin']),
  requestTimeout(45000),
  validateBody(GradeEvaluateSchema),
  (req, res, next) => {
    gradeController.evaluate(req, res, next);
  }
);

router.post(
  '/review-answer',
  requireAuth(['teacher', 'admin']),
  validateBody(ReviewAnswerSchema),
  (req, res, next) => {
    gradeController.reviewAnswer(req, res, next);
  }
);

router.post(
  '/finalize-submission',
  requireAuth(['teacher', 'admin']),
  validateBody(FinalizeSubmissionSchema),
  (req, res, next) => {
    gradeController.finalizeSubmission(req, res, next);
  }
);

export default router;

