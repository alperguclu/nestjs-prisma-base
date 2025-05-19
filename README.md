# NestJS Prisma Base

A reusable NestJS module for Prisma ORM with base classes for controllers, services, and DTOs.

## Installation

```bash
npm install nestjs-prisma-base
```

## Features

- Ready-to-use Prisma module with proper lifecycle management
- Base service with common CRUD operations
- Base controller with configurable REST endpoints
- Base DTOs for standardizing request/response data
- Utility decorators for easier implementation
- Factory functions to auto-generate components from Prisma models
- Selective endpoint activation for precise API control

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

### Using Multiple Prisma Clients

When working with multiple databases that have different schemas, each schema requires its own Prisma client. This package supports using multiple clients in the same application.

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';
import { PrismaClient as UsersDbClient } from './prisma/generated/users-client';
import { PrismaClient as ProductsDbClient } from './prisma/generated/products-client';

@Module({
  imports: [
    // Register the Users database client
    PrismaModule.forRoot({
      prismaClient: new UsersDbClient({
        datasources: {
          db: { url: process.env.USERS_DATABASE_URL },
        },
      }),
      providerToken: 'USERS_PRISMA_SERVICE',
      isGlobal: true, // Set as the default service for the app
    }),

    // Register the Products database client
    PrismaModule.forRoot({
      prismaClient: new ProductsDbClient({
        datasources: {
          db: { url: process.env.PRODUCTS_DATABASE_URL },
        },
      }),
      providerToken: 'PRODUCTS_PRISMA_SERVICE',
      isGlobal: false, // Don't register globally to avoid conflicts
    }),

    // Feature modules
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

Then inject the correct service in your feature modules:

```typescript
// Users database service
@Injectable()
@ModelName('user')
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(@Inject('USERS_PRISMA_SERVICE') prisma: PrismaService) {
    super(prisma);
  }
}

// Products database service
@Injectable()
@ModelName('product')
export class ProductService extends BaseService<Product, CreateProductDto, UpdateProductDto> {
  constructor(@Inject('PRODUCTS_PRISMA_SERVICE') prisma: PrismaService) {
    super(prisma);
  }
}
```

#### Alternative: Create Feature-Specific Modules

For better organization, you can create separate modules for each database:

```typescript
// users-db.module.ts
@Module({
  providers: [
    {
      provide: 'USERS_PRISMA_SERVICE',
      useFactory: () => {
        return new PrismaService(
          new UsersDbClient({
            datasources: {
              db: { url: process.env.USERS_DATABASE_URL },
            },
          })
        );
      },
    },
  ],
  exports: ['USERS_PRISMA_SERVICE'],
})
export class UsersDbModule {}

// products-db.module.ts
@Module({
  imports: [
    PrismaModule.forRoot({
      prismaClient: new ProductsDbClient({
        datasources: {
          db: { url: process.env.PRODUCTS_DATABASE_URL },
        },
      }),
      providerToken: 'PRODUCTS_PRISMA_SERVICE',
      isGlobal: false,
    }),
  ],
  exports: ['PRODUCTS_PRISMA_SERVICE'],
})
export class ProductsDbModule {}
```

Then import these modules in your feature modules:

```typescript
@Module({
  imports: [UsersDbModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
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

#### 4. Create your controller by extending the base controller with endpoint configuration

```typescript
// user.controller.ts
import { Controller } from '@nestjs/common';
import { BaseController, EnableEndpoint, EndpointType, EnableAllEndpoints, DisableEndpoint } from 'nestjs-prisma-base';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('users')
// Option 1: Enable specific endpoints
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
@EnableEndpoint(EndpointType.CREATE)

// Option 2: Enable all endpoints at once
// @EnableAllEndpoints()

// Option 3: Enable all except specific ones
// @EnableAllEndpoints()
// @DisableEndpoint(EndpointType.REMOVE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // Add custom endpoints here
  // Don't forget to enable your custom endpoints!
  @EnableEndpoint('findByEmail')
  @Get('by-email/:email')
  findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }
}
```

### Option 2: Using Factory Functions (Auto-Generated Approach)

#### 1. Generate an entire module for a model with configurable endpoints

```typescript
// user.module.ts
import { createModelModule, EndpointType } from 'nestjs-prisma-base';

// Option 1: Create module with specific enabled endpoints
export const UserModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Option 2: Create module with all endpoints enabled
export const ProductModule = createModelModule({
  modelName: 'product',
  enableAllEndpoints: true,
});

// Option 3: Create module with custom service
export const CategoryModule = createModelModule({
  modelName: 'category',
  enableAllEndpoints: true,
  serviceType: CategoryService, // Your custom service class
  providers: [
    /* Additional providers */
  ],
  imports: [
    /* Additional imports */
  ],
  exports: [
    /* Additional exports */
  ],
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

## Endpoint Configuration

**Important: By default, all endpoints are disabled for security reasons.** In version 0.2.0 and above, you must explicitly enable each endpoint you want to expose. This provides better security and control over your API surface.

### Available Endpoint Types

```typescript
export enum EndpointType {
  FIND_ALL = 'findAll', // GET /resource
  FIND_ONE = 'findOne', // GET /resource/:id
  CREATE = 'create', // POST /resource
  UPDATE = 'update', // PATCH /resource/:id
  REMOVE = 'remove', // DELETE /resource/:id
}
```

### Swagger Integration

When using this package with Swagger documentation, endpoints that are disabled will be automatically hidden from the Swagger UI. This is accomplished through the `ApiExcludeDisabledEndpoint` decorator that's applied to all standard endpoints in the `BaseController`.

If you're creating custom endpoints, you can use the decorator to hide them from Swagger when they're disabled:

```typescript
@Get('custom-endpoint')
@ApiExcludeDisabledEndpoint('customEndpoint')
customEndpoint() {
  if (!this.isEndpointEnabled('customEndpoint')) {
    throw new NotFoundException('Endpoint not available');
  }
  // Your implementation
}
```

This requires the `@nestjs/swagger` package to be installed in your project.

### Enabling Endpoints with Decorators

You can enable endpoints at the controller level:

```typescript
@Controller('users')
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // ...
}
```

Or enable all endpoints at once:

```typescript
@Controller('users')
@EnableAllEndpoints()
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // ...
}
```

### Disabling Specific Endpoints

You can disable specific endpoints even when using `@EnableAllEndpoints()`:

```typescript
@Controller('users')
@EnableAllEndpoints()
@DisableEndpoint(EndpointType.REMOVE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // ...
}
```

### Enabling Method-Level Endpoints

You can also selectively enable endpoints at the method level:

```typescript
@Controller('users')
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  // Only this method will be available
  @EnableEndpoint('findAdmins')
  @Get('admins')
  findAdmins() {
    return this.userService.findAdmins();
  }
}
```

## License

MIT

#### Simplified: Using forFeature for Multiple Databases

For an even cleaner approach, use the `forFeature` method to register databases:

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma-base';
import { PrismaClient as UsersDbClient } from './prisma/generated/users-client';
import { PrismaClient as ProductsDbClient } from './prisma/generated/products-client';

@Module({
  imports: [
    // Register both database clients
    PrismaModule.forFeature({
      name: 'users',
      prismaClient: new UsersDbClient({
        datasources: {
          db: { url: process.env.USERS_DATABASE_URL },
        },
      }),
    }),

    PrismaModule.forFeature({
      name: 'products',
      prismaClient: new ProductsDbClient({
        datasources: {
          db: { url: process.env.PRODUCTS_DATABASE_URL },
        },
      }),
    }),

    // Feature modules
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
```

Then inject them in your services:

```typescript
@Injectable()
@ModelName('user')
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  constructor(@Inject('USERS_PRISMA_SERVICE') prisma: PrismaService) {
    super(prisma);
  }
}
```
