import { Router } from 'express';
import { ocrController } from '../controllers/ocr.controller';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/extract', requireAuth(['teacher', 'admin']), (req, res, next) => {
  ocrController.extract(req, res, next);
});

router.post('/parse-handwritten', requireAuth(['teacher', 'admin', 'student']), (req, res, next) => {
  ocrController.parseHandwritten(req, res, next);
});

export default router;
