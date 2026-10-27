# Primer Headless Checkout Integration

This project integrates Primer's Headless Universal Checkout into a Next.js application, enabling multiple payment methods including credit/debit cards, digital wallets, and redirect payment options.

## Features

- Credit/debit card processing with dynamic card network detection
- Support for Apple Pay, Google Pay, and PayPal (native payment methods)
- Redirect payment methods (e.g., Klarna, PayPal redirect)
- Saved payment methods through Primer's vault functionality
- Responsive payment form with proper loading states
- Success redirection after payment completion

## Implementation Details

This implementation uses Primer's Headless SDK to:

1. Initialize the checkout with a client token
2. Display available payment methods
3. Handle various payment flows (cards, wallets, redirect payments)
4. Manage the payment lifecycle (loading, processing, success states)
5. Vault payment methods for future use

## Components

- `PaymentForm`: Main container component for the payment workflow
- `CardPaymentForm`: Secure card input fields for credit/debit card payments
- `NativePaymentButton`: Integration for native payment methods (Apple Pay, Google Pay, etc.)
- `RedirectPaymentButton`: Handles redirect-based payment flows
- `PaymentMethodsList`: Displays and manages payment method selection
- `VaultManagerUI`: Manages saved payment methods

## Getting Started

This example uses a test sandbox account which generates client tokens for demonstration purposes.

To use this code:

1. Generate a client token from your backend
2. Pass the client token to the `PaymentForm` component
3. Create a success page at `/success` to handle successful payments

## Official Documentation

For detailed implementation guides and API reference, see the official Primer documentation:

[Primer Headless Universal Checkout Documentation](https://primer.io/docs/payments/universal-checkout/headless/get-started/web)
