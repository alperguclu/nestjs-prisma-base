import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaModuleDTOOptions } from '../common/dto-config.interface';
import { configureDTOs } from '../common/configurable-dtos';
import { configureSwaggerDTOs } from '../common/swagger-dtos';

export interface PrismaModuleOptions {
  /**
   * Custom Prisma client instance (required)
   */
  prismaClient: any;

  /**
   * Whether this module should be registered as global
   * @default true
   */
  isGlobal?: boolean;

  /**
   * Custom provider token to use instead of PrismaService
   * Useful when using multiple Prisma clients
   */
  providerToken?: string | symbol;

  /**
   * DTO configuration options for automatic setup
   */
  dtoOptions?: PrismaModuleDTOOptions;
}

export interface PrismaFeatureOptions {
  /**
   * Name for the database feature (will be used as part of the provider token)
   * e.g., 'users' becomes 'USERS_PRISMA_SERVICE'
   */
  name: string;

  /**
   * Prisma client instance for this feature (required)
   */
  prismaClient: any;

  /**
   * Whether to use a custom provider token format (default: '${name.toUpperCase()}_PRISMA_SERVICE')
   */
  providerToken?: string | symbol;

  /**
   * DTO configuration options for automatic setup
   */
  dtoOptions?: PrismaModuleDTOOptions;
}

@Module({})
export class PrismaModule {
  /**
   * Register the PrismaModule
   * @param options Configuration options for the PrismaModule
   */
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    const providerToken = options?.providerToken || PrismaService;

    if (!options.prismaClient) {
      throw new Error('PrismaClient instance is required when using PrismaModule.forRoot()');
    }

    // Configure DTOs if options are provided
    if (options.dtoOptions) {
      this.applyDTOConfiguration(options.dtoOptions);
    }

    return {
      global: options?.isGlobal !== false,
      module: PrismaModule,
      providers: [
        {
          provide: providerToken,
          useFactory: () => {
            return new PrismaService(options.prismaClient);
          },
        },
      ],
      exports: [providerToken],
    };
  }

  /**
   * Create a feature module for a specific database schema
   * @param options Configuration for the database feature
   */
  static forFeature(options: PrismaFeatureOptions): DynamicModule {
    const providerToken = options.providerToken || `${options.name.toUpperCase()}_PRISMA_SERVICE`;

    if (!options.prismaClient) {
      throw new Error('PrismaClient instance is required when using PrismaModule.forFeature()');
    }

    // Configure DTOs if options are provided
    if (options.dtoOptions) {
      this.applyDTOConfiguration(options.dtoOptions);
    }

    return {
      module: PrismaModule,
      providers: [
        {
          provide: providerToken,
          useFactory: () => {
            return new PrismaService(options.prismaClient);
          },
        },
      ],
      exports: [providerToken],
    };
  }

  /**
   * Configure DTOs based on provided options
   * @private
   */
  private static applyDTOConfiguration(options: PrismaModuleDTOOptions): void {
    // Configure general DTO settings
    if (options.dtoConfig) {
      configureDTOs(options.dtoConfig);
    }

    // Configure Swagger integration
    if (options.swaggerIntegration) {
      configureSwaggerDTOs(options.swaggerIntegration);
    }

    // Log configuration for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 NestJS Prisma Base - DTO Configuration Applied:', {
        dtoConfig: options.dtoConfig || 'Using defaults',
        swaggerIntegration: options.swaggerIntegration?.enabled ? 'Enabled' : 'Disabled',
        minimalDTOs: options.useMinimalDTOs ? 'Enabled' : 'Disabled',
      });
    }
  }

  /**
   * Configure DTOs independently (useful for testing or manual configuration)
   * @param options DTO configuration options
   */
  static configureDTOs(options: PrismaModuleDTOOptions): void {
    this.applyDTOConfiguration(options);
  }
}
