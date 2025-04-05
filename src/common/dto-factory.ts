import { Type } from '@nestjs/common';
import { BaseCreateDto, BaseUpdateDto, BaseResponseDto } from '../base/base.dto';

/**
 * Factory function to create DTOs for a Prisma model
 * @param modelName The name of the Prisma model
 * @returns An object containing Create, Update, and Response DTOs for the model
 */
export function createDtos<T>(modelName: string): {
  CreateDto: Type<BaseCreateDto>;
  UpdateDto: Type<BaseUpdateDto>;
  ResponseDto: Type<BaseResponseDto & Partial<T>>;
} {
  // Create a class for the Create DTO
  class ModelCreateDto extends BaseCreateDto {}
  Object.defineProperty(ModelCreateDto, 'name', { value: `Create${modelName}Dto` });

  // Create a class for the Update DTO
  class ModelUpdateDto extends BaseUpdateDto {}
  Object.defineProperty(ModelUpdateDto, 'name', { value: `Update${modelName}Dto` });

  // Create a class for the Response DTO
  class ModelResponseDto extends BaseResponseDto {}
  Object.defineProperty(ModelResponseDto, 'name', { value: `${modelName}ResponseDto` });

  return {
    CreateDto: ModelCreateDto,
    UpdateDto: ModelUpdateDto,
    ResponseDto: ModelResponseDto as Type<BaseResponseDto & Partial<T>>,
  };
}
