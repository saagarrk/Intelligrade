import { Request, Response, NextFunction } from 'express';
import { performHandwrittenOcrAndParse } from '../../backend/geminiOcrService';
import { ApiResponse } from '../common/apiResponse';
import { BadRequestError } from '../common/errors';
import { validateUploadedFile } from '../common/fileValidator';

export class OcrController {
  async extract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageBase64, mimeType = 'image/jpeg', examContext = '', questions = [] } = req.body;
      if (!imageBase64) {
        throw new BadRequestError('Missing required imageBase64 property.');
      }

      // Strict file validation: checks file size limit and MIME type / magic bytes
      const validated = validateUploadedFile(imageBase64, mimeType);
      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';

      const ocrResult = await performHandwrittenOcrAndParse(
        validated.cleanBase64,
        {
          mimeType: validated.mimeType,
          examContext,
          questions,
          mockMode
        }
      );

      // Ensure no internal file paths leak in the response
      const sanitizedMetadata = { ...ocrResult.metadata };
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
        throw new BadRequestError('Missing required imageBase64 property.');
      }

      // Strict file validation: size, type, and binary header checking
      const validated = validateUploadedFile(imageBase64, mimeType);

      const mockMode = req.body.mockMode === true || req.headers['x-mock-ocr'] === 'true';
      const result = await performHandwrittenOcrAndParse(
        validated.cleanBase64,
        {
          mimeType: validated.mimeType,
          examContext,
          questions,
          mockMode
        }
      );

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

