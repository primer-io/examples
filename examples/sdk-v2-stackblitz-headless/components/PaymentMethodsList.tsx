'use client';

import { FC } from 'react';
import type {
  IAssetsManager,
  PaymentMethodType,
  PrimerHeadlessCheckout,
} from '@primer-io/checkout-web';
import { RedirectPaymentButton } from './RedirectPaymentButton';
import { NativePaymentButton } from './NativePaymentButton';
import { EnhancedPaymentMethodInfo } from '@/hooks/usePrimerHeadless';

interface PaymentMethodsListProps {
  paymentMethods: EnhancedPaymentMethodInfo[];
  selectedMethod: string | null;
  onSelectMethod: (methodType: string) => void;
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  assetsManager: IAssetsManager | null;
  isProcessing?: boolean;
}

export const PaymentMethodsList: FC<PaymentMethodsListProps> = ({
  paymentMethods,
  selectedMethod,
  onSelectMethod,
  createPaymentMethodManager,
  assetsManager,
  isProcessing = false,
}) => {
  // No payment methods available
  if (paymentMethods.length === 0) {
    return (
      <div className='py-4 text-gray-500'>No payment methods available.</div>
    );
  }

  // Group methods by type for display
  const standardMethods = paymentMethods.filter((method) => {
    return (
      !method?.managerType ||
      (method?.managerType !== 'REDIRECT' && method?.managerType !== 'NATIVE')
    );
  });

  const redirectMethods = paymentMethods.filter((method) => {
    return method?.managerType === 'REDIRECT' && method.isAvailable;
  });

  const nativeMethods = paymentMethods.filter((method) => {
    return method?.managerType === 'NATIVE' && method.isAvailable;
  });

  return (
    <div className='mb-6'>
      <h3 className='text-xl font-medium mb-4'>Payment Methods</h3>
      <div className='space-y-3'>
        {/* Standard payment methods with radio button selection */}
        {standardMethods.map((method) => (
          <div key={method.type} className='payment-method-item'>
            <label
              className={`flex items-center cursor-pointer p-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type='radio'
                name='paymentMethod'
                value={method.type}
                checked={selectedMethod === method.type}
                onChange={() => onSelectMethod(method.type)}
                className='mr-3'
                disabled={isProcessing}
              />
              {method.iconUrl && (
                <img
                  src={method.iconUrl}
                  alt={method.displayName}
                  className='h-6 mr-2'
                />
              )}
              <span>{method.displayName}</span>
            </label>
          </div>
        ))}

        {/* Redirect payment methods */}
        {redirectMethods.map((method) => (
          <div key={method.type} className='payment-method-item'>
            <RedirectPaymentButton
              paymentMethodType={method.type as PaymentMethodType}
              createPaymentMethodManager={createPaymentMethodManager}
              assetsManager={assetsManager}
              displayName={method.displayName}
              iconUrl={method.iconUrl}
              isProcessing={isProcessing}
            />
          </div>
        ))}

        {/* Native payment methods */}
        {nativeMethods.map((method) => (
          <div key={method.type} className='payment-method-item'>
            <NativePaymentButton
              paymentMethodType={method.type as PaymentMethodType}
              createPaymentMethodManager={createPaymentMethodManager}
              displayName={method.displayName}
              iconUrl={method.iconUrl}
              isProcessing={isProcessing}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
