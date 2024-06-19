import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { currencyCodes } from '../src/utils/currency.ts';
import { countryCodes } from './countryCodes.ts';

export const clientUISchema: UiSchema = {
  metadata: {
    'ui:widget': 'textarea',
  },
};

export const clientSessionSchema: RJSFSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['orderId', 'currencyCode', 'amount', 'customerId', 'order'],
  properties: {
    orderId: {
      type: 'string',
      description: 'A unique reference identifier for the payment.',
    },
    metadata: {
      type: 'string',
      examples: '{"key": "value"}',
      pattern: '^\\{.*\\}$',
      description:
        'A key-value map for additional data used throughout the payment lifecycle.',
    },
    currencyCode: {
      type: 'string',
      description: 'A 3-letter ISO 4217 currency code for the payment.',
      examples: currencyCodes,
      pattern: '^[A-Z]{3}$',
    },
    amount: {
      type: 'integer',
      description:
        'The charge amount in the smallest currency unit (e.g., cents for USD). Overrides totals from line items if provided.',
      minimum: 0,
    },
    customerId: {
      type: 'string',
      description:
        'Identifier for your customer. Used for managing payment methods and transactions.',
    },
    order: {
      type: 'object',
      properties: {
        lineItems: {
          type: 'array',
          items: {
            type: 'object',
            required: ['amount', 'itemId', 'description', 'quantity'],
            properties: {
              amount: {
                type: 'integer',
                description:
                  'Charge amount per line item in minor units. Minimum of 0.',
                minimum: 0,
              },
              itemId: {
                type: 'string',
                description: 'A unique identifier for the line item.',
              },
              name: {
                type: 'string',
                description: 'Name of the item.',
              },
              description: {
                type: 'string',
                description: 'A detailed description of the item.',
              },
              quantity: {
                type: 'integer',
                description: 'Quantity of the item purchased.',
                minimum: 1,
              },
              discountedAmount: {
                type: 'integer',
                description:
                  'Discount amount applied to the line item, in minor units.',
                minimum: 0,
              },
              taxAmount: {
                type: 'integer',
                description: 'Tax charged on the item, in minor units.',
                minimum: 0,
              },
              taxCode: {
                type: 'string',
                description:
                  'Tax code for the item, required for automated tax calculations.',
              },
              productType: {
                type: 'string',
                enum: ['PHYSICAL', 'DIGITAL'],
                description: 'Type of product: PHYSICAL or DIGITAL.',
              },
              productData: {
                type: 'object',
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Stock Keeping Unit identifier.',
                  },
                  brand: {
                    type: 'string',
                    description: 'Brand of the product.',
                  },
                  color: {
                    type: 'string',
                    description: 'Color of the product.',
                  },
                  globalTradeItemNumber: {
                    type: 'string',
                    description:
                      'Global Trade Item Number (e.g., ISBN for books).',
                  },
                  manufacturerPartNumber: {
                    type: 'string',
                    description: 'Manufacturer Part Number.',
                  },
                  weight: {
                    type: 'number',
                    description: 'Weight of the product.',
                  },
                  weightUnit: {
                    type: 'string',
                    description:
                      'Unit of measurement for weight (e.g., kg, g).',
                  },
                },
              },
            },
          },
          minItems: 1,
        },
        fees: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: {
                type: 'integer',
                description: 'Fee amount charged in minor units.',
                minimum: 0,
              },
              type: {
                type: 'string',
                description:
                  'Type of the fee (e.g., "Currency Conversion Fee").',
              },
              description: {
                type: 'string',
                description: 'Description of the fee.',
              },
            },
          },
        },
        countryCode: {
          type: 'string',
          description:
            'ISO 3166-1 alpha-2 country code of the order creation location.',
          pattern: '^[A-Z]{2}$',
          examples: countryCodes,
        },
        retailerCountryCode: {
          type: 'string',
          description: 'ISO 3166-1 alpha-2 country code of the retailer.',
          pattern: '^[A-Z]{2}$',
          examples: countryCodes,
        },
        shipping: {
          type: 'object',
          properties: {
            amount: {
              type: 'integer',
              description:
                'Shipping cost charged to the customer, in minor units.',
              minimum: 0,
            },
          },
        },
      },
    },
    customer: {
      type: 'object',
      properties: {
        emailAddress: {
          type: 'string',
          description:
            'Customer email address. Must be a valid email, supporting internationalized addresses.',
          format: 'email',
        },
        mobileNumber: {
          type: 'string',
          description: "The customer's mobile number.",
        },
        firstName: {
          type: 'string',
          description: "The customer's first name.",
        },
        lastName: {
          type: 'string',
          description: "The customer's last name.",
        },
        taxId: {
          type: 'string',
          description: "The customer's tax ID number for tax exemptions.",
        },
        nationalDocumentId: {
          type: 'string',
          description: "The customer's national identification number.",
        },
        billingAddress: {
          type: 'object',
          required: ['countryCode'],
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            addressLine1: {
              type: 'string',
              description: 'Street name, company name, or PO Box.',
            },
            addressLine2: {
              type: 'string',
              description: 'Apartment, unit, or building number.',
            },
            city: {
              type: 'string',
              description: 'Name of the city, district, town, or village.',
            },
            state: {
              type: 'string',
              description: 'State, county, or province.',
            },
            countryCode: {
              type: 'string',
              description: 'ISO 3166-1 alpha-2 country code.',
              examples: countryCodes,
              pattern: '^[A-Z]{2}$',
            },
            postalCode: {
              type: 'string',
              description: 'Postal or ZIP code.',
            },
          },
        },
        shippingAddress: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            addressLine1: {
              type: 'string',
              description: 'Street name, company name, or PO Box.',
            },
            addressLine2: {
              type: 'string',
              description: 'Apartment, unit, or building number.',
            },
            city: {
              type: 'string',
              description: 'Name of the city, district, town, or village.',
            },
            state: {
              type: 'string',
              description: 'State, county, or province.',
            },
            countryCode: {
              type: 'string',
              description: 'ISO 3166-1 alpha-2 country code.',
              pattern: '^[A-Z]{2}$',
            },
            postalCode: {
              type: 'string',
              description: 'Postal or ZIP code.',
            },
          },
        },
      },
    },
    paymentMethod: {
      type: 'object',
      description: 'Enable options associated with the payment method.',
      properties: {
        vaultOnSuccess: {
          type: 'boolean',
          description:
            'Whether to vault the payment method on a successful payment.',
        },
        vaultOn3DS: {
          type: 'boolean',
          description:
            'Whether to vault the payment method after successful 3DS authentication.',
        },
        descriptor: {
          type: 'string',
          description:
            'Description of the payment as it appears on a bank statement.',
        },
        paymentType: {
          type: 'string',
          description:
            'Defines the payment type, especially relevant for recurring payments.',
          enum: ['FIRST_PAYMENT', 'ECOMMERCE', 'SUBSCRIPTION', 'UNSCHEDULED'],
        },
        authorizationType: {
          type: 'string',
          description:
            'Specifies whether the authorized amount is final or can be adjusted post-authorization.',
          enum: ['ESTIMATED', 'FINAL'],
        },
        orderedAllowedCardNetworks: {
          type: 'array',
          description:
            'Validates card networks and sets priority for co-badged cards.',
          items: {
            type: 'string',
            examples: [
              'VISA',
              'MASTERCARD',
              'AMEX',
              'MAESTRO',
              'UNIONPAY',
              'CARTES_BANCAIRES',
              'DANKORT',
              'DINERS_CLUB',
              'DISCOVER',
              'ENROUTE',
              'ELO',
              'HIPER',
              'INTERAC',
              'JCB',
              'MIR',
              'OTHER',
            ],
          },
          uniqueItems: true,
        },
        options: {
          type: 'object',
          additionalProperties: true,
          description:
            'Additional options for different payment methods, structured as key-value pairs.',
        },
      },
    },
  },
};
