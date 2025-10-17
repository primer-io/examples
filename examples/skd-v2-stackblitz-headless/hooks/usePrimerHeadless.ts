'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import type {
  HeadlessUniversalCheckoutOptions,
  HeadlessVaultManager,
  IAssetsManager,
  PaymentMethodInfo,
  PrimerHeadlessCheckout,
} from '@primer-io/checkout-web';

// Enhanced payment method interface with asset data
export interface EnhancedPaymentMethodInfo extends PaymentMethodInfo {
  displayName: string;
  iconUrl: string;
  isAvailable: boolean;
}

interface UsePrimerHeadlessOptions {
  clientToken?: string | null;
}

export function usePrimerHeadless({
  clientToken,
}: UsePrimerHeadlessOptions = {}) {
  // Store instance in a ref to persist across renders
  const primerInstanceRef = useRef<PrimerHeadlessCheckout | null>(null);

  // Track if initialization is in progress for this specific hook instance
  const isInitializingRef = useRef<boolean>(false);

  // Track current client token to detect changes
  const previousTokenRef = useRef<string | null | undefined>(null);

  // State for component
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<
    PaymentMethodInfo[]
  >([]);
  const [enhancedPaymentMethods, setEnhancedPaymentMethods] = useState<
    EnhancedPaymentMethodInfo[]
  >([]);
  const [assetsManager, setAssetsManager] = useState<IAssetsManager | null>(
    null,
  );
  const [vaultManager, setVaultManager] = useState<HeadlessVaultManager | null>(
    null,
  );
  const [assetsLoading, setAssetsLoading] = useState(false);

  // Function to enhance payment methods with assets and availability
  const enhancePaymentMethods = useCallback(
    async (methods: PaymentMethodInfo[], assetsManager: IAssetsManager) => {
      if (
        methods.length === 0 ||
        !assetsManager ||
        !primerInstanceRef.current
      ) {
        return [];
      }

      setAssetsLoading(true);
      const enhanced: EnhancedPaymentMethodInfo[] = [];

      // Process payment card method first if available
      const cardMethod = methods.find(
        (method) => method.type === 'PAYMENT_CARD',
      );
      if (cardMethod) {
        enhanced.push({
          ...cardMethod,
          displayName: 'Credit/Debit Card',
          iconUrl:
            'https://goat-assets.production.core.primer.io/icon/credit-card/small.svg',
          isAvailable: true,
        });
      }

      // Process non-card payment methods
      const nonCardMethods = methods.filter(
        (method) => method.type !== 'PAYMENT_CARD',
      );

      for (const method of nonCardMethods) {
        try {
          // Default values
          let displayName: string = method.type;
          let iconUrl = '';
          let isAvailable = false;

          // Get display info
          try {
            const asset = await assetsManager.getPaymentMethodAsset(
              method.type,
            );
            displayName = asset?.displayName || method.type;
            iconUrl =
              asset?.iconUrl?.dark ||
              asset?.iconUrl?.light ||
              asset?.iconUrl?.colored ||
              '';
          } catch (error) {
            console.warn(`Error getting asset for ${method.type}:`, error);
          }

          // Check availability
          try {
            const manager =
              await primerInstanceRef.current.createPaymentMethodManager(
                method.type,
              );
            isAvailable = !!manager;
          } catch (error) {
            console.warn(
              `Error checking availability for ${method.type}:`,
              error,
            );
          }

          // Add to results
          enhanced.push({
            ...method,
            displayName,
            iconUrl,
            isAvailable,
          });
        } catch (error) {
          console.error(
            `Error processing payment method ${method.type}:`,
            error,
          );
        }
      }

      setAssetsLoading(false);
      return enhanced;
    },
    [],
  );

  // Load assets when payment methods change
  useEffect(() => {
    if (
      rawPaymentMethods.length > 0 &&
      assetsManager &&
      primerInstanceRef.current
    ) {
      enhancePaymentMethods(rawPaymentMethods, assetsManager).then((enhanced) =>
        setEnhancedPaymentMethods(enhanced),
      );
    }
  }, [rawPaymentMethods, assetsManager, enhancePaymentMethods]);

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
          // No teardown method in headless, so just nullify
          primerInstanceRef.current = null;

          // Reset state for clean initialization
          setRawPaymentMethods([]);
          setEnhancedPaymentMethods([]);
          setAssetsManager(null);
          setVaultManager(null);
        }

        // Import Primer
        const { Primer } = await import('@primer-io/checkout-web');

        // Configure checkout
        const options: HeadlessUniversalCheckoutOptions = {
          onAvailablePaymentMethodsLoad: (methods: PaymentMethodInfo[]) => {
            console.log('Available payment methods loaded:', methods);
            setRawPaymentMethods(methods);
          },
          onCheckoutComplete: (data) => {
            console.log('Checkout completed', data);
            setIsSuccess(true);
            setIsProcessing(false);
          },
          onCheckoutFail: (err) => {
            console.error('Checkout failed:', err);
            setError(err as Error);
            setIsProcessing(false);
          },
          onBeforePaymentCreate: (data, handler) => {
            setIsProcessing(true);
            handler?.continuePaymentCreation();
          },
          onPaymentMethodAction: (action) => {
            if (action === 'PAYMENT_METHOD_UNSELECTED') {
              setIsProcessing(false);
            }
          },
        };

        // Create checkout
        const checkout = await Primer.createHeadless(clientToken, options);

        if (!checkout) {
          throw new Error('Failed to create headless checkout');
        }

        // Store instance in this hook's ref
        primerInstanceRef.current = checkout;

        // Update the token ref to track changes
        previousTokenRef.current = clientToken;

        // Start checkout
        await checkout.start();

        // Get assets manager
        const assets = checkout.getAssetsManager();
        setAssetsManager(assets);

        // Try to create vault manager
        try {
          const vm = checkout.createVaultManager();
          setVaultManager(vm);
        } catch (err) {
          console.warn('Failed to create vault manager:', err);
        }
      } catch (err) {
        console.error('Failed to initialize Primer headless checkout:', err);
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
      // No explicit teardown method in headless, but we can clean up state
      if (primerInstanceRef.current) {
        primerInstanceRef.current = null;
      }
    };
  }, [clientToken]);

  // Create payment method manager
  const createPaymentMethodManager = useCallback(
    (paymentMethodType, options) => {
      if (!primerInstanceRef.current) {
        console.error('Headless checkout not initialized');
        return null;
      }

      try {
        return primerInstanceRef.current.createPaymentMethodManager(
          paymentMethodType,
          options as any,
        );
      } catch (error) {
        console.error(
          `Error creating payment method manager for ${paymentMethodType}:`,
          error,
        );
        return null;
      }
    },
    [],
  ) as PrimerHeadlessCheckout['createPaymentMethodManager'];

  // Reset function for manual cleanup/retry
  const resetPrimerInstance = useCallback(async () => {
    if (isInitializingRef.current) {
      return; // Don't reset while initializing
    }

    setIsLoading(true);
    try {
      // No explicit teardown in headless, just clean up
      primerInstanceRef.current = null;
    } catch (err) {
      console.error('Error cleaning up Primer checkout:', err);
    } finally {
      primerInstanceRef.current = null;
      previousTokenRef.current = null; // Force reinitialization on next render
      isInitializingRef.current = false;
      setRawPaymentMethods([]);
      setEnhancedPaymentMethods([]);
      setAssetsManager(null);
      setVaultManager(null);
      setIsSuccess(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    setIsProcessing(false);
  }, []);

  return {
    headlessCheckout: primerInstanceRef.current,
    isLoading: isLoading || assetsLoading,
    isSuccess,
    isProcessing,
    error,
    availablePaymentMethods: enhancedPaymentMethods,
    assetsManager,
    createPaymentMethodManager,
    vaultManager,
    setIsSuccessManually: setIsSuccess,
    cleanup,
    resetPrimerInstance,
  };
}
