/**
 * This file contains examples of how to use the package
 * It is not part of the package exports
 */

import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { BaseService } from '../base/base.service';
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from '../base/base.dto';
import { PaginationResult } from '../base/pagination.interface';
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
}

// Example 2: Custom service implementation
@Injectable()
export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  protected readonly modelName = 'user';

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
}

// Example 3: Using module factory with specific endpoints enabled
// Note: Without enabledEndpoints or enableAllEndpoints, no endpoints would be exposed
export const UsersModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Example 4: Using module factory with all endpoints enabled
export const ProductModule = createModelModule({
  modelName: 'product',
  enableAllEndpoints: true, // This is necessary to expose any endpoints
});

// Example 5: Using module factory with all endpoints enabled except DELETE
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

// Example 6: Create a controller that uses decorators to disable specific endpoints
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
