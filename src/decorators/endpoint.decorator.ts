import 'reflect-metadata';
import { applyDecorators } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

/**
 * Enum defining standard endpoint types
 */
export enum EndpointType {
  FIND_ALL = 'findAll',
  FIND_ONE = 'findOne',
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'remove',
}

// Metadata keys
export const ENABLED_ENDPOINTS_KEY = 'endpoints:enabled';
export const DISABLED_ENDPOINTS_KEY = 'endpoints:disabled';
export const ENDPOINT_ENABLED_KEY = 'endpoint:enabled';
export const ENDPOINT_DISABLED_KEY = 'endpoint:disabled';

/**
 * Decorator to enable an endpoint on a controller
 * Can be applied to a class to enable specific endpoints
 * or to a method to enable that specific method
 */
export function EnableEndpoint(endpointName: EndpointType | string) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    // If applied to a method
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(ENDPOINT_ENABLED_KEY, true, target, propertyKey);
      return descriptor;
    }

    // If applied to a class
    const enabledEndpoints = Reflect.getMetadata(ENABLED_ENDPOINTS_KEY, target) || [];
    enabledEndpoints.push(endpointName);
    Reflect.defineMetadata(ENABLED_ENDPOINTS_KEY, enabledEndpoints, target);
    return target;
  };
}

/**
 * Decorator to disable an endpoint on a controller
 * Can be applied to a class to disable specific endpoints
 * or to a method to disable that specific method
 */
export function DisableEndpoint(endpointName: EndpointType | string) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    // If applied to a method
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(ENDPOINT_DISABLED_KEY, true, target, propertyKey);
      return descriptor;
    }

    // If applied to a class
    const disabledEndpoints = Reflect.getMetadata(DISABLED_ENDPOINTS_KEY, target) || [];
    disabledEndpoints.push(endpointName);
    Reflect.defineMetadata(DISABLED_ENDPOINTS_KEY, disabledEndpoints, target);
    return target;
  };
}

/**
 * Enable all standard endpoints
 */
export function EnableAllEndpoints() {
  return EnableEndpoint('*');
}

/**
 * Check if an endpoint is enabled
 * @param target The target class
 * @param endpointName The endpoint name to check
 */
export function isEndpointEnabled(target: any, endpointName: string): boolean {
  // Check method-level disable decorator
  if (Reflect.getMetadata(ENDPOINT_DISABLED_KEY, target, endpointName)) {
    return false;
  }

  // Check method-level enable decorator
  if (Reflect.getMetadata(ENDPOINT_ENABLED_KEY, target, endpointName)) {
    return true;
  }

  // Check class-level enable decorator
  const enabledEndpoints = Reflect.getMetadata(ENABLED_ENDPOINTS_KEY, target.constructor) || [];
  if (enabledEndpoints.includes(endpointName) || enabledEndpoints.includes('*')) {
    // Check if explicitly disabled at class level
    const disabledEndpoints = Reflect.getMetadata(DISABLED_ENDPOINTS_KEY, target.constructor) || [];
    return !disabledEndpoints.includes(endpointName);
  }

  // By default, endpoints are not enabled
  return false;
}

/**
 * Decorator that conditionally applies ApiExcludeEndpoint when an endpoint is disabled
 * Can be applied to any controller method
 */
export function ApiExcludeDisabledEndpoint(endpointName: EndpointType | string): MethodDecorator {
  return (target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    // Store the enabled status as metadata since we can't evaluate it at decoration time
    Reflect.defineMetadata('api:shouldExclude', endpointName, target, propertyKey.toString());

    // We need to override the controller method to check at runtime
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // Check if this endpoint should be excluded from Swagger docs
      const thisInstance = this as any;
      const methodName = propertyKey.toString();
      const endpointToCheck = Reflect.getMetadata('api:shouldExclude', target, methodName) as string;

      if (!isEndpointEnabled(thisInstance, endpointToCheck)) {
        // If not enabled, apply ApiExcludeEndpoint (this won't have effect at runtime,
        // but would help if the metadata is read by other processes)
        ApiExcludeEndpoint()(target, methodName, descriptor);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
