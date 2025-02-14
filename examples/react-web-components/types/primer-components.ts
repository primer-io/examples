/**
 * This type can be used to create scoped tags for your components.
 *
 * Usage:
 *
 * ```ts
 * import type { ScopedElements } from "path/to/library/jsx-integration";
 *
 * declare module "my-library" {
 *   namespace JSX {
 *     interface IntrinsicElements
 *       extends ScopedElements<'test-', ''> {}
 *   }
 * }
 * ```
 *
 */
export type ScopedElements<
  Prefix extends string = '',
  Suffix extends string = '',
> = {
  [Key in keyof CustomElements as `${Prefix}${Key}${Suffix}`]: CustomElements[Key];
};

type BaseProps = {
  /** Content added between the opening and closing tags of the element */
  children?: any;
  /** Used for declaratively styling one or more elements using CSS (Cascading Stylesheets) */
  class?: string;
  /** Used for declaratively styling one or more elements using CSS (Cascading Stylesheets) */
  className?: string;
  /** Takes an object where the key is the class name(s) and the value is a boolean expression. When true, the class is applied, and when false, it is removed. */
  classList?: Record<string, boolean | undefined>;
  /** Specifies the text direction of the element. */
  dir?: 'ltr' | 'rtl';
  /** Contains a space-separated list of the part names of the element that should be exposed on the host element. */
  exportparts?: string;
  /** For <label> and <output>, lets you associate the label with some control. */
  htmlFor?: string;
  /** Specifies whether the element should be hidden. */
  hidden?: boolean | string;
  /** A unique identifier for the element. */
  id?: string;
  /** Keys tell React which array item each component corresponds to */
  key?: string | number;
  /** Specifies the language of the element. */
  lang?: string;
  /** Contains a space-separated list of the part names of the element. Part names allows CSS to select and style specific elements in a shadow tree via the ::part pseudo-element. */
  part?: string;
  /** Use the ref attribute with a variable to assign a DOM element to the variable once the element is rendered. */
  ref?: unknown | ((e: unknown) => void);
  /** Adds a reference for a custom element slot */
  slot?: string;
  /** Prop for setting inline styles */
  style?: Record<string, string | number>;
  /** Overrides the default Tab button behavior. Avoid using values other than -1 and 0. */
  tabIndex?: number;
  /** Specifies the tooltip text for the element. */
  title?: string;
  /** Passing 'no' excludes the element content from being translated. */
  translate?: 'yes' | 'no';
};

type BaseEvents = {};

export type PrimerCheckoutProps = {
  /**  */
  'clientToken'?: string;
  /**  */
  'options'?: PrimerCheckoutOptions;
  /**  */
  'customStyles'?: string;
  /**  */
  'disableLoader'?: boolean;
  /**  */
  'sdkStateManager'?: SdkStateManager;
  /**  */
  'sdkStateProvider'?: string;
  /**  */
  'paymentMethodsProvider'?: string;
  /**  */
  'paymentManagerProvider'?: string;
  /**  */
  'onprimer-state'?: (e: CustomEvent<CustomEvent>) => void;
  /**  */
  'onprimer-payment-methods'?: (e: CustomEvent<CustomEvent>) => void;
  /**  */
  'onprimer-initialized'?: (e: CustomEvent<CustomEvent>) => void;
};

export type CardPaymentFormProps = {
  /**  */
  paymentManagers?: InitializedManagersMap;
};

export type KlarnaPaymentComponentProps = {
  /**  */
  createPaymentMethodManager?: CreatePaymentMethodManager | undefined;
  /**  */
  manager?: IKlarnaPaymentMethodManager | null;
  /**  */
  categories?: KlarnaPaymentMethodCategory[];
  /**  */
  selectedCategoryId?: string | null;
  /**  */
  isProcessing?: boolean;
};

export type PrimerCardFormFieldsProps = {};

export type PrimerFailureProps = {
  /**  */
  sdkState?: HeadlessSDKState | undefined;
};

export type PrimerPaymentMethodButtonProps = {
  /**  */
  'type'?: string;
  /**  */
  'paymentMethods'?: PaymentMethodsContextValue;
  /**  */
  'onpayment-method-button-click'?: (e: CustomEvent<CustomEvent>) => void;
};

export type PrimerPaymentMethodButtonsProps = {
  /**  */
  'card-button'?: boolean;
  /**  */
  'paymentMethods'?: PaymentMethodsContextValue;
};

