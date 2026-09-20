import { z } from 'zod';

export type EvaluationStatusType = 'AI_SUGGESTED' | 'TEACHER_REVIEWED' | 'FINALIZED';

export interface EvaluationCriterionDto {
  id?: string;
  criterionName: string;
  description?: string;
  maxMarks: number;
  aiSuggestedMarks?: number;
  aiConfidence?: number;
  teacherAdjustedMarks?: number | null;
  finalMarks?: number | null;
  matchStatus?: string;
  feedback?: string;
}

export interface FeedbackItemDto {
  id?: string;
  feedbackType: string;
  feedbackText: string;
  author?: string;
  authorRole?: string;
  isPublicToStudent?: boolean;
}

export interface EvaluationResponseDto {
  id: string;
  submissionId: string;
  questionId: string;
  questionNumber: number;
  questionText: string;
  studentAnswer: string;
  modelAnswer: string;
  maxMarks: number;
  aiSuggestedMarks: number;
  aiConfidence: number;
  aiFeedback: string;
  semanticSimilarityScore?: number;
  teacherAdjustedMarks: number | null;
  finalMarks: number | null;
  evaluationStatus: EvaluationStatusType;
  isTeacherReviewed: boolean;
  reviewedBy: string | null;
  teacherNotes: string | null;
  teacherComment: string | null;
  finalizedAt?: string | null;
  finalizedBy?: string | null;
  createdTimestamp: string;
  updatedTimestamp: string;
  criteria?: EvaluationCriterionDto[];
  feedbacks?: FeedbackItemDto[];
  strengths?: string[];
  weaknesses?: string[];
  deductions?: Array<{ reason: string; pointsDeducted: number; category?: string }>;
}

export const UpdateTeacherEvaluationSchema = z.object({
  teacherAdjustedMarks: z.number().min(0).max(100).optional().nullable(),
  awardedMarks: z.number().min(0).max(100).optional().nullable(),
  teacherComment: z.string().optional(),
  teacherNotes: z.string().optional(),
  feedback: z.string().optional(),
  criteria: z.array(z.object({
    id: z.string().optional(),
    criterionName: z.string().optional(),
    name: z.string().optional(),
    awardedMarks: z.number().min(0).optional(),
    maxMarks: z.number().min(0).optional(),
    feedback: z.string().optional()
  })).optional()
});

export type UpdateTeacherEvaluationDto = z.infer<typeof UpdateTeacherEvaluationSchema>;

export const AcceptAiSuggestionSchema = z.object({
  teacherComment: z.string().optional(),
  teacherNotes: z.string().optional()
});

export type AcceptAiSuggestionDto = z.infer<typeof AcceptAiSuggestionSchema>;

export const ModifyMarksSchema = z.object({
  marks: z.number().min(0).max(100).optional(),
  awardedMarks: z.number().min(0).max(100).optional(),
  teacherAdjustedMarks: z.number().min(0).max(100).optional(),
  reason: z.string().optional(),
  teacherComment: z.string().optional(),
  teacherNotes: z.string().optional()
});

export type ModifyMarksDto = z.infer<typeof ModifyMarksSchema>;

export const FinalizeEvaluationSchema = z.object({
  finalMarks: z.number().min(0).max(100).optional().nullable(),
  teacherComment: z.string().optional(),
  teacherNotes: z.string().optional(),
  finalizedBy: z.string().optional()
});

export type FinalizeEvaluationDto = z.infer<typeof FinalizeEvaluationSchema>;
