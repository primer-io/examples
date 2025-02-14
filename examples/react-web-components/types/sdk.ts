import { ContextProvider } from '@lit/context';
import {
  BackgroundColor,
  CardPaymentMethodSubmitValues,
  HeadlessManagerType,
  HeadlessUniversalCheckoutOptions,
  IAchPaymentMethodManager,
  ICardPaymentMethodManager,
  IconUrl,
  IHeadlessHostedInput,
  IKlarnaPaymentMethodManager,
  INativePaymentMethodManager,
  IRedirectPaymentMethodManager,
  PaymentMethodType,
  PrimerHeadlessCheckout,
  Validation,
} from '@primer-io/checkout-web';
import {
  CSSResult,
  LitElement,
  nothing,
  PropertyValues,
  SVGTemplateResult,
} from 'lit';
import { TemplateResult } from 'lit-html';

export declare class Button extends LitElement {
  static styles: CSSResult[];
  variant: 'primary' | 'secondary' | 'tertiary';
  disabled: boolean;
  buttonType: 'button' | 'submit' | 'reset';
  render(): TemplateResult<1>;
}

export declare class CardForm extends LitElement {
  static styles: CSSResult[];
  paymentManagers: InitializedManagersMap;
  private sdkStateProvider;
  private formElement;
  private setupCardFormTask;
  connectedCallback(): void;
  disconnectedCallback(): void;
  private handleSlotButtonClick;
  render(): TemplateResult<1>;
  private submitCardPayment;
  private handleCustomButtonClick;
}

export declare class CardFormCardNumber extends LitElement {
  cardFormContext: CardFormContext | undefined;
  label: string;
  placeholder: string;
  ariaLabel: string;
  private hostedInputController;
  constructor();
  handleSlotchange(e: Event): void;
  render(): TemplateResult<1> | typeof nothing;
}

declare interface CardFormContext {
  cardNumberInput?: IHeadlessHostedInput;
  expiryInput?: IHeadlessHostedInput;
  cvvInput?: IHeadlessHostedInput;
  setCardholderName?: (val: string) => void;
  validate?: () => Promise<Validation>;
  submit?: (values?: CardPaymentMethodSubmitValues) => Promise<void>;
  errors?: Validation['validationErrors'];
}

export declare class CardFormCVV extends LitElement {
  cardFormContext: CardFormContext | undefined;
  label: string;
  placeholder: string;
  ariaLabel: string;
  private hostedInputController;
  constructor();
  handleSlotchange(e: Event): void;
  render(): TemplateResult<1> | typeof nothing;
}

export declare class CardFormError extends LitElement {
  static styles: CSSResult[];
  for?: string;
  render(): TemplateResult<1>;
}

export declare class CardFormExpiry extends LitElement {
  cardFormContext: CardFormContext | undefined;
  label: string;
  placeholder: string;
  ariaLabel: string;
  private hostedInputController;
  constructor();
  handleSlotchange(e: Event): void;
  render(): TemplateResult<1> | typeof nothing;
}

export declare class CardFormInput extends LitElement {
  static styles: CSSResult[];
  focusWithin: boolean;
  render(): TemplateResult<1>;
}

export declare class CardFormLabel extends LitElement {
  static styles: CSSResult[];
  for?: string;
  render(): TemplateResult<1>;
}

export declare class CardFormName extends LitElement {
  static styles: CSSResult[];
  cardFormContext?: CardFormContext;
  label: string;
  placeholder: string;
  private hostedInputController;
  handleSlotChange(e: Event): void;
  private handleInput;
  render(): TemplateResult<1> | typeof nothing;
}

export declare class CardPaymentForm extends LitElement {
  paymentManagers: InitializedManagersMap;
  private cardManager;
  private readonly cardHolderInputId;
  private readonly cardNumberInputId;
  private readonly cardExpiryInputId;
  private readonly cardCvvInputId;
  constructor();
  private setupCardFormTask;
  willUpdate(changedProperties: Map<string | number | symbol, unknown>): void;
  render(): TemplateResult<1>;
  submitCardPayment(): Promise<void>;
  static styles: CSSResult;
  private _generateUniqueId;
}

declare interface HeadlessSDKState {
  isProcessing: boolean;
  isSuccessful: boolean;
  isFailure: boolean;
  error?: Error | undefined;
}

declare type IconName = keyof typeof icons;

declare const icons: Record<string, SVGTemplateResult>;

export declare type InitializedManager =
  | {
      type: typeof PaymentMethodType.STRIPE_ACH;
      manager: IAchPaymentMethodManager;
    }
  | {
      type: typeof PaymentMethodType.PAYMENT_CARD;
      manager: ICardPaymentMethodManager;
    }
  | {
      type: typeof PaymentMethodType.KLARNA;
      manager: IKlarnaPaymentMethodManager;
    }
  | {
      type: RedirectPaymentMethodTypes;
      manager: IRedirectPaymentMethodManager;
    }
  | {
      type:
        | typeof PaymentMethodType.PAYPAL
        | typeof PaymentMethodType.GOOGLE_PAY
        | typeof PaymentMethodType.APPLE_PAY;
      manager: INativePaymentMethodManager;
    };

