import { GenericObjectType } from '@rjsf/utils';

export const textStyleFragment: GenericObjectType = {
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
    description:
      'Defines the transformation of the text (e.g., uppercase, lowercase, capitalize).',
  },
  letterSpacing: {
    type: 'string',
    description: 'Defines the spacing between letters in the text.',
  },
};
