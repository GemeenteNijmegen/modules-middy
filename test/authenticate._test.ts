import { AWS } from '@gemeentenijmegen/utils';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult, LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda';
import * as thisPackage from '../src/index';

const SECRET = 'geheim';

/*

NO RUNNING TESTS!!

Obviously this does not work yet... Struggeling with using the ts-jest transpiler
in conjunction with middy. No clue on how to solve this...
Some resources:
- https://middy.js.org/docs/intro/testing
- https://github.com/middyjs/middy/issues/1148
*/


describe('Authenticate', () => {

  beforeAll(() => {
    jest.spyOn(AWS, 'getSecret').mockImplementation(() => {
      return Promise.resolve(SECRET);
    });
  });

  it('returns 200 after succsesful validation', async () => {

    const event: Partial<APIGatewayProxyEvent> = {
      body: 'test',
      headers: {
        Authorization: 'Token geheim',
      },
    };

    const exec = middy<LambdaFunctionURLEvent, LambdaFunctionURLResult>()
      .use(thisPackage.authenticateUsingApiKey({
        allowedHeaders: ['Authorization'],
        apiKeyPrefix: 'Token ',
        apikeySecretArn: 'arn:secret/abcdef',
      }))
      .handler(handler);

    const result = await exec(event as any, {} as any, {} as any) as any;
    expect(result?.statusCode).toBe(200);

  });
});

async function handler(): Promise<APIGatewayProxyResult> {
  return {
    body: 'done',
    statusCode: 200,
  };
}