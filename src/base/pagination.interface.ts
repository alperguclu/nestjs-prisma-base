/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  /** Total number of records */
  total: number;
  /** Current page number */
  page: number;
  /** Number of records per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Paginated result interface
 */
export interface PaginationResult<T> {
  /** Array of data records */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  /** Page number (default: 1) */
  page?: number;
  /** Number of records per page (default: 10) */
  limit?: number;
}

/**
 * Pagination configuration interface
 */
export interface PaginationConfig {
  /** Default number of records per page (default: 10) */
  defaultLimit: number;
  /** Maximum allowed limit per page (default: 100) */
  maxLimit: number;
  /** Whether to allow unlimited results (limit = -1 or 0) (default: false) */
  allowUnlimited?: boolean;
}
