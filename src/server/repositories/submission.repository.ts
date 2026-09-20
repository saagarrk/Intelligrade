import { db, SubmissionEntity } from '../database/inMemoryDb';
import { PaginationParams, PaginatedResult, paginateAndSort } from '../common/pagination';

export interface SubmissionFilters {
  query?: string;
  status?: string;
  examId?: string;
  studentId?: string;
  studentRollNo?: string;
  studentName?: string;
  scoreTier?: 'high' | 'medium' | 'low' | 'all';
}

export class SubmissionRepository {
  async findAll(filters: SubmissionFilters = {}, pagination?: PaginationParams): Promise<PaginatedResult<SubmissionEntity> | SubmissionEntity[]> {
    let submissions = db.getAllSubmissions();

    if (filters.examId) {
      submissions = submissions.filter(s => s.examId === filters.examId);
    }

    if (filters.studentId) {
      submissions = submissions.filter(s => s.studentId === filters.studentId);
    }

    if (filters.studentRollNo) {
      const roll = filters.studentRollNo.toLowerCase().trim();
      submissions = submissions.filter(s => {
        const sRoll = (s.studentRollNo || (s as any).studentRollNumber || '').toLowerCase().trim();
        return sRoll === roll;
      });
    }

    if (filters.studentName) {
      const name = filters.studentName.toLowerCase().trim();
      submissions = submissions.filter(s => (s.studentName || '').toLowerCase().trim() === name);
    }

    if (filters.status && filters.status !== 'all') {
      submissions = submissions.filter(s => s.status === filters.status);
    }

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      submissions = submissions.filter(s =>
        (s.studentName || '').toLowerCase().includes(q) ||
        (s.studentRollNo || (s as any).studentRollNumber || '').toLowerCase().includes(q) ||
        ((s as any).examTitle || '').toLowerCase().includes(q)
      );
    }

    if (filters.scoreTier && filters.scoreTier !== 'all') {
      submissions = submissions.filter(s => {
        const pct = s.percentageScore ?? 0;
        if (filters.scoreTier === 'high') return pct >= 80;
        if (filters.scoreTier === 'medium') return pct >= 60 && pct < 80;
        if (filters.scoreTier === 'low') return pct < 60;
        return true;
      });
    }

    if (!pagination) {
      return submissions;
    }

    return paginateAndSort(submissions, pagination);
  }

  async findById(id: string): Promise<SubmissionEntity | null> {
    const sub = db.getSubmissionById(id);
    return sub || null;
  }

  async create(subData: SubmissionEntity): Promise<SubmissionEntity> {
    return db.saveSubmission(subData);
  }

  async update(id: string, updates: Partial<SubmissionEntity>): Promise<SubmissionEntity | null> {
    const existing = db.getSubmissionById(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    return db.saveSubmission(updated);
  }

  async delete(id: string): Promise<boolean> {
    const sub = db.getSubmissionById(id);
    if (sub && (sub as any).secureFileId) {
      db.deleteSecureFile((sub as any).secureFileId);
    }
    return db.deleteSubmission(id);
  }

  getSecureFile(fileId: string) {
    return db.getSecureFile(fileId);
  }

  saveSecureFile(record: any) {
    return db.saveSecureFile(record);
  }

  deleteSecureFile(fileId: string) {
    return db.deleteSecureFile(fileId);
  }

  async count(filters: SubmissionFilters = {}): Promise<number> {
    const res = await this.findAll(filters);
    return Array.isArray(res) ? res.length : res.meta.total;
  }
}

export const submissionRepository = new SubmissionRepository();
