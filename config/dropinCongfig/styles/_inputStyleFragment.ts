import { GenericObjectType } from '@rjsf/utils';
import { baseInputStyleFragment } from './_baseInputStyleFragment';

export const inputStyleFragment: GenericObjectType = {
  hover: {
    type: 'object',
    description: 'Style of the input element when it is being hovered over.',
    properties: baseInputStyleFragment,
  },
  focus: {
    type: 'object',
    description: 'Style of the input element when it has focus.',
    properties: baseInputStyleFragment,
  },
  placeholder: {
    type: 'object',
    description: "Style of the input element's placeholder text.",
    properties: baseInputStyleFragment,
  },
  webkitAutofill: {
    type: 'object',
    description:
      "Style of the input element's autofill values in webkit-based browsers.",
    properties: baseInputStyleFragment,
  },
  selection: {
    type: 'object',
    description: "Style of the input element's text selection.",
    properties: baseInputStyleFragment,
  },
  ...baseInputStyleFragment,
};
