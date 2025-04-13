import { Body, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { BaseService } from './base.service';
import { DISABLED_ENDPOINTS_KEY, ENABLED_ENDPOINTS_KEY, ENDPOINT_DISABLED_KEY, ENDPOINT_ENABLED_KEY, EndpointType, ApiExcludeDisabledEndpoint } from '../decorators/endpoint.decorator';

/**
 * Base controller with configurable CRUD endpoints
 * Endpoints are disabled by default and must be explicitly enabled
 * using the @EnableEndpoint decorator or module configuration.
 */
export abstract class BaseController<T, CreateDto, UpdateDto> {
  constructor(protected readonly service: BaseService<T, CreateDto, UpdateDto>) {
    // Apply ApiExcludeEndpoint for disabled endpoints at class creation time
    this.applySwaggerExclusions();
  }

  /**
   * Apply ApiExcludeEndpoint decorators to methods that should be excluded from Swagger
   * This is called once during controller construction
   */
  private applySwaggerExclusions(): void {
    // Get the prototype to apply decorators
    const proto = this.constructor.prototype;

    // We need descriptor objects for the ApiExcludeEndpoint decorator
    const findAllDesc = Object.getOwnPropertyDescriptor(proto, 'findAll') || { value: proto.findAll };
    const findOneDesc = Object.getOwnPropertyDescriptor(proto, 'findOne') || { value: proto.findOne };
    const createDesc = Object.getOwnPropertyDescriptor(proto, 'create') || { value: proto.create };
    const updateDesc = Object.getOwnPropertyDescriptor(proto, 'update') || { value: proto.update };
    const removeDesc = Object.getOwnPropertyDescriptor(proto, 'remove') || { value: proto.remove };

    // Check each standard endpoint
    if (!this.isEndpointEnabled(EndpointType.FIND_ALL)) {
      ApiExcludeEndpoint()(proto, 'findAll', findAllDesc);
    }
    if (!this.isEndpointEnabled(EndpointType.FIND_ONE)) {
      ApiExcludeEndpoint()(proto, 'findOne', findOneDesc);
    }
    if (!this.isEndpointEnabled(EndpointType.CREATE)) {
      ApiExcludeEndpoint()(proto, 'create', createDesc);
    }
    if (!this.isEndpointEnabled(EndpointType.UPDATE)) {
      ApiExcludeEndpoint()(proto, 'update', updateDesc);
    }
    if (!this.isEndpointEnabled(EndpointType.REMOVE)) {
      ApiExcludeEndpoint()(proto, 'remove', removeDesc);
    }
  }

  /**
   * Check if an endpoint is enabled for this controller instance
   */
  protected isEndpointEnabled(endpointName: string): boolean {
    // Check method-level disable decorator
    if (Reflect.getMetadata(ENDPOINT_DISABLED_KEY, this, endpointName)) {
      return false;
    }

    // Check method-level enable decorator
    if (Reflect.getMetadata(ENDPOINT_ENABLED_KEY, this, endpointName)) {
      return true;
    }

    // Check class-level enable decorator
    const enabledEndpoints = Reflect.getMetadata(ENABLED_ENDPOINTS_KEY, this.constructor) || [];
    if (enabledEndpoints.includes(endpointName) || enabledEndpoints.includes('*')) {
      // Check if explicitly disabled at class level
      const disabledEndpoints = Reflect.getMetadata(DISABLED_ENDPOINTS_KEY, this.constructor) || [];
      return !disabledEndpoints.includes(endpointName);
    }

    // By default, endpoints are not enabled
    return false;
  }

  /**
   * Get all records with pagination
   */
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    if (!this.isEndpointEnabled(EndpointType.FIND_ALL)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.findAll(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  /**
   * Get a single record by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!this.isEndpointEnabled(EndpointType.FIND_ONE)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.findOne(id);
  }

  /**
   * Create a new record
   */
  @Post()
  create(@Body() createDto: CreateDto) {
    if (!this.isEndpointEnabled(EndpointType.CREATE)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.create(createDto);
  }

  /**
   * Update a record
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    if (!this.isEndpointEnabled(EndpointType.UPDATE)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.update(id, updateDto);
  }

  /**
   * Delete a record
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    if (!this.isEndpointEnabled(EndpointType.REMOVE)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.remove(id);
  }
}
