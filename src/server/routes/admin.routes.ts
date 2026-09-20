import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { userController } from '../controllers/user.controller';
import { examController } from '../controllers/exam.controller';
import { submissionController } from '../controllers/submission.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import {
  CreateUserSchema,
  UpdateUserRoleSchema,
  UpdateUserStatusSchema,
  AdminResetPasswordSchema
} from '../dtos/user.dto';
import { UpdateExamStatusSchema } from '../dtos/exam.dto';
import { UpdateSubmissionStatusSchema } from '../dtos/submission.dto';

const router = Router();

// Strict Admin-only Authorization Guard
router.use(requireAuth(['admin']));

// System Statistics & Health
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// Audit Logs Ledger
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

// Evaluations Management
router.get('/evaluations', (req, res, next) => adminController.getEvaluations(req, res, next));
router.post('/evaluations/:submissionId/re-evaluate', (req, res, next) => submissionController.reevaluate(req, res, next));

// User Management (/api/v1/admin/users/*)
router.get('/users', (req, res, next) => userController.getUsers(req, res, next));
router.get('/users/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/users', validateBody(CreateUserSchema), (req, res, next) => userController.createUser(req, res, next));
router.patch('/users/:id/role', validateBody(UpdateUserRoleSchema), (req, res, next) => userController.updateRole(req, res, next));
router.patch('/users/:id/status', validateBody(UpdateUserStatusSchema), (req, res, next) => userController.updateStatus(req, res, next));
router.post('/users/:id/reset-password', validateBody(AdminResetPasswordSchema), (req, res, next) => userController.resetPassword(req, res, next));
router.delete('/users/:id', (req, res, next) => userController.deleteUser(req, res, next));

// Examinations Management (/api/v1/admin/examinations/*)
router.get('/examinations', (req, res, next) => examController.getExams(req, res, next));
router.patch('/examinations/:id/status', validateBody(UpdateExamStatusSchema), (req, res, next) => examController.updateStatus(req, res, next));
router.delete('/examinations/:id', (req, res, next) => examController.deleteExam(req, res, next));

// Submissions Management (/api/v1/admin/submissions/*)
router.get('/submissions', (req, res, next) => submissionController.getSubmissions(req, res, next));
router.patch('/submissions/:id/status', validateBody(UpdateSubmissionStatusSchema), (req, res, next) => submissionController.updateStatus(req, res, next));
router.delete('/submissions/:id', (req, res, next) => submissionController.deleteSubmission(req, res, next));

export default router;
