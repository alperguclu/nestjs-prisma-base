import { ApiProperty } from '@nestjs/swagger';

// Optional class-validator imports - will work if class-validator is available
let IsOptional: any, IsDateString: any, IsNumber: any, IsBoolean: any, IsString: any, MaxLength: any;

try {
  const classValidator = require('class-validator');
  IsOptional = classValidator.IsOptional;
  IsDateString = classValidator.IsDateString;
  IsNumber = classValidator.IsNumber;
  IsBoolean = classValidator.IsBoolean;
  IsString = classValidator.IsString;
  MaxLength = classValidator.MaxLength;
} catch (error) {
  // class-validator not available - decorators will be no-ops
  IsOptional =
    IsDateString =
    IsNumber =
    IsBoolean =
    IsString =
      () => () => {};
  MaxLength = () => () => {};
}

/**
 * Constructor type for mixin base classes
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

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
      type: () => Date,
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
      type: () => Date,
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
      type: () => Date,
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
      type: () => Boolean,
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
      type: () => Number,
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
      type: () => Number,
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
      type: () => Number,
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
      type: () => Number,
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
 * Mixin that adds message field for response context
 *
 * @example
 * ```typescript
 * class UserResponseDto extends WithMessage(BaseDto) {
 *   name: string;
 * }
 * ```
 */
export function WithMessage<T extends Constructor>(
  Base: T,
  config?: MixinConfig & {
    fieldName?: string;
    defaultMessage?: string;
    maxLength?: number;
  }
) {
  const mixinConfig = mergeMixinConfig(config);
  const fieldName = config?.fieldName || 'message';

  class MessageMixin extends Base {
    message?: string;
  }

  // Apply Swagger decorators
  if (mixinConfig.swagger?.enabled !== false) {
    ApiProperty({
      description: 'Response message providing additional context',
      example: config?.defaultMessage || 'Operation completed successfully',
      type: () => String,
      required: false,
      maxLength: config?.maxLength || 500,
    })(MessageMixin.prototype, fieldName);
  }

  // Apply validation decorators
  if (mixinConfig.validation?.enabled !== false) {
    IsOptional()(MessageMixin.prototype, fieldName);
    IsString()(MessageMixin.prototype, fieldName);
    if (config?.maxLength) {
      MaxLength(config.maxLength)(MessageMixin.prototype, fieldName);
    }
  }

  // If a custom field name is provided, define it dynamically
  if (fieldName !== 'message') {
    Object.defineProperty(MessageMixin.prototype, fieldName, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  return MessageMixin;
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
   * Full audit trail with message: timestamps + audit fields + versioning + message
   */
  static WithFullAuditTrailAndMessage<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithTimestamps(base, config),
      (base) => WithAuditFields(base, config),
      (base) => WithVersioning(base, config),
      (base) => WithMessage(base, config)
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
   * Soft delete with timestamps and message
   */
  static WithSoftDeleteTimestampsAndMessage<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithTimestamps(base, config),
      (base) => WithSoftDelete(base, config),
      (base) => WithMessage(base, config)
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
   * Standard entity with message: ID + timestamps + message
   */
  static WithStandardEntityAndMessage<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithTimestamps(base, config),
      (base) => WithMessage(base, config)
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

  /**
   * Complete entity with message: ID + timestamps + audit fields + soft delete + versioning + message
   */
  static WithCompleteEntityAndMessage<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithTimestamps(base, config),
      (base) => WithAuditFields(base, config),
      (base) => WithSoftDelete(base, config),
      (base) => WithVersioning(base, config),
      (base) => WithMessage(base, config)
    );
  }

  /**
   * Response entity: ID + timestamps + message (common for API responses)
   */
  static WithResponseEntity<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithTimestamps(base, config),
      (base) => WithMessage(base, config)
    );
  }

  /**
   * Minimal response: ID + message (lightweight API responses)
   */
  static WithMinimalResponse<T extends Constructor>(Base: T, config?: MixinConfig) {
    return composeMixins(
      Base,
      (base) => WithId(base, config),
      (base) => WithMessage(base, config)
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
