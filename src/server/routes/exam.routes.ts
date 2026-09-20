import { Router } from 'express';
import { examController } from '../controllers/exam.controller';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { CreateExamSchema, UpdateExamStatusSchema } from '../dtos/exam.dto';

const router = Router();

router.get('/', optionalAuth(), (req, res, next) => examController.getExams(req, res, next));
router.get('/:id', optionalAuth(), (req, res, next) => examController.getExamById(req, res, next));
router.post('/', requireAuth(['teacher', 'admin']), validateBody(CreateExamSchema), (req, res, next) => examController.createExam(req, res, next));
router.put('/:id', requireAuth(['teacher', 'admin']), (req, res, next) => examController.updateExam(req, res, next));
router.patch('/:id/status', requireAuth(['admin', 'teacher']), validateBody(UpdateExamStatusSchema), (req, res, next) => examController.updateStatus(req, res, next));
router.delete('/:id', requireAuth(['admin']), (req, res, next) => examController.deleteExam(req, res, next));

export default router;
