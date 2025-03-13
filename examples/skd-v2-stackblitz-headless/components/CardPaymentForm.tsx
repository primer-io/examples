'use client';

import React, { FC, useEffect, useRef, useState } from 'react';
import type {
  CardNetworkDetails,
  EventTypes,
  IAssetsManager,
  ICardPaymentMethodManager,
  IHeadlessHostedInput,
  PrimerHeadlessCheckout,
} from '@primer-io/checkout-web';

interface CardPaymentFormProps {
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  onPaymentError: (err: any) => void;
  assetsManager: IAssetsManager | null;
  isProcessing: boolean;
}

type EventListenerEvent = {
  active: boolean;
  dirty: boolean;
  error: string;
  errorCode: string;
  submitted: boolean;
  touched: boolean;
  valid: boolean;
};

export const CardPaymentForm: FC<CardPaymentFormProps> = ({
  createPaymentMethodManager,
  onPaymentError,
  assetsManager,
  isProcessing,
}) => {
  // State management for form
  const [cardManager, setCardManager] =
    useState<ICardPaymentMethodManager | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNetworks, setCardNetworks] = useState<CardNetworkDetails[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>(
    undefined,
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cardNetworkImageUrl, setCardNetworkImageUrl] = useState<string>('');

  // Create refs for the DOM elements
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);

  // Refs for event listeners to properly clean them up
  const cardNumberInputRef = useRef<IHeadlessHostedInput | null>(null);
  const cardExpiryInputRef = useRef<IHeadlessHostedInput | null>(null);
  const cardCvvInputRef = useRef<IHeadlessHostedInput | null>(null);

  // Ref to track initialization status
  const isManagerInitialized = useRef(false);
  const isInputsInitialized = useRef(false);

  // Ref for cleanup handling
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize the card manager once when component mounts
  useEffect(() => {
    // Skip if already initialized
    if (isManagerInitialized.current) return;

    // Create a new AbortController for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const initializeCardManager = async () => {
      try {
        const manager = await createPaymentMethodManager('PAYMENT_CARD', {
          onCardNetworksChange: async (event) => {
            // Skip if aborted
            if (signal.aborted) return;

            // Handle detected card networks
            const detectedNetworks = event.detectedCardNetworks?.items || [];
            setCardNetworks(event.selectableCardNetworks?.items || []);

            if (event.selectableCardNetworks?.preferred) {
              setSelectedNetwork(
                event.selectableCardNetworks.preferred.network,
              );
            }

            // Update card network image
            if (detectedNetworks.length > 0 && assetsManager) {
              const preferredNetwork = detectedNetworks[0].network;
              const asset =
                await assetsManager.getCardNetworkAsset(preferredNetwork);

              // Skip if aborted before setting state
              if (signal.aborted) return;

              setCardNetworkImageUrl(asset?.cardUrl || '');
            } else {
              // Skip if aborted before setting state
              if (signal.aborted) return;

              setCardNetworkImageUrl('');
            }
          },
          onCardNetworksLoading: () => {
            // Skip if aborted
            if (signal.aborted) return;

            setCardNetworks([]);
            setSelectedNetwork(undefined);
            setCardNetworkImageUrl('');
          },
        });

        // Skip if aborted before setting state
        if (signal.aborted) return;

        setCardManager(manager);
        isManagerInitialized.current = true;
      } catch (error) {
        console.error('Error setting up card payment form:', error);

        // Skip if aborted before handling error
        if (signal.aborted) return;

        onPaymentError(error);
      }
    };

    initializeCardManager();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [createPaymentMethodManager, assetsManager, onPaymentError]);

  // Initialize the hosted inputs once the card manager is ready and refs are available
  useEffect(() => {
    // Skip if no card manager or missing refs or already initialized
    if (
      !cardManager ||
      !cardNumberRef.current ||
      !cardExpiryRef.current ||
      !cardCvvRef.current ||
      isInputsInitialized.current ||
      cardNumberInputRef.current ||
      cardExpiryInputRef.current ||
      cardCvvInputRef.current
    ) {
      return;
    }

    console.log('Initializing hosted inputs...');

    // Create a new AbortController for cleanup if not already created
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    const signal = abortControllerRef.current.signal;

    const initializeHostedInputs = async () => {
      if (
        !cardNumberRef.current ||
        !cardExpiryRef.current ||
        !cardCvvRef.current
      ) {
        console.error('Card form elements are not ready');
        return;
      }
      try {
        // Create hosted inputs for secure card data collection
        const { cardNumberInput, cvvInput, expiryInput } =
          cardManager.createHostedInputs();

        // Store references for cleanup
        cardNumberInputRef.current = cardNumberInput;
        cardExpiryInputRef.current = expiryInput;
        cardCvvInputRef.current = cvvInput;
        const style = {
          paddingHorizontal: 0,
          input: {
            base: {
              height: '20px',
              fontSize: '14px',
            },
            placeholder: {
              fontSize: '14px',
            },
          },
        };
        // Render the inputs in their containers with proper placeholders and ARIA labels
        await Promise.all([
          cardNumberInput.render(cardNumberRef.current.id, {
            placeholder: '1234 1234 1234 1234',
            ariaLabel: 'Card number',
            style,
          }),
          expiryInput.render(cardExpiryRef.current.id, {
            placeholder: 'MM/YY',
            ariaLabel: 'Expiry date',
            style,
          }),
          cvvInput.render(cardCvvRef.current.id, {
            placeholder: '123',
            ariaLabel: 'CVV',
            style,
          }),
        ]);

        // Skip if aborted
        if (signal.aborted) return;

        isInputsInitialized.current = true;

        // Handle validation errors
        cardNumberInput.addEventListener(
          'change' as EventTypes.CHANGE,
          (event) => {
            // Skip if aborted
            if (!event || signal.aborted) return;

            const { error, dirty } = event as unknown as EventListenerEvent;
            if (dirty)
              setErrors((prev) => ({ ...prev, cardNumber: error || '' }));
          },
        );

        cvvInput.addEventListener('change' as EventTypes.CHANGE, (event) => {
          // Skip if aborted
          if (!event || signal.aborted) return;

          const { error, dirty } = event as unknown as EventListenerEvent;
          if (dirty) setErrors((prev) => ({ ...prev, cvv: error || '' }));
        });

        expiryInput.addEventListener('change' as EventTypes.CHANGE, (event) => {
          // Skip if aborted
          if (!event || signal.aborted) return;

          const { error, dirty } = event as unknown as EventListenerEvent;
          if (dirty)
            setErrors((prev) => ({ ...prev, expiryDate: error || '' }));
        });

        // Focus the card number input for better UX
        cardNumberInput.focus();
      } catch (err) {
        console.error('Error rendering card inputs:', err);

        // Skip if aborted before handling error
        if (signal.aborted) return;

        onPaymentError(err);
      }
    };

    initializeHostedInputs();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Clean up hosted inputs
      const cleanupInputs = () => {
        try {
          cardNumberInputRef.current = null;
          cardExpiryInputRef.current = null;
          cardCvvInputRef.current = null;
        } catch (err) {
          console.error('Error cleaning up card inputs:', err);
        }
      };

      // Clean up card manager
      const cleanupCardManager = () => {
        if (cardManager) {
          try {
            cardManager.reset();
          } catch (err) {
            console.error('Error cleaning up card manager:', err);
          }
        }
      };

      cleanupInputs();
      cleanupCardManager();
    };
  }, [cardManager, onPaymentError]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardManager) {
      onPaymentError(new Error('Card manager not initialized'));
      return;
    }

    // Set cardholder name on the card manager
    cardManager.setCardholderName(cardholderName);

    // Validate the form
    const { valid, validationErrors } = await cardManager.validate();

    if (valid) {
      try {
        setIsSubmitting(true);
        // Submit the payment
        await cardManager.submit({ cardNetwork: selectedNetwork });
        // Reset the form on success
        cardManager.reset();
      } catch (error) {
        console.error(error);
        onPaymentError(error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle validation errors
      const errorMessages: { [key: string]: string } = {};
      validationErrors.forEach((error: any) => {
        if (error.name === 'cardNumber-card')
          errorMessages.cardNumber = error.message;
        if (error.name === 'cvv-card') errorMessages.cvv = error.message;
        if (error.name === 'expiryDate-card')
          errorMessages.expiryDate = error.message;
        if (error.name === 'cardholderName')
          errorMessages.cardholderName = error.message;
      });

      setErrors(errorMessages);
      onPaymentError(validationErrors);
    }
  };

  // Determine if form is disabled (global processing or local submitting)
  const isFormDisabled = isProcessing || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className='mt-6'>
      <h3 className='text-xl font-medium mb-4'>Card Details</h3>

      {/* Cardholder Name Input */}
      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Cardholder Name
          <input
            type='text'
            id='cardholder-name'
            value={cardholderName}
            placeholder='John Doe'
            onChange={(e) => setCardholderName(e.target.value)}
            className='payment-input mt-1'
            disabled={isFormDisabled}
          />
        </label>
        {errors.cardholderName && (
          <p className='text-sm text-red-600 mt-1'>{errors.cardholderName}</p>
        )}
      </div>

      {/* Card Number Input */}
      <div className='mb-4'>
        <label
          htmlFor='card-number'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Card Number
        </label>
        <div className='relative'>
          {/* Card number input */}
          <div
            id='card-number'
            ref={cardNumberRef}
            className={`payment-input ${isFormDisabled ? 'opacity-50' : ''}`}
            data-testid='card-number-container'
          ></div>

          {/* Card network icon container - positioned absolutely */}
          {cardNetworkImageUrl && (
            <div className='absolute top-0 right-0 flex items-center h-full pr-3 pointer-events-none'>
              <img
                src={cardNetworkImageUrl}
                alt='Card Network'
                className='h-6'
              />
            </div>
          )}
        </div>
        {errors.cardNumber && (
          <p className='text-sm text-red-600 mt-1'>{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry and CVV Inputs */}
      <div className='grid grid-cols-2 gap-4 mb-4'>
        <div>
          <label
            htmlFor='card-expiry'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Expiry Date
          </label>
          <div
            id='card-expiry'
            ref={cardExpiryRef}
            className={`payment-input ${isFormDisabled ? 'opacity-50' : ''}`}
            data-testid='card-expiry-container'
          ></div>
          {errors.expiryDate && (
            <p className='text-sm text-red-600 mt-1'>{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='card-cvv'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            CVV
          </label>
          <div
            id='card-cvv'
            ref={cardCvvRef}
            className={`payment-input ${isFormDisabled ? 'opacity-50' : ''}`}
            data-testid='card-cvv-container'
          ></div>
          {errors.cvv && (
            <p className='text-sm text-red-600 mt-1'>{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Card Networks Selection (if needed) */}
      {cardNetworks.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-lg font-medium mb-2'>Select Card Network</h4>
          <div className='space-y-2'>
            {cardNetworks.map((network) => (
              <label key={network.network} className='flex items-center'>
                <input
                  type='radio'
                  name='cardNetwork'
                  value={network.network}
                  checked={selectedNetwork === network.network}
                  onChange={() => setSelectedNetwork(network.network)}
                  className='mr-2'
                  disabled={isFormDisabled}
                />
                <span>{network.displayName || network.network}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type='submit'
        disabled={isFormDisabled}
        className={`payment-button flex items-center justify-center ${isFormDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isFormDisabled ? (
          <>
            <svg
              className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          'Pay with Card'
        )}
      </button>
    </form>
  );
};
