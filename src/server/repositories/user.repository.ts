import { db, UserEntity } from '../database/inMemoryDb';
import { PaginationParams, PaginatedResult, paginateAndSort } from '../common/pagination';

export interface UserFilters {
  query?: string;
  role?: string;
  status?: string;
  department?: string;
}

export class UserRepository {
  async findAll(filters: UserFilters = {}, pagination?: PaginationParams): Promise<PaginatedResult<UserEntity> | UserEntity[]> {
    let users = db.getAllUsers();

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q)) ||
        (u.title && u.title.toLowerCase().includes(q))
      );
    }

    if (filters.role && filters.role !== 'all') {
      users = users.filter(u => u.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      users = users.filter(u => u.isActive === isActive);
    }

    if (filters.department && filters.department !== 'all') {
      users = users.filter(u => u.department === filters.department);
    }

    if (!pagination) {
      return users;
    }

    return paginateAndSort(users, pagination);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = db.getUserById(id);
    return user || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = db.getUserByEmail(email);
    return user || null;
  }

  async create(userData: UserEntity): Promise<UserEntity> {
    return db.saveUser(userData);
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = db.getUserById(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    return db.saveUser(updated);
  }

  async delete(id: string): Promise<boolean> {
    return db.deleteUser(id);
  }

  async count(filters: UserFilters = {}): Promise<number> {
    const res = await this.findAll(filters);
    return Array.isArray(res) ? res.length : res.meta.total;
  }
}

export const userRepository = new UserRepository();
