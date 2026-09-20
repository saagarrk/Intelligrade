import { Router } from 'express';
import { gradeController } from '../controllers/grade.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/evaluate', requireAuth(['teacher', 'admin']), (req, res, next) => {
  gradeController.evaluate(req, res, next);
});

router.post('/review-answer', requireAuth(['teacher', 'admin']), (req, res, next) => {
  gradeController.reviewAnswer(req, res, next);
});

router.post('/finalize-submission', requireAuth(['teacher', 'admin']), (req, res, next) => {
  gradeController.finalizeSubmission(req, res, next);
});

export default router;
