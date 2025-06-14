# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - Response Message Fields

### Added

- **Optional Message Fields**: Consistent response messaging across all DTO variants
- `message?: string` field added to `BaseResponseDto` for standardized API feedback
- `includeMessage` configuration option in `DTOConfig` for enabling message fields globally
- `messageField` configuration object for customizing field name, default value, and max length
- Message field support in `ConfigurableBaseResponseDto` with helper methods
- `shouldIncludeMessage()` and `getMessageFieldConfig()` utility methods
- `WithMessage(Base, config?)` mixin for adding message fields to any DTO
- Message field integration in `SwaggerBaseResponseDto` with automatic API documentation
- `MinimalBaseMessageDto` class for minimal DTOs with only message field
- Enhanced `MixinCombinations` with message field variants:
  - `WithFullAuditTrailAndMessage()` - Full audit trail + message
  - `WithSoftDeleteTimestampsAndMessage()` - Soft delete + timestamps + message
  - `WithStandardEntityAndMessage()` - ID + timestamps + message
  - `WithCompleteEntityAndMessage()` - All entity fields + message
  - `WithResponseEntity()` - Standard response entity (ID + timestamps + message)
  - `WithMinimalResponse()` - Minimal response (ID + message)
- Configuration validation for message field settings in `configureDTOs()`

### Enhanced

- **Backward Compatibility**: All changes are optional and non-breaking
- **Configuration System**: Extended existing DTO configuration to support message fields
- **Swagger Integration**: Automatic ApiProperty decorators for message fields when enabled
- **Type Safety**: Full TypeScript support with proper type definitions
- **Validation**: Built-in validation for message field configuration options

### Technical Features

- **Optional by Default**: Message fields disabled by default (`includeMessage: false`)
- **Configurable**: Custom field names, default values, and length limits supported
- **Flexible**: Works with all DTO variants (Base, Configurable, Swagger, Minimal, Mixins)
- **Performance**: Minimal overhead when not used, optional field omitted in JSON
- **Developer Experience**: Consistent API response messaging across applications

## [1.0.0] - Modular DTO Composition (Mixins)

### Added

- **Modular DTO Composition**: Advanced mixin system for building DTOs with composable features
- `WithTimestamps(Base, config?)` mixin for adding createdAt and updatedAt fields
- `WithSoftDelete(Base, config?)` mixin for adding deletedAt and isActive fields for soft deletion
- `WithAuditFields(Base, config?)` mixin for adding createdBy and updatedBy fields for audit trails
- `WithVersioning(Base, config?)` mixin for adding version field for optimistic locking
- `WithId(Base, config?)` mixin for adding id field for entity identification
- `composeMixins(Base, ...mixins)` utility function for composing multiple mixins
- `MixinConfig` interface for configuring mixin behavior (Swagger/Validation)
- `MixinCombinations.WithFullAuditTrail()` convenience combination for timestamps + audit fields + versioning
- `MixinCombinations.WithSoftDeleteAndTimestamps()` convenience combination for soft delete + timestamps
- `MixinCombinations.WithStandardEntity()` convenience combination for ID + timestamps
- `MixinCombinations.WithCompleteEntity()` convenience combination for all available fields
- `DisableSwagger()` and `DisableValidation()` wrapper functions for decorator control
- `hasSwaggerDisabled()` and `hasValidationDisabled()` type guard functions
- `MixinType<T>` and `ComposedMixin<T>` utility types for type-safe composition
- `Constructor<T>` generic constructor type for mixin composition
- Optional class-validator integration with graceful fallback when not installed
- Per-mixin configuration for enabling/disabling Swagger and validation decorators
- `class-validator` added as peer dependency for validation support

## [0.9.0] - DTO Configuration & Swagger Integration

### Added

