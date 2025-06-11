import { BadRequestException } from '@nestjs/common';
import {
  AdvancedSearchOptions,
  AdvancedFilter,
  AdvancedFilterOperator,
  QueryBuilderResult,
  SearchConfig,
} from './search.interface';

/**
 * Advanced query builder for constructing complex Prisma queries
 * Provides type-safe query building with validation and optimization
 */
export class AdvancedQueryBuilder {
  /**
   * Build a complete Prisma query from advanced search options
   * @param options Advanced search options
   * @param searchConfig Service search configuration
   * @returns Prisma-compatible query object
   */
  static buildQuery(options: AdvancedSearchOptions, searchConfig: SearchConfig): QueryBuilderResult {
    const result: QueryBuilderResult = {};

    // Build where conditions
    result.where = this.buildWhereConditions(options, searchConfig);

    // Build include conditions
    if (options.include) {
      result.include = options.include;
    }

    // Build select conditions
    if (options.select) {
      result.select = options.select;
    }

    // Build orderBy conditions
    if (options.orderBy) {
      result.orderBy = this.buildOrderConditions(options.orderBy);
    }

    return result;
  }

  /**
   * Build where conditions from advanced search options
   * @param options Advanced search options
   * @param searchConfig Service search configuration
   * @returns Prisma where conditions
   */
  private static buildWhereConditions(
    options: AdvancedSearchOptions,
    searchConfig: SearchConfig
  ): Record<string, any> | undefined {
    const conditions: Record<string, any>[] = [];

    // Handle basic search
    if (options.search && options.search.trim()) {
      const searchCondition = this.buildBasicSearchCondition(
        options.search.trim(),
        options.searchFields || searchConfig.defaultSearchFields,
        searchConfig
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Handle simple filters
    if (options.filters && Object.keys(options.filters).length > 0) {
      const filterCondition = this.buildSimpleFilters(options.filters);
      if (filterCondition) {
        conditions.push(filterCondition);
      }
    }

    // Handle advanced filters
    if (options.advancedFilters && Object.keys(options.advancedFilters).length > 0) {
      this.validateAdvancedFilters(options.advancedFilters, searchConfig);
      const advancedCondition = this.buildAdvancedFilters(options.advancedFilters);
      if (advancedCondition) {
        conditions.push(advancedCondition);
      }
    }

    // Handle raw where conditions
    if (options.where) {
      conditions.push(options.where);
    }

    // Combine conditions based on logical operator
    if (conditions.length === 0) {
      return undefined;
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    const logicalOp = options.logicalOperator || 'AND';
    return {
      [logicalOp]: conditions,
    };
  }

  /**
   * Build basic search condition for text search
   * @param searchTerm Search term
   * @param searchFields Fields to search in
   * @param searchConfig Search configuration
   * @returns Search condition
   */
  private static buildBasicSearchCondition(
    searchTerm: string,
    searchFields: string[],
    searchConfig: SearchConfig
  ): Record<string, any> | undefined {
    if (searchFields.length === 0) {
      return undefined;
    }

    const searchConditions = searchFields.map((field) => {
      const condition: any = {};

      switch (searchConfig.searchMode) {
        case 'startsWith':
          condition[field] = {
            startsWith: searchTerm,
            mode: searchConfig.caseSensitive ? 'default' : 'insensitive',
          };
          break;
        case 'endsWith':
          condition[field] = {
            endsWith: searchTerm,
            mode: searchConfig.caseSensitive ? 'default' : 'insensitive',
          };
          break;
        case 'contains':
        default:
          condition[field] = {
            contains: searchTerm,
            mode: searchConfig.caseSensitive ? 'default' : 'insensitive',
          };
          break;
      }

      return condition;
    });

    return { OR: searchConditions };
  }

  /**
   * Build simple filters condition
   * @param filters Simple key-value filters
   * @returns Filter condition
   */
  private static buildSimpleFilters(filters: Record<string, any>): Record<string, any> | undefined {
    const filterConditions: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filterConditions[key] = value;
      }
    });

    return Object.keys(filterConditions).length > 0 ? filterConditions : undefined;
  }

