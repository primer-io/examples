import { useEffect, useRef, useState } from 'react';
import './styles.css';
import { fetchClientToken } from './fetchClientToken.ts';

function App() {
  const [clientToken, setClientToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [applyingDiscount, setApplyingDiscount] = useState<boolean>(false);
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  const discountInputRef = useRef<HTMLInputElement | null>(null);
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

  // Handle discount code application
  const handleApplyDiscount = () => {
    const discountCode = discountInputRef.current?.value;

    if (!discountCode) {
      alert('Please enter a discount code');
      return;
    }

    setApplyingDiscount(true);

    // Simulate API call to validate discount code
    setTimeout(() => {
      setApplyingDiscount(false);
      setDiscountApplied(true);

      // Disable the input after applying discount
      if (discountInputRef.current) {
        discountInputRef.current.disabled = true;
      }
    }, 800);
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
              <div className='order-summary'>
                <h2>Order Summary</h2>
                <div className='order-item'>
                  <span>Premium Plan (Annual)</span>
                  <span>$199.00</span>
                </div>
                <div className='order-item'>
                  <span>Tax</span>
                  <span>$19.90</span>
                </div>
                <div className='order-total'>
                  <span>Total</span>
                  <span>$218.90</span>
                </div>
              </div>

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
                    </div>

                    <div className='form-row'>
                      <div className='form-field'>
                        <primer-input-card-holder-name></primer-input-card-holder-name>
                      </div>
                    </div>

                    {/* Discount code section */}
                    <div className='form-row discount-row'>
                      <primer-input-wrapper>
                        <primer-input-label slot='label'>
                          Discount Code
                        </primer-input-label>
                        <div slot='input' className='discount-field'>
                          <primer-input
                            id='discount-code'
                            ref={discountInputRef}
                          ></primer-input>
                          <button
                            className={`discount-button ${
                              discountApplied ? 'applied' : ''
                            } ${applyingDiscount ? 'loading' : ''}`}
                            onClick={handleApplyDiscount}
                            disabled={discountApplied || applyingDiscount}
                          >
                            {discountApplied
                              ? 'Applied'
                              : applyingDiscount
                                ? 'Applying...'
                                : 'Apply'}
                          </button>
                        </div>
                        {discountApplied && (
                          <span slot='error' className='discount-success'>
                            Discount applied successfully!
                          </span>
                        )}
                      </primer-input-wrapper>
                    </div>

                    {/* Submit button */}
                    <button type='submit' className='pay-button'>
                      Pay $218.90
                    </button>

                    <div className='secure-badge'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <rect
                          x='3'
                          y='11'
                          width='18'
                          height='11'
                          rx='2'
                          ry='2'
                        ></rect>
                        <path d='M7 11V7a5 5 0 0 1 10 0v4'></path>
                      </svg>
                      <span>Secure payment</span>
                    </div>
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
