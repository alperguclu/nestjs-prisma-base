/**
 * Minimal Base Create DTO
 * Contains no additional fields - provides a clean base class
 * for developers who want full control over their DTOs
 */
export class MinimalBaseCreateDto {
  // Intentionally empty - no additional fields
  // Developers can extend this class and add only the fields they need
}

/**
 * Minimal Base Update DTO
 * Contains no additional fields - provides a clean base class
 * for developers who want full control over their DTOs
 */
export class MinimalBaseUpdateDto {
  // Intentionally empty - no additional fields
  // Developers can extend this class and add only the fields they need
}

/**
 * Minimal Base Response DTO
 * Contains no additional fields - provides a clean base class
 * for developers who want full control over their DTOs
 */
export class MinimalBaseResponseDto {
  // Intentionally empty - no additional fields
  // Developers can define their own response structure completely
}

/**
 * Minimal Base DTO with only ID
 * For cases where only the ID field is needed in responses
 */
export class MinimalBaseIdDto {
  /**
   * Record ID
   */
  id?: number;
}

/**
 * Minimal Base DTO with timestamps
 * For cases where only timestamp fields are needed
 */
export class MinimalBaseTimestampDto {
  /**
   * Creation timestamp
   */
  createdAt?: Date;

  /**
   * Last update timestamp
   */
  updatedAt?: Date;
}

/**
 * Minimal Base DTO with ID and timestamps
 * For cases where basic common fields are needed without configuration overhead
 */
export class MinimalBaseEntityDto {
  /**
   * Record ID
   */
  id?: number;

  /**
   * Creation timestamp
   */
  createdAt?: Date;

  /**
   * Last update timestamp
   */
  updatedAt?: Date;
}

/**
 * Minimal Base DTO with only message field
 * For cases where only the message field is needed in responses
 */
export class MinimalBaseMessageDto {
  /**
   * Response message
   */
  message?: string;
}
