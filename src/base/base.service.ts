import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationResult, PaginationMeta, PaginationConfig } from './pagination.interface';
import { BasicSearchOptions, AdvancedSearchOptions, SearchConfig, RelationConfig } from './search.interface';
import { AdvancedQueryBuilder } from './query-builder';
import { RelationValidator } from './relation-validator';

/**
 * Base service class that provides common CRUD operations for any Prisma model
 * To be extended by entity-specific services
 */
@Injectable()
export abstract class BaseService<T, CreateDto, UpdateDto> {
  // The Prisma model name to be used (e.g., 'user', 'post')
  protected abstract readonly modelName: string;

  // Pagination configuration - can be overridden in child classes
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 10,
    maxLimit: 100,
    allowUnlimited: false,
  };

  // Search configuration - must be overridden in child classes for search functionality
  protected searchConfig: SearchConfig = {
    defaultSearchFields: [],
    caseSensitive: false,
    searchMode: 'contains',
    maxSearchFields: 10,
  };

  // Relation configuration - can be overridden in child classes for relation loading
  protected relationConfig: RelationConfig = {
    maxDepth: 3,
    allowNested: true,
  };

  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Validate and normalize pagination limit
   * @param limit The requested limit
   * @returns The validated and normalized limit
   * @throws BadRequestException if limit is invalid
   */
  protected validateLimit(limit: number): number {
    // Handle unlimited requests
    if (limit === 0 || limit === -1) {
      if (!this.paginationConfig.allowUnlimited) {
        throw new BadRequestException(`Unlimited results are not allowed. Maximum limit is ${this.paginationConfig.maxLimit}`);
      }
      // Return a very large number for unlimited (but still finite for calculations)
      return Number.MAX_SAFE_INTEGER;
    }

    // Validate positive number
    if (limit < 1) {
      throw new BadRequestException('Limit must be a positive number');
    }

    // Check maximum limit
    if (limit > this.paginationConfig.maxLimit) {
      throw new BadRequestException(`Limit ${limit} exceeds maximum allowed limit of ${this.paginationConfig.maxLimit}`);
    }

    return limit;
  }

  /**
   * Validate and normalize pagination page
   * @param page The requested page
   * @returns The validated and normalized page
   * @throws BadRequestException if page is invalid
   */
  protected validatePage(page: number): number {
    if (page < 1) {
      throw new BadRequestException('Page must be a positive number starting from 1');
    }
    return page;
  }

  /**
   * Validate search fields against configuration
   * @param searchFields The requested search fields
   * @returns The validated search fields
   * @throws BadRequestException if validation fails
   */
  protected validateSearchFields(searchFields: string[]): string[] {
    if (searchFields.length > this.searchConfig.maxSearchFields!) {
      throw new BadRequestException(`Too many search fields. Maximum allowed: ${this.searchConfig.maxSearchFields}`);
    }

    // If no default search fields are configured, don't allow search
    if (this.searchConfig.defaultSearchFields.length === 0 && searchFields.length > 0) {
      throw new BadRequestException('Search functionality is not configured for this service');
    }

    return searchFields;
  }

  /**
   * Build search conditions for Prisma query
   * @param options Search options
   * @returns Prisma where conditions
   */
  protected buildSearchConditions(options: BasicSearchOptions): any {
    const conditions: any = {};

    // Handle search term
    if (options.search && options.search.trim()) {
      const searchTerm = options.search.trim();
      const fieldsToSearch = options.searchFields && options.searchFields.length > 0 ? this.validateSearchFields(options.searchFields) : this.searchConfig.defaultSearchFields;

      if (fieldsToSearch.length > 0) {
        const searchConditions = fieldsToSearch.map((field) => {
          const condition: any = {};

          switch (this.searchConfig.searchMode) {
            case 'startsWith':
              condition[field] = {
                startsWith: searchTerm,
                mode: this.searchConfig.caseSensitive ? 'default' : 'insensitive',
              };
              break;
            case 'endsWith':
              condition[field] = {
                endsWith: searchTerm,
                mode: this.searchConfig.caseSensitive ? 'default' : 'insensitive',
              };
              break;
            case 'contains':
            default:
              condition[field] = {
                contains: searchTerm,
                mode: this.searchConfig.caseSensitive ? 'default' : 'insensitive',
              };
              break;
          }

          return condition;
        });

        conditions.OR = searchConditions;
      }
    }

    // Handle simple filters
    if (options.filters && Object.keys(options.filters).length > 0) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          conditions[key] = value;
        }
      });
    }

    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }

  /**
   * Build order by conditions for Prisma query
   * @param orderBy Order by options
   * @returns Prisma orderBy conditions
   */
  protected buildOrderConditions(orderBy?: Record<string, 'asc' | 'desc'>): any {
    if (!orderBy || Object.keys(orderBy).length === 0) {
      return undefined;
    }

    return Object.entries(orderBy).map(([field, direction]) => ({
      [field]: direction,
    }));
  }

  /**
   * Find all records with enhanced pagination metadata and search capabilities
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @param options Search and filter options
   * @returns Paginated result with metadata
   */
  async findAll(page = 1, limit?: number, options?: BasicSearchOptions): Promise<PaginationResult<T>> {
    // Use default limit if not provided
    const requestedLimit = limit ?? this.paginationConfig.defaultLimit;

    // Validate pagination parameters
    const validatedPage = this.validatePage(page);
    const validatedLimit = this.validateLimit(requestedLimit);

    // Handle unlimited case
    const isUnlimited = validatedLimit === Number.MAX_SAFE_INTEGER;
    const queryLimit = isUnlimited ? undefined : validatedLimit;
    const skip = isUnlimited ? 0 : (validatedPage - 1) * validatedLimit;

    // Build search and filter conditions
    const whereConditions = options ? this.buildSearchConditions(options) : undefined;
    const orderByConditions = options?.orderBy ? this.buildOrderConditions(options.orderBy) : undefined;

    // Build query options
    const queryOptions: any = {
      skip: isUnlimited ? undefined : skip,
      take: queryLimit,
    };

    if (whereConditions) {
      queryOptions.where = whereConditions;
    }

    if (orderByConditions) {
      queryOptions.orderBy = orderByConditions;
    }

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany(queryOptions) as Promise<T[]>,
      this.prisma[this.modelName].count({
        where: whereConditions,
      }) as Promise<number>,
    ]);

    // Calculate pagination metadata
    const actualLimit = isUnlimited ? total : validatedLimit;
    const totalPages = isUnlimited ? 1 : Math.ceil(total / validatedLimit);
    const hasNext = isUnlimited ? false : validatedPage < totalPages;
    const hasPrev = validatedPage > 1;

    const meta: PaginationMeta = {
      total,
      page: validatedPage,
      limit: actualLimit,
      totalPages,
      hasNext,
      hasPrev,
    };

    return {
      data,
      meta,
    };
  }

  /**
   * Find all records with simple array return (backward compatibility)
   * @deprecated Use findAll() instead for enhanced pagination and search
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @param options Search and filter options
   * @returns Array of records
   */
  async findAllSimple(page = 1, limit?: number, options?: BasicSearchOptions): Promise<T[]> {
    // Use default limit if not provided
    const requestedLimit = limit ?? this.paginationConfig.defaultLimit;

    // Validate pagination parameters
    const validatedPage = this.validatePage(page);
    const validatedLimit = this.validateLimit(requestedLimit);

    // Handle unlimited case
    const isUnlimited = validatedLimit === Number.MAX_SAFE_INTEGER;
    const queryLimit = isUnlimited ? undefined : validatedLimit;
    const skip = isUnlimited ? 0 : (validatedPage - 1) * validatedLimit;

    // Build search and filter conditions
    const whereConditions = options ? this.buildSearchConditions(options) : undefined;
    const orderByConditions = options?.orderBy ? this.buildOrderConditions(options.orderBy) : undefined;

    // Build query options
    const queryOptions: any = {
      skip: isUnlimited ? undefined : skip,
      take: queryLimit,
    };

    if (whereConditions) {
      queryOptions.where = whereConditions;
    }

    if (orderByConditions) {
      queryOptions.orderBy = orderByConditions;
    }

    return this.prisma[this.modelName].findMany(queryOptions) as Promise<T[]>;
  }

  /**
   * Convert ID to the appropriate type based on the model schema
   * @param id ID value (string or number)
   * @returns Converted ID value
   */
  protected convertId(id: string | number): string | number {
    // If already a number, return as-is
    if (typeof id === 'number') {
      return id;
    }

    // Try to convert string to number if it looks like an integer
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId) && numericId.toString() === id) {
      return numericId;
    }

    // Return as string (for UUID or other string-based IDs)
    return id;
  }

  /**
   * Find a record by ID
   */
  async findOne(id: string | number): Promise<T> {
    const convertedId = this.convertId(id);

    const record = await this.prisma[this.modelName].findUnique({
      where: { id: convertedId },
    });

    if (!record) {
      throw new NotFoundException(`${this.modelName} with ID "${id}" not found`);
    }

    return record as T;
  }

  /**
   * Create a new record
   */
  async create(data: CreateDto): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
    }) as Promise<T>;
  }

  /**
   * Update a record
   */
  async update(id: string | number, data: UpdateDto): Promise<T> {
    const convertedId = this.convertId(id);

    try {
      return (await this.prisma[this.modelName].update({
        where: { id: convertedId },
        data,
      })) as T;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} with ID "${id}" not found`);
      }
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async remove(id: string | number): Promise<T> {
    const convertedId = this.convertId(id);

    try {
      return (await this.prisma[this.modelName].delete({
        where: { id: convertedId },
      })) as T;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} with ID "${id}" not found`);
      }
      throw error;
    }
  }

  /**
   * Validate and process relation includes
   * @param options Advanced search options that may include relations
   * @returns Validated include object
   */
  protected processRelations(options: AdvancedSearchOptions): Record<string, boolean | any> {
    let requestedIncludes: string[] | Record<string, boolean | any> | undefined;

    // Handle different ways relations can be specified
    if (options.requestedIncludes) {
      requestedIncludes = options.requestedIncludes;
    } else if (options.include) {
      requestedIncludes = options.include;
    }

    // Validate includes using RelationValidator
    const validationResult = RelationValidator.validateIncludes(requestedIncludes, this.relationConfig);

    // Log warnings for invalid includes (could be enhanced with proper logging)
    if (validationResult.invalidKeys.length > 0) {
      console.warn(`Invalid relation keys ignored: ${validationResult.invalidKeys.join(', ')}`);
    }

    if (validationResult.depthExceeded) {
      console.warn(`Maximum relation depth (${this.relationConfig.maxDepth}) exceeded. Relations were truncated.`);
    }

    return validationResult.validatedIncludes;
  }

  /**
   * Build complete query options including relations
   * @param options Advanced search options
   * @returns Complete query builder result with validated relations
   */
  protected buildAdvancedQueryOptions(options: AdvancedSearchOptions): any {
    // Start with basic query building
    const queryResult = AdvancedQueryBuilder.buildQuery(options, this.searchConfig);

    // Process and validate relations
    const validatedIncludes = this.processRelations(options);

    // Merge validated includes with any existing includes from query builder
    if (Object.keys(validatedIncludes).length > 0) {
      queryResult.include = RelationValidator.mergeIncludes(queryResult.include, validatedIncludes);
    }

    return queryResult;
  }

  /**
   * Find all records with advanced search capabilities
   * Supports complex filtering, raw where conditions, relations, and field selection
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @param options Advanced search and filter options
   * @returns Paginated result with metadata
   */
  async findAllAdvanced(page = 1, limit?: number, options?: AdvancedSearchOptions): Promise<PaginationResult<T>> {
    // Use default limit if not provided
    const requestedLimit = limit ?? this.paginationConfig.defaultLimit;

    // Validate pagination parameters
    const validatedPage = this.validatePage(page);
    const validatedLimit = this.validateLimit(requestedLimit);

    // Handle unlimited case
    const isUnlimited = validatedLimit === Number.MAX_SAFE_INTEGER;
    const queryLimit = isUnlimited ? undefined : validatedLimit;
    const skip = isUnlimited ? 0 : (validatedPage - 1) * validatedLimit;

    // Build advanced query with relation validation
    const queryResult = options ? this.buildAdvancedQueryOptions(options) : {};

    // Build query options
    const queryOptions: any = {
      skip: isUnlimited ? undefined : skip,
      take: queryLimit,
    };

    // Apply where conditions
    if (queryResult.where) {
      queryOptions.where = queryResult.where;
    }

    // Apply include conditions (with validation)
    if (queryResult.include) {
      queryOptions.include = queryResult.include;
    }

    // Apply select conditions
    if (queryResult.select) {
      queryOptions.select = queryResult.select;
    }

    // Apply orderBy conditions
    if (queryResult.orderBy) {
      queryOptions.orderBy = queryResult.orderBy;
    }

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany(queryOptions) as Promise<T[]>,
      this.prisma[this.modelName].count({
        where: queryResult.where,
      }) as Promise<number>,
    ]);

    // Calculate pagination metadata
    const actualLimit = isUnlimited ? total : validatedLimit;
    const totalPages = isUnlimited ? 1 : Math.ceil(total / validatedLimit);
    const hasNext = isUnlimited ? false : validatedPage < totalPages;
    const hasPrev = validatedPage > 1;

    const meta: PaginationMeta = {
      total,
      page: validatedPage,
      limit: actualLimit,
      totalPages,
      hasNext,
      hasPrev,
    };

    return {
      data,
      meta,
    };
  }

  /**
   * Find all records with advanced search capabilities - simple array return
   * @deprecated Use findAllAdvanced() instead for enhanced pagination and search
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @param options Advanced search and filter options
   * @returns Array of records
   */
  async findAllAdvancedSimple(page = 1, limit?: number, options?: AdvancedSearchOptions): Promise<T[]> {
    const result = await this.findAllAdvanced(page, limit, options);
    return result.data;
  }
}
