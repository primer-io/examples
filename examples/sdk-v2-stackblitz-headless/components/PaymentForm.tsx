'use client';

import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrimerHeadless } from '@/hooks/usePrimerHeadless';
import { CardPaymentForm } from './CardPaymentForm';
import { PaymentMethodsList } from './PaymentMethodsList';
import { VaultManagerUI } from './VaultManagerUI';
import { ACHPaymentComponent } from './ACHPaymentComponent';
import { KlarnaPaymentComponent } from './KlarnaPaymentComponent';

interface PaymentFormProps {
  clientToken?: string;
}

export const PaymentForm: FC<PaymentFormProps> = ({ clientToken }) => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Initialize the Primer SDK using our enhanced custom hook
  const {
    isLoading,
    isProcessing,
    isSuccess,
    error,
    availablePaymentMethods,
    createPaymentMethodManager,
    assetsManager,
    vaultManager,
    setIsSuccessManually,
  } = usePrimerHeadless({
    clientToken,
  });

  // Handle redirect after successful payment
  useEffect(() => {
    if (isSuccess) {
      // Show success state for 2 seconds, then redirect
      setTimeout(() => {
        router.push('/success'); // You can create this success page later
      }, 2000);
    }
  }, [isSuccess, router]);

  // Auto-select the first available payment method
  useEffect(() => {
    if (availablePaymentMethods.length > 0 && !selectedMethod) {
      // Auto-select the Payment Card method if available
      const paymentCardMethod = availablePaymentMethods.find(
        (method) => method.type === 'PAYMENT_CARD',
      );
      if (paymentCardMethod) {
        setSelectedMethod(paymentCardMethod.type);
      } else {
        // Select the first available method
        setSelectedMethod(availablePaymentMethods[0].type);
      }
    }
  }, [availablePaymentMethods, selectedMethod]);

  // Handler for payment method selection
  const handleMethodSelect = (methodType: string) => {
    setSelectedMethod(methodType);
  };

  // Handler for payment errors
  const handlePaymentError = (err: any) => {
    console.error('Payment error:', err);
  };

  // Determine which payment component to show based on selected method
  const renderSelectedPaymentMethod = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod) {
      case 'PAYMENT_CARD':
        return (
          <CardPaymentForm
            createPaymentMethodManager={createPaymentMethodManager}
            onPaymentError={handlePaymentError}
            assetsManager={assetsManager}
            isProcessing={isProcessing}
          />
        );
      case 'STRIPE_ACH':
        return (
          <ACHPaymentComponent
            createPaymentMethodManager={createPaymentMethodManager}
            onPaymentError={handlePaymentError}
            isProcessing={isProcessing}
          />
        );
      case 'KLARNA':
        return (
          <KlarnaPaymentComponent
            createPaymentMethodManager={createPaymentMethodManager}
            onPaymentError={handlePaymentError}
            isProcessing={isProcessing}
          />
        );
      default:
        return (
          <div className='mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-md'>
            <p className='text-yellow-700'>
              Payment method &#34;{selectedMethod}&#34; is selected but no form
              component is available.
            </p>
          </div>
        );
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Payment</h2>

      {/* Loading indicator */}
      {isLoading && (
        <div className='py-4 text-center text-gray-600'>
          Loading payment options...
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className='py-4 text-center text-gray-600 flex items-center justify-center'>
          <svg
            className='animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500'
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
          Processing payment...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4'>
          {String(error)}
        </div>
      )}

      {/* Payment form */}
      {!isLoading && !error && !isSuccess && (
        <>
          {/* Payment methods list with enhanced data */}
          <PaymentMethodsList
            paymentMethods={availablePaymentMethods}
            selectedMethod={selectedMethod}
            onSelectMethod={handleMethodSelect}
            createPaymentMethodManager={createPaymentMethodManager}
            assetsManager={assetsManager}
            isProcessing={isProcessing}
          />

          {/* Vault manager for saved payment methods */}
          <VaultManagerUI
            vaultManager={vaultManager}
            isProcessing={isProcessing}
          />

          {/* Render the selected payment method component */}
          {renderSelectedPaymentMethod()}
        </>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className='bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-center justify-center'>
          <svg
            className='w-6 h-6 text-green-500 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
          Payment completed successfully! Redirecting...
        </div>
      )}
    </div>
  );
};
