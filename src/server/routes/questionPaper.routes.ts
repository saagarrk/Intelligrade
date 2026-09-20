import { Router } from 'express';
import { z } from 'zod';
import { questionPaperController } from '../controllers/questionPaper.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const ParseQuestionPaperSchema = z.object({
  rawText: z.string().min(5, 'Question paper rawText must be at least 5 characters'),
  examTitle: z.string().optional(),
  subject: z.string().optional()
});

const AutomatedTestSchema = z.object({
  examPaper: z.object({
    questions: z.array(z.any()).min(1, 'Exam paper questions must not be empty')
  })
});

router.post(
  '/gemini/parse-question-paper',
  requireAuth(['teacher', 'admin']),
  requestTimeout(45000),
  validateBody(ParseQuestionPaperSchema),
  (req, res, next) => {
    questionPaperController.parseQuestionPaper(req, res, next);
  }
);

router.post(
  '/question-paper/automated-test',
  requireAuth(['teacher', 'admin']),
  requestTimeout(45000),
  validateBody(AutomatedTestSchema),
  (req, res, next) => {
    questionPaperController.runAutomatedTest(req, res, next);
  }
);

export default router;

