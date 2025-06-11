# Migration Guide

This guide helps you migrate between different versions of nestjs-prisma-base.

## Upgrading to v1.0.0

### New Features

- **DTO Mixins**: Composable DTO building system
- **Mixin Combinations**: Pre-built mixin combinations
- **Enhanced Type Safety**: Better TypeScript support

### Breaking Changes

**None** - v1.0.0 is fully backward compatible with v0.9.0.

### New Capabilities

#### 1. DTO Mixins (New in v1.0.0)

```typescript
// Before v1.0.0
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
  // Manual field management
}

// v1.0.0 - Using mixins
export class UserResponseDto extends WithTimestamps(BaseResponseDto) {
  name: string;
  email: string;
  // Automatic timestamp fields
}

// v1.0.0 - Combining multiple mixins
export class CompleteUserDto extends MixinCombinations.WithCompleteEntity(BaseResponseDto) {
  name: string;
  email: string;
  // All standard fields included automatically
}
```

#### 2. Migration Strategy

**Option 1: Keep existing DTOs (No changes required)**

```typescript
// This continues to work exactly as before
export class UserResponseDto extends BaseResponseDto {
  name: string;
  email: string;
}
```

**Option 2: Gradually adopt mixins**

```typescript
// Migrate incrementally
export class UserResponseDto extends WithTimestamps(BaseResponseDto) {
  name: string;
  email: string;
}
```

**Option 3: Use new convenience combinations**

```typescript
// Use pre-built combinations
export class UserResponseDto extends MixinCombinations.WithStandardEntity(BaseResponseDto) {
  name: string;
  email: string;
}
```

## Upgrading to v0.9.0

### New Features

- **Configurable DTOs**: Flexible DTO configuration system
- **Swagger Integration**: Automatic API documentation
- **Minimal DTOs**: Maximum control options

### Breaking Changes

**None** - v0.9.0 is fully backward compatible.

### Migration Options

#### Option 1: Continue using existing DTOs

```typescript
// No changes needed - continues to work
export class CreateUserDto extends BaseCreateDto {
  name: string;
  email: string;
}
```

#### Option 2: Upgrade to configurable DTOs

```typescript
// Global configuration
configureDTOs({
  includeTimestamps: true,
  includeId: true,
});

// Switch to configurable DTOs
export class CreateUserDto extends ConfigurableBaseCreateDto {
  name: string;
  email: string;
}
```

#### Option 3: Add Swagger integration

```typescript
// Enable Swagger
configureSwaggerDTOs({ enabled: true });

// Use Swagger DTOs
export class CreateUserDto extends SwaggerBaseCreateDto {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
}
```

## Upgrading to v0.8.0

### New Features

- **Relation Loading**: Include related data in queries
- **Module Factories**: Auto-generate modules
- **Enhanced Validation**: Better error handling

### Breaking Changes

**None** - v0.8.0 is fully backward compatible.

### New Capabilities

#### 1. Relation Loading

```typescript
// New in v0.8.0 - include relations
GET /users?include=posts,profile

// Service configuration
export class UserService extends BaseService<...> {
  protected relationConfig: RelationConfig = {
    maxDepth: 3,
    allowNested: true,
  };
}
```

#### 2. Module Factories

```typescript
// New in v0.8.0 - auto-generate modules
export const UserModule = createModelModule({
  modelName: 'user',
  enableAllEndpoints: true,
});
```

## Upgrading to v0.7.0

### New Features

- **Advanced Search**: Complex queries with operators
- **Query Builder**: Enhanced query building
- **Filter Operators**: Advanced filtering capabilities

### Breaking Changes

**None** - v0.7.0 is fully backward compatible.

### Migration

#### Existing search continues to work:

```typescript
// v0.6.0 style - still works
GET /users?search=john&status=active
```

#### New advanced search capabilities:

```typescript
// v0.7.0 - new advanced search
const options: AdvancedSearchOptions = {
  advancedFilters: {
    age: { operator: 'gte', value: 18 },
    status: { operator: 'in', value: ['active', 'pending'] },
  },
};
```

