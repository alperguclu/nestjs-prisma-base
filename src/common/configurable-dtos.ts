import { DTOConfig } from './dto-config.interface';

/**
 * Global DTO configuration that can be set once and used across all DTOs
 */
let globalDTOConfig: DTOConfig = {
  includeTimestamps: true,
  includeId: true,
  swaggerEnabled: false,
  timestampFields: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
};

/**
 * Set global DTO configuration
 */
export function configureDTOs(config: Partial<DTOConfig>): void {
  globalDTOConfig = { ...globalDTOConfig, ...config };
}

/**
 * Get current global DTO configuration
 */
export function getDTOConfig(): DTOConfig {
  return { ...globalDTOConfig };
}

/**
 * Configurable Base Create DTO
 * Can be extended by services and configured globally or per-class
 */
export class ConfigurableBaseCreateDto {
  /**
   * Per-class DTO configuration (overrides global config)
   */
  protected static dtoConfig: Partial<DTOConfig> = {};

  /**
   * Configure this specific DTO class
   */
  static configure(config: Partial<DTOConfig>): void {
    this.dtoConfig = { ...this.dtoConfig, ...config };
  }

  /**
   * Get effective configuration (merge global + class-specific)
   */
  static getConfig(): DTOConfig {
    return { ...globalDTOConfig, ...this.dtoConfig };
  }

  // No additional fields by default - purely configurable
}

/**
 * Configurable Base Update DTO
 * Can be extended by services and configured globally or per-class
 */
export class ConfigurableBaseUpdateDto {
  /**
   * Per-class DTO configuration (overrides global config)
   */
  protected static dtoConfig: Partial<DTOConfig> = {};

  /**
   * Configure this specific DTO class
   */
  static configure(config: Partial<DTOConfig>): void {
    this.dtoConfig = { ...this.dtoConfig, ...config };
  }

  /**
   * Get effective configuration (merge global + class-specific)
   */
  static getConfig(): DTOConfig {
    return { ...globalDTOConfig, ...this.dtoConfig };
  }

  // No additional fields by default - purely configurable
}

/**
 * Configurable Base Response DTO
 * Conditionally includes fields based on configuration
 */
export class ConfigurableBaseResponseDto {
  /**
   * Per-class DTO configuration (overrides global config)
   */
  protected static dtoConfig: Partial<DTOConfig> = {};

  /**
   * Configure this specific DTO class
   */
  static configure(config: Partial<DTOConfig>): void {
    this.dtoConfig = { ...this.dtoConfig, ...config };
  }

  /**
   * Get effective configuration (merge global + class-specific)
   */
  static getConfig(): DTOConfig {
    return { ...globalDTOConfig, ...this.dtoConfig };
  }

  /**
   * Record ID - conditionally included based on configuration
   */
  id?: number;

  /**
   * Creation timestamp - conditionally included based on configuration
   */
  createdAt?: Date;

  /**
   * Last update timestamp - conditionally included based on configuration
   */
  updatedAt?: Date;

  /**
   * Helper method to check if timestamps should be included
   */
  static shouldIncludeTimestamps(): boolean {
    const config = this.getConfig();
    return config.includeTimestamps ?? true;
  }

  /**
   * Helper method to check if ID should be included
   */
  static shouldIncludeId(): boolean {
    const config = this.getConfig();
    return config.includeId ?? true;
  }

  /**
   * Helper method to check if Swagger is enabled
   */
  static isSwaggerEnabled(): boolean {
    const config = this.getConfig();
    return config.swaggerEnabled ?? false;
  }

  /**
   * Get timestamp field names from configuration
   */
  static getTimestampFields(): { createdAt: string; updatedAt: string } {
    const config = this.getConfig();
    return {
      createdAt: config.timestampFields?.createdAt ?? 'createdAt',
      updatedAt: config.timestampFields?.updatedAt ?? 'updatedAt',
    };
  }
}
