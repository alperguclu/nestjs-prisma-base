/**
 * This file contains examples of how to use the package
 * It is not part of the package exports
 */

import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { BaseService } from '../base/base.service';
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from '../base/base.dto';
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
@Controller('users')
@EnableEndpoint(EndpointType.FIND_ALL)
@EnableEndpoint(EndpointType.FIND_ONE)
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto> {
  constructor(service: UserService) {
    super(service);
  }

  // Custom endpoint example
  @Get('admins')
  @EnableEndpoint('admins')
  findAdmins() {
    // Example implementation
    return [];
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
}

// Example 3: Using module factory with specific endpoints enabled
export const UsersModule = createModelModule({
  modelName: 'user',
  routePath: 'users',
  enabledEndpoints: [EndpointType.FIND_ALL, EndpointType.FIND_ONE, EndpointType.CREATE],
});

// Example 4: Using module factory with all endpoints enabled
export const ProductModule = createModelModule({
  modelName: 'product',
  enableAllEndpoints: true,
});

// Example 5: Using module factory with all endpoints enabled except DELETE
export const CategoryModule = createModelModule({
  modelName: 'category',
  enableAllEndpoints: true,
  serviceType: class CategoryService extends BaseService<any, any, any> {
    protected readonly modelName = 'category';

    constructor(protected readonly prisma: PrismaService) {
      super(prisma);
    }
  },
});

// Example 6: Create a controller that uses decorators to disable specific endpoints
@Controller('orders')
@EnableAllEndpoints()
@DisableEndpoint(EndpointType.REMOVE)
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
    PrismaModule.forRoot(),
    UserModule,
    // Other modules
  ],
})
export class AppModule {}
