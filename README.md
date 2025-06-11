# NestJS Prisma Base

A comprehensive NestJS package providing base classes, utilities, and decorators for building CRUD APIs with Prisma ORM integration, featuring pagination, search, filtering, and relation loading capabilities.

## Installation

```bash
npm install nestjs-prisma-base
```

## Features

- Prisma module with proper lifecycle management
- Base service with common CRUD operations
- Base controller with configurable REST endpoints
- **Enhanced pagination with metadata** - NEW in v0.5.0
- **Limit protection and validation** - NEW in v0.5.1
- **Search and filtering capabilities** - NEW in v0.6.0
- **Advanced search with operators** - NEW in v0.7.0
- **Relation loading configuration** - NEW in v0.8.0
- **Configurable Base DTOs** - NEW in v0.9.0
- **Optional Swagger Integration** - NEW in v0.9.0
- **Minimal DTOs for maximum control** - NEW in v0.9.0
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
import { BaseService, SearchConfig } from 'nestjs-prisma-base';
import { PrismaService } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user'; // Prisma model name

  // Configure search functionality
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['name', 'email'], // Fields to search by default
    caseSensitive: false, // Case-insensitive search
    searchMode: 'contains', // Search mode
    maxSearchFields: 5, // Max fields allowed in search
  };

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

## Search and Filtering (v0.6.0+)

Powerful search and filtering capabilities with configurable options:

### Basic Search Usage

```typescript
// GET /users?search=john&page=1&limit=10
// Searches for "john" in default search fields (name, email)

// GET /users?search=john&searchFields=name,email
// Searches for "john" only in specified fields

// GET /users?sortBy=name&sortOrder=asc
// Sort results by name in ascending order

// GET /users?status=active&role=admin
// Filter by status=active AND role=admin
```

### Search Configuration

Configure search behavior in your service:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService, SearchConfig } from 'nestjs-prisma-base';

@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

  // Configure search functionality
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['name', 'email'], // Fields to search by default
    caseSensitive: false, // Case-insensitive search
    searchMode: 'contains', // 'contains' | 'startsWith' | 'endsWith'
    maxSearchFields: 5, // Maximum fields allowed in single search
  };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
```

### Search Options

```typescript
// In your service methods
import { BasicSearchOptions } from 'nestjs-prisma-base';

const searchOptions: BasicSearchOptions = {
  search: 'john', // Search term
  searchFields: ['name', 'email'], // Fields to search in
  filters: {
    // Exact match filters
    status: 'active',
    role: 'admin',
  },
  orderBy: {
    // Sorting
    name: 'asc',
    createdAt: 'desc',
  },
};

const results = await this.findAll(1, 20, searchOptions);
```

### Search Modes

```typescript
// Different search behaviors
protected searchConfig: SearchConfig = {
  defaultSearchFields: ['name', 'email'],

  // Contains (default) - matches anywhere in field
  searchMode: 'contains',    // "john" matches "johnsmith" and "ajohn"

  // Starts with - matches beginning of field
  searchMode: 'startsWith',  // "john" matches "johnsmith" but not "ajohn"

  // Ends with - matches end of field
  searchMode: 'endsWith',    // "john" matches "ajohn" but not "johnsmith"
};
```

### Programmatic Search

```typescript
// In your service
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  async searchActiveUsers(searchTerm: string): Promise<PaginationResult<User>> {
    const searchOptions: BasicSearchOptions = {
      search: searchTerm,
      filters: { status: 'active' },
      orderBy: { name: 'asc' },
    };

    return this.findAll(1, 20, searchOptions);
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const searchOptions: BasicSearchOptions = {
      filters: { role },
      orderBy: { name: 'asc' },
    };

    return this.findAllSimple(1, 100, searchOptions);
  }
}
```

### Advanced Query Examples

```typescript
// Complex search with multiple filters
GET /users?search=john&searchFields=name&status=active&role=admin&sortBy=createdAt&sortOrder=desc

