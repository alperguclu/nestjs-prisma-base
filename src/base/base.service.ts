import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationResult, PaginationMeta, PaginationConfig } from './pagination.interface';
import { BasicSearchOptions, SearchConfig } from './search.interface';

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
   * Find a record by ID
   */
  async findOne(id: string | number): Promise<T> {
    const record = await this.prisma[this.modelName].findUnique({
      where: { id },
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
    try {
      return (await this.prisma[this.modelName].update({
        where: { id },
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
    try {
      return (await this.prisma[this.modelName].delete({
        where: { id },
      })) as T;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} with ID "${id}" not found`);
      }
      throw error;
    }
  }
}
