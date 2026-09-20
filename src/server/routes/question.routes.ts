import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { examRepository } from '../repositories/exam.repository';
import { ApiResponse } from '../common/apiResponse';
import { NotFoundError, BadRequestError } from '../common/errors';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';

const router = Router();

const QuestionSchema = z.object({
  questionNumber: z.number().int().positive('Question number must be positive'),
  questionText: z.string().min(3, 'Question text must be at least 3 characters'),
  maxMarks: z.number().positive('Max marks must be greater than 0'),
  modelAnswer: z.string().min(1, 'Model answer is required'),
  topic: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  keyConcepts: z.array(z.object({
    concept: z.string(),
    weightMarks: z.number(),
    synonyms: z.array(z.string()).optional(),
    description: z.string().optional()
  })).optional()
});

/**
 * GET /api/v1/questions/exam/:examId
 * Retrieves all questions and rubrics for a specific exam
 */
router.get('/exam/:examId', optionalAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exam = await examRepository.findById(req.params.examId);
    if (!exam) {
      throw new NotFoundError(`Exam with id '${req.params.examId}' not found.`);
    }
    ApiResponse.success(res, {
      examId: exam.id,
      examTitle: exam.title,
      totalQuestions: (exam.questions || []).length,
      questions: exam.questions || []
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/questions/exam/:examId/:questionNumber
 * Retrieves a specific question by question number
 */
router.get('/exam/:examId/:questionNumber', optionalAuth(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exam = await examRepository.findById(req.params.examId);
    if (!exam) {
      throw new NotFoundError(`Exam with id '${req.params.examId}' not found.`);
    }
    const qNum = parseInt(req.params.questionNumber, 10);
    const question = (exam.questions || []).find((q: any) => q.questionNumber === qNum);
    if (!question) {
      throw new NotFoundError(`Question ${qNum} not found in exam '${exam.title}'.`);
    }
    ApiResponse.success(res, { question });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/questions/exam/:examId
 * Adds a new question and rubric to an exam (Teachers & Admins)
 */
router.post(
  '/exam/:examId',
  requireAuth(['teacher', 'admin']),
  validateBody(QuestionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exam = await examRepository.findById(req.params.examId);
      if (!exam) {
        throw new NotFoundError(`Exam with id '${req.params.examId}' not found.`);
      }

      const questions = [...(exam.questions || [])];
      const existingIdx = questions.findIndex((q: any) => q.questionNumber === req.body.questionNumber);
      if (existingIdx >= 0) {
        throw new BadRequestError(`Question ${req.body.questionNumber} already exists in this exam.`);
      }

      const newQ = {
        id: `q_${Date.now()}_${req.body.questionNumber}`,
        ...req.body
      };
      questions.push(newQ);
      questions.sort((a, b) => a.questionNumber - b.questionNumber);

      const totalMarks = questions.reduce((acc, q) => acc + (q.maxMarks || 0), 0);
      await examRepository.update(exam.id, { questions, totalMarks });

      ApiResponse.created(res, {
        message: `Question ${newQ.questionNumber} added successfully`,
        question: newQ,
        examTotalMarks: totalMarks
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/v1/questions/exam/:examId/:questionNumber
 * Updates a question or rubric definition (Teachers & Admins)
 */
router.put(
  '/exam/:examId/:questionNumber',
  requireAuth(['teacher', 'admin']),
  validateBody(QuestionSchema.partial()),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exam = await examRepository.findById(req.params.examId);
      if (!exam) {
        throw new NotFoundError(`Exam with id '${req.params.examId}' not found.`);
      }

      const qNum = parseInt(req.params.questionNumber, 10);
      const questions = [...(exam.questions || [])];
      const idx = questions.findIndex((q: any) => q.questionNumber === qNum);
      if (idx === -1) {
        throw new NotFoundError(`Question ${qNum} not found in this exam.`);
      }

      questions[idx] = {
        ...questions[idx],
        ...req.body,
        questionNumber: qNum
      };

      const totalMarks = questions.reduce((acc, q) => acc + (q.maxMarks || 0), 0);
      await examRepository.update(exam.id, { questions, totalMarks });

      ApiResponse.success(res, {
        message: `Question ${qNum} updated successfully`,
        question: questions[idx],
        examTotalMarks: totalMarks
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/v1/questions/exam/:examId/:questionNumber
 * Deletes a question from an exam (Admins & Teachers)
 */
router.delete(
  '/exam/:examId/:questionNumber',
  requireAuth(['teacher', 'admin']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exam = await examRepository.findById(req.params.examId);
      if (!exam) {
        throw new NotFoundError(`Exam with id '${req.params.examId}' not found.`);
      }

      const qNum = parseInt(req.params.questionNumber, 10);
      const questions = (exam.questions || []).filter((q: any) => q.questionNumber !== qNum);
      const totalMarks = questions.reduce((acc: number, q: any) => acc + (q.maxMarks || 0), 0);

      await examRepository.update(exam.id, { questions, totalMarks });

      ApiResponse.success(res, {
        message: `Question ${qNum} deleted successfully`,
        remainingQuestions: questions.length,
        examTotalMarks: totalMarks
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
