import './App.css';
import { Fragment, useLayoutEffect, useState } from 'react';
import { InitializedPaymentMethod, PrimerCheckout } from '../types/sdk.ts';
import { clientToken } from './clientToken.ts';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [payPal, setPayPal] = useState<InitializedPaymentMethod | undefined>(
    undefined,
  );
  const [card, setCard] = useState<InitializedPaymentMethod | undefined>(
    undefined,
  );
  const [otherPaymentMethods, setOtherPaymentMethods] = useState<
    InitializedPaymentMethod[]
  >([]);

  useLayoutEffect(() => {
    const primerCheckout = document.querySelector(
      'primer-checkout',
    ) as PrimerCheckout;
    primerCheckout?.addEventListener('primer-payment-methods', (evt) => {
      const paymentMethods = evt?.detail;
      const card = paymentMethods.get('PAYMENT_CARD');
      const payPal = paymentMethods.get('PAYPAL');

      const otherPaymentMethods = paymentMethods
        .toArray()
        .filter(
          (method) =>
            method.type !== 'PAYPAL' && method.type !== 'PAYMENT_CARD',
        );

      setPayPal(payPal);
      setCard(card);
      setOtherPaymentMethods(otherPaymentMethods);
    });

    primerCheckout?.addEventListener('primer-state', (evt) => {
      setIsProcessing(evt.detail.isProcessing);
    });
  }, []);

  return (
    <main>
      <div className='container'>
        {isProcessing && (
          <div className='loader-screen'>
            <div className='firework'></div>
            <div className='firework'></div>
            <div className='firework'></div>
            <div className='firework'></div>

            <div className='sparkle'></div>
            <div className='sparkle'></div>
            <div className='sparkle'></div>
            <div className='sparkle'></div>
            <div className='sparkle'></div>
          </div>
        )}
        <primer-checkout clientToken={clientToken}>
          <primer-main>
            <div slot='main'>
              {payPal && (
                <article
                  className='paypal'
                  data-tooltip='We offer 1% cashback on all PayPal transactions!'
                  data-placement='bottom'
                >
                  <primer-payment-method
                    type={payPal.type}
                  ></primer-payment-method>
                </article>
              )}
              {otherPaymentMethods.map(({ type, assets }) => (
                <Fragment key={type}>
                  <details>
                    <summary>
                      <h2>{assets?.displayName} </h2>
                      {assets && (
                        <img
                          src={
                            assets.iconUrl?.light ||
                            assets.iconUrl?.colored ||
                            assets.iconUrl?.dark
                          }
                          alt={type}
                        />
                      )}
                    </summary>
                    <div>
                      <primer-payment-method
                        type={type}
                      ></primer-payment-method>
                    </div>
                  </details>
                  <hr />
                </Fragment>
              ))}
              {card && (
                <primer-card-form>
                  <article className='cardForm'>
                    <div className='inlineForm'>
                      <primer-card-form-cardnumber
                        label='忍者のクレジット番号'
                        placeholder='1234 5678 9012 忍者'
                      ></primer-card-form-cardnumber>

                      <primer-card-form-expiry
                        label='有効期限？永遠です！'
                        placeholder='12/99'
                      ></primer-card-form-expiry>

                      <primer-card-form-cvv
                        label='秘密の暗号🔒'
                        placeholder='•••'
                      ></primer-card-form-cvv>
                    </div>
                    <primer-card-form-name
                      label='伝説の持ち主の名前'
                      placeholder='佐藤 一郎 (伝説)'
                    ></primer-card-form-name>
                    <primer-input-wrapper>
                      <span slot='label'>
                        <primer-input-label>Discount Code</primer-input-label>
                      </span>
                      <primer-input
                        slot='input'
                        className='extraInput'
                      ></primer-input>
                    </primer-input-wrapper>
                  </article>
                  <button className='sparklyButton' type='submit'>
                    オイラーはすごい!
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </button>
                </primer-card-form>
              )}
            </div>
          </primer-main>
        </primer-checkout>
      </div>
    </main>
  );
}

export default App;
