import { loadPrimer, PrimerCheckoutComponent } from '@primer-io/primer-js';
import { createExplanationElement } from './explanation.ts';
import { createClientSession } from './createClientSession.ts';

// Initialize everything
(async function () {
  // Load Primer
  await loadPrimer();

  // Reference to checkout element
  const checkout = document.querySelector('primer-checkout') as
    (PrimerCheckoutComponent & HTMLElement) | null;

  // Shows why the client session could not be created
  const errorMessage = document.createElement('p');
  errorMessage.className = 'checkout-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.hidden = true;

  // Function to initialize or reinitialize the checkout with a new token
  async function initializeCheckout() {
    // Show loading state on button if it exists
    const refreshButton = document.getElementById(
      'refresh-session-button',
    ) as HTMLButtonElement | null;
    if (refreshButton) {
      refreshButton.classList.add('loading');
      refreshButton.disabled = true;
      refreshButton.textContent = 'Resetting session...';
    }

    // Create a new client session and use its token
    try {
      const clientToken = await createClientSession();
      errorMessage.hidden = true;

      // client-token is an attribute
      checkout?.setAttribute('client-token', clientToken);

      // options is a property, not an attribute
      if (checkout) {
        checkout.options = {
          vault: {
            enabled: true,
          },
        };
      }

      // Reset button state
      if (refreshButton) {
        refreshButton.classList.remove('loading');
        refreshButton.disabled = false;
        refreshButton.textContent = 'Reset Checkout Session';
      }
    } catch (error) {
      errorMessage.textContent =
        error instanceof Error ? error.message : String(error);
      errorMessage.hidden = false;

      // Reset button with error indication
      if (refreshButton) {
        refreshButton.classList.remove('loading');
        refreshButton.classList.add('error');
        refreshButton.disabled = false;
        refreshButton.textContent = 'Error - Try Again';

        // Remove error class after delay
        setTimeout(() => {
          refreshButton.classList.remove('error');
        }, 3000);
      }
    }
  }

  // Create refresh button element
  function createRefreshButton(): HTMLDivElement {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'refresh-button-container';

    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'Test Controls';
    heading.className = 'refresh-section-heading';
    buttonContainer.appendChild(heading);

    // Add description text
    const description = document.createElement('p');
    description.className = 'refresh-section-description';
    description.textContent =
      'To start a new checkout session with a fresh client token, click the button below. This will reset the checkout state and allow you to test the flow again.';
    buttonContainer.appendChild(description);

    // Add button
    const button = document.createElement('button');
    button.id = 'refresh-session-button';
    button.className = 'refresh-session-button';
    button.textContent = 'Reset Checkout Session';
    button.addEventListener('click', initializeCheckout);

    buttonContainer.appendChild(button);
    return buttonContainer;
  }

  // Add explanation element and controls above the checkout component
  const main = document.querySelector('main')!;

  // Insert explanation first
  main.insertBefore(createExplanationElement(), checkout as Node | null);

  // Add the refresh button between explanation and checkout
  main.insertBefore(createRefreshButton(), checkout as Node | null);

  // Show errors right above the checkout
  main.insertBefore(errorMessage, checkout as Node | null);

  // Initialize checkout on page load
  await initializeCheckout();
})();
