import { z } from 'zod';
import { ExamEntity, SubmissionEntity } from '../database/inMemoryDb';

export interface ExamResponseDto {
  id: string;
  title: string;
  courseCode: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  gradeLevel?: string;
  instructions?: string[];
  status: 'published' | 'draft';
  questions: any[];
  questionsCount: number;
  submissionsCount: number;
  avgScore: number;
  createdAt: string;
  updatedAt: string;
}

export function toExamResponseDto(exam: ExamEntity, examSubmissions: SubmissionEntity[] = []): ExamResponseDto {
  const completedSubs = examSubmissions.filter(s => s.status === 'COMPLETED');
  const avgScore = completedSubs.length > 0
    ? Number((completedSubs.reduce((acc, s) => acc + (s.percentageScore ?? 0), 0) / completedSubs.length).toFixed(1))
    : 75.0;

  return {
    id: exam.id,
    title: exam.title,
    courseCode: exam.courseCode,
    subject: exam.subject,
    totalMarks: exam.totalMarks,
    durationMinutes: exam.durationMinutes,
    gradeLevel: exam.gradeLevel,
    instructions: exam.instructions,
    status: exam.status,
    questions: exam.questions || [],
    questionsCount: exam.questions?.length || 0,
    submissionsCount: examSubmissions.length,
    avgScore,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt
  };
}

export const CreateExamSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  courseCode: z.string().min(2, 'Course code is required'),
  subject: z.string().min(2, 'Subject is required'),
  totalMarks: z.number().positive(),
  durationMinutes: z.number().positive().default(90),
  gradeLevel: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  questions: z.array(z.any()).optional()
});

export type CreateExamDto = z.infer<typeof CreateExamSchema>;

export const UpdateExamStatusSchema = z.object({
  status: z.enum(['published', 'draft'])
});

export type UpdateExamStatusDto = z.infer<typeof UpdateExamStatusSchema>;
