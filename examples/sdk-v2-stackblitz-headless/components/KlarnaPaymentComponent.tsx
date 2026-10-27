'use client';

import React, { FC, useEffect, useState, useRef } from 'react';
import type { PrimerHeadlessCheckout } from '@primer-io/checkout-web';

interface KlarnaPaymentMethodCategory {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
}

interface KlarnaPaymentComponentProps {
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  onPaymentError: (err: any) => void;
  isProcessing: boolean;
}

export const KlarnaPaymentComponent: FC<KlarnaPaymentComponentProps> = ({
  createPaymentMethodManager,
  onPaymentError,
}) => {
  const [manager, setManager] = useState<any | null>(null);
  const [categories, setCategories] = useState<KlarnaPaymentMethodCategory[]>(
    [],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Container ref for handling height changes
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Klarna payment manager
  useEffect(() => {
    const initializeKlarna = async () => {
      try {
        const manager = await createPaymentMethodManager('KLARNA', {
          onPaymentMethodCategoriesChange: (event) => {
            setCategories(event || []);
          },
        });
        setManager(manager);
      } catch (error) {
        console.error('Error initializing Klarna:', error);
        onPaymentError(error);
      }
    };

    initializeKlarna();
  }, [createPaymentMethodManager, onPaymentError]);

  // Handle category selection
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (manager && containerRef.current) {
      try {
        await manager.renderCategory({
          paymentMethodCategoryId: categoryId,
          containerId: containerRef.current.id,
          onHeightChange: (newHeight: number) => {
            if (containerRef.current) {
              containerRef.current.style.height = `${newHeight}px`;
            }
          },
        });
      } catch (error) {
        console.error('Error rendering Klarna category:', error);
        onPaymentError(error);
      }
    }
  };

  // Start the payment process
  const handleStartPayment = async () => {
    if (manager && selectedCategoryId) {
      setIsProcessing(true);
      try {
        const response = await manager.start({
          paymentMethodCategoryId: selectedCategoryId,
        });

        if (response && response.outcome === 'DENIED') {
          throw new Error('Payment Denied');
        }
      } catch (error) {
        console.error('Error starting Klarna payment:', error);
        onPaymentError(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // If manager not initialized or no categories available
  if (!manager) {
    return (
      <div className='py-4 text-gray-500'>Initializing Klarna payment...</div>
    );
  }

  return (
    <div className='mt-6'>
      <h3 className='text-xl font-medium mb-4'>Klarna Payment Options</h3>

      {/* Payment Categories */}
      {categories.length > 0 ? (
        <div className='mb-4'>
          <p className='text-sm text-gray-600 mb-2'>Select a payment option:</p>
          <div className='space-y-2'>
            {categories.map((category) => (
              <button
                key={category.id}
                type='button'
                onClick={() => handleCategorySelect(category.id)}
                className={`w-full text-left p-3 border rounded-md flex items-center ${
                  selectedCategoryId === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {category.iconUrl && (
                  <img
                    src={category.iconUrl}
                    alt={category.name}
                    className='h-6 mr-2'
                  />
                )}
                <span className='font-medium'>{category.name}</span>
                {category.description && (
                  <span className='text-sm text-gray-500 ml-2'>
                    {category.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className='py-4 text-gray-500'>
          No Klarna payment options available.
        </div>
      )}

      {/* Klarna rendered content container */}
      <div
        id='klarna-category-container'
        ref={containerRef}
        className='mb-4 transition-all duration-300 overflow-hidden'
        style={{ height: '0px' }}
      ></div>

      {/* Submit Button */}
      {selectedCategoryId && (
        <button
          type='button'
          onClick={handleStartPayment}
          disabled={isProcessing}
          className='payment-button'
        >
          {isProcessing
            ? 'Processing...'
            : `Pay with ${
                categories.find((cat) => cat.id === selectedCategoryId)?.name ||
                'Klarna'
              }`}
        </button>
      )}
    </div>
  );
};
