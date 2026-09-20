import { Router } from 'express';
import { z } from 'zod';
import { ocrController } from '../controllers/ocr.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const OcrExtractSchema = z.object({
  imageBase64: z.string().min(10, 'imageBase64 is required and must not be empty'),
  mimeType: z.string().optional(),
  examContext: z.string().optional(),
  questions: z.array(z.any()).optional(),
  mockMode: z.boolean().optional()
});

router.post(
  '/extract',
  requireAuth(['teacher', 'admin']),
  requestTimeout(60000),
  validateBody(OcrExtractSchema),
  (req, res, next) => {
    ocrController.extract(req, res, next);
  }
);

router.post(
  '/parse-handwritten',
  requireAuth(['teacher', 'admin', 'student']),
  requestTimeout(60000),
  validateBody(OcrExtractSchema),
  (req, res, next) => {
    ocrController.parseHandwritten(req, res, next);
  }
);

export default router;

