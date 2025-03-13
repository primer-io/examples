'use client';
import { Primer, PrimerCheckout } from '@primer-io/checkout-web';
import { useCallback, useEffect, useState, useRef } from 'react';

interface UsePrimerDropInOptions {
  clientToken?: string | null;
  containerId?: string;
  onCheckoutComplete?: (data: any) => void;
}

export function usePrimerDropIn({
  clientToken,
  containerId = 'container',
  onCheckoutComplete,
}: UsePrimerDropInOptions = {}) {
  // Store instance in a ref to persist across renders
  const primerInstanceRef = useRef<PrimerCheckout | null>(null);

  // Track if initialization is in progress for this specific hook instance
  const isInitializingRef = useRef<boolean>(false);

  // Track current client token to detect changes
  const previousTokenRef = useRef<string | null | undefined>(null);

  // State for component
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize or reinitialize Primer when client token changes
  useEffect(() => {
    if (!clientToken || typeof window === 'undefined') return;

    // Skip if no change in token (prevents unnecessary reinitializations)
    if (clientToken === previousTokenRef.current && primerInstanceRef.current) {
      return;
    }

    // Skip if already initializing in this instance
    if (isInitializingRef.current) {
      return;
    }

    // Start initialization
    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    const initialize = async () => {
      try {
        // Tear down any existing checkout for this instance
        if (primerInstanceRef.current) {
          await primerInstanceRef.current.teardown();
          primerInstanceRef.current = null;
        }

        // Initialize drop-in checkout with new token
        const checkout = await Primer.showUniversalCheckout(clientToken, {
          // Target the container element
          container: `#${containerId}`,
          // Event handlers
          onCheckoutComplete: (data: any) => {
            console.log('Checkout completed', data);
            setIsSuccess(true);
            setIsLoading(false);
            if (onCheckoutComplete) {
              onCheckoutComplete(data);
            }
          },
          onCheckoutFail: (err: any, data: any, handler: any) => {
            console.error('Checkout failed:', err);
            setError(err as Error);
            setIsLoading(false);
            return handler?.showErrorMessage();
          },

          // Additional standard configuration
          apiVersion: '2.4',
        });

        if (!checkout) {
          throw new Error('Failed to create drop-in checkout');
        }

        // Store instance in this hook's ref
        primerInstanceRef.current = checkout;
        // Update the token ref to track changes
        previousTokenRef.current = clientToken;
      } catch (err) {
        console.error('Failed to initialize Primer drop-in checkout:', err);
        setError(err as Error);
        primerInstanceRef.current = null;
      } finally {
        setIsLoading(false);
        isInitializingRef.current = false;
      }
    };

    initialize();

    // Cleanup function
    return () => {
      // We don't await this in the cleanup function as it could cause issues
      if (primerInstanceRef.current) {
        primerInstanceRef.current.teardown();
      }
    };
  }, [clientToken, containerId, onCheckoutComplete]);

  // Reset function for manual cleanup/retry
  const resetPrimerInstance = useCallback(async () => {
    if (isInitializingRef.current) {
      return; // Don't reset while initializing
    }

    setIsLoading(true);
    try {
      if (primerInstanceRef.current) {
        await primerInstanceRef.current.teardown();
      }
    } catch (err) {
      console.error('Error tearing down Primer checkout:', err);
    } finally {
      primerInstanceRef.current = null;
      previousTokenRef.current = null; // Force reinitialization on next render
      isInitializingRef.current = false;
      setIsSuccess(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  return {
    dropInCheckout: primerInstanceRef.current,
    isLoading,
    isSuccess,
    error,
    resetPrimerInstance,
  };
}
