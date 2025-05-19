import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
// Remove default import since we won't use it
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: any;
  [key: string]: any;

  constructor(@Optional() customClient?: any) {
    this.prismaClient = customClient;

    // Set up a proxy to properly forward all properties and method calls
    return new Proxy(this, {
      get: (target: any, prop: string | symbol) => {
        // First check if the property exists on the service
        if (prop in target) {
          return target[prop];
        }

        // If not, forward to the prismaClient
        if (target.prismaClient) {
          return target.prismaClient[prop];
        }

        return undefined;
      },
    });
  }

  async onModuleInit() {
    if (this.prismaClient) {
      await this.prismaClient.$connect();
    }
  }

  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }

  /**
   * Helper method to apply Prisma middleware to a NestJS app
   */
  async enableShutdownHooks(app: INestApplication) {
    if (this.prismaClient) {
      this.prismaClient.$on('beforeExit', async () => {
        await app.close();
      });
    }
  }
}
