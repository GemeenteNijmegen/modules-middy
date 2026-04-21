import middy from '@middy/core';
import { default as createHttpError, default as errors } from 'http-errors';
import { ZodError, ZodObject } from 'zod';

export interface ValidatorOptions<T extends ZodObject> {
  /**
   * The ZOD schema used to validate the incomming request.
   */
  schema: T;
  /**
   * Indicates to check only the request body using the provided schema.
   * Setting this to true implies that the incomming event is an AWS http event.
   * @default true
   */
  checkRequestBodySchema?: boolean;
}

/**
 * Takes a ZOD schema and validates of the event or http request body is valid.
 * Note: This relies on the middy jsonBodyParser for normalizing the event
 * (e.g. decoding and JSON parsing) the jsonBodyParser modifies the incomming event.
 * @param opts
 * @returns
 */
export function validator<T extends ZodObject>(opts: ValidatorOptions<T>): middy.MiddlewareObj<any, any> {

  const before: middy.MiddlewareFn<any, any> = async (request) => {
    try {

      // Get the object we are validating
      let object = request.event;
      if (opts.checkRequestBodySchema !== false) {
        object = request.event.body;
      }

      console.info('Validating object', object);
      // Run zod validation
      opts.schema.parse(object);

    } catch (error) {
      console.error(error);
      if (error instanceof ZodError) {
        throw createHttpError(400, 'Event body failed validation', {
          cause: error.issues,
        });
      }
      throw errors.BadRequest();
    }
  };

  const onError: middy.MiddlewareFn<T, T> = async (): Promise<undefined> => {
    // Do nothing?
  };

  return {
    before,
    onError: onError,
  };
}

export default validator;
