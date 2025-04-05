import { Injectable, Type } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { PrismaService } from '../prisma/prisma.service';
import { createDtos } from './dto-factory';

/**
 * Factory function to create a service for a Prisma model
 * @param modelName The name of the Prisma model (e.g., 'user', 'post')
 * @param prismaModelKey The key used in PrismaClient (e.g., 'user', 'post')
 * @returns A service class for the model
 */
export function createModelService<T>(modelName: string, prismaModelKey: string): Type<BaseService<T, any, any>> {
  // Generate DTOs
  const { CreateDto, UpdateDto, ResponseDto } = createDtos<T>(modelName);

  // Create service class
  @Injectable()
  class GenericModelService extends BaseService<T, typeof CreateDto, typeof UpdateDto> {
    protected readonly modelName = prismaModelKey;

    constructor(protected override readonly prisma: PrismaService) {
      super(prisma);
    }
  }

  // Set class name
  Object.defineProperty(GenericModelService, 'name', { value: `${modelName}Service` });

  return GenericModelService;
}
