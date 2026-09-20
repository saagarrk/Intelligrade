import { Router } from 'express';
import { gradeController } from '../controllers/grade.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/generate', requireAuth(['teacher', 'admin']), (req, res, next) => {
  gradeController.generateModelAnswer(req, res, next);
});

export default router;
