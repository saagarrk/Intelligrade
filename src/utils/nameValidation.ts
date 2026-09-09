/**
 * Full Legal Name Validation Utility
 * Enforces institutional compliance: alphabetic characters only, no numbers,
 * length constraints, and strict input sanitization.
 */
import { LegalNameSchema, sanitizeText, LEGAL_NAME_REGEX } from './validationSchemas';

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedName?: string;
}

export function validateLegalName(name: string): NameValidationResult {
  const result = LegalNameSchema.safeParse(name);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      isValid: false,
      error: firstIssue?.message || 'Invalid Full Legal Name.'
    };
  }

  return {
    isValid: true,
    sanitizedName: result.data
  };
}

/**
 * Filter out numbers in real-time if desired
 */
export function filterNameInput(value: string): string {
  return sanitizeText(value.replace(/\d/g, ''));
}

export { LEGAL_NAME_REGEX, sanitizeText };
