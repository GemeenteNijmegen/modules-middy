import { Logger } from '@aws-lambda-powertools/logger';
import { authenticateUsingApiKey, environmentVariables, validator } from '@gemeentenijmegen/middy';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import jsonBodyParser from '@middy/http-json-body-parser';
import inputOutputLogger from '@middy/input-output-logger';
import { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import createError from 'http-errors';
import * as z from 'zod';

const logger = new Logger({ serviceName: 'ExperimentMiddyLambda' });

const SuperSimpleZodSchema = z.object({
  name: z.string(),
});

async function lambdaHandler(event: LambdaFunctionURLEvent, context: any, someTupel: any): Promise<LambdaFunctionURLResult> {
  console.log('Handled', event.requestContext.requestId);
  console.log('Tupel', someTupel);

  if (event.queryStringParameters?.notFound === 'true') {
    throw createError.NotFound();
  }

  return {
    statusCode: 200,
    body: `Ok! - Request ID: ${event.requestContext.requestId}`,
    headers: {
      'Content-Type': 'text/plain',
    },
  };

}

export const handler = middy<LambdaFunctionURLEvent, LambdaFunctionURLResult>()
  .use(inputOutputLogger({ // Logs the raw event and response
    logger: (message => logger.info(message)),
  }))
  .use(environmentVariables([ // Checks if required env. variables are set (throws error otherwise). Note: this runs every time
    'API_KEY_ARN',
  ]))
  .use(authenticateUsingApiKey({ // Validates the API key
    apiKeyPrefix: 'Token ',
    hardcodedSecret: 'superGeheim',
  }))
  .use(jsonBodyParser()) // Automatically parses HTTP requests with JSON body and converts the body into an object. Also handles gracefully broken JSON if used in combination of httpErrorHandler.
  .use(validator({ // Note this is our custom validator that uses Zod instead of the middy validator that uses ajv.
    schema: SuperSimpleZodSchema,
  }))
  // .use(eventNormalizer()) // Normalizes AWS events from different sources (e.g. SNS, SQS) See: https://middy.js.org/docs/middlewares/event-normalizer/
  .use(httpErrorHandler()) // Catches unhandled errors and converts them to a http response (if the error contains a statusCode and message) Tip: Use createError from this package
  .handler(lambdaHandler)