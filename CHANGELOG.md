# Changelog

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
