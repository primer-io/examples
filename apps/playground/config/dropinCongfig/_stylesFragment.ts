import { GenericObjectType } from '@rjsf/utils';
import { baseSubmitButtonStyleFragment } from './styles/_baseSubmitButtonStyleFragment';
import { errorMessageStyleFragment } from './styles/_errorMessageStyleFragment';
import { inputStyleFragment } from './styles/_inputStyleFragment';
import { savedPaymentMethodButtonStyleFragment } from './styles/_savedPaymentMethodButtonStyleFragment';
import { submitButtonStyleFragment } from './styles/_submitButtonStyleFragment';
import { textStyleFragment } from './styles/_textStyleFragment';

export const stylesFragment: GenericObjectType = {
  fontFaces: {
    type: 'array',
    description: 'Custom fonts to be used in the checkout.',
    items: {
      type: 'object',
      properties: {
        fontFamily: {
          type: 'string',
          description: 'Font family of the text.',
        },
        src: {
          type: 'string',
          description: 'Location of the font file.',
        },
        unicodeRange: {
          type: 'string',
          description: 'Unicode range of the font.',
        },
        fontVariant: {
          type: 'string',
          description: 'Variant of the font.',
        },
        fontFeatureSettings: {
          type: 'string',
          description: 'Feature settings of the font.',
        },
        fontVariationSettings: {
          type: 'string',
          description: 'Variation settings of the font.',
        },
        fontStretch: {
          type: 'string',
          description: 'Stretch of the font.',
        },
        fontWeight: {
          type: 'string',
          description: 'Weight of the font.',
        },
        fontStyle: {
          type: 'string',
          description: 'Style of the font.',
        },
      },
    },
  },
  stylesheets: {
    type: 'array',
    description: 'Custom stylesheets to be used in the checkout.',
    items: {
      type: 'object',
      properties: {
        href: {
          type: 'string',
          description: 'URL of the stylesheet.',
        },
      },
    },
  },
  loadingScreen: {
    type: 'object',
    description: 'Style for the loading screen during checkout processing.',
    properties: {
      color: {
        type: 'string',
        description: 'Color of the loading screen.',
      },
    },
  },
  input: {
    type: 'object',
    description: 'Styles for input fields within the checkout.',
    properties: {
      base: {
        type: 'object',
        description: 'Base style for input fields.',
        properties: inputStyleFragment,
      },
      error: {
        type: 'object',
        description: 'Style for input fields in an error state.',
        properties: inputStyleFragment,
      },
    },
  },
  inputLabel: {
    type: 'object',
    description: 'Style for input field labels.',
    properties: textStyleFragment,
  },
  inputErrorText: {
    type: 'object',
    description: 'Style for error text below input fields.',
    properties: {
      ...textStyleFragment,
      textAlign: {
        type: 'string',
        description: 'Alignment of the error text.',
      },
    },
  },
  formSpacings: {
    type: 'object',
    description: 'Spacing configurations for form elements.',
    properties: {
      betweenLabelAndInput: {
        type: 'string',
        description:
          'Space between a form label and its corresponding input element.',
      },
      betweenInputs: {
        type: 'string',
        description: 'Space between different input elements.',
      },
    },
  },
  showMorePaymentMethodsButton: {
    type: 'object',
    description: 'Styles for the "Show More Payment Methods" button.',
    properties: {
      base: textStyleFragment,
      disabled: textStyleFragment,
    },
  },
  networkError: {
    type: 'object',
    description: 'Styles for network error messages.',
    properties: {
      button: {
        type: 'object',
        properties: {
          base: {
            type: 'object',
            description: 'Base style for network error button.',
            properties: baseSubmitButtonStyleFragment,
          },
        },
      },
    },
  },
  submitButton: {
    type: 'object',
    description: "Styles for the checkout's submit button.",
    properties: {
      base: submitButtonStyleFragment,
      disabled: submitButtonStyleFragment,
      loading: submitButtonStyleFragment,
    },
  },
  vaultTitle: {
    type: 'object',
    properties: textStyleFragment,
  },
  savedPaymentMethodButton: {
    type: 'object',
    description: 'Styles for saved payment method buttons.',
    properties: {
      base: savedPaymentMethodButtonStyleFragment,
      selected: savedPaymentMethodButtonStyleFragment,
    },
  },
  paymentMethodButton: {
    type: 'object',
    description: 'Styles for payment method buttons in the checkout.',
    properties: {
      height: {
        type: 'number',
        description: 'Height of the payment method button.',
      },
      minHeight: {
        type: 'number',
        description: 'Minimum height of the payment method button.',
      },
      maxHeight: {
        type: 'number',
        description: 'Maximum height of the payment method button.',
      },
      primaryText: textStyleFragment,
      logoColor: {
        type: 'string',
        enum: ['DARK', 'LIGHT', 'COLORED'],
        description: 'Color of the payment method logo.',
      },
      marginTop: {
        type: 'string',
        description: 'Top margin of the payment method button.',
      },
      background: {
        type: 'string',
        description: 'Background color or image of the button.',
      },
      borderRadius: {
        type: ['number', 'string'],
        description: "Radius of the button's corners.",
      },
      boxShadow: {
        type: 'string',
        description: 'Shadow effect of the button.',
      },
      borderStyle: {
        type: 'string',
        description: "Style of the button's border.",
      },
      borderColor: {
        type: ['number', 'string'],
        description: "Color of the button's border.",
      },
      borderWidth: {
        type: ['number', 'string'],
        description: "Width of the button's border.",
      },
    },
  },
  errorMessage: {
    type: 'object',
    description: 'Styles for error messages.',
    properties: errorMessageStyleFragment,
  },
  smallPrint: {
    type: 'object',
    properties: textStyleFragment,
  },
};
