import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  LoginSchema,
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema
} from '../dtos/auth.dto';

const router = Router();

router.post('/login', authRateLimiter, validateBody(LoginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/register', authRateLimiter, validateBody(RegisterSchema), (req, res, next) => authController.register(req, res, next));
router.get('/me', requireAuth(), (req, res, next) => authController.me(req, res, next));
router.get('/session-validate', requireAuth(), (req, res, next) => authController.sessionValidate(req, res, next));
router.post('/logout', requireAuth(), (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', authRateLimiter, validateBody(ForgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authRateLimiter, validateBody(ResetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));
router.post('/change-password', requireAuth(), validateBody(ChangePasswordSchema), (req, res, next) => authController.changePassword(req, res, next));

export default router;
