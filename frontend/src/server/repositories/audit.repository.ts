import { db, AuditLogEntity } from '../database/inMemoryDb';
import { PaginationParams, PaginatedResult, paginateAndSort } from '../common/pagination';

export interface AuditFilters {
  query?: string;
  role?: string;
  action?: string;
  status?: string;
}

export class AuditRepository {
  async findAll(filters: AuditFilters = {}, pagination?: PaginationParams): Promise<PaginatedResult<AuditLogEntity> | AuditLogEntity[]> {
    let logs = db.getAllAuditLogs();

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      logs = logs.filter(l =>
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q)
      );
    }

    if (filters.role && filters.role !== 'all') {
      logs = logs.filter(l => l.userRole.toLowerCase() === filters.role?.toLowerCase());
    }

    if (filters.status && filters.status !== 'all') {
      logs = logs.filter(l => l.status === filters.status);
    }

    if (!pagination) {
      return logs;
    }

    return paginateAndSort(logs, pagination);
  }

  async create(logData: Omit<AuditLogEntity, 'id'>): Promise<AuditLogEntity> {
    return db.addAuditLog(logData);
  }

  async count(filters: AuditFilters = {}): Promise<number> {
    const res = await this.findAll(filters);
    return Array.isArray(res) ? res.length : res.meta.total;
  }
}

export const auditRepository = new AuditRepository();
