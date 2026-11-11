# Primer Checkout examples and AI skills

Runnable examples for Primer Checkout on the web, and AI coding skills for web, iOS and Android.

## Examples

| Example                                                                 | What it shows                                                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [primer-checkout-basic](examples/primer-checkout-basic)                 | Minimal TypeScript and Vite integration with a toggle for custom styling.                            |
| [primer-checkout-custom-form](examples/primer-checkout-custom-form)     | React card form built from individual Primer input components.                                       |
| [primer-checkout-custom-layout](examples/primer-checkout-custom-layout) | React layout that places card and PayPal in their own sections and groups the other payment methods. |
| [primer-checkout-themes](examples/primer-checkout-themes)               | Switching between eight visual themes with CSS variables (TypeScript and Vite).                      |
| [primer-checkout-vaulted](examples/primer-checkout-vaulted)             | Saving payment methods with the vault option, with a control to reset the session.                   |

Every example is a standalone project. Open its folder, run `npm install`, then `npm run dev`. These examples get their client token from Primer's hosted demo endpoint, so they run without a Primer account.

## AI skills

Skills for Claude Code and other AI coding assistants that cover Primer Checkout on web, iOS and Android. In Claude Code, add the marketplace, then install the plugin for your platform:

```text
/plugin marketplace add primer-io/examples
/plugin install primer-web-components@primer-skills
/plugin install primer-ios-checkout@primer-skills
/plugin install primer-android-checkout@primer-skills
```

For other assistants, see [claude-code-skills/README.md](claude-code-skills/README.md).

## More from Primer

- [Primer documentation](https://primer.io/docs) covers all products and integrations, including the server-side APIs.
- The [Primer GitHub organization](https://github.com/primer-io) hosts the iOS, Android and React Native SDKs.

## Issues

Report problems with an example or a skill in [GitHub issues](https://github.com/primer-io/examples/issues).
