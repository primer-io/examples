import { loadPrimer } from '@primer-io/primer-js';
import { createClientSession } from './createClientSession.ts';

// Function to apply custom styles based on saved preference
function applyStoredStylePreference() {
  const styleEnabled = localStorage.getItem('customStylesEnabled') === 'true';
  const styleToggle = document.getElementById(
    'styleToggle',
  ) as HTMLInputElement;

  if (styleToggle) {
    styleToggle.checked = styleEnabled;

    if (styleEnabled) {
      document.documentElement.classList.add('custom-styles-enabled');
    } else {
      document.documentElement.classList.remove('custom-styles-enabled');
    }
  }
}

// Setup style toggle functionality
function setupStyleToggle() {
  const styleToggle = document.getElementById('styleToggle');

  if (styleToggle) {
    styleToggle.addEventListener('change', function (this: HTMLInputElement) {
      // Save preference to localStorage
      localStorage.setItem('customStylesEnabled', String(this.checked));

      // Apply or remove custom styles
      if (this.checked) {
        document.documentElement.classList.add('custom-styles-enabled');
      } else {
        document.documentElement.classList.remove('custom-styles-enabled');
      }
    });
  }
}

// Initialize everything
(async function () {
  // Apply stored style preference first
  applyStoredStylePreference();

  // Setup style toggle
  setupStyleToggle();

  // Load Primer and initialize checkout
  await loadPrimer();

  const checkout = document.querySelector('primer-checkout')!;
  try {
    // Set the client token to initialize the checkout
    checkout.setAttribute('client-token', await createClientSession());
  } catch (error) {
    const message = document.createElement('p');
    message.setAttribute('role', 'alert');
    message.textContent =
      error instanceof Error ? error.message : String(error);
    checkout.replaceWith(message);
  }
})();
