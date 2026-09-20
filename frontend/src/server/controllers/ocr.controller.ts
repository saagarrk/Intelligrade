import { Request, Response, NextFunction } from 'express';
import { performHandwrittenOcrAndParse } from '../../backend/geminiOcrService';
import { ApiResponse } from '../common/apiResponse';
import { BadRequestError } from '../common/errors';

export class OcrController {
  async extract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageBase64, mimeType = 'image/jpeg', examContext = '', questions = [] } = req.body;
      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';

      const ocrResult = await performHandwrittenOcrAndParse(
        imageBase64,
        {
          mimeType,
          examContext,
          questions,
          mockMode
        }
      );

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
        metadata: ocrResult.metadata,
        lines: ocrResult.detectedLines.map(l => ({ lineNumber: l.lineNumber, text: l.cleanedText, confidence: l.confidence }))
      });
    } catch (err) {
      next(err);
    }
  }

  async parseHandwritten(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageBase64, mimeType = 'image/jpeg', examContext = '', questions = [] } = req.body;
      if (!imageBase64) {
        throw new BadRequestError('Missing required imageBase64 property');
      }

      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';
      const result = await performHandwrittenOcrAndParse(
        imageBase64,
        {
          mimeType,
          examContext,
          questions,
          mockMode
        }
      );

      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const ocrController = new OcrController();
