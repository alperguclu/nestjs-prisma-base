import { Body, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { BaseService } from './base.service';
import { DISABLED_ENDPOINTS_KEY, ENABLED_ENDPOINTS_KEY, ENDPOINT_DISABLED_KEY, ENDPOINT_ENABLED_KEY, EndpointType, ApiExcludeDisabledEndpoint } from '../decorators/endpoint.decorator';

/**
 * Base controller with configurable CRUD endpoints
 * Endpoints are disabled by default and must be explicitly enabled
 * using the @EnableEndpoint decorator or module configuration.
 */
export abstract class BaseController<T, CreateDto, UpdateDto> {
  constructor(protected readonly service: BaseService<T, CreateDto, UpdateDto>) {}

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
  @ApiExcludeDisabledEndpoint(EndpointType.FIND_ALL)
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
  @ApiExcludeDisabledEndpoint(EndpointType.FIND_ONE)
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
  @ApiExcludeDisabledEndpoint(EndpointType.CREATE)
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
  @ApiExcludeDisabledEndpoint(EndpointType.UPDATE)
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
  @ApiExcludeDisabledEndpoint(EndpointType.REMOVE)
  remove(@Param('id') id: string) {
    if (!this.isEndpointEnabled(EndpointType.REMOVE)) {
      throw new NotFoundException('Endpoint not available');
    }
    return this.service.remove(id);
  }
}
