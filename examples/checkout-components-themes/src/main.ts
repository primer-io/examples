import { loadPrimer, PrimerCheckoutComponent } from '@primer-io/primer-js';
import { fetchClientToken } from './fetchClientToken';

(async function () {
  await loadPrimer();
  let clientToken: string | null = null;

  // Get DOM elements first
  const styleSelector = document.getElementById(
    'style-selector',
  ) as HTMLSelectElement;
  const checkoutContainer = document.getElementById('checkout-container')!;
  const prevThemeBtn = document.getElementById(
    'prev-theme',
  ) as HTMLButtonElement;
  const nextThemeBtn = document.getElementById(
    'next-theme',
  ) as HTMLButtonElement;

  // Fetch client token
  const response = await fetchClientToken('a1b2c3d4e5f6g7h8i9j0');
  if (response.success) {
    clientToken = response.clientToken;
    initializeCheckout(clientToken);
  } else {
    console.error('Failed to fetch client token:', response.error);
    showError(response.error);
  }

  // Theme configuration
  const themeConfig = {
    'light': {
      className: '',
      displayName: 'Light Theme',
    },
    'dark': {
      className: 'primer-dark-theme',
      displayName: 'Dark Theme',
    },
    'minimal': {
      className: 'minimal-theme',
      displayName: 'Minimal Theme',
    },
    'high-contrast': {
      className: 'high-contrast-theme',
      displayName: 'High Contrast Theme',
    },
    'kawaii': {
      className: 'kawaii-theme',
      displayName: 'Kawaii Theme',
    },
    'brutalist': {
      className: 'brutalist-theme',
      displayName: 'Brutalist Theme',
    },
    'neon-cyberpunk': {
      className: 'neon-cyberpunk-theme',
      displayName: 'Neon Cyberpunk Theme',
    },
    'pimp-my-checkout': {
      className: 'pimp-my-checkout-theme',
      displayName: 'Pimp My Checkout',
    },
  };

  // Load saved theme preference if available
  const savedTheme = localStorage.getItem('checkout-theme') || 'light';
  applyTheme(savedTheme);
  styleSelector.value = savedTheme;

  // Listen for theme changes
  styleSelector?.addEventListener('change', (event) => {
    const selectedTheme = (event.target as HTMLSelectElement).value;
    applyTheme(selectedTheme);

    // Save preference
    localStorage.setItem('checkout-theme', selectedTheme);
  });

  // Theme navigation with arrow buttons
  prevThemeBtn?.addEventListener('click', () => {
    navigateTheme('prev');
  });

  nextThemeBtn?.addEventListener('click', () => {
    navigateTheme('next');
  });

  // Function to navigate through themes
  function navigateTheme(direction: 'prev' | 'next') {
    const options = Array.from(styleSelector.options);
    const currentIndex = styleSelector.selectedIndex;
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
    }

    styleSelector.selectedIndex = newIndex;
    const selectedTheme = styleSelector.value;
    applyTheme(selectedTheme);

    // Save preference
    localStorage.setItem('checkout-theme', selectedTheme);
  }

  // Function to apply the selected theme
  function applyTheme(theme: string) {
    // Set the page theme attribute for our custom styles
    document.documentElement.setAttribute('data-theme', theme);

    // Update the checkout component class for Primer's built-in themes
    if (themeConfig[theme as keyof typeof themeConfig]) {
      // Find the checkout component inside the container
      const checkoutElement =
        checkoutContainer.querySelector('primer-checkout');

      if (checkoutElement) {
        // Apply the theme class directly to the primer-checkout element
        (checkoutElement as unknown as HTMLElement).className =
          themeConfig[theme as keyof typeof themeConfig].className;

        // Log theme change
        console.log(
          `Theme changed to: ${
            themeConfig[theme as keyof typeof themeConfig].displayName
          }`,
        );
      }

      // Reinitialize the checkout with the new theme
      if (clientToken) {
        reinitializeCheckout(clientToken);
      }
    }
  }

  // Function to initialize the checkout
  function initializeCheckout(token: string) {
    // Create checkout element
    const checkoutElement = document.createElement(
      'primer-checkout',
    ) as HTMLElement & PrimerCheckoutComponent;
    checkoutElement.clientToken = token;

    // Clear container and append element
    checkoutContainer.innerHTML = '';
    checkoutContainer.appendChild(checkoutElement as unknown as HTMLElement);
  }

  // Function to reinitialize the checkout
  function reinitializeCheckout(token: string) {
    // Remove existing checkout component
    const existingCheckout = checkoutContainer.querySelector('primer-checkout');
    if (existingCheckout) {
      (existingCheckout as unknown as HTMLElement).remove();
    }

    // Create and initialize a new checkout component
    const newCheckout = document.createElement(
      'primer-checkout',
    ) as HTMLElement & PrimerCheckoutComponent;

    // Get the current theme
    const currentTheme = styleSelector.value;

    // Apply the theme class if defined
    if (themeConfig[currentTheme as keyof typeof themeConfig]) {
      (newCheckout as unknown as HTMLElement).className =
        themeConfig[currentTheme as keyof typeof themeConfig].className;
    }

    // Set a tiny timeout to ensure the DOM has fully processed the removal
    setTimeout(() => {
      newCheckout.clientToken = token;
      checkoutContainer.appendChild(newCheckout as unknown as HTMLElement);
    }, 50);
  }

  // Function to show error
  function showError(error: string) {
    checkoutContainer.innerHTML = `
      <div class="error-message">
        <h3>Error Loading Checkout</h3>
        <p>${error}</p>
      </div>
    `;
  }
})();
