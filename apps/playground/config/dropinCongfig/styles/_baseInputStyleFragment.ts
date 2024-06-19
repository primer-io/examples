import { GenericObjectType } from '@rjsf/utils';

export const baseInputStyleFragment: GenericObjectType = {
  height: {
    type: ['number', 'string'],
    description: 'Defines the height of the input element.',
  },
  paddingHorizontal: {
    type: 'number',
    description: 'Defines the horizontal padding of the input element.',
  },
  color: {
    type: 'string',
    description: 'Defines the color of the text.',
  },
  fontFamily: {
    type: 'string',
    description: 'Defines the font family of the text.',
  },
  fontWeight: {
    type: 'string',
    description: 'Defines the weight of the text.',
  },
  fontSize: {
    type: 'string',
    description: 'Defines the size of the text.',
  },
  fontSmoothing: {
    type: 'string',
    description: 'Defines the smoothing of the font.',
  },
  lineHeight: {
    type: 'string',
    description: 'Defines the height of the line.',
  },
  textTransform: {
    type: 'string',
    description: 'Defines the transformation of the text.',
  },
  letterSpacing: {
    type: 'string',
    description: 'Defines the spacing between letters in the text.',
  },
  background: {
    type: 'string',
    description: 'Defines the background color or image of the box element.',
  },
  borderRadius: {
    type: ['number', 'string'],
    description: "Defines the radius of the box element's corners.",
  },
  boxShadow: {
    type: 'string',
    description: 'Defines the shadow effect of the box element.',
  },
  borderStyle: {
    type: 'string',
    description: "Defines the style of the box element's border.",
  },
  borderColor: {
    type: ['number', 'string'],
    description: "Defines the color of the box element's border.",
  },
  borderWidth: {
    type: ['number', 'string'],
    description: "Defines the width of the box element's border.",
  },
};
