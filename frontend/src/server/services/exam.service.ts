import { examRepository, ExamFilters } from '../repositories/exam.repository';
import { submissionRepository } from '../repositories/submission.repository';
import { auditRepository } from '../repositories/audit.repository';
import { ExamEntity, SubmissionEntity } from '../database/inMemoryDb';
import { ExamResponseDto, toExamResponseDto, CreateExamDto } from '../dtos/exam.dto';
import { PaginationParams, PaginatedResult } from '../common/pagination';
import { NotFoundError, BadRequestError } from '../common/errors';

export class ExamService {
  async getExams(filters: ExamFilters, pagination?: PaginationParams): Promise<PaginatedResult<ExamResponseDto> | ExamResponseDto[]> {
    const allSubs = await submissionRepository.findAll({}) as SubmissionEntity[];

    if (!pagination) {
      const exams = await examRepository.findAll(filters) as ExamEntity[];
      return exams.map(exam => {
        const examSubs = allSubs.filter(s => s.examId === exam.id);
        return toExamResponseDto(exam, examSubs);
      });
    }

    const res = await examRepository.findAll(filters, pagination) as PaginatedResult<ExamEntity>;
    return {
      items: res.items.map(exam => {
        const examSubs = allSubs.filter(s => s.examId === exam.id);
        return toExamResponseDto(exam, examSubs);
      }),
      meta: res.meta
    };
  }

  async getExamById(id: string): Promise<ExamResponseDto & { questions: any[] }> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError(`Examination with id '${id}' not found.`);
    }

    const subs = await submissionRepository.findAll({ examId: id }) as SubmissionEntity[];
    const dto = toExamResponseDto(exam, subs);
    return { ...dto, questions: exam.questions || [] };
  }

  async createExam(dto: CreateExamDto, actorEmail: string): Promise<ExamResponseDto> {
    const newExam: ExamEntity = {
      id: `exam_${Date.now()}`,
      title: dto.title,
      courseCode: dto.courseCode,
      subject: dto.subject,
      totalMarks: dto.totalMarks,
      durationMinutes: dto.durationMinutes || 90,
      gradeLevel: dto.gradeLevel || 'Undergraduate',
      instructions: dto.instructions || [],
      status: 'published',
      questions: dto.questions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await examRepository.create(newExam);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_CREATE_EXAM',
      resource: `Exam: ${saved.title} (${saved.courseCode})`,
      status: 'Success'
    });

    return toExamResponseDto(saved, []);
  }

  async updateExam(id: string, updates: any, actorEmail: string): Promise<ExamResponseDto> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError(`Examination with id '${id}' not found.`);
    }

    const updated = await examRepository.update(id, updates);
    if (!updated) {
      throw new NotFoundError(`Failed to update exam '${id}'.`);
    }

    const subs = await submissionRepository.findAll({ examId: id }) as SubmissionEntity[];

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'teacher',
      action: 'TEACHER_UPDATE_EXAM',
      resource: `Exam: ${exam.title}`,
      status: 'Success'
    });

    return toExamResponseDto(updated, subs);
  }

  async updateExamStatus(id: string, status: 'published' | 'draft', actorEmail: string): Promise<ExamResponseDto> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError(`Examination with id '${id}' not found.`);
    }

    const updated = await examRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundError(`Failed to update status for exam '${id}'.`);
    }

    const subs = await submissionRepository.findAll({ examId: id }) as SubmissionEntity[];

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_UPDATE_EXAM_STATUS',
      resource: `Exam: ${exam.title} -> ${status}`,
      status: 'Success'
    });

    return toExamResponseDto(updated, subs);
  }

  async deleteExam(id: string, actorEmail: string): Promise<void> {
    const exam = await examRepository.findById(id);
    if (!exam) {
      throw new NotFoundError(`Examination with id '${id}' not found.`);
    }

    await examRepository.delete(id);

    await auditRepository.create({
      timestamp: new Date().toISOString(),
      userEmail: actorEmail,
      userRole: 'admin',
      action: 'ADMIN_DELETE_EXAM',
      resource: `Exam: ${exam.title}`,
      status: 'Success'
    });
  }
}

export const examService = new ExamService();
