// Base classes
export { BaseController } from './base/base.controller';
export { BaseService } from './base/base.service';
export { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from './base/base.dto';

// Interfaces
export { PaginationResult, PaginationMeta, PaginationConfig } from './base/pagination.interface';
export { BasicSearchOptions, AdvancedSearchOptions, AdvancedFilter, AdvancedFilterOperator, SearchConfig, SearchQuery, QueryBuilderResult } from './base/search.interface';

// Utilities
export { AdvancedQueryBuilder } from './base/query-builder';

// Prisma module and service
export { PrismaModule, PrismaModuleOptions } from './prisma/prisma.module';
export { PrismaService } from './prisma/prisma.service';

// Decorators
export { EnableEndpoint, DisableEndpoint, EnableAllEndpoints, EndpointType } from './decorators/endpoint.decorator';
export { ModelName } from './decorators/model-name.decorator';

// Factories
export { createModelModule, ModelModuleOptions } from './common/module-factory';
export { createDtos } from './common/dto-factory';
