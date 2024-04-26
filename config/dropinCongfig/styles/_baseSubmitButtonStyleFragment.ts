import { GenericObjectType } from '@rjsf/utils';
import { textStyleFragment } from './_textStyleFragment';

export const baseSubmitButtonStyleFragment: GenericObjectType = {
  ...textStyleFragment,
  background: {
    type: 'string',
    description: 'Defines the background color or image of the button.',
  },
  borderRadius: {
    type: ['number', 'string'],
    description: "Defines the radius of the button's corners.",
  },
  boxShadow: {
    type: 'string',
    description: 'Defines the shadow effect of the button.',
  },
  borderStyle: {
    type: 'string',
    description: "Defines the style of the button's border.",
  },
  borderColor: {
    type: ['number', 'string'],
    description: "Defines the color of the button's border.",
  },
  borderWidth: {
    type: ['number', 'string'],
    description: "Defines the width of the button's border.",
  },
};
