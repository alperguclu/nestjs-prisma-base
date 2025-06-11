/**
 * Basic search options for simple filtering and searching
 */
export interface BasicSearchOptions {
  /** Search term to find across specified fields */
  search?: string;
  /** Fields to search in (if not specified, uses service's default search fields) */
  searchFields?: string[];
  /** Simple key-value filters for exact matches */
  filters?: Record<string, any>;
  /** Order by fields with direction */
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Search configuration for services
 */
export interface SearchConfig {
  /** Default fields to search in when no searchFields are specified */
  defaultSearchFields: string[];
  /** Whether search is case-sensitive (default: false) */
  caseSensitive?: boolean;
  /** Search mode: 'contains' | 'startsWith' | 'endsWith' (default: 'contains') */
  searchMode?: 'contains' | 'startsWith' | 'endsWith';
  /** Maximum number of search fields allowed (default: 10) */
  maxSearchFields?: number;
}

/**
 * Extended pagination query with search capabilities
 */
export interface SearchQuery {
  /** Page number (default: 1) */
  page?: number;
  /** Number of records per page */
  limit?: number;
  /** Search term */
  search?: string;
  /** Comma-separated search fields */
  searchFields?: string;
  /** Order by field */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Additional filters as query parameters */
  [key: string]: any;
}
