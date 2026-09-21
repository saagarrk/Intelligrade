import { z } from 'zod';
/**
 * Universal Sanitization Utilities
 * Prevents XSS, script injection, control character pollution, and whitespace distortion.
 */
// Strip HTML tags, script markers, null bytes, and non-printable control characters
export function sanitizeString(input) {
    if (typeof input !== 'string')
        return '';
    return input
        .replace(/\0/g, '') // remove null bytes
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove ASCII control characters except \t and \n
        .replace(/<[^>]*>?/gm, '') // strip HTML/XML tags
        .replace(/javascript:/gi, '') // remove javascript pseudo-protocol
        .trim();
}
// Deep space-normalizing text sanitizer for names and labels
export function sanitizeText(input) {
    const sanitized = sanitizeString(input);
    // Collapse consecutive whitespaces into a single standard space
    return sanitized.replace(/\s+/g, ' ');
}
// Strict email sanitizer: lowercase, trim, remove illegal whitespace
export function sanitizeEmail(input) {
    if (typeof input !== 'string')
        return '';
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
    .pipe(z
    .string()
    .min(1, 'Full Legal Name is required.')
    .min(LEGAL_NAME_MIN_LENGTH, `Full Legal Name must be at least ${LEGAL_NAME_MIN_LENGTH} characters.`)
    .max(LEGAL_NAME_MAX_LENGTH, `Full Legal Name cannot exceed ${LEGAL_NAME_MAX_LENGTH} characters.`)
    .refine((val) => !/\d/.test(val), {
    message: 'Full Legal Name cannot contain numbers or numeric digits. Legal names must use alphabetic letters only.'
})
    .refine((val) => LEGAL_NAME_REGEX.test(val), {
    message: 'Full Legal Name can only contain letters, spaces, hyphens (-), apostrophes (\'), and periods (.). Special symbols are not permitted.'
})
    .refine((val) => {
    const lettersOnly = val.replace(/[^a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/g, '');
    return lettersOnly.length >= 2;
}, {
    message: 'Full Legal Name must contain at least 2 alphabetic letters.'
}));
/**
 * Zod Schema for Institutional Email
 */
export const EmailSchema = z
    .string()
    .transform(sanitizeEmail)
    .pipe(z
    .string()
    .min(1, 'Institutional email is required.')
    .email('Please enter a valid institutional email address (e.g., name@university.edu).')
    .max(100, 'Email cannot exceed 100 characters.'));
export function evaluatePasswordStrength(password) {
    const p = password || '';
    const hasMinLength = p.length >= 8;
    const hasUppercase = /[A-Z]/.test(p);
    const hasLowercase = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const errors = [];
    if (!hasMinLength)
        errors.push('Minimum 8 characters');
    if (!hasUppercase)
        errors.push('At least one uppercase letter (A-Z)');
    if (!hasLowercase)
        errors.push('At least one lowercase letter (a-z)');
    if (!hasNumber)
        errors.push('At least one number (0-9)');
    if (!hasSpecial)
        errors.push('At least one special character (!@#$%^&*...)');
    let score = 0;
    if (hasMinLength)
        score++;
    if (hasUppercase)
        score++;
    if (hasLowercase)
        score++;
    if (hasNumber)
        score++;
    if (hasSpecial)
        score++;
    let label = 'Very Weak';
    let color = 'text-rose-500';
    if (score === 5) {
        label = 'Very Strong';
        color = 'text-emerald-400';
    }
    else if (score === 4) {
        label = 'Strong';
        color = 'text-emerald-500';
    }
    else if (score === 3) {
        label = 'Medium';
        color = 'text-amber-400';
    }
    else if (score === 2) {
        label = 'Weak';
        color = 'text-orange-400';
    }
    return {
        score,
        hasMinLength,
        hasUppercase,
        hasLowercase,
        hasNumber,
        hasSpecial,
        isValid: score >= 4 && hasMinLength, // production valid
        label,
        color,
        errors
    };
}
/**
 * Zod Schema for Production Strong Password
 */
export const StrongPasswordSchema = z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password cannot exceed 128 characters.')
    .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter (A-Z).'
})
    .refine((val) => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter (a-z).'
})
    .refine((val) => /[0-9]/.test(val), {
    message: 'Password must contain at least one numeric digit (0-9).'
})
    .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: 'Password must contain at least one special symbol (e.g. !@#$%^&*).'
});
/**
 * General Password Schema (Accepts existing 6+ char passwords for backwards login,
 * while StrongPasswordSchema is enforced for new creations, resets, and updates)
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
/**
 * Login Schema with Strict Validation and Sanitization
 */
export const LoginSchema = z.object({
    email: EmailSchema,
    password: z.string().min(1, 'Password is required.'),
    role: UserRoleSchema.optional(),
    rememberMe: z.boolean().optional().default(false)
});
/**
 * Forgot Password Schema
 */
export const ForgotPasswordSchema = z.object({
    email: EmailSchema
});
/**
 * Reset Password Schema
 */
export const ResetPasswordSchema = z.object({
    email: EmailSchema,
    token: z.string().min(1, 'Password reset token or code is required.'),
    newPassword: StrongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required.')
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match. Please re-enter your new password.',
    path: ['confirmPassword']
});
/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: StrongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required.')
}).refine(data => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match. Please re-enter.',
    path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password.',
    path: ['newPassword']
});
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
        .pipe(z
        .string()
        .min(1, 'Appeal justification is required.')
        .min(5, 'Please provide a clear justification of at least 5 characters.')
        .max(1000, 'Appeal justification cannot exceed 1000 characters.')),
    studentRollNo: z.string().optional().transform(val => (val ? sanitizeText(val).slice(0, 50) : undefined))
});
export function validateWithSchema(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const fieldErrors = {};
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
