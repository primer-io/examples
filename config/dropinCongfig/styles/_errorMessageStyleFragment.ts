import { GenericObjectType } from '@rjsf/utils';

export const errorMessageStyleFragment: GenericObjectType = {
  color: {
    type: 'string',
    description: 'Defines the color of the error message text.',
  },
  fontFamily: {
    type: 'string',
    description: 'Defines the font family of the error message text.',
  },
  fontWeight: {
    type: 'string',
    description: 'Defines the weight of the error message text.',
  },
  fontSize: {
    type: 'string',
    description: 'Defines the size of the error message text.',
  },
  fontSmoothing: {
    type: 'string',
    description: 'Defines the smoothing of the font for the error message.',
  },
  lineHeight: {
    type: 'string',
    description: 'Defines the height of the line for the error message text.',
  },
  textTransform: {
    type: 'string',
    description:
      'Defines the transformation of the error message text (e.g., uppercase, lowercase).',
  },
  letterSpacing: {
    type: 'string',
    description:
      'Defines the spacing between letters in the error message text.',
  },
  background: {
    type: 'string',
    description:
      'Defines the background color or image of the error message area.',
  },
  borderRadius: {
    type: ['number', 'string'],
    description: 'Defines the radius of the corners of the error message area.',
  },
  boxShadow: {
    type: 'string',
    description: 'Defines the shadow effect of the error message area.',
  },
  borderStyle: {
    type: 'string',
    description: 'Defines the style of the border of the error message area.',
  },
  borderColor: {
    type: ['number', 'string'],
    description: 'Defines the color of the border of the error message area.',
  },
  borderWidth: {
    type: ['number', 'string'],
    description: 'Defines the width of the border of the error message area.',
  },
};