// Search in multiple fields with filters
GET /products?search=laptop&searchFields=name,description,sku&category=electronics&inStock=true

// Pagination with search
GET /orders?search=pending&status=pending&page=2&limit=25&sortBy=createdAt&sortOrder=desc
```

## DTO Configuration & Swagger Integration (v0.9.0+)

Version 0.9.0 introduces flexible DTO configuration options and optional Swagger integration, giving you multiple approaches to define your DTOs based on your project needs.

### DTO Options Overview

Choose the DTO approach that best fits your development style:

- **Original DTOs**: `BaseCreateDto`, `BaseUpdateDto`, `BaseResponseDto` - backward compatible
- **Configurable DTOs**: `ConfigurableBaseCreateDto`, etc. - flexible configuration system
- **Swagger DTOs**: `SwaggerBaseCreateDto`, etc. - automatic Swagger documentation
- **Minimal DTOs**: `MinimalBaseCreateDto`, etc. - completely empty base classes

### 1. Configurable Base DTOs

Configurable DTOs allow you to control field inclusion and behavior globally or per-class:

```typescript
import { ConfigurableBaseCreateDto, ConfigurableBaseUpdateDto, ConfigurableBaseResponseDto, configureDTOs } from 'nestjs-prisma-base';

// Global DTO configuration (applies to all configurable DTOs)
configureDTOs({
  includeTimestamps: true,
  includeId: true,
  timestampFields: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Your DTOs extend configurable base classes
export class CreateUserDto extends ConfigurableBaseCreateDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;
}

export class UserResponseDto extends ConfigurableBaseResponseDto {
  name: string;
  email: string;
  // id, createdAt, updatedAt automatically included based on config
}

// Per-class configuration (overrides global config)
UserResponseDto.configure({
  includeTimestamps: false, // This class won't include timestamps
});
```

### 2. Swagger Integration

Automatically apply Swagger decorators when `@nestjs/swagger` is available:

```typescript
import { SwaggerBaseCreateDto, SwaggerBaseUpdateDto, SwaggerBaseResponseDto, configureSwaggerDTOs } from 'nestjs-prisma-base';
import { ApiProperty } from '@nestjs/swagger';

// Enable Swagger globally
configureSwaggerDTOs({
  enabled: true,
  includeExamples: true,
  includeDescriptions: true,
  fieldConfig: {
    id: { description: 'User ID', example: 1 },
    createdAt: { description: 'Creation time', example: '2023-01-01T00:00:00Z' },
  },
});

export class CreateUserDto extends SwaggerBaseCreateDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsEmail()
  email: string;
}

export class UserResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;
  // id, createdAt, updatedAt automatically get Swagger decorators
}
```

### 3. Minimal DTOs

For developers who want complete control with no additional fields:

```typescript
import { MinimalBaseCreateDto, MinimalBaseUpdateDto, MinimalBaseResponseDto, MinimalBaseIdDto, MinimalBaseTimestampDto, MinimalBaseEntityDto } from 'nestjs-prisma-base';

// Completely empty base classes
export class CreateUserDto extends MinimalBaseCreateDto {
  name: string;
  email: string;
  // Only your fields, nothing else
}

// Or use pre-built minimal variations
export class UserIdDto extends MinimalBaseIdDto {
  // Contains: id?: number
}

export class UserTimestampsDto extends MinimalBaseTimestampDto {
  // Contains: createdAt?: Date, updatedAt?: Date
}

export class UserEntityDto extends MinimalBaseEntityDto {
  // Contains: id?: number, createdAt?: Date, updatedAt?: Date
  name: string;
  email: string;
}
```

### 4. PrismaModule DTO Configuration

Configure DTOs at the module level for automatic setup:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [
    PrismaModule.forRoot({
      prismaClient: new PrismaClient(),
      dtoOptions: {
        // Global DTO configuration
        dtoConfig: {
          includeTimestamps: true,
          includeId: true,
          timestampFields: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          },
        },
        // Swagger integration configuration
        swaggerIntegration: {
          enabled: true,
          includeExamples: true,
          includeDescriptions: true,
          includeTimestamps: true,
        },
        // Use minimal DTOs by default
        useMinimalDTOs: false,
      },
    }),
  ],
})
export class AppModule {}
```

