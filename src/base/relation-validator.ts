import { RelationConfig, RelationValidationResult } from './search.interface';

/**
 * Utility class for validating and processing relation includes
 */
export class RelationValidator {
  /**
   * Validate requested includes against the relation configuration
   */
  static validateIncludes(requestedIncludes: string[] | Record<string, boolean | any> | undefined, config: RelationConfig): RelationValidationResult {
    const result: RelationValidationResult = {
      validatedIncludes: {},
      invalidKeys: [],
      depthExceeded: false,
    };

    // If no config is provided, allow everything (backward compatibility)
    if (!config) {
      if (Array.isArray(requestedIncludes)) {
        result.validatedIncludes = this.arrayToIncludeObject(requestedIncludes);
      } else if (typeof requestedIncludes === 'object' && requestedIncludes !== null) {
        result.validatedIncludes = requestedIncludes;
      }
      return result;
    }

    // Start with default includes
    if (config.defaultIncludes) {
      result.validatedIncludes = { ...config.defaultIncludes };
    }

    // Process requested includes
    if (requestedIncludes) {
      let includesToProcess: Record<string, boolean | any>;

      if (Array.isArray(requestedIncludes)) {
        includesToProcess = this.arrayToIncludeObject(requestedIncludes);
      } else if (typeof requestedIncludes === 'object') {
        includesToProcess = requestedIncludes;
      } else {
        return result;
      }

      // Validate each requested include
      for (const [key, value] of Object.entries(includesToProcess)) {
        if (this.isValidInclude(key, config)) {
          // Check for custom configuration
          if (config.customIncludes && config.customIncludes[key]) {
            result.validatedIncludes[key] = config.customIncludes[key];
          } else {
            result.validatedIncludes[key] = value;
          }
        } else {
          result.invalidKeys.push(key);
        }
      }
    }

    // Check depth if configured
    if (config.maxDepth && config.maxDepth > 0) {
      const depth = this.calculateDepth(result.validatedIncludes);
      if (depth > config.maxDepth) {
        result.depthExceeded = true;
        result.validatedIncludes = this.limitDepth(result.validatedIncludes, config.maxDepth);
      }
    }

    return result;
  }

  /**
   * Convert array of relation names to include object
   */
  private static arrayToIncludeObject(includes: string[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const include of includes) {
      if (typeof include === 'string' && include.trim()) {
        result[include.trim()] = true;
      }
    }
    return result;
  }

  /**
   * Check if a relation key is valid according to the configuration
   */
  private static isValidInclude(key: string, config: RelationConfig): boolean {
    // If no available includes specified, allow all
    if (!config.availableIncludes || config.availableIncludes.length === 0) {
      return true;
    }

    // Check if the key is in the allowed list
    return config.availableIncludes.includes(key);
  }

  /**
   * Calculate the maximum depth of nested includes
   */
  private static calculateDepth(includes: Record<string, any>, currentDepth = 0): number {
    let maxDepth = currentDepth;

    for (const value of Object.values(includes)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if this is a nested include object
        if ('include' in value && typeof value.include === 'object') {
          const nestedDepth = this.calculateDepth(value.include, currentDepth + 1);
          maxDepth = Math.max(maxDepth, nestedDepth);
        } else if (!('select' in value) && !('where' in value)) {
          // This appears to be a direct nested include
          const nestedDepth = this.calculateDepth(value, currentDepth + 1);
          maxDepth = Math.max(maxDepth, nestedDepth);
        }
      }
    }

    return maxDepth;
  }

  /**
   * Limit the depth of includes to the specified maximum
   */
  private static limitDepth(includes: Record<string, any>, maxDepth: number, currentDepth = 0): Record<string, any> {
    if (currentDepth >= maxDepth) {
      return {};
    }

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(includes)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('include' in value && typeof value.include === 'object') {
          result[key] = {
            ...value,
            include: this.limitDepth(value.include, maxDepth, currentDepth + 1),
          };
        } else if (!('select' in value) && !('where' in value)) {
          result[key] = this.limitDepth(value, maxDepth, currentDepth + 1);
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Parse comma-separated include string into array
   */
  static parseIncludeString(includeString: string): string[] {
    if (!includeString || typeof includeString !== 'string') {
      return [];
    }

    return includeString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Merge default includes with requested includes
   */
  static mergeIncludes(defaultIncludes: Record<string, boolean | any> | undefined, requestedIncludes: Record<string, boolean | any> | undefined): Record<string, boolean | any> {
    const merged = { ...(defaultIncludes || {}) };

    if (requestedIncludes) {
      for (const [key, value] of Object.entries(requestedIncludes)) {
        merged[key] = value;
      }
    }

    return merged;
  }
}