export declare interface InitializedManagersMap
  extends Map<PaymentMethodType, InitializedManager> {
  get<T extends PaymentMethodType>(key: T): ManagerByType<T> | undefined;
}

export declare type InitializedPaymentAssets = {
  displayName: string;
  backgroundColor?: BackgroundColor;
  buttonText: string;
  iconUrl?: IconUrl;
};

export declare type InitializedPaymentMethod =
  | {
      type: typeof PaymentMethodType.STRIPE_ACH;
      managerType: HeadlessManagerType.ACH;
      assets: InitializedPaymentAssets;
    }
  | {
      type: typeof PaymentMethodType.PAYMENT_CARD;
      managerType: HeadlessManagerType.CARD;
      assets: null;
    }
  | {
      type: typeof PaymentMethodType.KLARNA;
      managerType: HeadlessManagerType.KLARNA;
      assets: InitializedPaymentAssets;
    }
  | {
      type: typeof PaymentMethodType.PAYPAL;
      managerType: HeadlessManagerType.NATIVE;
      assets: null;
    }
  | {
      type: typeof PaymentMethodType.GOOGLE_PAY;
      managerType: HeadlessManagerType.NATIVE;
      assets: null;
    }
  | {
      type: typeof PaymentMethodType.APPLE_PAY;
      managerType: HeadlessManagerType.NATIVE;
      assets: null;
    }
  | RedirectPaymentMethod;

export declare interface InitializedPaymentMethodMap
  extends Map<PaymentMethodType, InitializedPaymentMethod> {
  get<T extends PaymentMethodType>(key: T): PaymentMethodByType<T> | undefined;
}

declare type JSONSafe<T> = T extends (...args: any[]) => any
  ? never
  : T extends symbol
    ? never
    : T extends bigint
      ? never
      : T extends Array<infer U>
        ? JSONSafe<U>[]
        : T extends object
          ? {
              [K in keyof T as JSONSafe<T[K]> extends never
                ? never
                : K]: JSONSafe<T[K]>;
            }
          : T;

declare type ManagerByType<T extends PaymentMethodType> = Extract<
  InitializedManager,
  {
    type: T;
  }
>;

export declare class NativePayment extends LitElement {
  paymentMethod: InitializedPaymentMethod | undefined;
  paymentManagers: InitializedManagersMap;
  private _buttonId;
  private _nativePaymentMethodManager;
  private loadNativeButtonTask;
  constructor();
  willUpdate(_changedProperties: PropertyValues): void;
  render(): TemplateResult<1>;
  static styles: CSSResult;
}

export declare type NativePaymentMethodTypes =
  | typeof PaymentMethodType.PAYPAL
  | typeof PaymentMethodType.GOOGLE_PAY
  | typeof PaymentMethodType.APPLE_PAY;

export declare class PaymentMethod extends LitElement {
  static styles: CSSResult[];
  type: PaymentMethodType | undefined;
  paymentMethods: PaymentsObject | null;
  render(): TemplateResult<1> | null;
}

export declare type PaymentMethodByType<T extends PaymentMethodType> = Extract<
  InitializedPaymentMethod,
  {
    type: T;
  }
>;

export declare class PaymentsObject {
  private readonly _methods;
  constructor(map: InitializedPaymentMethodMap);
  get<T extends RedirectPaymentMethodTypes>(
    type: T,
  ): RedirectPaymentMethod | undefined;
  get<T extends (typeof PaymentMethodType)[keyof typeof PaymentMethodType]>(
    type: T,
  ): PaymentMethodByType<T> | undefined;
  toArray(): InitializedPaymentMethod[];
  size(): number;
}

