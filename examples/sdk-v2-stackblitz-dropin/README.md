# Primer Drop-in Checkout Integration

This project integrates Primer's Drop-in Universal Checkout into a Next.js application, providing a simple, pre-built payment UI that supports multiple payment methods.

## Features

- Ready-to-use payment UI with minimal configuration
- Support for multiple payment methods (cards, digital wallets, redirect methods)
- Automatic handling of payment method UI rendering
- Responsive design that works across devices
- Complete payment lifecycle management (loading, success, error states)
- Redirection after successful payment

## Implementation Details

This implementation uses Primer's Drop-in SDK to:

1. Initialize the checkout with a client token
2. Display a pre-built payment interface
3. Handle the complete payment flow automatically
4. Manage the payment lifecycle (loading, processing, success states)
5. Provide appropriate callbacks for success and failure scenarios

## Components

- `CheckoutComponent`: Container component that renders the Drop-in checkout UI
- `usePrimerDropIn`: Custom React hook for managing the Primer Drop-in checkout lifecycle
- `page.tsx`: Main checkout page with order summary and customer details

## Getting Started

This example uses a test sandbox account which generates client tokens for demonstration purposes.

To use this code:

1. Generate a client token from your backend
2. Pass the client token to the `CheckoutComponent`
3. Create a success page at `/success` to handle successful payments

## Official Documentation

For detailed implementation guides and API reference, see the official Primer documentation:

[Primer Drop-in Universal Checkout Documentation](https://primer.io/docs/payments/universal-checkout/drop-in/get-started/web)
