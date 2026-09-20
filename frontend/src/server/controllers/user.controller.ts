import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../common/apiResponse';
import { parsePaginationParams } from '../common/pagination';

export class UserController {
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePaginationParams(req.query, 10);
      const filters = {
        query: req.query.q ? String(req.query.q) : undefined,
        role: req.query.role ? String(req.query.role) : undefined,
        status: req.query.status ? String(req.query.status) : undefined,
        department: req.query.department ? String(req.query.department) : undefined
      };

      const result = await userService.getUsers(filters, pagination);
      ApiResponse.success(res, { users: result.items }, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      ApiResponse.success(res, { user });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const user = await userService.createUser(req.body, actorEmail);
      ApiResponse.created(res, { user, message: 'User created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const user = await userService.updateUserRole(req.params.id, req.body.role, actorEmail);
      ApiResponse.success(res, { user, message: `Role updated to ${req.body.role}` });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const user = await userService.updateUserStatus(req.params.id, req.body.isActive, actorEmail);
      ApiResponse.success(res, {
        user,
        message: `Account has been ${req.body.isActive ? 'activated' : 'deactivated'}`
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      const result = await userService.resetPassword(req.params.id, req.body.newPassword, actorEmail);
      ApiResponse.success(res, {
        temporaryPassword: result.temporaryPassword,
        message: 'Password reset successful. Temporary password generated.'
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actorEmail = req.user?.email || 'admin@intelligrade.edu';
      await userService.deleteUser(req.params.id, actorEmail);
      ApiResponse.success(res, { message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
