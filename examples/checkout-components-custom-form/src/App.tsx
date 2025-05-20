import { PrimerCheckoutComponent } from '@primer-io/primer-js';
import { useEffect, useRef, useState } from 'react';
import { DiscountCodeSection } from './components/DiscountCodeSection';
import { OrderSummary } from './components/OrderSummary';
import { SecureBadge } from './components/SecureBadge';
import { TestCardsTable } from './components/TestCardsTable';
import { fetchClientToken } from './fetchClientToken.ts';
import './styles.css';

/**
 * Main App component for the custom checkout form example
 *
 * This component handles the overall layout and demonstrates how to build
 * a custom payment form layout with Primer components.
 */
function App() {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const checkoutRef = useRef<PrimerCheckoutComponent | null>(null);

  // Order details - In a real app, this would likely come from an API or state management
  const orderItems = [{ name: 'Premium Plan (Annual)', price: '$199.00' }];
  const taxAmount = '$19.90';
  const totalAmount = '$218.90';

  // Fetch client token on component mount
  useEffect(() => {
    async function getToken() {
      setIsLoading(true);
      const response = await fetchClientToken('a1b2c3d4e5f6g7h8i9j0');
      if (response.success) {
        setClientToken(response.clientToken);
      } else {
        console.error('Failed to fetch client token:', response.error);
      }
      setIsLoading(false);
    }

    getToken();
  }, []);

  useEffect(() => {
    if (clientToken && checkoutRef.current) {
      checkoutRef.current.addEventListener('primer:state-change', (event) => {
        setIsProcessing(!!event.detail?.isProcessing);
      });
    }
  }, [clientToken]);

  // Handle discount code application
  const handleDiscountApplied = (code: string) => {
    console.log(`Discount code applied: ${code}`);
    // In a real app, you would update the order total or apply other business logic
  };

  if (isLoading) {
    return <div className='loading'>Loading checkout...</div>;
  }

  return (
    <div className='app'>
      <div className='checkout-container'>
        <div className='checkout-header'>
          <h1>Complete Your Order</h1>
          <p className='checkout-subtitle'>
            Secure payment processing by Primer
          </p>
        </div>

        <primer-checkout client-token={clientToken} ref={checkoutRef}>
          <primer-main slot='main'>
            <div slot='payments' className='payments-container'>
              {/* Test card information component */}
              <TestCardsTable />

              {/* Order summary component */}
              <OrderSummary
                items={orderItems}
                taxAmount={taxAmount}
                totalAmount={totalAmount}
              />

              {/* Payment form - showing the primary card form elements directly in App.tsx */}
              <div className='payment-form'>
                <h2>Payment Details</h2>
                <primer-card-form>
                  <div slot='card-form-content' className='card-form-layout'>
                    {/* Card number and CVV on same line */}
                    <div className='form-row'>
                      <div className='form-field card-number'>
                        <primer-input-card-number></primer-input-card-number>
                      </div>
                      <div className='form-field cvv'>
                        <primer-input-cvv></primer-input-cvv>
                      </div>
                    </div>

                    {/* Expiry date and cardholder name on separate lines */}
                    <div className='form-row'>
                      <div className='form-field expiry'>
                        <primer-input-card-expiry></primer-input-card-expiry>
                      </div>

                      <div className='form-field cardholder-name'>
                        <primer-input-card-holder-name></primer-input-card-holder-name>
                      </div>
                    </div>

                    {/* Discount code section as a separate component */}
                    <DiscountCodeSection
                      onApplyDiscount={handleDiscountApplied}
                    />

                    {/* Submit button */}
                    <primer-button type='submit' loading={isProcessing}>
                      Pay {totalAmount}
                    </primer-button>

                    {/* Secure badge as a separate component */}
                    <SecureBadge />
                  </div>
                </primer-card-form>
              </div>
            </div>
          </primer-main>
        </primer-checkout>
      </div>
    </div>
  );
}

export default App;
