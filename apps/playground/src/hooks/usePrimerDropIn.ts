import { useState, useEffect } from 'react';
import {
  PrimerCheckout,
  UniversalCheckoutOptions,
} from '@primer-io/checkout-web';

const { Primer } = window;

export function usePrimerDropIn(
  container: string,
  clientToken?: string,
  config?: Omit<UniversalCheckoutOptions, 'container'>,
) {
  const [primerCheckout, setPrimerCheckout] = useState<PrimerCheckout | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | unknown | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !clientToken) {
      return;
    }

    const onLoaded = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Showing drop-in');
        if (primerCheckout) {
          console.log('Tearing down existing drop-in');
          primerCheckout.teardown();
        }
        const newCheckout = await Primer.showUniversalCheckout(clientToken, {
          ...config,
          container,
          onCheckoutComplete: config?.onCheckoutComplete,
          onCheckoutFail: (err, data, handler) => {
            setError(err);
            config?.onCheckoutFail?.(err, data, handler);
          },
        });

        setPrimerCheckout(newCheckout);
      } catch (err: unknown) {
        console.error('Failed to load Primer drop-in:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    onLoaded();
  }, [clientToken, container, config]);

  return { primerCheckout, isLoading, error };
}
