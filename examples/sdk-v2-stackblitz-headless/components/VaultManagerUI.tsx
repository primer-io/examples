'use client';

import { FC, useEffect, useState } from 'react';
import type {
  HeadlessVaultManager,
  VaultedPaymentMethod,
} from '@primer-io/checkout-web';

interface VaultManagerUIProps {
  vaultManager: HeadlessVaultManager | null;
  isProcessing?: boolean;
}

export const VaultManagerUI: FC<VaultManagerUIProps> = ({
  vaultManager,
  isProcessing,
}) => {
  const [vaultedPaymentMethods, setVaultedPaymentMethods] = useState<
    VaultedPaymentMethod[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch saved payment methods when component mounts
  useEffect(() => {
    const fetchVaultedMethods = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!vaultManager) return;

        // Fetch the vaulted payment methods from Primer
        const methods = await vaultManager.fetchVaultedPaymentMethods();
        setVaultedPaymentMethods(methods);
      } catch (err) {
        console.error('Error fetching vaulted payment methods:', err);
        setError('Failed to load payment methods.');
      } finally {
        setIsLoading(false);
      }
    };

    if (vaultManager) {
      fetchVaultedMethods();
    }
  }, [vaultManager]);

  // Delete a saved payment method
  const handleDeleteMethod = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!vaultManager) return;

      // Delete the vaulted payment method
      await vaultManager.deleteVaultedPaymentMethod(id);

      // Update the UI to remove the deleted method
      setVaultedPaymentMethods((prev) =>
        prev.filter((method) => method.id !== id),
      );
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method.');
    } finally {
      setIsLoading(false);
    }
  };

  // Use a saved payment method to make a payment
  const handleStartPayment = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!vaultManager) return;

      // Start the payment flow using the saved payment method
      await vaultManager.startPaymentFlow(id);
      setIsSuccess(true);
    } catch (err) {
      console.error('Error starting payment flow:', err);
      setError('Failed to start payment flow.');
    } finally {
      setIsLoading(false);
    }
  };

  if (vaultedPaymentMethods.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='py-4 text-gray-600'>Loading saved payment methods...</div>
    );
  }

  if (isSuccess) {
    return (
      <div className='bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4'>
        Payment completed successfully!
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4'>
        {error}
      </div>
    );
  }

  if (isProcessing) {
    return null;
  }

  return (
    <div className='mb-6'>
      <h3 className='text-xl font-medium mb-4'>Saved Payment Methods</h3>
      <ul className='space-y-3'>
        {vaultedPaymentMethods.map((method) => (
          <li key={method.id} className='border border-gray-200 rounded-md p-4'>
            <div className='flex justify-between items-center'>
              <div>
                <p className='font-medium'>{method.paymentInstrumentType}</p>
                {!!method.paymentInstrumentData.last4Digits && (
                  <p className='text-sm text-gray-600'>
                    •••• {String(method.paymentInstrumentData.last4Digits)}
                  </p>
                )}
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleStartPayment(method.id)}
                  className='bg-blue-500 text-white px-3 py-1 rounded-md text-sm'
                >
                  Pay
                </button>
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className='bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm'
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
