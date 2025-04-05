import { DynamicModule, Module, Type } from '@nestjs/common';
import { createModelController } from './controller-factory';
import { createModelService } from './service-factory';
import { PrismaService } from '../prisma/prisma.service';

interface ModelModuleOptions {
  modelName: string; // The model name (CamelCase, e.g., 'User')
  prismaModelKey: string; // The prisma model key (camelCase, e.g., 'user')
  routePath: string; // The base route path (e.g., 'users')
  exports?: boolean; // Whether to export the service
}

/**
 * Factory function to create a complete module for a Prisma model
 * @param options Configuration options for the module
 * @returns A dynamic module for the model
 */
export function createModelModule(options: ModelModuleOptions): DynamicModule {
  const { modelName, prismaModelKey, routePath, exports = true } = options;

  // Create service and controller classes
  const service = createModelService(modelName, prismaModelKey);
  const controller = createModelController(modelName, routePath, service);

  @Module({})
  class DynamicModelModule {}

  // Set the class name
  Object.defineProperty(DynamicModelModule, 'name', { value: `${modelName}Module` });

  // Return dynamic module configuration
  return {
    module: DynamicModelModule,
    controllers: [controller],
    providers: [service, PrismaService],
    exports: exports ? [service] : [],
  };
}
