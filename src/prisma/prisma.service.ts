import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit, Optional } from '@nestjs/common';
// Remove default import since we won't use it
// import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: any;

  constructor(@Optional() customClient?: any) {
    this.prismaClient = customClient;
    // Remove the else block entirely - no fallback to default client
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
