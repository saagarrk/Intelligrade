import { z } from 'zod';
import { UserEntity } from '../database/inMemoryDb';

// Response DTO: NEVER exposes passwordHash!
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  department?: string;
  rollNumber?: string;
  title?: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export function toUserResponseDto(entity: UserEntity): UserResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    role: entity.role,
    department: entity.department,
    rollNumber: entity.rollNumber,
    title: entity.title,
    permissions: entity.permissions || [],
    createdAt: entity.createdAt,
    lastLogin: entity.lastLogin,
    isActive: entity.isActive
  };
}

// Request DTO Schemas
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'admin']),
  department: z.string().optional(),
  rollNumber: z.string().optional(),
  title: z.string().optional()
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['student', 'teacher', 'admin'])
});

export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleSchema>;

export const UpdateUserStatusSchema = z.object({
  isActive: z.boolean()
});

export type UpdateUserStatusDto = z.infer<typeof UpdateUserStatusSchema>;

export const AdminResetPasswordSchema = z.object({
  newPassword: z.string().min(6).optional()
});

export type AdminResetPasswordDto = z.infer<typeof AdminResetPasswordSchema>;
