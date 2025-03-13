'use client';

import React, { FC, useEffect, useState, useRef } from 'react';
import {
  IHeadlessPaymentMethodButton,
  INativePaymentMethodManager,
  PaymentMethodType,
  PrimerHeadlessCheckout,
} from '@primer-io/checkout-web';

interface NativePaymentButtonProps {
  paymentMethodType: PaymentMethodType;
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  displayName: string;
  iconUrl: string;
  isProcessing?: boolean;
}

type NativePaymentMethodTypes = 'PAYPAL' | 'APPLE_PAY' | 'GOOGLE_PAY';

export const NativePaymentButton: FC<NativePaymentButtonProps> = ({
  paymentMethodType,
  createPaymentMethodManager,
  displayName,
  isProcessing = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  // Use refs to store instances
  const buttonInstanceRef = useRef<IHeadlessPaymentMethodButton | null>(null);
  const managerRef = useRef<INativePaymentMethodManager | null>(null);

  // Use a ref for the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Update button state when isProcessing changes
  useEffect(() => {
    if (buttonInstanceRef.current && isRendered) {
      try {
        // Disable the button when processing payment
        buttonInstanceRef.current.setDisabled(isProcessing);
      } catch (error) {
        console.error(
          `Error updating button state for ${paymentMethodType}:`,
          error,
        );
      }
    }
  }, [isProcessing, paymentMethodType, isRendered]);

  // Initialize the payment method manager
  useEffect(() => {
    let isMounted = true;

    const initManager = async () => {
      try {
        // Create the payment method manager
        const manager = await createPaymentMethodManager(
          paymentMethodType as NativePaymentMethodTypes,
        );

        if (!isMounted) return;

        if (!manager) {
          setError(`${paymentMethodType} is not available`);
          return;
        }

        managerRef.current = manager;
      } catch (error) {
        console.error(`Error setting up ${paymentMethodType} manager:`, error);
        if (isMounted) {
          setError(`Error initializing ${paymentMethodType}: ${error}`);
        }
      }
    };

    // Clean up previous manager if any
    if (managerRef.current) {
      try {
        managerRef.current = null;
      } catch (e) {
        console.error('Error cleaning up manager:', e);
      }
    }

    initManager();

    return () => {
      isMounted = false;
    };
  }, [paymentMethodType, createPaymentMethodManager]);

  // Render the button once the manager is available and container is in DOM
  useEffect(() => {
    let isMounted = true;

    const renderButton = async () => {
      if (!managerRef.current || !containerRef.current || isRendered) {
        return;
      }
      try {
        // Clean up any existing button first
        if (buttonInstanceRef.current) {
          try {
            buttonInstanceRef.current.clean();
            buttonInstanceRef.current = null;
          } catch (e) {
            console.error('Error unmounting previous button:', e);
          }
        }

        // Create the button
        const button = managerRef.current?.createButton();

        if (!button || !isMounted) {
          return;
        }

        buttonInstanceRef.current = button;

        // Render the button to the container
        await button.render(containerRef.current.id, {
          style: {
            buttonColor: 'black',
            height: 40,
            width: '100%',
          },
        });

        // Set initial disabled state if necessary
        if (isProcessing && buttonInstanceRef.current) {
          buttonInstanceRef.current.setDisabled(true);
        }

        if (isMounted) {
          setIsRendered(true);
          setError(null);
        }
      } catch (renderError) {
        console.error(
          `Error rendering ${paymentMethodType} button:`,
          renderError,
        );
        if (isMounted) {
          setError(`Error rendering ${paymentMethodType}: ${renderError}`);
        }
      }
    };

    renderButton();

    return () => {
      isMounted = false;
    };
  }, [paymentMethodType, isRendered, isProcessing]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Unmount button if it exists
      if (buttonInstanceRef.current) {
        try {
          buttonInstanceRef.current.clean();
        } catch (e) {
          console.error('Error unmounting button:', e);
        }
        buttonInstanceRef.current = null;
      }

      // Clear manager
      managerRef.current = null;
    };
  }, []);

  // Render the container for the native button
  return (
    <div className='w-full'>
      {error && <div className='text-sm text-red-600 mb-2'>{error}</div>}
      <div
        id={`${paymentMethodType.toLowerCase()}-button`}
        ref={containerRef}
        className={`border border-transparent w-full ${isProcessing ? 'opacity-50' : ''}`}
      ></div>
      {!isRendered && !error && (
        <div className='text-sm text-gray-500 mt-1'>
          Initializing {displayName || paymentMethodType} payment...
        </div>
      )}
      {isProcessing && isRendered && (
        <div className='text-sm text-blue-500 mt-1 flex items-center justify-center'>
          <svg
            className='animate-spin -ml-1 mr-2 h-4 w-4'
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
        </div>
      )}
    </div>
  );
};
