import { Router } from 'express';
import { z } from 'zod';
import { ocrController } from '../controllers/ocr.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const OcrExtractSchema = z.object({
  imageBase64: z.string().optional(),
  dataUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  scanUrl: z.string().optional(),
  originalScanUrl: z.string().optional(),
  image: z.string().optional(),
  mimeType: z.string().optional(),
  examContext: z.string().optional(),
  questions: z.array(z.any()).optional(),
  mockMode: z.boolean().optional()
}).refine(
  data => Boolean(data.imageBase64 || data.dataUrl || data.imageUrl || data.scanUrl || data.originalScanUrl || data.image),
  { message: 'An imageBase64, dataUrl, or scanUrl property must be provided' }
);

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

