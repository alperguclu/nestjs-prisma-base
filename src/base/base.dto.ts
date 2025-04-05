/**
 * Base class for all DTOs
 */
export abstract class BaseDto {}

/**
 * Base class for Create DTOs
 * Extend this class to define specific create DTOs
 */
export abstract class BaseCreateDto extends BaseDto {}

/**
 * Base class for Update DTOs
 * Extend this class to define specific update DTOs
 */
export abstract class BaseUpdateDto extends BaseDto {}

/**
 * Base class for Response DTOs
 * Extend this class to define specific response DTOs
 */
export abstract class BaseResponseDto extends BaseDto {
  id!: string | number;
  createdAt?: Date;
  updatedAt?: Date;
}
