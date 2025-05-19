import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

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
}
