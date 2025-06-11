# NestJS Prisma Base

A reusable NestJS module for Prisma ORM with base classes for controllers, services, and DTOs.

## Installation

```bash
npm install nestjs-prisma-base
```

## Features

- Prisma module with proper lifecycle management
- Base service with common CRUD operations
- Base controller with configurable REST endpoints
- **Enhanced pagination with metadata** - NEW in v0.5.0
- **Limit protection and validation** - NEW in v0.6.0
- Base DTOs for standardizing request/response data
- Support for multiple Prisma clients/databases
- Factory functions to auto-generate components

## Basic Usage

### 1. Set up the PrismaModule in your app

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    // REQUIRED: Always provide a PrismaClient instance
    PrismaModule.forRoot({
      prismaClient: new PrismaClient(),
    }),
    // Other modules
  ],
})
export class AppModule {}
```

### 2. Create your entity DTOs

```typescript
// user.dto.ts
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from 'nestjs-prisma-base';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateUserDto extends BaseCreateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
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

### 3. Create your service

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { BaseService } from 'nestjs-prisma-base';
import { PrismaService } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user'; // Prisma model name

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
```

### 4. Create your controller

```typescript
// user.controller.ts
import { Controller } from '@nestjs/common';
import { BaseController, EnableEndpoint, EndpointType } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
// IMPORTANT: By default, all endpoints are disabled for security
// You must explicitly enable each endpoint
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
@EnableEndpoint(EndpointType.CREATE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
```

## Enhanced Pagination (v0.5.0+)

The `findAll` method now returns enhanced pagination metadata:

```typescript
// GET /users?page=1&limit=10
{
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
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

### Backward Compatibility

For projects that need the old array response, use `findAllSimple()`:

```typescript
// In your custom service
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  // Returns User[] instead of PaginationResult<User>
  async getUsersAsArray(): Promise<User[]> {
    return this.findAllSimple(1, 10);
  }
}
```

### Pagination Types

```typescript
import { PaginationResult, PaginationMeta } from 'nestjs-prisma-base';

// Enhanced pagination response
interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Pagination metadata
interface PaginationMeta {
  total: number; // Total number of records
  page: number; // Current page number
  limit: number; // Records per page
  totalPages: number; // Total number of pages
  hasNext: boolean; // Whether there's a next page
  hasPrev: boolean; // Whether there's a previous page
}
```

## Limit Protection (v0.6.0+)

Protect your application from performance issues by configuring pagination limits:

### Default Configuration

By default, the base service uses these safe limits:

```typescript
{
  defaultLimit: 10,      // Default records per page
  maxLimit: 100,         // Maximum allowed limit
  allowUnlimited: false  // Disable unlimited results
}
```

### Custom Configuration

Override pagination configuration in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService, PaginationConfig } from 'nestjs-prisma-base';

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

  // Custom pagination limits
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 20, // Default 20 items per page
    maxLimit: 200, // Maximum 200 items per page
    allowUnlimited: false, // Don't allow unlimited results
  };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
```

### Validation Examples

The service automatically validates pagination parameters:

```typescript
// ✅ Valid requests
GET /users?page=1&limit=10
GET /users?page=2&limit=50
GET /users?page=1            // Uses default limit (20)

// ❌ Invalid requests (throw BadRequestException)
GET /users?page=0&limit=10   // Page must be >= 1
GET /users?page=1&limit=0    // Limit must be >= 1 (unless unlimited allowed)
GET /users?page=1&limit=300  // Exceeds maxLimit (200)
GET /users?page=1&limit=-1   // Unlimited not allowed by default
```

### Allowing Unlimited Results

For administrative or export operations, you can allow unlimited results:

```typescript
export class AdminService extends BaseService<any, any, any> {
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 50,
    maxLimit: 1000,
    allowUnlimited: true, // ⚠️ Use carefully!
  };

  async exportAllData(): Promise<any[]> {
    // Pass -1 or 0 for unlimited results
    return this.findAllSimple(1, -1);
  }
}
```

**⚠️ Warning:** Unlimited results can severely impact performance and memory usage. Only enable for trusted administrative operations.

## Multiple Database Support

When working with multiple databases:

```typescript
import { Module, Inject } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma-base';
import { PrismaClient as UsersDbClient } from './prisma/generated/users-client';
import { PrismaClient as ProductsDbClient } from './prisma/generated/products-client';

@Module({
  imports: [
    // First database
    PrismaModule.forRoot({
      prismaClient: new UsersDbClient({
        datasources: { db: { url: process.env.USERS_DATABASE_URL } },
      }),
      providerToken: 'USERS_PRISMA_SERVICE',
    }),

    // Second database
    PrismaModule.forRoot({
      prismaClient: new ProductsDbClient({
        datasources: { db: { url: process.env.PRODUCTS_DATABASE_URL } },
      }),
      providerToken: 'PRODUCTS_PRISMA_SERVICE',
      isGlobal: false,
    }),
  ],
})
export class AppModule {}

// Services for different databases
@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

  constructor(@Inject('USERS_PRISMA_SERVICE') prisma: PrismaService) {
    super(prisma);
  }
}

@Injectable()
export class ProductService extends BaseService<Product, CreateProductDto, UpdateProductDto> {
  protected readonly modelName = 'product';

  constructor(@Inject('PRODUCTS_PRISMA_SERVICE') prisma: PrismaService) {
    super(prisma);
  }
}
```

### Alternative: Using forFeature

For a cleaner organization:

```typescript
// Even cleaner approach for multiple databases
@Module({
  imports: [
    PrismaModule.forFeature({
      name: 'users', // Creates USERS_PRISMA_SERVICE token
      prismaClient: new UsersDbClient({
        datasources: { db: { url: process.env.USERS_DATABASE_URL } },
      }),
    }),

    PrismaModule.forFeature({
      name: 'products', // Creates PRODUCTS_PRISMA_SERVICE token
      prismaClient: new ProductsDbClient({
        datasources: { db: { url: process.env.PRODUCTS_DATABASE_URL } },
      }),
    }),
  ],
})
export class AppModule {}
```

## Using Factory Functions

Generate an entire module with one function call:

```typescript
import { createModelModule, EndpointType } from 'nestjs-prisma-base';

// Create a module with specific enabled endpoints
export const UserModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Create a module with all endpoints enabled
export const ProductModule = createModelModule({
  modelName: 'product',
  enableAllEndpoints: true,
});
```

## Endpoint Configuration

Available endpoints that can be enabled:

```typescript
export enum EndpointType {
  FIND_ALL = 'findAll', // GET /resource
  FIND_ONE = 'findOne', // GET /resource/:id
  CREATE = 'create', // POST /resource
  UPDATE = 'update', // PATCH /resource/:id
  REMOVE = 'remove', // DELETE /resource/:id
}
```

### Enabling All Endpoints

```typescript
@Controller('users')
@EnableAllEndpoints()
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // ...
}
```

### Disabling Specific Endpoints

```typescript
@Controller('users')
@EnableAllEndpoints()
@DisableEndpoint(EndpointType.REMOVE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // ...
}
```

## License

MIT
