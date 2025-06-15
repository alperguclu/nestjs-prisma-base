# NestJS Prisma Base

A comprehensive NestJS package providing base classes, utilities, and decorators for building CRUD APIs with Prisma ORM integration.

[![npm version](https://badge.fury.io/js/nestjs-prisma-base.svg)](https://badge.fury.io/js/nestjs-prisma-base)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### 🚀 **Core Features**

- **Base CRUD Operations**: Ready-to-use controllers and services
- **Enhanced Pagination**: Metadata-rich pagination with configurable limits
- **Advanced Search & Filtering**: Multi-field search with operators and sorting
- **Relation Loading**: Configurable nested relation includes with validation
- **Endpoint Control**: Enable/disable specific endpoints with decorators

### 🛠 **DTO System**

- **Configurable DTOs**: Global and per-class configuration
- **Swagger Integration**: Automatic API documentation
- **Minimal DTOs**: Maximum control with empty base classes
- **Modular Composition**: Mix-and-match DTO features with mixins
- **Response Messages**: Optional message fields for consistent API feedback **NEW in v1.1.0**

### ⚡ **Developer Experience**

- **Module Factories**: Auto-generate complete modules
- **Multiple Database Support**: Work with multiple Prisma clients
- **TypeScript**: Full type safety and IntelliSense support
- **Validation**: Built-in request validation and error handling

## Quick Start

### Installation

```bash
npm install nestjs-prisma-base
```

### Configuration (Required for Advanced Features)

**⚠️ CRITICAL: Configuration must be imported BEFORE your application starts!**

Create a configuration file and import it first in `main.ts`:

**1. Create `src/config/dto-config.ts`:**

```typescript
import { configureDTOs, configureSwaggerDTOs } from 'nestjs-prisma-base';

// Configure DTOs globally
configureDTOs({
  includeTimestamps: true,
  includeId: true,
  includeMessage: true, // Enable response message fields
  messageField: {
    fieldName: 'message',
    defaultValue: 'Operation completed successfully',
    maxLength: 500,
  },
});

// Configure Swagger integration
configureSwaggerDTOs({
  enabled: true,
});
```

**2. Import in `src/main.ts` FIRST:**

```typescript
// ⚠️ CRITICAL: This import MUST be first!
import './config/dto-config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### 1. Setup PrismaModule

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';

@Module({
  imports: [
    PrismaModule.forRoot({
      prismaClient: new PrismaClient(),
    }),
  ],
})
export class AppModule {}
```

### 2. Create Service & Controller

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { BaseService, PrismaService } from 'nestjs-prisma-base';

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

// user.controller.ts
import { Controller } from '@nestjs/common';
import { BaseController, EnableAllEndpoints } from 'nestjs-prisma-base';

@Controller('users')
@EnableAllEndpoints() // Enables all CRUD endpoints
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
```

### 3. Define DTOs

```typescript
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from 'nestjs-prisma-base';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto extends BaseCreateDto {
  @IsString() name: string;
  @IsEmail() email: string;
}

export class UpdateUserDto extends BaseUpdateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  // message field available for API feedback
}
```

**That's it!** You now have a fully functional CRUD API with pagination, search, and filtering.

## Pagination Response

All `findAll` methods return rich pagination metadata:

```json
{
  "data": [{ "id": 1, "name": "John", "email": "john@example.com" }],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Advanced Features

### 📚 **Swagger Integration with Message Fields**

For automatic message field documentation in Swagger:

```typescript
import { SwaggerBaseResponseDto, EnableSwaggerBaseFields } from 'nestjs-prisma-base';
import { ApiProperty } from '@nestjs/swagger';

@EnableSwaggerBaseFields // ← Required for automatic base field documentation
export class UserResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  // message, id, createdAt, updatedAt fields automatically documented
}
```

### 🏭 **Module Factory**

Generate complete modules with one function:

```typescript
import { createModelModule, EndpointType } from 'nestjs-prisma-base';

export const UserModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enableAllEndpoints: true,
});
```

### 🎨 **DTO Configuration**

```typescript
import { ConfigurableBaseCreateDto, configureDTOs } from 'nestjs-prisma-base';

// Global configuration (already done above)
export class CreateUserDto extends ConfigurableBaseCreateDto {
  name: string;
  email: string;
  // Automatically includes configured fields
}
```

## Documentation

### 📖 **Available Documentation**

- [**Complete Feature Guide**](./docs/features.md) - Comprehensive feature documentation with examples
- [**Migration Guide**](./docs/migration.md) - Version upgrade guide and compatibility matrix
- [**Documentation Index**](./docs/index.md) - Complete documentation overview

### 🚀 **Get More Help**

- **Quick Questions**: Use the examples in this README
- **Advanced Features**: Check the [Complete Feature Guide](./docs/features.md)
- **Version Migration**: See the [Migration Guide](./docs/migration.md)
- **Issues & Support**: [Create an Issue](https://github.com/your-org/nestjs-prisma-base/issues)

## Version History

- **v1.1.4** - Fixed missing EnableSwaggerBaseFields export
- **v1.1.3** - Fixed SwaggerBaseResponseDto inheritance with @EnableSwaggerBaseFields decorator
- **v1.1.2** - Fixed SwaggerBaseResponseDto message field documentation issue
- **v1.1.1** - Fixed Swagger circular dependency issues with audit field mixins
- **v1.1.0** - Response message fields for consistent API feedback
- **v1.0.0** - Modular DTO composition with mixins
- **v0.9.0** - Configurable DTOs and Swagger integration
- **v0.8.0** - Relation loading and module factories
- **v0.7.0** - Advanced search with operators
- **v0.6.0** - Search and filtering capabilities
- **v0.5.0** - Enhanced pagination with metadata

## License

MIT