export declare class PrimerCheckout extends LitElement {
  static styles: CSSResult[];
  private headlessController;
  customStyles: string;
  clientToken: string;
  options: PrimerCheckoutOptions;
  disableLoader: boolean;
  sdkStateManager: SdkStateManager;
  sdkStateProvider: ContextProvider<
    {
      __context__: SdkState;
    },
    this
  >;
  paymentMethodsProvider: ContextProvider<
    {
      __context__: PaymentsObject | null;
    },
    this
  >;
  paymentManagerProvider: ContextProvider<
    {
      __context__: InitializedManagersMap;
    },
    this
  >;
  constructor();
  attributeChangedCallback(
    attrName: string,
    oldVal: string,
    newVal: string,
  ): void;
  transformCustomStylesObjectToCSSVariables(
    styles: Record<string, string>,
  ): void;
  willUpdate(changedProperties: PropertyValues): void;
  setSDKState(state: SdkState): void;
  setPaymentMethods(paymentMethods: PaymentsObject): void;
  onInitialized(checkoutInstance: PrimerHeadlessCheckout): void;
  render(): TemplateResult<1> | null;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: PrimerCheckout, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof ShadowRootEventMap>(
    type: K,
    listener: (this: PrimerCheckout, ev: ShadowRootEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: PrimerCheckout, ev: DocumentEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof PrimerSdkEvents>(
    type: K,
    listener: (this: PrimerCheckout, ev: PrimerSdkEvents[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}

export declare class PrimerCheckoutComplete extends LitElement {
  render(): TemplateResult<1>;
}

export declare class PrimerCheckoutFailure extends LitElement {
  sdkState: HeadlessSDKState | undefined;
  render(): TemplateResult<1>;
}

export declare type PrimerCheckoutOptions =
  JSONSafe<HeadlessUniversalCheckoutOptions>;

export declare class PrimerCheckoutState extends LitElement {
  static styles: CSSResult[];
  type: 'complete' | 'failure';
  description?: string;
  render(): TemplateResult<1>;
}

export declare class PrimerIcon extends LitElement {
  static styles: CSSResult[];
  color: string;
  size: 'lg' | 'sm';
  /** The name of the icon to draw - available names can be found under library.ts file */
  name?: IconName;
  render(): TemplateResult<1>;
}

export declare class PrimerMain extends LitElement {
  static styles: CSSResult[];
  paymentMethods: PaymentsObject | null;
  sdkState: SdkState | undefined;
  render(): TemplateResult<1>;
}

declare interface PrimerSdkEvents {
  'primer-state': CustomEvent<SdkState>;
  'primer-payment-methods': CustomEvent<PaymentsObject>;
  'primer-initialized': CustomEvent<PrimerHeadlessCheckout>;
}

export declare class RedirectPayment extends LitElement {
  static styles: CSSResult[];
  paymentMethod: InitializedPaymentMethod | undefined;
  paymentManagers: InitializedManagersMap;
  sdkState: SdkState | undefined;
  private _paymentMethodManager;
  willUpdate(changedProperties: PropertyValues): void;
  startRedirectPayment(): void;
  render(): TemplateResult<1>;
}

export declare type RedirectPaymentMethod = {
  type: RedirectPaymentMethodTypes;
  managerType: HeadlessManagerType.REDIRECT;
  assets: InitializedPaymentAssets;
};

export declare type RedirectPaymentMethodTypes = Exclude<
  PaymentMethodType,
  | typeof PaymentMethodType.STRIPE_ACH
  | typeof PaymentMethodType.PAYMENT_CARD
  | typeof PaymentMethodType.KLARNA
  | typeof PaymentMethodType.PAYPAL
  | typeof PaymentMethodType.GOOGLE_PAY
  | typeof PaymentMethodType.APPLE_PAY
>;

declare type SdkState = {
  isSuccessful: boolean;
  isProcessing: boolean;
  error?: Error;
  isLoading?: boolean;
  failure?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

declare class SdkStateManager {
  private _state;
  private _setState;
  constructor(setState: (state: SdkState) => void);
  private reducer;
  private dispatch;
  startProcessing(): void;
  completeProcessing(): void;
  completeLoading(): void;
  setError(error: Error): void;
  setFailure(
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ): void;
  reset(): void;
}

export declare class Spinner extends LitElement {
  color: string;
  static styles: CSSResult;
  render(): TemplateResult<1>;
}

export {};

declare global {
  interface HTMLElementTagNameMap {
    'primer-checkout': PrimerCheckout;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'card-payment-form': CardPaymentForm;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-spinner': SpinnerComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-checkout-state': PrimerCheckoutStateComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-icon': PrimerIconComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-input': InputComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-button': ButtonComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-input-label': InputLabelComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-error': InputErrorComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-redirect-payment': RedirectPaymentComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-main': PrimerMainComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-native-payment': NativePaymentComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-checkout-complete': PrimerCheckoutCompleteComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form': CardFormComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-checkout-failure': PrimerCheckoutFailureComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-payment-method': PaymentMethodComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-cvv': CardFormCVVComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-cardnumber': CardFormCardNumberComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-expiry': CardFormExpiryComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-name': CardFormNameComponent;
  }
}

declare global {
  interface Window {
    Primer: typeof _Primer;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'klarna-payment-component': KlarnaPaymentComponent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-card-form-fields': PrimerCardFormFields;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-payment-method-button': PrimerPaymentMethodButton;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-payment-method-buttons': PrimerPaymentMethodButtons;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'primer-secure-input': PrimerSecureInput;
  }
}
