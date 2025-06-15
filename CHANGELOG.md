# Changelog

All notable changes to this project will be documented in this file.

## [1.1.4] - Export Fix

### Fixed

- **Missing Export**: Added `EnableSwaggerBaseFields` decorator to main package exports
- **Import Error**: Resolved "Module has no exported member 'EnableSwaggerBaseFields'" error

### Technical Details

- Added `EnableSwaggerBaseFields` to the Swagger DTOs export list in `src/index.ts`
- No functional changes - purely fixes the import/export issue from v1.1.3

## [1.1.3] - SwaggerBaseResponseDto Automatic Inheritance Fix

### Fixed

- **SwaggerBaseResponseDto Inheritance**: Fixed automatic Swagger decorator inheritance for child classes
- **Message Field Documentation**: Resolved issue where message field and other base fields weren't appearing in child class Swagger documentation
- **Decorator Propagation**: Fixed the fundamental issue where parent class decorators weren't being applied to child classes in Swagger schema generation

### Added

- **@EnableSwaggerBaseFields Decorator**: New class decorator that ensures automatic inheritance of Swagger decorators for base fields
- **Simplified Configuration**: Cleaner approach to applying Swagger decorators to classes extending `SwaggerBaseResponseDto`
- **Better Documentation**: Enhanced JSDoc with examples showing proper usage

### Changed

- **Usage Pattern**: Classes extending `SwaggerBaseResponseDto` now need to use the `@EnableSwaggerBaseFields` decorator for automatic field documentation
- **Architecture**: Simplified the decorator application system for better reliability and performance

### Usage

```typescript
// Before v1.1.3 (was supposed to work automatically but didn't)
export class LoginResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty() user: AuthUser;
  // Base fields missing from Swagger docs ❌
}

// After v1.1.3 (explicit decorator ensures it works)
@EnableSwaggerBaseFields
export class LoginResponseDto extends SwaggerBaseResponseDto {
  @ApiProperty() user: AuthUser;
  // Base fields automatically documented ✅
}
```

### Technical Details

- Removed complex inheritance tracking system that wasn't working reliably
- Implemented simple decorator-based approach for explicit field inheritance
- Maintains all existing configuration options (`includeMessage`, `includeTimestamps`, etc.)
- No breaking changes to configuration - only adds the decorator requirement

## [1.1.2] - SwaggerBaseResponseDto Message Field Fix

### Fixed

- **SwaggerBaseResponseDto Message Field**: Fixed missing `message` field in Swagger documentation despite proper configuration
- **Configuration Timing Issue**: Resolved timing issue where Swagger decorators were applied before configuration was set
- **Configuration Disconnection**: Fixed disconnection between `configureDTOs({ includeMessage: true })` and `configureSwaggerDTOs({ enabled: true })`
- **Automatic Decorator Application**: Message field now appears automatically in Swagger docs when `includeMessage: true` is configured

### Technical Details

- **Deferred Decorator Application**: Decorators are now applied when configuration is set, not at module load time
- **Configuration Integration**: Swagger decorators now respect the `includeMessage` setting from DTO configuration
- **Cross-Configuration Communication**: Added callback system to sync DTO config changes with Swagger decorator updates
- **Conditional Field Inclusion**: Message field decorator is only applied when `dtoConfig.includeMessage === true`

### Affected Components

- `SwaggerBaseResponseDto` now properly shows message field in Swagger documentation
- All response DTOs extending `SwaggerBaseResponseDto` automatically include message field when configured
- No breaking changes - purely fixes automatic behavior as documented

### Configuration Requirements

For automatic message field documentation, ensure both configurations are set:

```typescript
// Enable message fields in DTOs
configureDTOs({ includeMessage: true });

// Enable Swagger integration
configureSwaggerDTOs({ enabled: true });
```

## [1.1.1] - Swagger Circular Dependency Fix

### Fixed

- **Swagger Circular Dependency Error**: Resolved circular dependency issues when using audit field mixins with Swagger integration
- **Mixin Swagger Decorators**: Fixed `@ApiProperty` decorators in all mixins to use lazy resolvers (`type: () => Type`)
- **Complex Mixin Combinations**: Fixed Swagger schema generation for complex mixin combinations like `WithFullAuditTrail` and `WithCompleteEntity`
- **Type Resolution**: Added explicit type specification to prevent Swagger reflection system from getting confused by mixin inheritance chains

### Technical Details

- Updated all mixin `@ApiProperty` decorators to use arrow function type resolvers
- Fixed `WithTimestamps`, `WithSoftDelete`, `WithAuditFields`, `WithVersioning`, `WithId`, and `WithMessage` mixins
- Updated `SwaggerBaseResponseDto` decorators to use lazy resolvers
- Ensures compatibility with @nestjs/swagger v7.0.0+ and complex mixin compositions

### Affected Components

- All mixin combinations now work correctly with Swagger documentation
- `MixinCombinations.WithFullAuditTrail` and related combinations
- Custom mixin compositions using audit fields
- No breaking changes - purely internal decorator improvements

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

- Extended `
