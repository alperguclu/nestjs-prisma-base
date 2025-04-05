/**
 * This file contains examples of how to use the package
 * It is not part of the package exports
 */

import { Controller, Injectable, Module } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { BaseService } from '../base/base.service';
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from '../base/base.dto';
import { ModelName } from '../decorators/model-name.decorator';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

// Example with a User entity

// 1. Define your DTOs
export class CreateUserDto extends BaseCreateDto {
  name!: string;
  email!: string;
  password!: string;
}

export class UpdateUserDto extends BaseUpdateDto {
  name?: string;
  email?: string;
}

export class UserResponseDto extends BaseResponseDto {
  name!: string;
  email!: string;
}

// 2. Define your service
@Injectable()
@ModelName('user') // This will specify 'user' as the Prisma model name
export class UserService extends BaseService<UserResponseDto, CreateUserDto, UpdateUserDto> {
  // The modelName property is defined via the ModelName decorator
  protected readonly modelName = 'user';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // You can add custom methods here
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user as UserResponseDto | null;
  }
}

// 3. Define your controller
@Controller('users')
export class UserController extends BaseController<UserResponseDto, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // You can add custom endpoints here
}

// 4. Define your module
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

// 5. Use in your main app module
@Module({
  imports: [
    PrismaModule.forRoot(),
    UserModule,
    // Other modules
  ],
})
export class AppModule {}
