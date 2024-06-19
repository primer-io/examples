import { GenericObjectType } from '@rjsf/utils';
import { baseSubmitButtonStyleFragment } from './_baseSubmitButtonStyleFragment';

export const submitButtonStyleFragment: GenericObjectType = {
  hover: {
    type: 'object',
    description:
      "Defines the style for the submit button when it's being hovered over.",
    properties: baseSubmitButtonStyleFragment,
  },
  focus: {
    type: 'object',
    description: 'Defines the style for the submit button when it has focus.',
    properties: baseSubmitButtonStyleFragment,
  },
  ...baseSubmitButtonStyleFragment,
};
