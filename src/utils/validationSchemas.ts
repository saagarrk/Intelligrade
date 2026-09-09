import { z } from 'zod';

/**
 * Universal Sanitization Utilities
 * Prevents XSS, script injection, control character pollution, and whitespace distortion.
 */

// Strip HTML tags, script markers, null bytes, and non-printable control characters
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove ASCII control characters except \t and \n
    .replace(/<[^>]*>?/gm, '') // strip HTML/XML tags
    .replace(/javascript:/gi, '') // remove javascript pseudo-protocol
    .trim();
}

// Deep space-normalizing text sanitizer for names and labels
export function sanitizeText(input: unknown): string {
  const sanitized = sanitizeString(input);
  // Collapse consecutive whitespaces into a single standard space
  return sanitized.replace(/\s+/g, ' ');
}

// Strict email sanitizer: lowercase, trim, remove illegal whitespace
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  return sanitizeString(input).toLowerCase().replace(/\s+/g, '');
}

/**
 * Regex-based Legal Naming Constants
 */
export const LEGAL_NAME_REGEX = /^[a-zA-Z\s\-'.\u00C0-\u024F\u1E00-\u1EFF]+$/;
export const LEGAL_NAME_MIN_LENGTH = 2;
export const LEGAL_NAME_MAX_LENGTH = 70;

/**
 * Zod Schema for Full Legal Name
 * 1. Sanitizes string (removes HTML tags and normalizes spaces)
 * 2. Checks required non-empty string
 * 3. Explicitly rejects numeric characters (0-9)
 * 4. Enforces strict regex for valid alphabetic, hyphen, apostrophe, period, and international letters
 * 5. Enforces minimum 2 alphabetic letters
 * 6. Enforces length constraints (2 to 70 characters)
 */
export const LegalNameSchema = z
  .string()
  .transform(sanitizeText)
  .pipe(
    z
      .string()
      .min(1, 'Full Legal Name is required.')
      .min(
        LEGAL_NAME_MIN_LENGTH,
        `Full Legal Name must be at least ${LEGAL_NAME_MIN_LENGTH} characters.`
      )
      .max(
        LEGAL_NAME_MAX_LENGTH,
        `Full Legal Name cannot exceed ${LEGAL_NAME_MAX_LENGTH} characters.`
      )
      .refine(
        (val) => !/\d/.test(val),
        {
          message: 'Full Legal Name cannot contain numbers or numeric digits. Legal names must use alphabetic letters only.'
        }
      )
      .refine(
        (val) => LEGAL_NAME_REGEX.test(val),
        {
          message: 'Full Legal Name can only contain letters, spaces, hyphens (-), apostrophes (\'), and periods (.). Special symbols are not permitted.'
        }
      )
      .refine(
        (val) => {
          const lettersOnly = val.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/g, '');
          return lettersOnly.length >= 2;
        },
        {
          message: 'Full Legal Name must contain at least 2 alphabetic letters.'
        }
      )
  );

/**
 * Zod Schema for Institutional Email
 */
export const EmailSchema = z
  .string()
  .transform(sanitizeEmail)
  .pipe(
    z
      .string()
      .min(1, 'Institutional email is required.')
      .email('Please enter a valid institutional email address (e.g., name@university.edu).')
      .max(100, 'Email cannot exceed 100 characters.')
  );

/**
 * Zod Schema for Password
 */
export const PasswordSchema = z
  .string()
  .min(1, 'Password is required.')
  .min(6, 'Password must be at least 6 characters long.')
  .max(128, 'Password cannot exceed 128 characters.');

/**
 * Zod Schema for Role
 */
export const UserRoleSchema = z.enum(['student', 'teacher', 'admin']);

/**
 * Registration Schema with Strict Validation and Sanitization
 */
export const RegisterSchema = z.object({
  name: LegalNameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  role: UserRoleSchema.default('student'),
  department: z.string().optional().transform(val => (val ? sanitizeText(val).slice(0, 100) : undefined)),
  rollNumber: z.string().optional().transform(val => (val ? sanitizeText(val).slice(0, 50) : undefined)),
  title: z.string().optional().transform(val => (val ? sanitizeText(val).slice(0, 80) : undefined)),
  adminKey: z.string().optional().transform(val => (val ? sanitizeString(val) : undefined)),
  teacherKey: z.string().optional().transform(val => (val ? sanitizeString(val) : undefined))
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Login Schema with Strict Validation and Sanitization
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required.'),
  role: UserRoleSchema.optional()
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Student Reevaluation Appeal Schema
 */
export const ReevaluationAppealSchema = z.object({
  questionNumber: z
    .union([z.number(), z.string()])
    .transform(val => Number(val))
    .refine(val => !isNaN(val) && val >= 1 && val <= 50, {
      message: 'Question number must be a valid positive number between 1 and 50.'
    }),
  reason: z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(1, 'Appeal justification is required.')
        .min(5, 'Please provide a clear justification of at least 5 characters.')
        .max(1000, 'Appeal justification cannot exceed 1000 characters.')
    ),
  studentRollNo: z.string().optional().transform(val => (val ? sanitizeText(val).slice(0, 50) : undefined))
});

export type ReevaluationAppealInput = z.infer<typeof ReevaluationAppealSchema>;

/**
 * Schema Validation Helper that returns structured error info
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  let firstErrorMessage = 'Validation failed.';

  for (const issue of result.error.issues) {
    const fieldName = issue.path.join('.') || 'root';
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  }

  if (result.error.issues.length > 0) {
    firstErrorMessage = result.error.issues[0].message;
  }

  return {
    success: false,
    error: firstErrorMessage,
    fieldErrors
  };
}
