import { useEffect, useState } from 'react';
import './styles.css';
import { fetchClientToken } from './fetchClientToken.ts';

const CHECKOUT_CONFIG = {
  paypal: {
    buttonColor: 'blue',
  },
};

function App() {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  if (isLoading) {
    return <div className='loading'>Loading checkout...</div>;
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
