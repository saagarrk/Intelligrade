import { z } from 'zod';
import { UserResponseDto } from './user.dto';

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['student', 'teacher', 'admin']).optional()
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'admin']),
  department: z.string().optional(),
  rollNumber: z.string().optional(),
  title: z.string().optional(),
  teacherKey: z.string().optional(),
  adminKey: z.string().optional()
});

export type RegisterRequestDto = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Valid institutional email is required')
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  email: z.string().email('Valid institutional email is required'),
  token: z.string().min(1, 'Reset code or token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
  expiresIn?: string;
}
