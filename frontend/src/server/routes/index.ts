import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import examRoutes from './exam.routes';
import submissionRoutes from './submission.routes';
import adminRoutes from './admin.routes';
import ocrRoutes from './ocr.routes';
import academicRoutes from './academic.routes';
import gradeRoutes from './grade.routes';
import modelAnswerRoutes from './modelAnswer.routes';
import questionPaperRoutes from './questionPaper.routes';
import { ApiResponse } from '../common/apiResponse';

const router = Router();

// System Health Gateway
router.get('/health', (req: Request, res: Response) => {
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  ApiResponse.success(res, {
    status: 'UP',
    service: 'IntelliGrade Production REST API Engine',
    geminiConfigured,
    timestamp: new Date().toISOString()
  });
});

// Mount domain routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exams', examRoutes);
router.use('/submissions', submissionRoutes);
router.use('/admin', adminRoutes);
router.use('/ocr', ocrRoutes);
router.use('/grade', gradeRoutes);
router.use('/model-answers', modelAnswerRoutes);
router.use('/', academicRoutes);
router.use('/', questionPaperRoutes);

export default router;
