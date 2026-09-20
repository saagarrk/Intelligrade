import { db, ExamEntity } from '../database/inMemoryDb';
import { PaginationParams, PaginatedResult, paginateAndSort } from '../common/pagination';

export interface ExamFilters {
  query?: string;
  status?: string;
  subject?: string;
}

export class ExamRepository {
  async findAll(filters: ExamFilters = {}, pagination?: PaginationParams): Promise<PaginatedResult<ExamEntity> | ExamEntity[]> {
    let exams = db.getAllExams();

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      exams = exams.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.courseCode.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'all') {
      exams = exams.filter(e => e.status === filters.status);
    }

    if (filters.subject && filters.subject !== 'all') {
      exams = exams.filter(e => e.subject === filters.subject);
    }

    if (!pagination) {
      return exams;
    }

    return paginateAndSort(exams, pagination);
  }

  async findById(id: string): Promise<ExamEntity | null> {
    const exam = db.getExamById(id);
    return exam || null;
  }

  async create(examData: ExamEntity): Promise<ExamEntity> {
    return db.saveExam(examData);
  }

  async update(id: string, updates: Partial<ExamEntity>): Promise<ExamEntity | null> {
    const existing = db.getExamById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return db.saveExam(updated);
  }

  async delete(id: string): Promise<boolean> {
    return db.deleteExam(id);
  }

  async count(filters: ExamFilters = {}): Promise<number> {
    const res = await this.findAll(filters);
    return Array.isArray(res) ? res.length : res.meta.total;
  }
}

export const examRepository = new ExamRepository();
