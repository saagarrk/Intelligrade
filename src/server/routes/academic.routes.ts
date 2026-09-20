import { Router } from 'express';
import { z } from 'zod';
import { academicController } from '../controllers/academic.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';

const router = Router();

const AppealReevaluationSchema = z.object({
  questionNumber: z.union([z.number(), z.string()]),
  reason: z.string().min(5, 'Reason for reevaluation must be at least 5 characters'),
  studentRollNo: z.string().optional()
});

const MockEmailSchema = z.object({
  recipientEmail: z.string().email().optional(),
  studentName: z.string().optional(),
  studentRollNumber: z.string().optional(),
  courseCode: z.string().optional(),
  examTitle: z.string().optional(),
  scoreAwarded: z.union([z.number(), z.string()]).optional(),
  maxMarks: z.union([z.number(), z.string()]).optional(),
  percentageScore: z.union([z.number(), z.string()]).optional(),
  feedbackSummary: z.string().optional(),
  questionScores: z.array(z.any()).optional()
});

// Student appeal endpoint
router.post(
  '/student/appeal-reevaluation',
  requireAuth(['student', 'admin']),
  validateBody(AppealReevaluationSchema),
  (req, res, next) => {
    academicController.appealReevaluation(req, res, next);
  }
);

// Notifications mock email endpoint
router.post(
  '/notifications/mock-email',
  requireAuth(['teacher', 'admin']),
  validateBody(MockEmailSchema),
  (req, res, next) => {
    academicController.sendMockEmail(req, res, next);
  }
);

export default router;
