import 'reflect-metadata';

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
