import { RJSFSchema } from '@rjsf/utils';
import { paymentsFragment } from './_paymentsFragment';
import { stylesFragment } from './_stylesFragment';

export const dropInConfigSchema: RJSFSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    locale: {
      type: 'string',
      description: 'The locale to use for the Drop-in',
      examples: ['en-US', 'fr-FR', 'de-DE', 'en'],
      pattern: '^[a-z]{2}(-[A-Z]{2})?$',
    },
    ...paymentsFragment,
    ...stylesFragment,
    form: {
      type: 'object',
      description: 'Form related settings for the checkout interface.',
      properties: {
        inputLabelsVisible: {
          type: 'boolean',
          description: 'Choose whether to show the label above inputs.',
        },
      },
    },
  },
};
