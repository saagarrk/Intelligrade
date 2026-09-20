import { Router } from 'express';
import { questionPaperController } from '../controllers/questionPaper.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/gemini/parse-question-paper', requireAuth(['teacher', 'admin']), (req, res, next) => {
  questionPaperController.parseQuestionPaper(req, res, next);
});

router.post('/question-paper/automated-test', requireAuth(['teacher', 'admin']), (req, res, next) => {
  questionPaperController.runAutomatedTest(req, res, next);
});

export default router;
