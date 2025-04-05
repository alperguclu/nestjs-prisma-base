/**
 * Decorator to define the Prisma model name for a service
 */
export function ModelName(name: string): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('model:name', name, target.prototype);

    // Define a getter for the modelName property
    Object.defineProperty(target.prototype, 'modelName', {
      get: function () {
        return Reflect.getMetadata('model:name', this);
      },
    });
  };
}
