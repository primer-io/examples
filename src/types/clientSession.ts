export interface ClientSession {
  clientToken: string;
  clientTokenExpirationDate: Date;
  order: Order;
  amount: number;
  currencyCode: string;
  metadata: Record<string, any>;
  customer: Customer;
  paymentMethod: PaymentMethod;
  warnings: Warnings;
}

export interface Customer {
  billingAddress: IngAddress;
  shippingAddress: IngAddress;
}

export interface IngAddress {
  countryCode: string;
}

export interface Order {
  lineItems: LineItem[];
  countryCode: string;
  retailerCountryCode: string;
  fees: Fee[];
  shipping: Shipping;
}

export interface Fee {
  amount: number;
}

export interface LineItem {
  amount: number;
  productType: string;
  productData: Shipping;
}

export interface Shipping {}

export interface PaymentMethod {
  paymentType: string;
  orderedAllowedCardNetworks: string[];
  options: Options;
  authorizationType: string;
}

export type Options = {
  PAYMENT_CARD: PaymentCard;
} & Record<string, PaymentMethodType>;

export interface PaymentMethodType {
  surcharge: Shipping;
}

export interface PaymentCard {
  networks: Record<string, PaymentMethodType>;
}

export interface Warnings {
  type: string;
  code: string;
}
