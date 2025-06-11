# Complete Feature Guide

This guide covers all features available in nestjs-prisma-base package with detailed examples and configuration options.

## Table of Contents

1. [Core CRUD Operations](#core-crud-operations)
2. [Enhanced Pagination](#enhanced-pagination)
3. [Search & Filtering](#search--filtering)
4. [Advanced Search](#advanced-search)
5. [Relation Loading](#relation-loading)
6. [Endpoint Control](#endpoint-control)
7. [DTO Configuration](#dto-configuration)
8. [Mixin System](#mixin-system)
9. [Module Factories](#module-factories)
10. [Multiple Database Support](#multiple-database-support)

## Core CRUD Operations

### Base Service

The `BaseService` provides common CRUD operations for any Prisma model:

```typescript
@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user'; // Prisma model name

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}
```

### Base Controller

The `BaseController` provides REST endpoints with configurable access:

```typescript
@Controller('users')
@EnableAllEndpoints()
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
```

### Available Methods

| Method      | Endpoint               | Description                       |
| ----------- | ---------------------- | --------------------------------- |
| `findAll()` | `GET /resource`        | Paginated list with search/filter |
| `findOne()` | `GET /resource/:id`    | Single record by ID               |
| `create()`  | `POST /resource`       | Create new record                 |
| `update()`  | `PATCH /resource/:id`  | Update existing record            |
| `remove()`  | `DELETE /resource/:id` | Delete record                     |

## Enhanced Pagination

### Pagination Response

All `findAll` methods return enhanced pagination metadata:

```typescript
interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  total: number; // Total number of records
  page: number; // Current page number
  limit: number; // Records per page
  totalPages: number; // Total number of pages
  hasNext: boolean; // Whether there's a next page
  hasPrev: boolean; // Whether there's a previous page
}
```

### Pagination Configuration

Configure pagination limits in your service:

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 20, // Default items per page
    maxLimit: 200, // Maximum allowed limit
    allowUnlimited: false, // Disable unlimited results
  };
}
```

### Usage Examples

```typescript
// GET /users?page=1&limit=10
// GET /users?page=2&limit=50
// GET /users                    // Uses default limit

// Invalid requests throw BadRequestException:
// GET /users?page=0            // Page must be >= 1
// GET /users?limit=300         // Exceeds maxLimit
```

### Backward Compatibility

For projects needing array responses, use `findAllSimple()`:

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  async getUsersAsArray(): Promise<User[]> {
    return this.findAllSimple(1, 10);
  }
}
```

## Search & Filtering

### Basic Search Usage

```typescript
// Search in default fields
GET /users?search=john

// Search in specific fields
GET /users?search=john&searchFields=name,email

// Combine with filters
GET /users?search=john&status=active&role=admin

// Sort results
GET /users?search=john&sortBy=name&sortOrder=asc

// Paginate results
GET /users?search=john&page=2&limit=20
```

### Search Configuration

Configure search behavior in your service:

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['name', 'email'], // Fields to search by default
    caseSensitive: false, // Case-insensitive search
    searchMode: 'contains', // Search mode
    maxSearchFields: 5, // Max fields in single search
  };
}
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

## Advanced Search

### Advanced Filter Operators

```typescript
import { AdvancedSearchOptions, AdvancedFilterOperator } from 'nestjs-prisma-base';

const advancedOptions: AdvancedSearchOptions = {
  advancedFilters: {
    age: { operator: 'gte', value: 18 }, // age >= 18
    salary: { operator: 'between', value: [50000, 100000] }, // salary BETWEEN
    status: { operator: 'in', value: ['active', 'pending'] }, // status IN
    name: { operator: 'contains', value: 'john' }, // name LIKE '%john%'
    createdAt: { operator: 'gte', value: new Date('2023-01-01') },
  },
};
```

### Available Operators

| Operator     | Description           | Example                                                        |
| ------------ | --------------------- | -------------------------------------------------------------- |
| `equals`     | Exact match           | `{ field: { operator: 'equals', value: 'admin' } }`            |
| `not`        | Not equal             | `{ field: { operator: 'not', value: 'inactive' } }`            |
| `gt`         | Greater than          | `{ age: { operator: 'gt', value: 18 } }`                       |
| `gte`        | Greater than or equal | `{ age: { operator: 'gte', value: 18 } }`                      |
| `lt`         | Less than             | `{ age: { operator: 'lt', value: 65 } }`                       |
| `lte`        | Less than or equal    | `{ age: { operator: 'lte', value: 65 } }`                      |
| `contains`   | String contains       | `{ name: { operator: 'contains', value: 'john' } }`            |
| `startsWith` | String starts with    | `{ name: { operator: 'startsWith', value: 'john' } }`          |
| `endsWith`   | String ends with      | `{ name: { operator: 'endsWith', value: 'son' } }`             |
| `in`         | Value in array        | `{ status: { operator: 'in', value: ['active', 'pending'] } }` |
| `notIn`      | Value not in array    | `{ status: { operator: 'notIn', value: ['banned'] } }`         |
| `between`    | Value between range   | `{ age: { operator: 'between', value: [18, 65] } }`            |

### Date Range Searches

```typescript
// Service method
async findUsersByDateRange(startDate: Date, endDate: Date): Promise<PaginationResult<User>> {
  const advancedOptions: AdvancedSearchOptions = {
    advancedFilters: {
      createdAt: {
        operator: 'between',
        value: [startDate, endDate],
      },
    },
  };

  return this.findAllAdvanced(1, 20, advancedOptions);
}

// Usage
const users = await userService.findUsersByDateRange(
  new Date('2023-01-01'),
  new Date('2023-12-31')
);
```

## Relation Loading

### Basic Relation Loading

```typescript
// Include single relation
GET /users?include=posts

// Include multiple relations
GET /users?include=posts,profile,comments

// Include relations for single record
GET /users/1?include=posts,profile
```

### Relation Configuration

Configure relation loading in your service:

```typescript
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected relationConfig: RelationConfig = {
    maxDepth: 3, // Maximum relation depth
    allowNested: true, // Allow nested relations
    allowedRelations: ['posts', 'profile'], // Restrict allowed relations
  };
}
```

### Programmatic Relation Loading

```typescript
async findUsersWithPosts(): Promise<PaginationResult<User>> {
  const options: AdvancedSearchOptions = {
    requestedIncludes: ['posts'],
  };

  return this.findAllAdvanced(1, 20, options);
}

async findUserWithRelations(id: number): Promise<User | null> {
  const options: AdvancedSearchOptions = {
    filters: { id },
    requestedIncludes: ['posts', 'profile'],
  };

  const result = await this.findAllAdvanced(1, 1, options);
  return result.data.length > 0 ? result.data[0] : null;
}
```

## Endpoint Control

### Available Endpoints

```typescript
export enum EndpointType {
  FIND_ALL = 'findAll', // GET /resource
  FIND_ONE = 'findOne', // GET /resource/:id
  CREATE = 'create', // POST /resource
  UPDATE = 'update', // PATCH /resource/:id
  REMOVE = 'remove', // DELETE /resource/:id
}
```

### Enable Specific Endpoints

```typescript
@Controller('users')
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
@EnableEndpoint(EndpointType.CREATE)
export class UserController extends BaseController<...> {}
```

### Enable All Endpoints

```typescript
@Controller('users')
@EnableAllEndpoints()
export class UserController extends BaseController<...> {}
```

### Disable Specific Endpoints

```typescript
@Controller('users')
@EnableAllEndpoints()
@DisableEndpoint(EndpointType.REMOVE)  // Enable all except DELETE
export class UserController extends BaseController<...> {}
```

### Method-Level Control

```typescript
export class UserController extends BaseController<...> {
  @EnableEndpoint(EndpointType.FIND_ALL)
  findAll() {
    return super.findAll();
  }

  @DisableEndpoint(EndpointType.REMOVE)
  remove() {
    return super.remove();
  }
}
```

## DTO Configuration

### Original DTOs (Backward Compatible)

```typescript
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from 'nestjs-prisma-base';

export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}

export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  // Includes: id?, createdAt?, updatedAt?
}
```

### Configurable DTOs

Global configuration:

```typescript
import { configureDTOs } from 'nestjs-prisma-base';

configureDTOs({
  includeTimestamps: true,
  includeId: true,
  timestampFields: {
    createdAt: 'created_at', // Custom column names
    updatedAt: 'updated_at',
  },
});
```

Per-class configuration:

```typescript
export class UserResponseDto extends ConfigurableBaseResponseDto {
  name: string;
  email: string;
}

// Override global config for this class
UserResponseDto.configure({
  includeTimestamps: false,
});
```

### Swagger DTOs

```typescript
import { configureSwaggerDTOs } from 'nestjs-prisma-base';

configureSwaggerDTOs({
  enabled: true,
  includeExamples: true,
  includeDescriptions: true,
  fieldConfig: {
    id: { description: 'User ID', example: 1 },
    createdAt: { description: 'Creation time', example: '2023-01-01T00:00:00Z' },
  },
});

export class UserResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;
  // Automatic Swagger decorators for base fields
}
```

### Minimal DTOs

```typescript
import { MinimalBaseCreateDto, MinimalBaseEntityDto } from 'nestjs-prisma-base';

// Completely empty base class
export class CreateUserDto extends MinimalBaseCreateDto {
  name: string;
  email: string;
  // Only your fields, nothing else
}

// Pre-built minimal combinations
export class UserEntityDto extends MinimalBaseEntityDto {
  // Contains: id?, createdAt?, updatedAt?
  name: string;
  email: string;
}
```

## Mixin System

### Individual Mixins

```typescript
import { WithTimestamps, WithSoftDelete, WithAuditFields, WithVersioning, WithId } from 'nestjs-prisma-base';

// Add timestamps
export class UserDto extends WithTimestamps(BaseDto) {
  name: string;
  // Includes: createdAt?, updatedAt?
}

// Add soft delete
export class UserDto extends WithSoftDelete(BaseDto) {
  name: string;
  // Includes: deletedAt?, isActive?
}

// Add audit fields
export class UserDto extends WithAuditFields(BaseDto) {
  name: string;
  // Includes: createdBy?, updatedBy?
}
```

### Combining Mixins

```typescript
import { composeMixins } from 'nestjs-prisma-base';

export class CompleteUserDto extends composeMixins(BaseDto, WithTimestamps, WithAuditFields, WithVersioning, WithSoftDelete) {
  name: string;
  email: string;
  // Includes all mixin fields
}
```

### Convenience Combinations

```typescript
import { MixinCombinations } from 'nestjs-prisma-base';

// Full audit trail (timestamps + audit fields + versioning)
export class AuditedUserDto extends MixinCombinations.WithFullAuditTrail(BaseDto) {
  name: string;
  // Includes: createdAt, updatedAt, createdBy, updatedBy, version
}

// Standard entity (id + timestamps)
export class StandardUserDto extends MixinCombinations.WithStandardEntity(BaseDto) {
  name: string;
  // Includes: id, createdAt, updatedAt
}

// Complete entity (all possible fields)
export class CompleteUserDto extends MixinCombinations.WithCompleteEntity(BaseDto) {
  name: string;
  // Includes: id, createdAt, updatedAt, createdBy, updatedBy, version, deletedAt, isActive
}
```

### Mixin Configuration

```typescript
// Configure mixin behavior
export class UserDto extends WithTimestamps(BaseDto, {
  swagger: { enabled: true, includeExamples: true },
  validation: { enabled: true, optional: true },
}) {
  name: string;
}

// Disable Swagger for specific mixin
export class UserDto extends DisableSwagger(WithTimestamps(BaseDto)) {
  name: string;
}

// Disable validation for specific mixin
export class UserDto extends DisableValidation(WithAuditFields(BaseDto)) {
  name: string;
}
```

## Module Factories

### Basic Factory Usage

```typescript
import { createModelModule, EndpointType } from 'nestjs-prisma-base';

// Create module with specific endpoints
export const UserModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Create module with all endpoints
export const ProductModule = createModelModule({
  modelName: 'product',
  routePath: 'products',
  enableAllEndpoints: true,
});
```

### Advanced Factory Configuration

```typescript
export const UserModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enableAllEndpoints: true,
  serviceType: CustomUserService, // Use custom service
  providers: [UserValidationService], // Additional providers
  imports: [EmailModule], // Additional imports
  exports: ['userService'], // Additional exports
});
```

### Using in App Module

```typescript
@Module({
  imports: [
    PrismaModule.forRoot({ prismaClient: new PrismaClient() }),
    UserModule, // Generated module
    ProductModule, // Generated module
  ],
})
export class AppModule {}
```

## Multiple Database Support

### Basic Multi-Database Setup

```typescript
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
    }),
  ],
})
export class AppModule {}
```

### Services for Different Databases

```typescript
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

### Using forFeature for Cleaner Organization

```typescript
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
