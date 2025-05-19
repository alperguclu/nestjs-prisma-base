import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: any;

  constructor(customClient?: any) {
    if (customClient) {
      this.prismaClient = customClient;
    } else {
      // In a multi-schema app, all instances should be provided explicitly
      this.prismaClient = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });
    }
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

  // Forward all methods and properties to the underlying PrismaClient
  [key: string]: any;
}