- **Configurable Base DTOs**: Flexible DTO classes with runtime configuration
- `ConfigurableBaseCreateDto`, `ConfigurableBaseUpdateDto`, `ConfigurableBaseResponseDto` classes
- `configureDTOs()` function for global DTO configuration
- `DTOConfig` interface for controlling DTO behavior (timestamps, ID inclusion, field names)
- **Minimal DTOs**: Completely empty base classes for maximum control
- `MinimalBaseCreateDto`, `MinimalBaseUpdateDto`, `MinimalBaseResponseDto` classes
- `MinimalBaseIdDto` class containing only ID field
- `MinimalBaseTimestampDto` class containing only timestamp fields
- `MinimalBaseEntityDto` class containing ID and timestamp fields
- **Optional Swagger Integration**: Automatic API documentation when enabled
- `SwaggerBaseCreateDto`, `SwaggerBaseUpdateDto`, `SwaggerBaseResponseDto` classes
- `SwaggerDTOConfig` interface for Swagger-specific configuration
- `configureSwaggerDTOs()` function for global Swagger DTO configuration
- `applySwaggerDecoratorsToClass()` utility function for manual decorator application
- `isSwaggerIntegrationEnabled()` utility function for checking Swagger status
- **Enhanced PrismaModule**: Module-level DTO configuration support
- `PrismaModuleDTOOptions` interface for module-level DTO configuration
- `dtoOptions` parameter in `PrismaModule.forRoot()` and `PrismaModule.forFeature()` methods
- `PrismaModule.configureDTOs()` static method for manual configuration
- Support for custom timestamp field names (e.g., created_at vs createdAt)
- Optional ID and timestamp field inclusion controls per DTO class
- Automatic `@ApiProperty` decorator application when Swagger is enabled
- Global and per-class configuration system with inheritance
- Configuration state checking utilities for runtime validation
- Development mode logging for DTO configuration debugging
- Graceful fallback when `@nestjs/swagger` is not installed

## [0.8.0]

### Added

- **Relation Loading Configuration**: Comprehensive system for managing and validating relation includes
- `RelationConfig` interface for configuring relation loading behavior
- `RelationValidator` utility class for validating and processing relation includes
- `RelationValidationResult` interface for detailed validation feedback
- Protected `relationConfig` property in BaseService for customizable relation configuration
- Enhanced `AdvancedSearchOptions` with `requestedIncludes` field for relation specification
- Extended `SearchQuery` interface with `include` parameter for REST API relation loading
- Automatic relation validation with depth limiting for performance protection
- Support for default relations, available relations whitelist, and custom relation configurations
- Intelligent relation merging for combining default and requested includes

### Enhanced

- **BaseController**: Added support for relation includes via query parameters
- Enhanced `findAll()` endpoint to accept `include` query parameter for relation loading
- Enhanced `findOne()` endpoint to support relation includes for single record retrieval
- Updated `parseSearchOptions()` to handle comma-separated relation includes
- Automatic fallback between advanced and basic search based on requested features
- Improved query parameter parsing with relation support
- Enhanced API documentation with relation loading examples

### Security & Performance

- **Depth Protection**: Configurable maximum relation depth to prevent performance issues
- **Whitelist Validation**: Optional `availableIncludes` configuration for security
- **Invalid Include Handling**: Graceful handling of invalid relation requests with warnings
- **Nested Relation Support**: Intelligent handling of nested relation configurations

### API Enhancements

- **REST API**: Seamless relation loading via `?include=posts,profile,comments` query parameters
- **Type Safety**: Full TypeScript support for relation validation and configuration
- **Backward Compatibility**: All existing functionality remains unchanged
- **Flexible Configuration**: Per-service relation configuration override capability

### Technical Features

- **Non-breaking changes**: All existing methods and interfaces remain unchanged
- **Performance optimized**: Efficient relation processing with validation caching
- **Configurable**: Flexible depth limits, whitelists, and custom configurations
- **Developer-friendly**: Clear validation messages and automatic include parsing

### Documentation

- Added comprehensive JSDoc documentation for all relation-related interfaces and classes
- Included examples for relation configuration and query parameter usage
- Updated exports to include all new relation loading functionality

## [0.7.0]

### Added

- **Advanced Search Capabilities**: Comprehensive advanced query system for complex filtering
- `AdvancedSearchOptions` interface extending basic search with advanced operators
- `AdvancedQueryBuilder` utility class for building complex Prisma queries
- `AdvancedFilter` interface with 12 operator types (`equals`, `not`, `contains`, `startsWith`, `endsWith`, `gt`, `gte`, `lt`, `lte`, `in`, `notIn`, `isNull`, `isNotNull`)
- `findAllAdvanced()` method in BaseService for advanced search capabilities
- `findAllAdvancedSimple()` method for backward compatibility
- Support for raw Prisma where conditions in advanced search
- Logical operator support (`AND` | `OR`) for combining conditions
- Include/select field support for relation loading and field selection
- Advanced filter validation with configurable field restrictions
- Type-safe query building with comprehensive validation

