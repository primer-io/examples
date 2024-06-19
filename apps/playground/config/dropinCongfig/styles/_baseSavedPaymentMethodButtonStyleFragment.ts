import { GenericObjectType } from '@rjsf/utils';

export const baseSavedPaymentMethodButtonStyleFragment: GenericObjectType = {
  color: {
    type: 'string',
    description: 'Defines the color of the text on the button.',
  },
  fontFamily: {
    type: 'string',
    description: 'Defines the font family of the text on the button.',
  },
  fontWeight: {
    type: 'string',
    description: 'Defines the weight of the text on the button.',
  },
  fontSize: {
    type: 'string',
    description: 'Defines the size of the text on the button.',
  },
  fontSmoothing: {
    type: 'string',
    description: 'Defines the smoothing of the font on the button.',
  },
  lineHeight: {
    type: 'string',
    description: 'Defines the height of the line of text on the button.',
  },
  textTransform: {
    type: 'string',
    description: 'Defines the transformation of the text on the button.',
  },
  letterSpacing: {
    type: 'string',
    description: 'Defines the spacing between letters on the button.',
  },
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
