import { Router } from 'express';
import { z } from 'zod';
import { gradeController } from '../controllers/grade.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const GenerateModelAnswerSchema = z.object({
  questionText: z.string().min(3, 'Question text must be at least 3 characters'),
  topic: z.string().optional(),
  maxMarks: z.number().positive().default(10),
  difficulty: z.string().optional()
});

router.post(
  '/generate',
  requireAuth(['teacher', 'admin']),
  requestTimeout(45000),
  validateBody(GenerateModelAnswerSchema),
  (req, res, next) => {
    gradeController.generateModelAnswer(req, res, next);
  }
);

export default router;