### Enhanced

- Extended `SearchConfig` interface with advanced filtering configuration
- Added `allowedAdvancedFields` and `maxAdvancedFilters` configuration options
- Enhanced query builder with operator-based filtering and validation
- Improved error handling for invalid operator-value combinations

### Technical Features

- **Non-breaking changes**: All existing methods remain unchanged
- **Performance optimized**: Parallel queries for data and count operations
- **Type-safe**: Full TypeScript support with strict type checking
- **Configurable**: Flexible configuration for security and performance
- **Validated**: Comprehensive input validation and error handling

### Documentation

- Added comprehensive JSDoc documentation for all new interfaces and methods
- Included examples for advanced filter operators and configurations
- Updated exports to include all new advanced search functionality

## [0.6.1]

### Fixed

- **Type Conversion**: Fixed critical bug where BaseService was not converting string route parameters to integers
  - Added `convertId()` method to handle automatic type conversion for ID parameters
  - Fixed 500 errors in `findOne()`, `update()`, and `remove()` methods when using integer IDs
  - Supports both integer and string-based IDs (UUID) automatically
- **Factory Modules**: Fixed critical bug where `createModelModule()` factory was not properly registering controllers
  - Controllers are now properly registered in the module's `controllers` array
  - Fixed 404 errors for factory-generated modules (Posts, Categories, etc.)
  - Added proper dependency injection using `@Inject()` decorator
  - Added `@Controller()` decorator to dynamically created controllers

### Technical Details

- Enhanced BaseService with intelligent ID type detection and conversion
- Improved module factory architecture for better NestJS integration
- Resolved controller registration issues that prevented factory modules from working

## [0.6.0]

### Added

- **Search and Filtering**: Comprehensive search functionality with configurable options
- `BasicSearchOptions` interface for search parameters
- `SearchConfig` interface for service-level search configuration
- Text search across configurable fields with multiple search modes
- Simple key-value filtering support
- Sorting/ordering capabilities with multiple fields
- Query parameter parsing in BaseController for search, filters, and sorting
- Search field validation and limits for security

### Changed

- **BREAKING**: `findAll()` method signature now accepts optional `BasicSearchOptions` parameter
- **BREAKING**: `findAllSimple()` method signature now accepts optional `BasicSearchOptions` parameter
- Enhanced BaseController to parse and handle search query parameters
- Updated examples with comprehensive search and filtering scenarios

### Security

- Configurable maximum search fields limit prevents abuse
- Search functionality disabled by default (requires configuration)
- Validation of search fields against allowed configuration

### Documentation

- Added comprehensive search and filtering documentation to README
- Updated examples with various search configuration patterns
- Documented query parameter usage and programmatic search methods

## [0.5.1]

### Added

- **Limit Protection**: Configurable pagination limits to prevent performance issues
- `PaginationConfig` interface for customizing pagination behavior
- Automatic validation of page and limit parameters
- Support for unlimited results (when explicitly enabled)
- `validateLimit()` and `validatePage()` methods in BaseService
- Enhanced error messages with `BadRequestException` for invalid pagination parameters

### Changed

- `findAll()` and `findAllSimple()` methods now validate pagination parameters
- Default limit handling: uses configured `defaultLimit` when no limit is provided
- Pagination methods now handle unlimited requests (limit = -1 or 0) when `allowUnlimited: true`

### Security

- Maximum limit protection prevents excessively large result sets
- Disabled unlimited results by default to prevent performance issues

### Documentation

- Added comprehensive limit protection documentation to README
- Updated examples with pagination configuration patterns
- Added validation examples and error scenarios

## [0.5.0]

### Added

- **Enhanced Pagination**: Complete rewrite of pagination system
- `PaginationResult<T>` interface with data and metadata
- `PaginationMeta` interface with comprehensive pagination information
- Parallel queries for better performance (data + count)
- `findAllSimple()` method for backward compatibility

### Changed

- **BREAKING**: `findAll()` now returns `PaginationResult<T>` instead of `T[]`
- Enhanced pagination metadata: total, page, limit, totalPages, hasNext, hasPrev
- Improved BaseController typing and documentation

### Deprecated

