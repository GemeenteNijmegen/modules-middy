import { environmentVariables as existingEnvironmentVariables } from '@gemeentenijmegen/utils';
import middy from '@middy/core';

export class EnvironmentConfigurationError extends Error { }

export const environmentVariables = (keys: string[]): middy.MiddlewareObj<any, any> => {

  const before: middy.MiddlewareFn<any, any> = async (_) => {
    try {
      existingEnvironmentVariables(keys);
    } catch (error) {
      if (error instanceof Error) {
        throw new EnvironmentConfigurationError(error.message);
      }
      throw new EnvironmentConfigurationError('Environment is not configured properly');
    }
  };

  const onError: middy.MiddlewareFn<any, any> = async (request): Promise<undefined> => {
    if (request.error instanceof EnvironmentConfigurationError) {
      // This will trigger a failure in the lambda... Which is good
      // as we cannot run the lambda while we are missing configuration
      throw new Error('Environment variable configuration failed');
    }
  };

  return {
    before,
    onError: onError,
  };
};

export default environmentVariables;
