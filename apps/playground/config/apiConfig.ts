import { RJSFSchema } from '@rjsf/utils';

export const apiConfigSchema: RJSFSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['environment', 'apiKey'],
  properties: {
    environment: {
      type: 'string',
      enum: ['SANDBOX', 'PRODUCTION', 'STAGING', 'DEV'],
    },
    apiKey: {
      type: 'string',
    },
  },
};
