'use client';

import React, { FC, useEffect, useState } from 'react';
import type { PrimerHeadlessCheckout } from '@primer-io/checkout-web';

interface ACHPaymentComponentProps {
  createPaymentMethodManager: PrimerHeadlessCheckout['createPaymentMethodManager'];
  onPaymentError: (err: any) => void;
  isProcessing: boolean;
}

export const ACHPaymentComponent: FC<ACHPaymentComponentProps> = ({
  createPaymentMethodManager,
  onPaymentError,
}) => {
  const [manager, setManager] = useState<any | null>(null);
  const [showMandate, setShowMandate] = useState(false);
  const [isConfirmingMandate, setIsConfirmingMandate] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the ACH payment manager
  useEffect(() => {
    const initializeACH = async () => {
      try {
        const manager = await createPaymentMethodManager('STRIPE_ACH', {
          onCollectBankAccountDetailsComplete: () => {
            console.log('Bank account details collected');
            setShowMandate(true);
          },
        });
        setManager(manager);
      } catch (error) {
        console.error('Error initializing ACH:', error);
        onPaymentError(error);
      }
    };

    initializeACH();
  }, [createPaymentMethodManager, onPaymentError]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email is required';
    } else if (!/^\S+@\S+$/i.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (manager) {
      setIsSubmitting(true);
      try {
        const validationError = await manager.start({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailAddress: formData.emailAddress,
        });

        if (validationError) {
          console.error('Validation Error:', validationError);
          onPaymentError(validationError);
        } else {
          await manager.collectBankAccountDetails();
          // Mandate will be displayed via onCollectBankAccountDetailsComplete
        }
      } catch (error) {
        console.error('Error during ACH payment:', error);
        onPaymentError(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Handle confirming mandate
  const handleConfirmMandate = async () => {
    if (manager) {
      setIsConfirmingMandate(true);
      try {
        await manager.confirmMandate();
      } catch (error) {
        console.error('Error confirming mandate:', error);
        onPaymentError(error);
      } finally {
        setIsConfirmingMandate(false);
      }
    }
  };

  // If manager not initialized, don't render anything
  if (!manager) {
    return (
      <div className='py-4 text-gray-500'>Initializing ACH payment...</div>
    );
  }

  return (
    <div className='mt-6'>
      <h3 className='text-xl font-medium mb-4'>ACH Bank Transfer</h3>

      {!showMandate ? (
        <form onSubmit={handleSubmit}>
          {/* First Name Input */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              First Name
              <input
                type='text'
                name='firstName'
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder='John'
                className='payment-input mt-1'
              />
            </label>
            {errors.firstName && (
              <p className='text-sm text-red-600 mt-1'>{errors.firstName}</p>
            )}
          </div>

          {/* Last Name Input */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Last Name
              <input
                type='text'
                name='lastName'
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder='Doe'
                className='payment-input mt-1'
              />
            </label>
            {errors.lastName && (
              <p className='text-sm text-red-600 mt-1'>{errors.lastName}</p>
            )}
          </div>

          {/* Email Input */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
              <input
                type='email'
                name='emailAddress'
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder='john.doe@example.com'
                className='payment-input mt-1'
              />
            </label>
            {errors.emailAddress && (
              <p className='text-sm text-red-600 mt-1'>{errors.emailAddress}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='payment-button'
          >
            {isSubmitting ? 'Processing...' : 'Proceed to Bank Account Details'}
          </button>
        </form>
      ) : (
        <div className='p-4 border border-gray-200 rounded-md'>
          {/* Display the mandate text */}
          <p className='mb-4'>
            By clicking confirm, you agree to the ACH payment terms and
            authorize this transaction.
          </p>
          <button
            onClick={handleConfirmMandate}
            disabled={isConfirmingMandate}
            className='payment-button'
          >
            {isConfirmingMandate ? 'Processing...' : 'Confirm Mandate'}
          </button>
        </div>
      )}
    </div>
  );
};
