import { GenericObjectType } from '@rjsf/utils';
import { baseSavedPaymentMethodButtonStyleFragment } from './_baseSavedPaymentMethodButtonStyleFragment';

export const savedPaymentMethodButtonStyleFragment: GenericObjectType = {
  hover: {
    type: 'object',
    description:
      'Style for the saved payment method button when it is being hovered over.',
    properties: baseSavedPaymentMethodButtonStyleFragment,
  },
  focus: {
    type: 'object',
    description: 'Style for the saved payment method button when it has focus.',
    properties: baseSavedPaymentMethodButtonStyleFragment,
  },
  ...baseSavedPaymentMethodButtonStyleFragment,
};
