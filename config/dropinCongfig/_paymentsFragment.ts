import { GenericObjectType } from '@rjsf/utils';

export const paymentsFragment: GenericObjectType = {
  card: {
    type: 'object',
    description:
      'Customize the appearance and behavior of the card fields in the checkout form.',
    properties: {
      cardholderName: {
        type: 'object',
        description: 'Options for the cardholder name input field.',
        properties: {
          required: {
            type: 'boolean',
            description: 'Whether the cardholder name is required.',
          },
          visible: {
            type: 'boolean',
            description:
              'Deprecated. Set visibility on your Dashboard instead.',
          },
          placeholder: {
            type: 'string',
            description: 'Placeholder for the cardholder name.',
          },
        },
      },
      cardNumber: {
        type: 'object',
        properties: {
          placeholder: {
            type: 'string',
            description: 'Placeholder for the card number.',
          },
        },
      },
      expiryDate: {
        type: 'object',
        properties: {
          placeholder: {
            type: 'string',
            description: 'Placeholder for the expiry date.',
          },
        },
      },
      cvv: {
        type: 'object',
        properties: {
          placeholder: {
            type: 'string',
            description: 'Placeholder for the CVV field.',
          },
        },
      },
      preferredFlow: {
        type: 'string',
        description: 'Specify the preferred flow for entering card details.',
        enum: ['DEDICATED_SCENE', 'EMBEDDED_IN_HOME'],
      },
    },
  },
  redirect: {
    type: 'object',
    description: 'Options for payment methods that rely on redirecting.',
    properties: {
      returnUrl: {
        type: 'string',
        description:
          'The URL to return to after the redirect process has completed.',
      },
      forceRedirect: {
        type: 'boolean',
        description: 'Whether to always use a redirect flow.',
      },
    },
  },
  paypal: {
    type: 'object',
    properties: {
      buttonColor: {
        type: 'string',
        description: 'The color of the PayPal button.',
        enum: ['gold', 'blue', 'silver', 'white', 'black'],
      },
      buttonShape: {
        type: 'string',
        description: 'The shape of the PayPal button.',
        enum: ['pill', 'rect'],
      },
      buttonSize: {
        type: 'string',
        description: 'The size of the PayPal button.',
        enum: ['small', 'medium', 'large', 'responsive'],
      },
      buttonHeight: {
        type: 'number',
        description: 'The height of the PayPal button in pixels.',
      },
      buttonLabel: {
        type: 'string',
        description: 'The label displayed on the PayPal button.',
        enum: ['checkout', 'credit', 'pay', 'buynow', 'paypal', 'installment'],
      },
      buttonTagline: {
        type: 'boolean',
        description:
          'Whether to display the PayPal tagline beneath the button.',
      },
      paymentFlow: {
        type: 'string',
        description: 'The payment flow to use for the PayPal button.',
        enum: ['DEFAULT', 'PREFER_VAULT'],
      },
      onClick: {
        type: 'string',
        description:
          'A function to be called when the PayPal button is clicked.',
      },
    },
  },
  googlePay: {
    type: 'object',
    description: 'Options for using Google Pay as a payment method.',
    properties: {
      buttonType: {
        type: 'string',
        enum: [
          'long',
          'short',
          'book',
          'buy',
          'checkout',
          'donate',
          'order',
          'pay',
          'plain',
          'subscribe',
        ],
      },
      buttonColor: {
        type: 'string',
        enum: ['default', 'black', 'white'],
      },
      buttonSizeMode: {
        type: 'string',
        enum: ['fill', 'static'],
      },
      onClick: {
        type: 'string',
        description:
          'A function to be called when the Google Pay button is clicked.',
      },
      captureBillingAddress: {
        type: 'boolean',
        description: 'Whether to prompt the user to select a billing address.',
      },
    },
  },
  applePay: {
    type: 'object',
    description: 'Options for using Apple Pay as a payment method.',
    properties: {
      buttonType: {
        type: 'string',
        enum: [
          'plain',
          'buy',
          'set-up',
          'donate',
          'check-out',
          'book',
          'subscribe',
        ],
      },
      buttonStyle: {
        type: 'string',
        enum: ['white', 'white-outline', 'black'],
      },
      captureBillingAddress: {
        type: 'boolean',
      },
    },
  },
  klarna: {
    type: 'object',
    description: 'Options for using Klarna as a payment method.',
    properties: {
      paymentFlow: {
        type: 'string',
        enum: ['DEFAULT', 'PREFER_VAULT'],
      },
      recurringPaymentDescription: {
        type: 'string',
      },
      allowedPaymentCategories: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['pay_now', 'pay_later', 'pay_over_time'],
        },
      },
    },
  },
  directDebit: {
    type: 'object',
    description: 'Options for using direct debit as a payment method.',
    required: ['customerCountryCode', 'companyName', 'companyAddress'],
    properties: {
      customerCountryCode: {
        type: 'string',
      },
      companyName: {
        type: 'string',
      },
      companyAddress: {
        type: 'string',
      },
      customerName: {
        type: 'string',
      },
      customerEmail: {
        type: 'string',
      },
      customerAddressLine1: {
        type: 'string',
      },
      customerAddressLine2: {
        type: 'string',
      },
      customerCity: {
        type: 'string',
      },
      customerPostalCode: {
        type: 'string',
      },
      iban: {
        type: 'string',
      },
      submitButtonLabels: {
        type: 'object',
      },
    },
  },
};
