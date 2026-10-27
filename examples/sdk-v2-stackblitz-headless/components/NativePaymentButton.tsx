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

  // Use refs to store instances
  const buttonRef = useRef<IHeadlessPaymentMethodButton | null>(null);
  const managerRef = useRef<INativePaymentMethodManager | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize manager and render button
  useEffect(() => {
    let isActive = true;

    const initializeButton = async () => {
      try {
        // Create the payment method manager
        const manager = await createPaymentMethodManager(
          paymentMethodType as NativePaymentMethodTypes,
        );

        if (!isActive || !manager || !containerRef.current) return;

        managerRef.current = manager;

        // Create and render the button
        const button = manager.createButton();
        if (!button) return;

        buttonRef.current = button;

        await button.render(containerRef.current.id, {
          style: {
            buttonColor: 'black',
            height: 40,
            width: '100%',
          },
        });

        // Set disabled state if we're processing
        if (isProcessing && buttonRef.current) {
          buttonRef.current.setDisabled(true);
        }
      } catch (err) {
        console.error(`Error initializing ${paymentMethodType}:`, err);
        if (isActive) {
          setError(`Error initializing ${paymentMethodType}`);
        }
      }
    };

    initializeButton();

    // Clean up on unmount
    return () => {
      isActive = false;

      if (buttonRef.current) {
        try {
          buttonRef.current.clean();
          buttonRef.current = null;
        } catch (e) {
          console.error('Error cleaning up button:', e);
        }
      }

      managerRef.current = null;
    };
  }, [paymentMethodType, createPaymentMethodManager]);

  // Update button disabled state when isProcessing changes
  useEffect(() => {
    if (buttonRef.current) {
      try {
        buttonRef.current.setDisabled(isProcessing);
      } catch (err) {
        console.error('Failed to update button state:', err);
      }
    }
  }, [isProcessing]);

  return (
    <div className='w-full'>
      {error && <div className='text-sm text-red-600 mb-2'>{error}</div>}
      <div
        id={`${paymentMethodType.toLowerCase()}-button`}
        ref={containerRef}
        className='border border-transparent w-full'
      ></div>
      {isProcessing && (
        <div className='text-sm text-blue-500 mt-1 text-center'>
          Processing payment...
        </div>
      )}
    </div>
  );
};
