import { SwaggerDTOConfig } from './dto-config.interface';

/**
 * Check if @nestjs/swagger is available
 */
let isSwaggerAvailable = false;
let ApiProperty: any = null;

try {
  const swaggerModule = require('@nestjs/swagger');
  ApiProperty = swaggerModule.ApiProperty;
  isSwaggerAvailable = true;
} catch (error) {
  // Swagger is not available, decorators will be no-ops
  isSwaggerAvailable = false;
}

/**
 * Global Swagger DTO configuration
 */
let globalSwaggerConfig: SwaggerDTOConfig = {
  enabled: false,
  includeTimestamps: true,
  includeExamples: true,
  includeDescriptions: true,
  fieldConfig: {
    id: {
      description: 'Unique identifier for the record',
      example: 1,
    },
    createdAt: {
      description: 'Timestamp when the record was created',
      example: '2023-01-01T00:00:00.000Z',
    },
    updatedAt: {
      description: 'Timestamp when the record was last updated',
      example: '2023-01-01T12:00:00.000Z',
    },
  },
};

/**
 * Configure Swagger DTOs globally
 */
export function configureSwaggerDTOs(config: Partial<SwaggerDTOConfig>): void {
  globalSwaggerConfig = { ...globalSwaggerConfig, ...config };
}

/**
 * Get current Swagger DTO configuration
 */
export function getSwaggerDTOConfig(): SwaggerDTOConfig {
  return { ...globalSwaggerConfig };
}

/**
 * Create a conditional ApiProperty decorator
 */
function createConditionalApiProperty(options: any = {}) {
  if (!isSwaggerAvailable || !globalSwaggerConfig.enabled) {
    // Return a no-op decorator if Swagger is not available or not enabled
    return function (target: any, propertyKey: string) {
      // No operation
    };
  }

  return ApiProperty(options);
}

/**
 * Get field configuration for Swagger
 */
function getFieldConfig(fieldName: 'id' | 'createdAt' | 'updatedAt' | 'message') {
  const config = globalSwaggerConfig.fieldConfig?.[fieldName];
  const includeDescriptions = globalSwaggerConfig.includeDescriptions ?? true;
  const includeExamples = globalSwaggerConfig.includeExamples ?? true;

  return {
    description: includeDescriptions ? config?.description : undefined,
    example: includeExamples ? config?.example : undefined,
  };
}

/**
 * Swagger-Enhanced Base Create DTO
 * Automatically applies ApiProperty decorators when Swagger is enabled
 */
export class SwaggerBaseCreateDto {
  /**
   * Per-class Swagger configuration
   */
  protected static swaggerConfig: Partial<SwaggerDTOConfig> = {};

  /**
   * Configure Swagger for this specific DTO class
   */
  static configureSwagger(config: Partial<SwaggerDTOConfig>): void {
    this.swaggerConfig = { ...this.swaggerConfig, ...config };
  }

  /**
   * Get effective Swagger configuration
   */
  static getSwaggerConfig(): SwaggerDTOConfig {
    return { ...globalSwaggerConfig, ...this.swaggerConfig };
  }

  // No additional fields by default - purely for extension
}

/**
 * Swagger-Enhanced Base Update DTO
 * Automatically applies ApiProperty decorators when Swagger is enabled
 */
export class SwaggerBaseUpdateDto {
  /**
   * Per-class Swagger configuration
   */
  protected static swaggerConfig: Partial<SwaggerDTOConfig> = {};

  /**
   * Configure Swagger for this specific DTO class
   */
  static configureSwagger(config: Partial<SwaggerDTOConfig>): void {
    this.swaggerConfig = { ...this.swaggerConfig, ...config };
  }

  /**
   * Get effective Swagger configuration
   */
  static getSwaggerConfig(): SwaggerDTOConfig {
    return { ...globalSwaggerConfig, ...this.swaggerConfig };
  }

  // No additional fields by default - purely for extension
}

/**
 * Swagger-Enhanced Base Response DTO
 * Includes common fields with automatic Swagger documentation
 */
export class SwaggerBaseResponseDto {
  /**
   * Per-class Swagger configuration
   */
  protected static swaggerConfig: Partial<SwaggerDTOConfig> = {};

  /**
   * Configure Swagger for this specific DTO class
   */
  static configureSwagger(config: Partial<SwaggerDTOConfig>): void {
    this.swaggerConfig = { ...this.swaggerConfig, ...config };
  }

  /**
   * Get effective Swagger configuration
   */
  static getSwaggerConfig(): SwaggerDTOConfig {
    return { ...globalSwaggerConfig, ...this.swaggerConfig };
  }

  /**
   * Record ID with automatic Swagger documentation
   */
  id?: number;

  /**
   * Creation timestamp with automatic Swagger documentation
   */
  createdAt?: Date;

  /**
   * Last update timestamp with automatic Swagger documentation
   */
  updatedAt?: Date;

  /**
   * Optional response message with automatic Swagger documentation
   */
  message?: string;
}

/**
 * Apply Swagger decorators to the SwaggerBaseResponseDto
 * This will be called automatically when the class is loaded
 */
function applySwaggerDecorators() {
  if (!isSwaggerAvailable) {
    return;
  }

  // Apply decorators to the prototype
  const idConfig = getFieldConfig('id');
  const createdAtConfig = getFieldConfig('createdAt');
  const updatedAtConfig = getFieldConfig('updatedAt');
  const messageConfig = getFieldConfig('message');

  // Apply ApiProperty decorators if Swagger is enabled
  if (globalSwaggerConfig.enabled) {
    createConditionalApiProperty({
      description: idConfig.description || 'Unique identifier',
      example: idConfig.example || 1,
      type: () => Number,
      required: false,
    })(SwaggerBaseResponseDto.prototype, 'id');

    if (globalSwaggerConfig.includeTimestamps) {
      createConditionalApiProperty({
        description: createdAtConfig.description || 'Creation timestamp',
        example: createdAtConfig.example || '2023-01-01T00:00:00.000Z',
        type: () => Date,
        required: false,
      })(SwaggerBaseResponseDto.prototype, 'createdAt');

      createConditionalApiProperty({
        description: updatedAtConfig.description || 'Last update timestamp',
        example: updatedAtConfig.example || '2023-01-01T12:00:00.000Z',
        type: () => Date,
        required: false,
      })(SwaggerBaseResponseDto.prototype, 'updatedAt');
    }

    // Apply message field decorator
    createConditionalApiProperty({
      description: messageConfig.description || 'Response message providing additional context about the operation',
      example: messageConfig.example || 'Operation completed successfully',
      type: () => String,
      required: false,
    })(SwaggerBaseResponseDto.prototype, 'message');
  }
}

/**
 * Helper function to manually apply Swagger decorators to a class
 * Useful for dynamic decorator application
 */
export function applySwaggerDecoratorsToClass<T extends object>(
  target: new (...args: any[]) => T,
  fields: Array<{
    propertyKey: string;
    options?: any;
  }>
): void {
  if (!isSwaggerAvailable || !globalSwaggerConfig.enabled) {
    return;
  }

  fields.forEach(({ propertyKey, options = {} }) => {
    createConditionalApiProperty(options)(target.prototype, propertyKey);
  });
}

/**
 * Utility to check if Swagger is available and enabled
 */
export function isSwaggerIntegrationEnabled(): boolean {
  return isSwaggerAvailable && globalSwaggerConfig.enabled;
}

// Apply decorators when the module is loaded
if (typeof window === 'undefined') {
  // Only apply in Node.js environment (not in browser)
  applySwaggerDecorators();
}
