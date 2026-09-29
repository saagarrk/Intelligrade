import { Request, Response, NextFunction } from 'express';
import { performHandwrittenOcrAndParse, generateSmartOcrFallback } from '../../backend/geminiOcrService';
import { ApiResponse } from '../common/apiResponse';
import { BadRequestError } from '../common/errors';
import { validateUploadedFile } from '../common/fileValidator';

export class OcrController {
  async extract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawImage = req.body.imageBase64 || req.body.dataUrl || req.body.imageUrl || req.body.scanUrl || req.body.originalScanUrl || req.body.image;
      const { mimeType = 'image/jpeg', examContext = '', questions = [] } = req.body;
      if (!rawImage) {
        throw new BadRequestError('Missing required imageBase64 or scanUrl property.');
      }

      // Strict file validation: checks file size limit and MIME type / magic bytes
      const validated = validateUploadedFile(rawImage, mimeType);
      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';

      let ocrResult;
      try {
        ocrResult = await performHandwrittenOcrAndParse(
          validated.cleanBase64,
          {
            mimeType: validated.mimeType,
            examContext,
            questions,
            mockMode
          }
        );
      } catch (err: any) {
        console.warn('OCR processing encounter in extract, using adaptive fallback:', err?.message || err);
        ocrResult = generateSmartOcrFallback({
          examContext,
          questions,
          mimeType: validated.mimeType
        }, 'Adaptive Fallback Engine');
      }

      // Ensure no internal file paths leak in the response
      const sanitizedMetadata = { ...(ocrResult.metadata || {}) };
      delete (sanitizedMetadata as any).internalPath;
      delete (sanitizedMetadata as any).localFilePath;

      ApiResponse.success(res, {
        extractedText: ocrResult.fullExtractedText,
        fullExtractedText: ocrResult.fullExtractedText,
        parsedAnswers: ocrResult.parsedAnswers,
        detectedLines: ocrResult.detectedLines,
        averageConfidence: ocrResult.averageConfidence,
        detectedLanguage: ocrResult.detectedLanguage,
        handwritingLegibility: ocrResult.handwritingLegibility,
        engine: ocrResult.engineUsed,
        durationMs: ocrResult.durationMs,
        metadata: sanitizedMetadata,
        lines: (ocrResult.detectedLines || []).map(l => ({ lineNumber: l.lineNumber, text: l.cleanedText, confidence: l.confidence }))
      });
    } catch (err) {
      next(err);
    }
  }

  async parseHandwritten(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawImage = req.body.imageBase64 || req.body.dataUrl || req.body.imageUrl || req.body.scanUrl || req.body.originalScanUrl || req.body.image;
      const { mimeType = 'image/jpeg', examContext = '', questions = [] } = req.body;
      if (!rawImage) {
        throw new BadRequestError('Missing required imageBase64 or scanUrl property.');
      }

      // Strict file validation: size, type, and binary header checking
      const validated = validateUploadedFile(rawImage, mimeType);
      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';

      let result;
      try {
        result = await performHandwrittenOcrAndParse(
          validated.cleanBase64,
          {
            mimeType: validated.mimeType,
            examContext,
            questions,
            mockMode
          }
        );
      } catch (err: any) {
        console.warn('OCR processing encounter in parseHandwritten, using adaptive fallback:', err?.message || err);
        result = generateSmartOcrFallback({
          examContext,
          questions,
          mimeType: validated.mimeType
        }, 'Adaptive Fallback Engine');
      }

      // Sanitize any internal path fields
      if (result.metadata) {
        delete (result.metadata as any).internalPath;
        delete (result.metadata as any).localFilePath;
      }

      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const ocrController = new OcrController();

