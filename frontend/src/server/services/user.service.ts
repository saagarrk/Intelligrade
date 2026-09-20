import bcrypt from 'bcryptjs';
import { userRepository, UserFilters } from '../repositories/user.repository';
import { auditRepository } from '../repositories/audit.repository';
import { authService } from './auth.service';
import { UserEntity } from '../database/inMemoryDb';
import {
  UserResponseDto,
  toUserResponseDto,
  CreateUserDto
} from '../dtos/user.dto';
import { PaginationParams, PaginatedResult } from '../common/pagination';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../common/errors';

export class UserService {
  async getUsers(filters: UserFilters, pagination: PaginationParams): Promise<PaginatedResult<UserResponseDto>> {
    const res = await userRepository.findAll(filters, pagination) as PaginatedResult<UserEntity>;
    return {
      items: res.items.map(toUserResponseDto),
      meta: res.meta
    };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' was not found.`);
    }
    return toUserResponseDto(user);
  }

  async createUser(dto: CreateUserDto, actorEmail: string): Promise<UserResponseDto> {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`User with email '${dto.email}' already exists.`);
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(dto.password, salt);

    const newUser: UserEntity = {
      id: `usr_${dto.role}_${Date.now()}`,
      name: dto.name,
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: dto.role,
      department: dto.department || 'General Academic',
      rollNumber: dto.rollNumber,
      title: dto.title,
      permissions: dto.role === 'admin'
        ? ['read:all', 'write:all', 'admin:manage_users', 'admin:audit_logs']
        : dto.role === 'teacher'
        ? ['read:all', 'write:preprocess', 'write:ocr', 'write:grades', 'override:marks']
        : ['read:submissions', 'read:grades', 'read:insights'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true
    };

    const created = await userRepository.create(newUser);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_CREATE_USER',
      resource: `User: ${created.email} (${created.role})`,
      status: 'Success'
    });

    return toUserResponseDto(created);
  }

  async updateUserRole(id: string, newRole: 'student' | 'teacher' | 'admin', actorEmail: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found.`);
    }

    const updated = await userRepository.update(id, { role: newRole });
    if (!updated) {
      throw new NotFoundError(`Failed to update role for user '${id}'.`);
    }

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_UPDATE_ROLE',
      resource: `User: ${user.email} -> ${newRole}`,
      status: 'Success'
    });

    return toUserResponseDto(updated);
  }

  async updateUserStatus(id: string, isActive: boolean, actorEmail: string): Promise<UserResponseDto> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found.`);
    }

    const updated = await userRepository.update(id, { isActive });
    if (!updated) {
      throw new NotFoundError(`Failed to update status for user '${id}'.`);
    }

    // Invalidate sessions immediately if deactivated
    if (!isActive) {
      authService.invalidateUserSessions(id);
    }

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: isActive ? 'ADMIN_ACTIVATE_USER' : 'ADMIN_DEACTIVATE_USER',
      resource: `User: ${user.email} (Status: ${isActive ? 'ACTIVE' : 'DEACTIVATED'})`,
      status: 'Success'
    });

    return toUserResponseDto(updated);
  }

  async resetPassword(id: string, newPassword?: string, actorEmail = 'admin@intelligrade.edu'): Promise<{ temporaryPassword: string }> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found.`);
    }

    const tempPassword = newPassword || `Temp@${Math.random().toString(36).substring(2, 8)}!`;
    const passwordHash = bcrypt.hashSync(tempPassword, 10);

    await userRepository.update(id, { passwordHash });
    authService.invalidateUserSessions(id);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_RESET_PASSWORD',
      resource: `User: ${user.email}`,
      status: 'Success'
    });

    return { temporaryPassword: tempPassword };
  }

  async deleteUser(id: string, actorEmail: string): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id '${id}' not found.`);
    }

    if (id === 'usr_admin_01') {
      throw new ForbiddenError('Root Primary Administrator account cannot be deleted.');
    }

    authService.invalidateUserSessions(id);
    await userRepository.delete(id);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_DELETE_USER',
      resource: `User: ${user.email}`,
      status: 'Success'
    });
  }
}

export const userService = new UserService();