## Upgrading to v0.6.0

### New Features

- **Search & Filtering**: Multi-field search capabilities
- **Sort & Order**: Flexible sorting options
- **Search Configuration**: Configurable search behavior

### Breaking Changes

**None** - v0.6.0 is fully backward compatible.

### Migration

#### Configure search in your services:

```typescript
export class UserService extends BaseService<...> {
  protected searchConfig: SearchConfig = {
    defaultSearchFields: ['name', 'email'],
    caseSensitive: false,
    searchMode: 'contains',
  };
}
```

## Upgrading to v0.5.0

### New Features

- **Enhanced Pagination**: Rich metadata with pagination results
- **Limit Protection**: Configurable pagination limits
- **Improved Performance**: Better query optimization

### Breaking Changes

**⚠️ Response Format Change** - `findAll()` now returns `PaginationResult<T>` instead of `T[]`

### Migration

#### Before v0.5.0:

```typescript
// Returned T[]
const users = await userService.findAll(1, 10);
// users was User[]
```

#### After v0.5.0:

```typescript
// Returns PaginationResult<T>
const result = await userService.findAll(1, 10);
// result.data is User[]
// result.meta contains pagination info

// Access data
const users = result.data;
const totalCount = result.meta.total;
```

#### Backward Compatibility Option:

```typescript
// Use findAllSimple() for old behavior
const users = await userService.findAllSimple(1, 10);
// Returns User[] like before
```

#### Update Controllers:

```typescript
// Before v0.5.0
@Get()
async findAll(): Promise<User[]> {
  return this.userService.findAll(1, 10);
}

// After v0.5.0
@Get()
async findAll(): Promise<PaginationResult<User>> {
  return this.userService.findAll(1, 10);
}
```

## Version Compatibility Matrix

| Feature             | v0.5.0 | v0.6.0 | v0.7.0 | v0.8.0 | v0.9.0 | v1.0.0 |
| ------------------- | ------ | ------ | ------ | ------ | ------ | ------ |
| Basic CRUD          | ✅     | ✅     | ✅     | ✅     | ✅     | ✅     |
| Enhanced Pagination | ✅     | ✅     | ✅     | ✅     | ✅     | ✅     |
| Search & Filtering  | ❌     | ✅     | ✅     | ✅     | ✅     | ✅     |
| Advanced Search     | ❌     | ❌     | ✅     | ✅     | ✅     | ✅     |
| Relation Loading    | ❌     | ❌     | ❌     | ✅     | ✅     | ✅     |
| Configurable DTOs   | ❌     | ❌     | ❌     | ❌     | ✅     | ✅     |
| Swagger Integration | ❌     | ❌     | ❌     | ❌     | ✅     | ✅     |
| DTO Mixins          | ❌     | ❌     | ❌     | ❌     | ❌     | ✅     |

## General Migration Tips

### 1. Progressive Migration

- You don't need to migrate everything at once
- New features are additive, not replacing
- Start with new projects, migrate existing ones gradually

### 2. Testing Strategy

```typescript
// Keep existing tests working
describe('User Service', () => {
  it('should maintain backward compatibility', async () => {
    // Test existing functionality still works
    const users = await userService.findAllSimple(1, 10);
    expect(Array.isArray(users)).toBe(true);
  });

  it('should support new features', async () => {
    // Test new functionality
    const result = await userService.findAll(1, 10);
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
  });
});
```

### 3. Configuration Strategy

```typescript
// Start with minimal configuration
@Module({
  imports: [
    PrismaModule.forRoot({
      prismaClient: new PrismaClient(),
      // Add configuration options gradually
    }),
  ],
})
export class AppModule {}
```

### 4. Documentation Updates

- Update your API documentation when adopting new response formats
- Document new query parameters for search and filtering
- Update examples to show new capabilities

## Need Help?

- Check the [Complete Feature Guide](./features.md) for detailed examples
- Review the [API Reference](./api/) for specific method signatures
- Look at the [Examples Repository](https://github.com/your-org/nestjs-prisma-base-examples) for working code samples
