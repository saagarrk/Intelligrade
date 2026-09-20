import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { gradeService } from '../services/grade.service';
import { ApiResponse } from '../common/apiResponse';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { requestTimeout } from '../middleware/requestTimeout';

const router = Router();

const AiEvaluateSchema = z.object({
  questions: z.array(z.object({
    id: z.string().optional(),
    questionNumber: z.number().int().optional(),
    questionText: z.string().min(1, 'Question text is required'),
    maxMarks: z.number().positive().default(10),
    modelAnswer: z.string().optional(),
    topic: z.string().optional(),
    keyConcepts: z.array(z.any()).optional()
  })).min(1, 'At least one question is required for evaluation'),
  studentAnswers: z.array(z.any()).optional(),
  student_answers: z.array(z.any()).optional(),
  studentName: z.string().optional(),
  student_name: z.string().optional(),
  examId: z.string().optional(),
  exam_id: z.string().optional()
});

/**
 * GET /api/ai/health
 * Health check for AI evaluation subsystem showing Spring Boot orchestration
 */
router.get('/health', (req: Request, res: Response) => {
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  ApiResponse.success(res, {
    status: 'HEALTHY',
    service: 'IntelliGrade AI Service Adapter',
    version: '2.5.0',
    orchestrator: 'Spring Boot Backend (Port 8080)',
    directPythonAccess: 'Blocked (Internal Token Authenticated)',
    geminiConfigured,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/ai/evaluate
 * Protected: Only authenticated instructors and administrators can trigger evaluation APIs.
 * Validates request payload and applies 45s hard request timeout with graceful fallback.
 */
router.post(
  '/evaluate',
  requireAuth(['teacher', 'admin']),
  requestTimeout(45000),
  validateBody(AiEvaluateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        questions = [],
        studentAnswers = [],
        student_answers = [],
        studentName = 'Candidate',
        student_name = 'Candidate',
        examId = 'exam-01',
        exam_id = 'exam-01'
      } = req.body;

      const normalizedAnswers = (studentAnswers && studentAnswers.length > 0) ? studentAnswers : (student_answers || []);
      const name = studentName || student_name;
      const exam = examId || exam_id;

      // Try routing through Spring Boot backend with internal authentication headers
      try {
        const internalKey = process.env.AI_SERVICE_SECRET_KEY || 'intelligrade-ai-internal-secret-token-2026';
        const springBootRes = await fetch('http://localhost:8080/api/ai/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-API-Key': internalKey
          },
          body: JSON.stringify({
            examId: exam,
            studentName: name,
            questions,
            studentAnswers: normalizedAnswers
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (springBootRes.ok) {
          const springData = await springBootRes.json();
          return ApiResponse.success(res, springData);
        }
      } catch {
        // Spring Boot backend is offline or unreachable; gracefully fallback to internal AI engine
      }

      const result = await gradeService.evaluateAnswers(questions, normalizedAnswers, name);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

