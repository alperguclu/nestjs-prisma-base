// Base classes
export { BaseController } from './base/base.controller';
export { BaseService } from './base/base.service';
export { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from './base/base.dto';

// v0.9.0: Configurable DTOs
export {
  ConfigurableBaseCreateDto,
  ConfigurableBaseUpdateDto,
  ConfigurableBaseResponseDto,
  configureDTOs,
  getDTOConfig,
} from './common/configurable-dtos';

// v0.9.0: Minimal DTOs
export {
  MinimalBaseCreateDto,
  MinimalBaseUpdateDto,
  MinimalBaseResponseDto,
  MinimalBaseIdDto,
  MinimalBaseTimestampDto,
  MinimalBaseEntityDto,
} from './common/minimal-dtos';

// v0.9.0: Swagger-Enhanced DTOs
export {
  SwaggerBaseCreateDto,
  SwaggerBaseUpdateDto,
  SwaggerBaseResponseDto,
  configureSwaggerDTOs,
  getSwaggerDTOConfig,
  applySwaggerDecoratorsToClass,
  isSwaggerIntegrationEnabled,
} from './common/swagger-dtos';

// v1.0.0: Modular DTO Composition (Mixins)
export {
  WithTimestamps,
  WithSoftDelete,
  WithAuditFields,
  WithVersioning,
  WithId,
  composeMixins,
  MixinCombinations,
  DisableSwagger,
  DisableValidation,
  hasSwaggerDisabled,
  hasValidationDisabled,
  MixinConfig,
  MixinType,
  ComposedMixin,
} from './common/dto-mixins';

// v0.9.0: DTO Configuration Interfaces
export { DTOConfig, SwaggerDTOConfig, PrismaModuleDTOOptions } from './common/dto-config.interface';

// Interfaces
export { PaginationResult, PaginationMeta, PaginationConfig } from './base/pagination.interface';
export {
  BasicSearchOptions,
  AdvancedSearchOptions,
  AdvancedFilter,
  AdvancedFilterOperator,
  SearchConfig,
  SearchQuery,
  QueryBuilderResult,
  RelationConfig,
  RelationValidationResult,
} from './base/search.interface';

// Utilities
export { AdvancedQueryBuilder } from './base/query-builder';
export { RelationValidator } from './base/relation-validator';

// Prisma module and service
export { PrismaModule, PrismaModuleOptions } from './prisma/prisma.module';
export { PrismaService } from './prisma/prisma.service';

// Decorators
export { EnableEndpoint, DisableEndpoint, EnableAllEndpoints, EndpointType } from './decorators/endpoint.decorator';
export { ModelName } from './decorators/model-name.decorator';

// Factories
export { createModelModule, ModelModuleOptions } from './common/module-factory';
export { createDtos } from './common/dto-factory';