  /**
   * Build advanced filters with operators
   * @param advancedFilters Advanced filter configuration
   * @returns Advanced filter conditions
   */
  private static buildAdvancedFilters(
    advancedFilters: Record<string, AdvancedFilter>
  ): Record<string, any> | undefined {
    const conditions: Record<string, any> = {};

    Object.entries(advancedFilters).forEach(([field, filter]) => {
      const condition = this.buildOperatorCondition(filter.operator, filter.value);
      if (condition !== undefined) {
        conditions[field] = condition;
      }
    });

    return Object.keys(conditions).length > 0 ? conditions : undefined;
  }

  /**
   * Build condition for a specific operator
   * @param operator Filter operator
   * @param value Filter value
   * @returns Prisma condition
   */
  private static buildOperatorCondition(operator: AdvancedFilterOperator, value: any): any {
    switch (operator) {
      case 'equals':
        return value;
      case 'not':
        return { not: value };
      case 'contains':
        return { contains: value, mode: 'insensitive' };
      case 'startsWith':
        return { startsWith: value, mode: 'insensitive' };
      case 'endsWith':
        return { endsWith: value, mode: 'insensitive' };
      case 'gt':
        return { gt: value };
      case 'gte':
        return { gte: value };
      case 'lt':
        return { lt: value };
      case 'lte':
        return { lte: value };
      case 'in':
        return { in: Array.isArray(value) ? value : [value] };
      case 'notIn':
        return { notIn: Array.isArray(value) ? value : [value] };
      case 'isNull':
        return null;
      case 'isNotNull':
        return { not: null };
      default:
        throw new BadRequestException(`Unsupported operator: ${operator}`);
    }
  }

  /**
   * Build order by conditions
   * @param orderBy Order by configuration
   * @returns Prisma orderBy conditions
   */
  private static buildOrderConditions(orderBy: Record<string, 'asc' | 'desc'>): any {
    return Object.entries(orderBy).map(([field, direction]) => ({
      [field]: direction,
    }));
  }

  /**
   * Validate advanced filters against configuration
   * @param advancedFilters Advanced filter configuration
   * @param searchConfig Search configuration
   */
  private static validateAdvancedFilters(
    advancedFilters: Record<string, AdvancedFilter>,
    searchConfig: SearchConfig
  ): void {
    const filterCount = Object.keys(advancedFilters).length;
    const maxFilters = searchConfig.maxAdvancedFilters || 20;

    if (filterCount > maxFilters) {
      throw new BadRequestException(
        `Too many advanced filters. Maximum allowed: ${maxFilters}, provided: ${filterCount}`
      );
    }

    // Validate allowed fields if configured
    if (searchConfig.allowedAdvancedFields && searchConfig.allowedAdvancedFields.length > 0) {
      const invalidFields = Object.keys(advancedFilters).filter(
        (field) => !searchConfig.allowedAdvancedFields!.includes(field)
      );

      if (invalidFields.length > 0) {
        throw new BadRequestException(
          `Invalid advanced filter fields: ${invalidFields.join(', ')}. ` +
            `Allowed fields: ${searchConfig.allowedAdvancedFields.join(', ')}`
        );
      }
    }

    // Validate operator-value combinations
    Object.entries(advancedFilters).forEach(([field, filter]) => {
      this.validateOperatorValue(field, filter.operator, filter.value);
    });
  }

  /**
   * Validate operator and value combination
   * @param field Field name
   * @param operator Filter operator
   * @param value Filter value
   */
  private static validateOperatorValue(field: string, operator: AdvancedFilterOperator, value: any): void {
    const nullOperators: AdvancedFilterOperator[] = ['isNull', 'isNotNull'];
    const arrayOperators: AdvancedFilterOperator[] = ['in', 'notIn'];

    if (nullOperators.includes(operator)) {
      // Null operators don't need a value
      return;
    }

    if (value === undefined || value === null) {
      throw new BadRequestException(
        `Advanced filter for field '${field}' with operator '${operator}' requires a value`
      );
    }

    if (arrayOperators.includes(operator) && !Array.isArray(value)) {
      throw new BadRequestException(
        `Advanced filter for field '${field}' with operator '${operator}' requires an array value`
      );
    }
  }
}