### 5. Advanced Configuration Examples

#### Custom Timestamp Fields

```typescript
// Configure for databases with custom timestamp column names
configureDTOs({
  includeTimestamps: true,
  timestampFields: {
    createdAt: 'created_at', // Maps to created_at column
    updatedAt: 'modified_at', // Maps to modified_at column
  },
});
```

#### Per-Service Configuration

```typescript
// Different DTO configs for different services
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaService) {
    super(prisma);

    // Configure DTOs specifically for this service
    CreateUserDto.configure({ includeTimestamps: false });
    UserResponseDto.configure({ includeId: true, includeTimestamps: true });
  }
}
```

#### Conditional Swagger Setup

```typescript
// Only enable Swagger in development/staging
configureSwaggerDTOs({
  enabled: process.env.NODE_ENV !== 'production',
  includeExamples: true,
  includeDescriptions: process.env.NODE_ENV === 'development',
});
```

#### Manual Swagger Decorator Application

```typescript
import { applySwaggerDecoratorsToClass } from 'nestjs-prisma-base';

// Manually apply Swagger decorators to any class
applySwaggerDecoratorsToClass(MyCustomDto, [
  {
    propertyKey: 'name',
    options: { description: 'Name field', example: 'John' },
  },
  {
    propertyKey: 'email',
    options: { description: 'Email field', example: 'john@example.com' },
  },
]);
```

### 6. Migration from Existing DTOs

Migrating to configurable DTOs is completely optional and non-breaking:

```typescript
// Before (v0.8.x and earlier) - still works!
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}

// After (v0.9.0+) - optional upgrade
export class CreateUserDto extends ConfigurableBaseCreateDto {
  name: string;
  email: string;
}

// Or with Swagger support
export class CreateUserDto extends SwaggerBaseCreateDto {
  @ApiProperty({ description: 'User name' })
  name: string;

  @ApiProperty({ description: 'Email address' })
  email: string;
}
```

### 7. Configuration Utilities

Check current configuration and Swagger availability:

```typescript
import { getDTOConfig, getSwaggerDTOConfig, isSwaggerIntegrationEnabled } from 'nestjs-prisma-base';

// Check current DTO configuration
const dtoConfig = getDTOConfig();
console.log('Timestamps enabled:', dtoConfig.includeTimestamps);

// Check Swagger configuration
const swaggerConfig = getSwaggerDTOConfig();
console.log('Swagger enabled:', swaggerConfig.enabled);

// Check if Swagger is available and enabled
if (isSwaggerIntegrationEnabled()) {
  console.log('Swagger decorators will be applied');
}
```

### Configuration Interface Reference

```typescript
interface DTOConfig {
  includeTimestamps?: boolean; // Include createdAt/updatedAt fields
  includeId?: boolean; // Include id field in response DTOs
  swaggerEnabled?: boolean; // Enable Swagger integration
  timestampFields?: {
    // Custom timestamp field names
    createdAt?: string;
    updatedAt?: string;
  };
}

interface SwaggerDTOConfig {
  enabled: boolean; // Enable/disable Swagger decorators
  includeTimestamps?: boolean; // Include timestamps in Swagger docs
  includeExamples?: boolean; // Include examples in Swagger docs
  includeDescriptions?: boolean; // Include descriptions in Swagger docs
  fieldConfig?: {
    // Custom field configurations
    id?: { description?: string; example?: any };
    createdAt?: { description?: string; example?: any };
    updatedAt?: { description?: string; example?: any };
  };
}
```

## Limit Protection (v0.5.1+)

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
