import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationResult, PaginationMeta, PaginationConfig } from './pagination.interface';

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
   * Find all records with enhanced pagination metadata
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @returns Paginated result with metadata
   */
  async findAll(page = 1, limit?: number): Promise<PaginationResult<T>> {
    // Use default limit if not provided
    const requestedLimit = limit ?? this.paginationConfig.defaultLimit;

    // Validate pagination parameters
    const validatedPage = this.validatePage(page);
    const validatedLimit = this.validateLimit(requestedLimit);

    // Handle unlimited case
    const isUnlimited = validatedLimit === Number.MAX_SAFE_INTEGER;
    const queryLimit = isUnlimited ? undefined : validatedLimit;
    const skip = isUnlimited ? 0 : (validatedPage - 1) * validatedLimit;

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany({
        skip: isUnlimited ? undefined : skip,
        take: queryLimit,
      }) as Promise<T[]>,
      this.prisma[this.modelName].count() as Promise<number>,
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
   * @deprecated Use findAll() instead for enhanced pagination
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: configured defaultLimit)
   * @returns Array of records
   */
  async findAllSimple(page = 1, limit?: number): Promise<T[]> {
    // Use default limit if not provided
    const requestedLimit = limit ?? this.paginationConfig.defaultLimit;

    // Validate pagination parameters
    const validatedPage = this.validatePage(page);
    const validatedLimit = this.validateLimit(requestedLimit);

    // Handle unlimited case
    const isUnlimited = validatedLimit === Number.MAX_SAFE_INTEGER;
    const queryLimit = isUnlimited ? undefined : validatedLimit;
    const skip = isUnlimited ? 0 : (validatedPage - 1) * validatedLimit;

    return this.prisma[this.modelName].findMany({
      skip: isUnlimited ? undefined : skip,
      take: queryLimit,
    }) as Promise<T[]>;
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
