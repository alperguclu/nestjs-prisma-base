import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export interface PrismaModuleOptions {
  /**
   * Custom Prisma client instance
   */
  prismaClient?: any;

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
   * Prisma client instance for this feature
   */
  prismaClient: any;

  /**
   * Whether to use a custom provider token format (default: '${name.toUpperCase()}_PRISMA_SERVICE')
   */
  providerToken?: string | symbol;
}

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  /**
   * Register the PrismaModule
   * @param options Configuration options for the PrismaModule
   */
  static forRoot(options?: PrismaModuleOptions): DynamicModule {
    const providerToken = options?.providerToken || PrismaService;

    return {
      global: options?.isGlobal !== false,
      module: PrismaModule,
      providers: [
        {
          provide: providerToken,
          useFactory: () => {
            if (options?.prismaClient) {
              // Use the provided custom client
              return new PrismaService(options.prismaClient);
            }
            // Default behavior - no arguments
            return new PrismaService();
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
