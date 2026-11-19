import { useEffect, useState } from 'react';
import './styles.css';
import { createClientSession } from './createClientSession.ts';

const CHECKOUT_CONFIG = {
  paypal: {
    buttonColor: 'blue',
  },
};

function App() {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Create a client session on component mount
  useEffect(() => {
    createClientSession()
      .then(setClientToken)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className='loading'>Loading checkout...</div>;
  }

  if (error) {
    return (
      <div className='loading' role='alert'>
        {error}
      </div>
    );
  }

  return (
    <div className='app'>
      <h1>Custom Checkout Layout</h1>

      <primer-checkout client-token={clientToken} options={CHECKOUT_CONFIG}>
        <primer-main slot='main'>
          <div slot='payments' className='payment-methods'>
            {/* Card payment at the top */}
            <div className='card-container'>
              <h2>Pay with Card</h2>
              <primer-payment-method type='PAYMENT_CARD'></primer-payment-method>
            </div>

            <primer-error-message-container></primer-error-message-container>

            {/* PayPal with special styling */}
            <div className='paypal-container'>
              <h2>Quick Checkout</h2>
              <primer-payment-method type='PAYPAL'></primer-payment-method>
            </div>

            {/* Other payment methods using container */}
            <div className='other-methods'>
              <h2>Alternative Payment Methods</h2>
              <primer-payment-method-container exclude='PAYMENT_CARD,PAYPAL'></primer-payment-method-container>
            </div>
          </div>
        </primer-main>
      </primer-checkout>
    </div>
  );
}

export default App;
