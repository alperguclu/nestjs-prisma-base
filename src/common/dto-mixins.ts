import { ApiProperty } from '@nestjs/swagger';

// Optional class-validator imports - will work if class-validator is available
let IsOptional: any, IsDateString: any, IsNumber: any, IsBoolean: any;

try {
  const classValidator = require('class-validator');
  IsOptional = classValidator.IsOptional;
  IsDateString = classValidator.IsDateString;
  IsNumber = classValidator.IsNumber;
  IsBoolean = classValidator.IsBoolean;
} catch (error) {
  // class-validator not available - decorators will be no-ops
  IsOptional =
    IsDateString =
    IsNumber =
    IsBoolean =
      () => () => {};
}

// Constructor type for mixin composition
type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin configuration options
 */
export interface MixinConfig {
  swagger?: {
    enabled?: boolean;
    includeExamples?: boolean;
    includeDescriptions?: boolean;
  };
  validation?: {
    enabled?: boolean;
    optional?: boolean;
  };
}

/**
 * Default mixin configuration
 */
const defaultMixinConfig: MixinConfig = {
  swagger: {
    enabled: true,
    includeExamples: true,
    includeDescriptions: true,
  },
  validation: {
    enabled: true,
    optional: true,
  },
};

/**
 * Merge mixin configurations
 */
function mergeMixinConfig(userConfig?: MixinConfig): MixinConfig {
  return {
    swagger: {
      ...defaultMixinConfig.swagger,
      ...userConfig?.swagger,
    },
    validation: {
      ...defaultMixinConfig.validation,
      ...userConfig?.validation,
    },
  };
}

/**
 * Apply decorators conditionally based on configuration
 */
function applyDecorators(target: any, propertyKey: string, mixinConfig: MixinConfig, apiPropertyOptions: any) {
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty(apiPropertyOptions)(target, propertyKey);
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(target, propertyKey);
  }
}

/**
 * Mixin that adds timestamp fields (createdAt, updatedAt)
 *
 * @example
 * ```typescript
 * class UserDto extends WithTimestamps(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithTimestamps<T extends Constructor>(Base: T, config?: MixinConfig) {
  const mixinConfig = mergeMixinConfig(config);

  class TimestampsMixin extends Base {
    createdAt?: Date;
    updatedAt?: Date;
  }

  // Apply decorators to createdAt
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Creation timestamp',
      example: '2023-01-01T00:00:00.000Z',
      required: false,
    })(TimestampsMixin.prototype, 'createdAt');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(TimestampsMixin.prototype, 'createdAt');
    IsDateString()(TimestampsMixin.prototype, 'createdAt');
  }

  // Apply decorators to updatedAt
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Last update timestamp',
      example: '2023-01-01T12:00:00.000Z',
      required: false,
    })(TimestampsMixin.prototype, 'updatedAt');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(TimestampsMixin.prototype, 'updatedAt');
    IsDateString()(TimestampsMixin.prototype, 'updatedAt');
  }

  return TimestampsMixin;
}

/**
 * Mixin that adds soft delete fields (deletedAt, isActive)
 *
 * @example
 * ```typescript
 * class UserDto extends WithSoftDelete(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithSoftDelete<T extends Constructor>(Base: T, config?: MixinConfig) {
  const mixinConfig = mergeMixinConfig(config);

  class SoftDeleteMixin extends Base {
    deletedAt?: Date;
    isActive?: boolean;
  }

  // Apply decorators to deletedAt
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Soft deletion timestamp',
      example: '2023-01-01T18:00:00.000Z',
      required: false,
    })(SoftDeleteMixin.prototype, 'deletedAt');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(SoftDeleteMixin.prototype, 'deletedAt');
    IsDateString()(SoftDeleteMixin.prototype, 'deletedAt');
  }

  // Apply decorators to isActive
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Whether the record is active (not soft deleted)',
      example: true,
      default: true,
      required: false,
    })(SoftDeleteMixin.prototype, 'isActive');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(SoftDeleteMixin.prototype, 'isActive');
    IsBoolean()(SoftDeleteMixin.prototype, 'isActive');
  }

  return SoftDeleteMixin;
}

/**
 * Mixin that adds audit fields (createdBy, updatedBy)
 *
 * @example
 * ```typescript
 * class UserDto extends WithAuditFields(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithAuditFields<T extends Constructor>(Base: T, config?: MixinConfig) {
  const mixinConfig = mergeMixinConfig(config);

  class AuditFieldsMixin extends Base {
    createdBy?: number;
    updatedBy?: number;
  }

  // Apply decorators to createdBy
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'ID of user who created this record',
      example: 1,
      required: false,
    })(AuditFieldsMixin.prototype, 'createdBy');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(AuditFieldsMixin.prototype, 'createdBy');
    IsNumber()(AuditFieldsMixin.prototype, 'createdBy');
  }

  // Apply decorators to updatedBy
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'ID of user who last updated this record',
      example: 2,
      required: false,
    })(AuditFieldsMixin.prototype, 'updatedBy');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(AuditFieldsMixin.prototype, 'updatedBy');
    IsNumber()(AuditFieldsMixin.prototype, 'updatedBy');
  }

  return AuditFieldsMixin;
}

/**
 * Mixin that adds versioning field (version)
 *
 * @example
 * ```typescript
 * class UserDto extends WithVersioning(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithVersioning<T extends Constructor>(Base: T, config?: MixinConfig) {
  const mixinConfig = mergeMixinConfig(config);

  class VersioningMixin extends Base {
    version?: number;
  }

  // Apply decorators to version
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Version number for optimistic locking',
      example: 1,
      default: 1,
      required: false,
    })(VersioningMixin.prototype, 'version');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(VersioningMixin.prototype, 'version');
    IsNumber()(VersioningMixin.prototype, 'version');
  }

  return VersioningMixin;
}

/**
 * Mixin that adds ID field for DTOs that need it
 *
 * @example
 * ```typescript
 * class UserResponseDto extends WithId(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithId<T extends Constructor>(Base: T, config?: MixinConfig) {
  const mixinConfig = mergeMixinConfig(config);

  class IdMixin extends Base {
    id?: number;
  }

  // Apply decorators to id
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Unique identifier',
      example: 1,
      required: false,
    })(IdMixin.prototype, 'id');
  }

  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(IdMixin.prototype, 'id');
    IsNumber()(IdMixin.prototype, 'id');
  }

  return IdMixin;
}

/**
 * Utility type to extract the type from a mixin constructor
 */