- `findAllSimple()` method is now the backward compatibility option

### Documentation

- Updated README with comprehensive pagination examples
- Added migration guide for v0.5.0
- Enhanced examples with new pagination response format

## [0.4.4]

### Fixed

- Fixed property forwarding issue where Prisma models were not accessible through PrismaService
- Implemented JavaScript Proxy to properly forward all properties and method calls to underlying PrismaClient
- Added TypeScript index signature for better compatibility with BaseService

## [0.4.2]

### Changed

- **BREAKING**: Removed default PrismaClient creation fallback completely
- PrismaClient instance is now always required when using PrismaModule.forRoot()
- Updated PrismaModuleOptions interface to make prismaClient required
- Added validation to ensure PrismaClient is provided in both forRoot() and forFeature() methods

### Fixed

- Completely eliminated dependency on default @prisma/client import
- Updated examples in codebase to reflect required PrismaClient provision

## [0.4.1]

### Fixed

- Fixed dependency injection issues for PrismaService constructor
- Added @Optional() decorator to customClient parameter
- Improved factory method to handle cases with and without custom clients
- Resolved "UnknownDependenciesException" errors when using multiple clients

## [0.4.0]

### Added

- **MAJOR**: Support for multiple Prisma clients in the same application
- New PrismaModuleOptions interface with enhanced configuration options
- New forFeature() method for simplified multi-database setup
- Support for custom provider tokens to avoid conflicts between multiple clients
- Enhanced PrismaService to work with custom client instances

### Changed

- **BREAKING**: PrismaModule.forRoot() now accepts configuration options
- Enhanced PrismaService constructor to accept custom PrismaClient instances
- Updated documentation with comprehensive multi-database examples
- Added examples for both forRoot() and forFeature() approaches

### Fixed

- Improved lifecycle management for custom PrismaClient instances
- Better error handling for missing client configurations

## [0.3.1]

### Fixed

- Improved Swagger integration to properly hide disabled endpoints
  - Fixed issue where disabled endpoints were still showing in Swagger UI
  - Implemented a more robust approach for applying ApiExcludeEndpoint at runtime

## [0.3.0]

### Changed

- **BREAKING**: Updated NestJS dependencies to v11.0.16
  - Updated `@nestjs/common` to ^11.0.0
  - Updated `@nestjs/core` to ^11.0.0
  - Updated `@nestjs/swagger` to ^11.0.0
- Updated peer dependencies to reflect NestJS v11 compatibility
- Requires Node.js 20+ (NestJS v11 requirement)

## [0.2.2]

### Added

- Swagger integration with `ApiExcludeDisabledEndpoint` decorator
  - Automatically hides disabled endpoints from Swagger UI documentation
  - Applied to all standard endpoints in `BaseController`
  - Available for use with custom endpoints
- Added documentation for Swagger integration in README

### Changed

- Updated dependencies to include `@nestjs/swagger` as a peer dependency

## [0.2.0]

### Added

- Configurable endpoint activation system
  - New `@EnableEndpoint()` and `@DisableEndpoint()` decorators
  - New `EndpointType` enum for standard endpoint types
  - New `@EnableAllEndpoints()` decorator for enabling all endpoints at once
- Selective endpoint configuration in `createModelModule()`
  - Added `enabledEndpoints` option to enable specific endpoints
  - Added `enableAllEndpoints` option to enable all endpoints at once
- Improved module factory with better type safety and configuration options
  - Full TypeScript generic support
  - Support for custom service types
  - Additional providers, imports, and exports

### Changed

- **BREAKING**: Base controller endpoints are now disabled by default
  - Endpoints must be explicitly enabled using decorators or module configuration
- **BREAKING**: Consolidated service-factory and controller-factory into module-factory
- Improved type safety throughout the codebase
- Enhanced error handling in base services

### Fixed

- Prisma service shutdown hooks compatibility
- Various TypeScript typing issues

## [0.1.4]

### Fixed

- Build issues with TypeScript compilation
- Fixed package publishing configuration

## [0.1.3]

### Fixed

- Package structure and distribution
- TypeScript definitions

## [0.1.2]

### Fixed

- TypeScript type issues in PrismaService

## [0.1.1]

### Added

- Initial release with source code

## [0.1.0]

### Added

- Initial package structure
- Base controller, service, and DTO classes
- Prisma module and service integration
