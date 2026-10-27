'use client';

import { FC, useState } from 'react';
import type {
  IAssetsManager,
  PaymentMethodType,
  PrimerHeadlessCheckout,
} from '@primer-io/checkout-web';

interface RedirectPaymentButtonProps {
  paymentMethodType: PaymentMethodType;
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  assetsManager: IAssetsManager | null;
  displayName: string;
  iconUrl: string;
  isProcessing?: boolean;
}

export const RedirectPaymentButton: FC<RedirectPaymentButtonProps> = ({
  paymentMethodType,
  createPaymentMethodManager,
  displayName,
  iconUrl,
  isProcessing = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle button click to start the redirect payment flow
  const handleClick = async () => {
    setIsLoading(true);

    try {
      const manager = await createPaymentMethodManager(paymentMethodType);
      if (!manager) {
        throw new Error(`Payment method ${paymentMethodType} is not available`);
      }
      await manager.start();
    } catch (error) {
      console.error(`Error starting ${paymentMethodType} payment:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Button is disabled if global processing or local loading
  const isDisabled = isProcessing || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`payment-button bg-blue-500 flex items-center justify-center ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isDisabled ? (
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
        <>
          {iconUrl && (
            <img
              src={iconUrl}
              alt={displayName || paymentMethodType}
              className='h-6 mr-2'
            />
          )}
          {`Pay with ${displayName || paymentMethodType}`}
        </>
      )}
    </button>
  );
};
