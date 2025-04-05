import { DynamicModule, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {
  /**
   * Register the PrismaModule as a global module
   */
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: PrismaModule,
    };
  }
}
