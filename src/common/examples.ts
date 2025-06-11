/**
 * This file contains examples of how to use the package
 * It is not part of the package exports
 */

import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { BaseService } from '../base/base.service';
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from '../base/base.dto';
import { PaginationResult, PaginationConfig } from '../base/pagination.interface';
import { BasicSearchOptions, SearchConfig } from '../base/search.interface';
import { ModelName } from '../decorators/model-name.decorator';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { createModelModule } from './module-factory';
import { EnableEndpoint, EndpointType, EnableAllEndpoints, DisableEndpoint } from '../decorators/endpoint.decorator';

// Example entity
interface User {
  id: string;
  name: string;
  email: string;
  status?: string;
}

// Example DTOs
class CreateUserDto {
  name: string = '';
  email: string = '';
}

class UpdateUserDto {
  name?: string;
  email?: string;
}

// Example 1: Creating a custom controller with selective endpoint enabling
// IMPORTANT: Without the EnableEndpoint decorators, no endpoints would be exposed
@Controller('users')
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(service: UserService) {
    super(service);
  }

  // Custom endpoint example - MUST be explicitly enabled
  @Get('admins')
  @EnableEndpoint('admins')
  findAdmins() {
    // Example implementation
    return [];
  }

  // Example of using the new pagination response
  @Get('paginated')
  @EnableEndpoint('paginated')
  async findAllPaginated(): Promise<PaginationResult<User>> {
    // This will return the new enhanced pagination response:
    // {
    //   data: User[],
    //   meta: {
    //     total: 100,
    //     page: 1,
    //     limit: 10,
    //     totalPages: 10,
    //     hasNext: true,
    //     hasPrev: false
    //   }
    // }
    return this.service.findAll(1, 10);
  }

  // Example of using search functionality
  @Get('search')
  @EnableEndpoint('search')
  async searchUsers(): Promise<PaginationResult<User>> {
    // Example search with options
    const searchOptions: BasicSearchOptions = {
      search: 'john',
      searchFields: ['name', 'email'],
      filters: { status: 'active' },
      orderBy: { name: 'asc' },
    };

    return this.service.findAll(1, 20, searchOptions);
  }
}

// Example 2: Custom service implementation with pagination and search configuration
@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

  // Override pagination configuration
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 20, // Default 20 items per page
    maxLimit: 200, // Maximum 200 items per page
    allowUnlimited: false, // Don't allow unlimited results
  };

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

  // Custom method example
  async findAdmins(): Promise<User[]> {
    return [];
  }

  // Example of backward compatibility method
  async findAllAsArray(): Promise<User[]> {
    // Use the deprecated method for backward compatibility
    return this.findAllSimple(1, 10);
  }

  // Example of advanced search usage
  async searchActiveUsers(searchTerm: string): Promise<PaginationResult<User>> {
    const searchOptions: BasicSearchOptions = {
      search: searchTerm,
      filters: { status: 'active' },
      orderBy: { name: 'asc' },
    };

    return this.findAll(1, 20, searchOptions);
  }
}

// Example 3: Service with different search configuration
@Injectable()
export class ProductService extends BaseService<any, any, any> {
  protected readonly modelName = 'product';

  // More restrictive search configuration
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['name', 'description', 'sku'],
    caseSensitive: false,
    searchMode: 'startsWith', // Only match from beginning
    maxSearchFields: 3,
  };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

// Example 4: Service with no search functionality
@Injectable()
export class LogService extends BaseService<any, any, any> {
  protected readonly modelName = 'log';

  // No search fields configured - search will be disabled
  protected searchConfig: SearchConfig = {
    defaultSearchFields: [], // Empty = no search functionality
    caseSensitive: false,
    searchMode: 'contains',
    maxSearchFields: 0,
  };

  // Allow unlimited results for administrative operations
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 50,
    maxLimit: 1000,
    allowUnlimited: true, // ⚠️ Use carefully - can impact performance
  };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  // Example method that might need unlimited results
  async exportAllLogs(): Promise<any[]> {
    // Pass -1 or 0 for unlimited results (only works if allowUnlimited: true)
    return this.findAllSimple(1, -1);
  }
}

// Example 5: Service with strict limits for high-traffic endpoints
@Injectable()
export class PublicDataService extends BaseService<any, any, any> {
  protected readonly modelName = 'publicData';

  // Strict limits for public APIs
  protected paginationConfig: PaginationConfig = {
    defaultLimit: 10,
    maxLimit: 50, // Lower max limit for public endpoints
    allowUnlimited: false,
  };

  // Limited search capability
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['title'],
    caseSensitive: false,
    searchMode: 'contains',
    maxSearchFields: 1, // Only allow single field search
  };

  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

// Example 6: Using module factory with specific endpoints enabled
// Note: Without enabledEndpoints or enableAllEndpoints, no endpoints would be exposed
export const UsersModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Example 7: Using module factory with all endpoints enabled
export const ProductModule = createModelModule({
  modelName: 'product',
  enableAllEndpoints: true, // This is necessary to expose any endpoints
});

// Example 8: Using module factory with all endpoints enabled except DELETE
export const CategoryModule = createModelModule({
  modelName: 'category',
  enableAllEndpoints: true, // First enable all
  serviceType: class CategoryService extends BaseService<any, any, any> {
    protected readonly modelName = 'category';

    constructor(protected readonly prisma: PrismaService) {
      super(prisma);
    }
  },
});

// Example 9: Create a controller that uses decorators to disable specific endpoints
@Controller('orders')
@EnableAllEndpoints() // First enable all endpoints
@DisableEndpoint(EndpointType.REMOVE) // Then selectively disable some
export class OrderController extends BaseController<any, any, any> {
  constructor(service: BaseService<any, any, any>) {
    super(service);
  }
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
    PrismaModule.forRoot({
      prismaClient: new (require('@prisma/client').PrismaClient)(),
    }),
    UserModule,
    // Other modules
  ],
})
export class AppModule {}
