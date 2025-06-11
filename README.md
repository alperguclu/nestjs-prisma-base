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
- **Modular Composition**: Mix-and-match DTO features with mixins **NEW in v1.0.0**

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
}
```

**That's it!** You now have a fully functional CRUD API with pagination, search, and filtering.

## Core Concepts

### 🔍 **Search & Filtering**

```typescript
// GET /users?search=john&status=active&page=1&limit=10
// GET /users?search=john&searchFields=name,email&sortBy=name&sortOrder=asc
```

Configure search behavior:

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected searchConfig = {
    defaultSearchFields: ['name', 'email'],
    caseSensitive: false,
    searchMode: 'contains', // 'contains' | 'startsWith' | 'endsWith'
  };
}
```

### 🔗 **Relation Loading**

```typescript
// GET /users?include=posts,profile
// GET /users/1?include=posts
```

### 🎛 **Endpoint Control**

```typescript
@Controller('users')
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.CREATE)
@DisableEndpoint(EndpointType.REMOVE)
export class UserController extends BaseController<...> {}
```

### 🧩 **DTO Mixins (v1.0.0)**

Build DTOs with composable mixins:

```typescript
import { WithTimestamps, WithAuditFields, composeMixins } from 'nestjs-prisma-base';

// Use individual mixins
export class UserDto extends WithTimestamps(BaseDto) {
  name: string;
  // Includes: createdAt, updatedAt
}

// Combine multiple mixins
export class AuditedUserDto extends composeMixins(BaseDto, WithTimestamps, WithAuditFields, WithVersioning) {
  name: string;
  // Includes: createdAt, updatedAt, createdBy, updatedBy, version
}

// Use convenience combinations
export class CompleteUserDto extends MixinCombinations.WithCompleteEntity(BaseDto) {
  name: string;
  // Includes: id, createdAt, updatedAt, createdBy, updatedBy, version, deletedAt, isActive
}
```

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

// Global configuration
configureDTOs({
  includeTimestamps: true,
  includeId: true,
});

export class CreateUserDto extends ConfigurableBaseCreateDto {
  name: string;
  email: string;
  // Automatically includes configured fields
}
```

### 📚 **Swagger Integration**

```typescript
import { SwaggerBaseResponseDto, configureSwaggerDTOs } from 'nestjs-prisma-base';

configureSwaggerDTOs({ enabled: true });

export class UserResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  // Automatic Swagger decorators for base fields
}
```

## Documentation

### 📖 **Detailed Guides**

- [**Full Feature Guide**](./docs/features.md) - Complete feature documentation
- [**Search & Filtering**](./docs/search-filtering.md) - Advanced search capabilities
- [**Relation Loading**](./docs/relations.md) - Working with nested data
- [**DTO Configuration**](./docs/dto-configuration.md) - Flexible DTO options
- [**Mixin System**](./docs/mixins.md) - Composable DTO building
- [**Migration Guide**](./docs/migration.md) - Upgrading between versions

### 🔧 **API Reference**

- [**BaseService API**](./docs/api/base-service.md)
- [**BaseController API**](./docs/api/base-controller.md)
- [**Configuration Options**](./docs/api/configuration.md)

### 📝 **Examples**

- [**Basic CRUD**](./examples/basic-crud)
- [**Advanced Search**](./examples/advanced-search)
- [**Multiple Databases**](./examples/multiple-databases)
- [**Custom DTOs**](./examples/custom-dtos)

## Examples Repository

Check out the [**nestjs-prisma-base-examples**](https://github.com/your-org/nestjs-prisma-base-examples) repository for complete working examples.

## Version History

- **v1.0.0** - Modular DTO composition with mixins
- **v0.9.0** - Configurable DTOs and Swagger integration
- **v0.8.0** - Relation loading and module factories
- **v0.7.0** - Advanced search with operators
- **v0.6.0** - Search and filtering capabilities
- **v0.5.0** - Enhanced pagination with metadata

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT © [Your Name](https://github.com/your-username)
