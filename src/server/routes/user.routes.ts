import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validateRequest';
import {
  CreateUserSchema,
  UpdateUserRoleSchema,
  UpdateUserStatusSchema,
  AdminResetPasswordSchema
} from '../dtos/user.dto';

const router = Router();

// All user management routes require admin privileges
router.use(requireAuth(['admin']));

router.get('/', (req, res, next) => userController.getUsers(req, res, next));
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));
router.post('/', validateBody(CreateUserSchema), (req, res, next) => userController.createUser(req, res, next));
router.patch('/:id/role', validateBody(UpdateUserRoleSchema), (req, res, next) => userController.updateRole(req, res, next));
router.patch('/:id/status', validateBody(UpdateUserStatusSchema), (req, res, next) => userController.updateStatus(req, res, next));
router.post('/:id/reset-password', validateBody(AdminResetPasswordSchema), (req, res, next) => userController.resetPassword(req, res, next));
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export default router;
