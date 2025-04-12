import { DynamicModule, Type } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { EndpointType, EnableEndpoint } from '../decorators/endpoint.decorator';

/**
 * Options for configuring a model module
 */
export interface ModelModuleOptions<T = any, CreateDto = any, UpdateDto = any> {
  /**
   * Name of the model in Prisma (e.g., 'user', 'post')
   */
  modelName: string;

  /**
   * Path for the controller's route
   */
  routePath?: string;

  /**
   * List of specific endpoints to enable
   * If not provided and enableAllEndpoints is false, no endpoints will be enabled
   */
  enabledEndpoints?: EndpointType[];

  /**
   * Enable all standard endpoints
   */
  enableAllEndpoints?: boolean;

  /**
   * Service type (optional, will create a default service if not provided)
   */
  serviceType?: Type<BaseService<T, CreateDto, UpdateDto>>;

  /**
   * Additional providers to include in the module
   */
  providers?: any[];

  /**
   * Additional imports for the module
   */
  imports?: any[];

  /**
   * Additional exports from the module
   */
  exports?: any[];
}

/**
 * Creates a module for a Prisma model with configurable endpoints
 */
export function createModelModule<T = any, CreateDto = any, UpdateDto = any>(options: ModelModuleOptions<T, CreateDto, UpdateDto>): DynamicModule {
  const { modelName, routePath = modelName, serviceType, enabledEndpoints = [], enableAllEndpoints = false, providers = [], imports = [], exports = [] } = options;

  // Create a dynamic controller with the specified configuration
  const controllerFactory = (service: BaseService<T, CreateDto, UpdateDto>) => {
    // Use the specified endpoint configuration
    let controllerClass = createModelController<T, CreateDto, UpdateDto>(modelName, routePath, service.constructor as Type<BaseService<T, CreateDto, UpdateDto>>);

    // Apply endpoint configuration
    if (enableAllEndpoints) {
      controllerClass = EnableEndpoint('*')(controllerClass);
    } else if (enabledEndpoints.length > 0) {
      enabledEndpoints.forEach((endpoint) => {
        controllerClass = EnableEndpoint(endpoint)(controllerClass);
      });
    }

    // Return the configured controller
    return controllerClass;
  };

  // Create a dynamic service if not provided
  const serviceFactory = serviceType ? serviceType : createModelService<T, CreateDto, UpdateDto>(modelName, modelName);

  // Define providers
  const moduleProviders = [
    {
      provide: `${modelName}Service`,
      useFactory: (prisma: PrismaService) => new serviceFactory(prisma),
      inject: [PrismaService],
    },
    {
      provide: `${modelName}Controller`,
      useFactory: (service: BaseService<T, CreateDto, UpdateDto>) => {
        const ControllerClass = controllerFactory(service);
        return new ControllerClass(service);
      },
      inject: [`${modelName}Service`],
    },
    ...providers,
  ];

  return {
    module: PrismaModule,
    imports: [PrismaModule, ...imports],
    providers: moduleProviders,
    exports: [`${modelName}Service`, ...exports],
  };
}

/**
 * Create a model service class for a specific Prisma model
 */
export function createModelService<T, CreateDto, UpdateDto>(modelName: string, prismaModelKey: string): Type<BaseService<T, CreateDto, UpdateDto>> {
  class ModelService extends BaseService<T, CreateDto, UpdateDto> {
    protected readonly modelName = prismaModelKey;
  }

  Object.defineProperty(ModelService, 'name', {
    value: `${modelName}Service`,
  });

  return ModelService;
}

/**
 * Create a model controller class for a specific Prisma model
 */
export function createModelController<T, CreateDto, UpdateDto>(modelName: string, routePath: string, serviceType: Type<BaseService<T, CreateDto, UpdateDto>>): Type<any> {
  const { BaseController } = require('../base/base.controller');

  class ModelController extends BaseController<T, CreateDto, UpdateDto> {
    constructor(service: BaseService<T, CreateDto, UpdateDto>) {
      super(service);
    }
  }

  Object.defineProperty(ModelController, 'name', {
    value: `${modelName}Controller`,
  });

  Reflect.defineMetadata('path', routePath, ModelController);

  return ModelController;
}
