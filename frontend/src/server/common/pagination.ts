import { PaginationMeta } from './apiResponse';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export function parsePaginationParams(query: Record<string, any>, defaultLimit = 10): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const rawLimit = parseInt(String(query.limit || defaultLimit), 10) || defaultLimit;
  const limit = Math.min(100, Math.max(1, rawLimit));
  const sortBy = query.sortBy ? String(query.sortBy) : undefined;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
}

export function paginateAndSort<T>(
  items: T[],
  params: PaginationParams,
  sortFn?: (a: T, b: T) => number
): PaginatedResult<T> {
  let sortedItems = [...items];

  if (sortFn) {
    sortedItems.sort(sortFn);
  } else if (params.sortBy) {
    const key = params.sortBy as keyof T;
    const order = params.sortOrder === 'asc' ? 1 : -1;
    sortedItems.sort((a, b) => {
      const valA = a[key];
      const valB = b[key];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      return valA > valB ? order : -order;
    });
  }

  const total = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const startIndex = (params.page - 1) * params.limit;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + params.limit);

  const meta: PaginationMeta = {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1
  };

  return { items: paginatedItems, meta };
}
