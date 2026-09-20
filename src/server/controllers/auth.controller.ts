import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../common/apiResponse';
import { toUserResponseDto } from '../dtos/user.dto';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      ApiResponse.success(res, result, 200);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      ApiResponse.created(res, result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 401, 'Unauthorized');
        return;
      }
      ApiResponse.success(res, { user: toUserResponseDto(req.user) });
    } catch (err) {
      next(err);
    }
  }

  async sessionValidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.token) {
        ApiResponse.error(res, 401, 'Unauthorized session', 'TOKEN_MISSING');
        return;
      }
      const session = authService.getSession(req.token);
      ApiResponse.success(res, {
        valid: true,
        user: toUserResponseDto(req.user),
        expiresAt: session?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.token) {
        authService.revokeToken(req.token);
      }
      ApiResponse.success(res, { message: 'Successfully logged out' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      ApiResponse.success(res, {
        message: `Password reset verification code generated for ${email}.`,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, token, newPassword } = req.body;
      await authService.resetPassword(email, token, newPassword);
      ApiResponse.success(res, {
        message: 'Your password has been successfully updated. Please log in with your new credentials.'
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 401, 'Unauthorized');
        return;
      }
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      ApiResponse.success(res, {
        message: 'Your password has been successfully updated.'
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
