import { Controller, Type } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { BaseService } from '../base/base.service';
import { createDtos } from './dto-factory';

/**
 * Factory function to create a controller for a Prisma model
 * @param modelName The name of the Prisma model (e.g., 'User', 'Post')
 * @param routePath The base route path for the controller
 * @param serviceType The service class for the model
 * @returns A controller class for the model
 */
export function createModelController<T>(modelName: string, routePath: string, serviceType: Type<BaseService<T, any, any>>): Type<BaseController<T, any, any>> {
  // Generate DTOs
  const { CreateDto, UpdateDto } = createDtos<T>(modelName);

  // Create controller class
  @Controller(routePath)
  class GenericModelController extends BaseController<T, typeof CreateDto, typeof UpdateDto> {
    constructor(service: BaseService<T, typeof CreateDto, typeof UpdateDto>) {
      super(service);
    }
  }

  // Set class name
  Object.defineProperty(GenericModelController, 'name', { value: `${modelName}Controller` });

  return GenericModelController;
}
