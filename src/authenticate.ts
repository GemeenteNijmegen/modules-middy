import { AWS } from '@gemeentenijmegen/utils';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyResult, LambdaFunctionURLEvent } from 'aws-lambda';

export interface AuthenticateUsingApiKeyOptions {
  allowedHeaders?: string[];
  apikeySecretArn?: string;
  apiKeyPrefix?: string;
  hardcodedSecret?: string;
}

export class AuthenticationError extends Error { }

const defaults = {
  allowedHeaders: [
    'X-Authorization',
    'Authorization',
    'authorization',
    'x-api-key',
  ],
  apikeySecretArn: undefined,
  apiKeyPrefix: undefined,
  hardcodedSecret: undefined,
};

let API_KEY: string | undefined = undefined;

export type AwsHttpEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2 | LambdaFunctionURLEvent;

export const authenticateUsingApiKey = (opts?: AuthenticateUsingApiKeyOptions): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const options = { ...defaults, ...opts };

  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request) => {

    if (!API_KEY && !options.hardcodedSecret) {
      let arn = options.apikeySecretArn ?? process.env.API_KEY_ARN;
      if (!arn) {
        throw new AuthenticationError('API_KEY_ARN not configured (either pass as a configuration option or set API_KEY_ARN environment variable).');
      }
      API_KEY = await AWS.getSecret(arn);
    }

    if (!API_KEY && !options.hardcodedSecret) {
      throw new AuthenticationError('API_KEY was not loaded');
    }

    if (!request.event.headers) {
      throw new AuthenticationError('No headers avaialble to check for API key');
    }

    const usedHeader = options.allowedHeaders.find(h => request.event.headers[h] != undefined);
    if (!usedHeader) {
      throw new AuthenticationError('No headers available to check for API key');
    }

    const header = request.event.headers[usedHeader];

    if (!header) {
      throw new AuthenticationError('No Authorization header found in the request.');
    }

    const key = API_KEY ?? options.hardcodedSecret;

    if (options.apiKeyPrefix) {
      if (!header.startsWith(options.apiKeyPrefix)) {
        throw new AuthenticationError('Authorization header must have a token prefix');
      }
      if (header.substring(options.apiKeyPrefix.length) !== key) {
        throw new AuthenticationError('Invalid API key');
      }
    } else {
      if (header !== key) {
        throw new AuthenticationError('Invalid API key');
      }
    }
  };

  const onError: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (request): Promise<undefined> => {

    if (!(request.error instanceof AuthenticationError)) {
      // Let other middle ware handle this error
      return;
    }

    console.error('Failed with reason:', request.error);
    request.earlyResponse = {
      statusCode: 401,
      body: 'Unauthorized',
      headers: {
        'Content-Type': 'text/plain',
      },
    };

  };

  return {
    before,
    onError: onError,
  };
};

export default authenticateUsingApiKey;
