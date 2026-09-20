import { z } from 'zod';
import { SubmissionEntity, ExamEntity } from '../database/inMemoryDb';

export interface SubmissionResponseDto {
  id: string;
  examId: string;
  examTitle: string;
  studentId?: string;
  studentName: string;
  studentRollNo: string;
  submittedAt: string;
  status: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  gradeAwarded: string;
  isFlagged: boolean;
  pagesCount: number;
}

export function toSubmissionResponseDto(sub: SubmissionEntity, exam?: ExamEntity): SubmissionResponseDto {
  const maxScore = sub.maxScore || (exam ? exam.totalMarks : 100);
  const totalScore = sub.totalScore || 0;
  const percentageScore = sub.percentageScore || (maxScore > 0 ? Number(((totalScore / maxScore) * 100).toFixed(1)) : 0);

  return {
    id: sub.id,
    examId: sub.examId,
    examTitle: (sub as any).examTitle || exam?.title || 'Academic Assessment',
    studentId: sub.studentId,
    studentName: sub.studentName,
    studentRollNo: sub.studentRollNo,
    submittedAt: sub.submittedAt,
    status: sub.status,
    totalScore,
    maxScore,
    percentageScore,
    gradeAwarded: sub.gradeAwarded || (percentageScore >= 90 ? 'A+' : percentageScore >= 80 ? 'A' : percentageScore >= 70 ? 'B' : percentageScore >= 60 ? 'C' : 'F'),
    isFlagged: !!sub.isFlagged,
    pagesCount: sub.pages?.length || 0
  };
}

export const UpdateSubmissionStatusSchema = z.object({
  status: z.enum(['UPLOADED', 'PREPROCESSED', 'OCR_COMPLETED', 'GRADING', 'COMPLETED', 'UNDER_REVIEW', 'FAILED'])
});

export type UpdateSubmissionStatusDto = z.infer<typeof UpdateSubmissionStatusSchema>;

export const SubmissionPageSchema = z.object({
  pageNumber: z.number().int().positive().default(1),
  dataUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  ocrText: z.string().optional()
});

export const CreateSubmissionSchema = z.object({
  examId: z.string().min(1, 'Exam ID is required'),
  studentName: z.string().min(1).optional(),
  studentRollNo: z.string().optional(),
  studentRollNumber: z.string().optional(),
  studentId: z.string().optional(),
  pages: z.array(SubmissionPageSchema).optional()
});

export type CreateSubmissionDto = z.infer<typeof CreateSubmissionSchema>;

export const GradeOverrideSchema = z.object({
  awardedMarks: z.number().nonnegative(),
  rationale: z.string().min(5, 'Override reason is required')
});

export type GradeOverrideDto = z.infer<typeof GradeOverrideSchema>;
