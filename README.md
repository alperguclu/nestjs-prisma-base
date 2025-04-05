# NestJS Prisma Base

A reusable NestJS module for Prisma ORM with base classes for controllers, services, and DTOs.

## Installation

```bash
npm install nestjs-prisma-base
```

## Features

- Ready-to-use Prisma module with proper lifecycle management
- Base service with common CRUD operations
- Base controller with REST endpoints
- Base DTOs for standardizing request/response data
- Utility decorators for easier implementation
- Factory functions to auto-generate components from Prisma models

## Usage

### Option 1: Extending Base Classes (Manual Approach)

#### 1. Import the PrismaModule in your app module

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';

@Module({
  imports: [
    PrismaModule.forRoot(),
    // Your other modules
  ],
})
export class AppModule {}
```

#### 2. Create your entity DTOs by extending the base DTOs

```typescript
// user.dto.ts
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from 'nestjs-prisma-base';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto extends BaseCreateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateUserDto extends BaseUpdateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
}
```

#### 3. Create your service by extending the base service

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { BaseService, ModelName, PrismaService } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
@ModelName('user')
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Add custom methods here
}
```

#### 4. Create your controller by extending the base controller

```typescript
// user.controller.ts
import { Controller } from '@nestjs/common';
import { BaseController } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // Add custom endpoints here
}
```

### Option 2: Using Factory Functions (Auto-Generated Approach)

#### 1. Generate an entire module for a model in one line

```typescript
// user.module.ts
import { createModelModule } from 'nestjs-prisma-base';

// This creates a complete module with controller, service and DTOs
export const UserModule = createModelModule({
  modelName: 'User',
  prismaModelKey: 'user',
  routePath: 'users',
});
```

#### 2. Import the generated module in your app module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';
import { UserModule } from './user.module';

@Module({
  imports: [
    PrismaModule.forRoot(),
    UserModule,
    // Other modules
  ],
})
export class AppModule {}
```

#### 3. Generate individual components (if you need more control)

```typescript
// Generate DTOs for a model
import { createDtos } from 'nestjs-prisma-base';
import { User } from '@prisma/client';

const { CreateDto, UpdateDto, ResponseDto } = createDtos<User>('User');

// Generate a service
import { createModelService } from 'nestjs-prisma-base';

const UserService = createModelService<User>('User', 'user');

// Generate a controller
import { createModelController } from 'nestjs-prisma-base';

const UserController = createModelController<User>('User', 'users', UserService);
```

#### 4. Extend generated components with custom functionality

```typescript
// First, generate the base service
const BaseUserService = createModelService<User>('User', 'user');

// Then extend it with custom methods
@Injectable()
class ExtendedUserService extends BaseUserService {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Add custom methods
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
```

## License

ISC
