/**
 * Configuration interface for DTO features
 */
export interface DTOConfig {
  /**
   * Whether to include timestamp fields (createdAt, updatedAt) in DTOs
   * @default true
   */
  includeTimestamps?: boolean;

  /**
   * Whether to include ID field in response DTOs
   * @default true
   */
  includeId?: boolean;

  /**
   * Whether to include message field in response DTOs
   * @default false
   */
  includeMessage?: boolean;

  /**
   * Whether Swagger integration is enabled
   * @default false
   */
  swaggerEnabled?: boolean;

  /**
   * Configuration for timestamp field names
   */
  timestampFields?: {
    createdAt?: string;
    updatedAt?: string;
  };

  /**
   * Configuration for message field
   */
  messageField?: {
    fieldName?: string;
    defaultValue?: string;
    maxLength?: number;
  };
}

/**
 * Configuration interface for Swagger integration in DTOs
 */
export interface SwaggerDTOConfig {
  /**
   * Whether Swagger integration is enabled
   * @default false
   */
  enabled: boolean;

  /**
   * Whether to include timestamp fields in Swagger documentation
   * @default true
   */
  includeTimestamps?: boolean;

  /**
   * Whether to include examples in Swagger documentation
   * @default true
   */
  includeExamples?: boolean;

  /**
   * Whether to include detailed descriptions for common fields
   * @default true
   */
  includeDescriptions?: boolean;

  /**
   * Custom field configurations for Swagger
   */
  fieldConfig?: {
    id?: {
      description?: string;
      example?: any;
    };
    createdAt?: {
      description?: string;
      example?: any;
    };
    updatedAt?: {
      description?: string;
      example?: any;
    };
    message?: {
      description?: string;
      example?: any;
    };
  };
}

/**
 * Combined configuration for PrismaModule DTO options
 */
export interface PrismaModuleDTOOptions {
  /**
   * Default DTO configuration
   */
  dtoConfig?: DTOConfig;

  /**
   * Swagger integration configuration
   */
  swaggerIntegration?: SwaggerDTOConfig;

  /**
   * Whether to provide minimal DTOs (no additional fields)
   * @default false
   */
  useMinimalDTOs?: boolean;
}
