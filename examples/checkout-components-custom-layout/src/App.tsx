import { useEffect, useRef, useState } from 'react';
import './styles.css';
import { fetchClientToken } from './fetchClientToken.ts';

// Define types for payment methods
interface InitializedPaymentMethod {
  type: string;
  name: string;
}

function App() {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [card, setCard] = useState<InitializedPaymentMethod | undefined>(
    undefined,
  );
  const [payPal, setPayPal] = useState<InitializedPaymentMethod | undefined>(
    undefined,
  );
  const [otherMethods, setOtherMethods] = useState<InitializedPaymentMethod[]>(
    [],
  );

  const checkoutRef = useRef<HTMLElementTagNameMap['primer-checkout']>(null);

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

  // Add event listener for payment methods update
  useEffect(() => {
    if (!checkoutRef.current || !clientToken) return;

    const handlePaymentMethodsUpdate = (event: any) => {
      const paymentMethods = event.detail;

      // Get specific payment methods
      const cardMethod = paymentMethods.get('PAYMENT_CARD');
      const payPalMethod = paymentMethods.get('PAYPAL');

      // Get other payment methods, filtering out card and PayPal
      const others = paymentMethods
        .toArray()
        .filter(
          (method: InitializedPaymentMethod) =>
            method.type !== 'PAYMENT_CARD' && method.type !== 'PAYPAL',
        );

      setCard(cardMethod);
      setPayPal(payPalMethod);
      setOtherMethods(others);
    };

    checkoutRef.current.addEventListener(
      'primer-payment-methods-updated',
      handlePaymentMethodsUpdate,
    );

    return () => {
      checkoutRef.current?.removeEventListener(
        'primer-payment-methods-updated',
        handlePaymentMethodsUpdate,
      );
    };
  }, [clientToken, checkoutRef.current]);

  if (isLoading) {
    return <div className='loading'>Loading checkout...</div>;
  }

  return (
    <div className='app'>
      <h1>Custom Checkout Layout</h1>

      <primer-checkout client-token={clientToken} ref={checkoutRef}>
        <primer-main slot='main'>
          <div slot='payments' className='payment-methods'>
            {/* Card payment at the top */}
            {card && (
              <div className='card-container'>
                <h2>Pay with Card</h2>
                <primer-payment-method type={card.type}></primer-payment-method>
              </div>
            )}

            {/* PayPal with special styling */}
            {payPal && (
              <div className='paypal-container'>
                <h2>Quick Checkout</h2>
                <primer-payment-method
                  type={payPal.type}
                ></primer-payment-method>
              </div>
            )}

            {/* Other payment methods */}
            {otherMethods.length > 0 && (
              <div className='other-methods'>
                <h2>Alternative Payment Methods</h2>
                <div className='methods-grid'>
                  {otherMethods.map((method) => (
                    <div key={method.type} className='method-item'>
                      <primer-payment-method
                        type={method.type}
                      ></primer-payment-method>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </primer-main>
      </primer-checkout>
    </div>
  );
}

export default App;
