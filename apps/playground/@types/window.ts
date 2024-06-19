import { Primer } from '@primer-io/checkout-web';

// Extend the Window interface
declare global {
  interface Window {
    Primer: typeof Primer;
  }
}
