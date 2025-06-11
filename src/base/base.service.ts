import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationResult, PaginationMeta } from './pagination.interface';

/**
 * Base service class that provides common CRUD operations for any Prisma model
 * To be extended by entity-specific services
 */
@Injectable()
export abstract class BaseService<T, CreateDto, UpdateDto> {
  // The Prisma model name to be used (e.g., 'user', 'post')
  protected abstract readonly modelName: string;

  constructor(protected readonly prisma: PrismaService) {}

  /**
   * Find all records with enhanced pagination metadata
   * @param page Page number (default: 1)
   * @param limit Number of records per page (default: 10)
   * @returns Paginated result with metadata
   */
  async findAll(page = 1, limit = 10): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    // Get total count and data in parallel for better performance
    const [data, total] = await Promise.all([
      this.prisma[this.modelName].findMany({
        skip,
        take: limit,
      }) as Promise<T[]>,
      this.prisma[this.modelName].count() as Promise<number>,
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const meta: PaginationMeta = {
      total,
      page,
      limit,
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
   * @param limit Number of records per page (default: 10)
   * @returns Array of records
   */
  async findAllSimple(page = 1, limit = 10): Promise<T[]> {
    const skip = (page - 1) * limit;

    return this.prisma[this.modelName].findMany({
      skip,
      take: limit,
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
