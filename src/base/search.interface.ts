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
 * Advanced filter operator types for complex queries
 */
export type AdvancedFilterOperator = 'equals' | 'not' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn' | 'isNull' | 'isNotNull';

/**
 * Advanced filter configuration for a specific field
 */
export interface AdvancedFilter {
  /** The filter operator to apply */
  operator: AdvancedFilterOperator;
  /** The value to filter by (not required for isNull/isNotNull) */
  value?: any;
}

/**
 * Relation loading configuration for services
 */
export interface RelationConfig {
  /** Default relations to include in all queries */
  defaultIncludes?: Record<string, boolean | any>;
  /** Available relations that can be requested dynamically */
  availableIncludes?: string[];
  /** Maximum nesting depth for relations to prevent performance issues */
  maxDepth?: number;
  /** Whether to allow nested relation loading (default: true) */
  allowNested?: boolean;
  /** Custom relation configurations for specific includes */
  customIncludes?: Record<string, any>;
}

/**
 * Relation validation result
 */
export interface RelationValidationResult {
  /** Validated include object ready for Prisma */
  validatedIncludes: Record<string, boolean | any>;
  /** Invalid relation keys that were rejected */
  invalidKeys: string[];
  /** Whether the maximum depth was exceeded */
  depthExceeded: boolean;
}

/**
 * Advanced search options extending basic search with complex query capabilities
 */
export interface AdvancedSearchOptions extends BasicSearchOptions {
  /** Raw Prisma where conditions for direct query control */
  where?: Record<string, any>;
  /** Advanced filters with operator-based conditions */
  advancedFilters?: Record<string, AdvancedFilter>;
  /** Logical operator for combining conditions ('AND' | 'OR') */
  logicalOperator?: 'AND' | 'OR';
  /** Include related models in the query */
  include?: Record<string, boolean | any>;
  /** Select specific fields only */
  select?: Record<string, boolean>;
  /** Requested relations to include (will be validated against RelationConfig) */
  requestedIncludes?: string[];
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
  /** Allowed fields for advanced filtering (empty array allows all) */
  allowedAdvancedFields?: string[];
  /** Maximum number of advanced filters allowed (default: 20) */
  maxAdvancedFilters?: number;
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
  /** Comma-separated list of relations to include */
  include?: string;
  /** Additional filters as query parameters */
  [key: string]: any;
}

/**
 * Query builder result containing Prisma-compatible conditions
 */
export interface QueryBuilderResult {
  /** Prisma where conditions */
  where?: Record<string, any>;
  /** Prisma include conditions */
  include?: Record<string, boolean | any>;
  /** Prisma select conditions */
  select?: Record<string, boolean>;
  /** Prisma orderBy conditions */
  orderBy?: any;
}
