import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BaseService } from './base.service';

/**
 * Base controller with common CRUD endpoints
 * To be extended by entity-specific controllers
 */
export abstract class BaseController<T, CreateDto, UpdateDto> {
  constructor(private readonly service: BaseService<T, CreateDto, UpdateDto>) {}

  /**
   * Get all records with pagination
   */
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.findAll(page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  /**
   * Get a single record by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * Create a new record
   */
  @Post()
  create(@Body() createDto: CreateDto) {
    return this.service.create(createDto);
  }

  /**
   * Update a record
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    return this.service.update(id, updateDto);
  }

  /**
   * Delete a record
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