export type PrimerSecureInputProps = {
  /**  */
  label?: string | undefined;
  /**  */
  placeholder?: string | undefined;
  /**  */
  name?: string;
  /**  */
  paymentMethods?: PaymentMethodsContextValue | undefined;
  /**  */
  container?: HTMLDivElement;
};

export type PrimerSuccessProps = {};

export type ButtonComponentProps = {
  /**  */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /**  */
  disabled?: boolean;
  /**  */
  buttonType?: 'button' | 'submit' | 'reset';
};

export type InputComponentProps = {
  /**  */
  focusWithin?: boolean;
};

export type InputErrorComponentProps = {
  /**  */
  for?: string | undefined;
};

export type InputLabelComponentProps = {
  /**  */
  for?: string | undefined;
};

export type SpinnerComponentProps = {
  /**  */
  color?: string;
};

export type CardFormComponentProps = {
  /**  */
  paymentManagers?: InitializedManagersMap;
};

export type NativePaymentComponentProps = {
  /**  */
  paymentMethod?: InitializedPaymentMethod | undefined;
  /**  */
  paymentManagers?: InitializedManagersMap;
};

export type PaymentMethodComponentProps = {
  /**  */
  type?: PaymentMethodType | undefined;
  /**  */
  paymentMethods?: PaymentsObject | null;
};

export type PrimerMainComponentProps = {
  /**  */
  paymentMethods?: PaymentsObject | null;
  /**  */
  sdkState?: SdkState | undefined;
};

export type RedirectPaymentComponentProps = {
  /**  */
  paymentMethod?: InitializedPaymentMethod | undefined;
  /**  */
  paymentManagers?: InitializedManagersMap;
  /**  */
  sdkState?: SdkState | undefined;
};

export type CardFormCardNumberComponentProps = {
  /**  */
  'label'?: string;
  /**  */
  'placeholder'?: string;
  /**  */
  'aria-label'?: string;
  /**  */
  'cardFormContext'?: CardFormContext | undefined;
};

export type CardFormCVVComponentProps = {
  /**  */
  'label'?: string;
  /**  */
  'placeholder'?: string;
  /**  */
  'aria-label'?: string;
  /**  */
  'cardFormContext'?: CardFormContext | undefined;
};

export type CardFormNameComponentProps = {
  /**  */
  label?: string;
  /**  */
  placeholder?: string;
  /**  */
  cardFormContext?: CardFormContext | undefined;
};

export type CardFormExpiryComponentProps = {
  /**  */
  'label'?: string;
  /**  */
  'placeholder'?: string;
  /**  */
  'aria-label'?: string;
  /**  */
  'cardFormContext'?: CardFormContext | undefined;
};

export type CustomElements = {
  /**
   *
   * ---
   *
   *
   * ### **Events:**
   *  - **primer-state**
   * - **primer-payment-methods**
   * - **primer-initialized**
   */
  'primer-checkout': Partial<PrimerCheckoutProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'card-payment-form': Partial<CardPaymentFormProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'klarna-payment-component': Partial<
    KlarnaPaymentComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-card-form-fields': Partial<
    PrimerCardFormFieldsProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-failure': Partial<PrimerFailureProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   *
   * ### **Events:**
   *  - **payment-method-button-click**
   */
  'primer-payment-method-button': Partial<
    PrimerPaymentMethodButtonProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-payment-method-buttons': Partial<
    PrimerPaymentMethodButtonsProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-secure-input': Partial<
    PrimerSecureInputProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-success': Partial<PrimerSuccessProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-button': Partial<ButtonComponentProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-input': Partial<InputComponentProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-card-form-error': Partial<
    InputErrorComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-input-label': Partial<
    InputLabelComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-spinner': Partial<SpinnerComponentProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-card-form': Partial<CardFormComponentProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-native-payment': Partial<
    NativePaymentComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-payment-method': Partial<
    PaymentMethodComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-main': Partial<PrimerMainComponentProps & BaseProps & BaseEvents>;

  /**
   *
   * ---
   *
   */
  'primer-redirect-payment': Partial<
    RedirectPaymentComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-card-form-cardnumber': Partial<
    CardFormCardNumberComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-card-form-cvv': Partial<
    CardFormCVVComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-card-form-name': Partial<
    CardFormNameComponentProps & BaseProps & BaseEvents
  >;

  /**
   *
   * ---
   *
   */
  'primer-card-form-expiry': Partial<
    CardFormExpiryComponentProps & BaseProps & BaseEvents
  >;
};