export type MixinType<T> = T extends Constructor<infer U> ? U : never;

/**
 * Utility type for composing multiple mixins
 */
export type ComposedMixin<T extends readonly Constructor[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends Constructor<infer U>
    ? Rest extends readonly Constructor[]
      ? Constructor<U> & ComposedMixin<Rest>
      : Constructor<U>
    : never
  : Constructor<{}>;

/**
 * Utility function to compose multiple mixins
 *
 * @example
 * ```typescript
 * class UserDto extends composeMixins(
 *   BaseDto,
 *   WithTimestamps,
 *   WithAuditFields,
 *   WithSoftDelete
 * ) {
 *   name: string;
 *   email: string;
 * }
 * ```
 */
export function composeMixins<T extends Constructor>(Base: T, ...mixins: Array<(base: Constructor) => Constructor>): T {
  return mixins.reduce((acc, mixin) => mixin(acc), Base as any);
}

/**
 * Common mixin combinations for convenience
 */
export class MixinCombinations {
  /**
   * Full audit trail: timestamps + audit fields + versioning
   */
  static WithFullAuditTrail<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithTimestamps(base, config),
      (base) => WithAuditFields(base, config),
      (base) => WithVersioning(base, config)
    );
  }

  /**
   * Soft delete with timestamps
   */
  static WithSoftDeleteAndTimestamps<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithTimestamps(base, config),
      (base) => WithSoftDelete(base, config)
    );
  }

  /**
   * Standard entity: ID + timestamps
   */
  static WithStandardEntity<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithTimestamps(base, config)
    );
  }

  /**
   * Complete entity: ID + timestamps + audit fields + soft delete + versioning
   */
  static WithCompleteEntity<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithTimestamps(base, config),
      (base) => WithAuditFields(base, config),
      (base) => WithSoftDelete(base, config),
      (base) => WithVersioning(base, config)
    );
  }
}

/**
 * Decorator to disable Swagger for specific mixin combinations
 */
export function DisableSwagger<T extends Constructor>(Base: T): T {
  return class extends Base {
    static __disableSwagger = true;
  } as any;
}

/**
 * Decorator to disable validation for specific mixin combinations
 */
export function DisableValidation<T extends Constructor>(Base: T): T {
  return class extends Base {
    static __disableValidation = true;
  } as any;
}

/**
 * Type guard to check if a class has Swagger disabled
 */
export function hasSwaggerDisabled(target: any): boolean {
  return target.__disableSwagger === true;
}

/**
 * Type guard to check if a class has validation disabled
 */
export function hasValidationDisabled(target: any): boolean {
  return target.__disableValidation === true;
}
