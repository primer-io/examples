# Primer Checkout: themes

Switches Primer Checkout between eight themes using CSS variables: Light, Dark, Minimal, High Contrast, Kawaii, Brutalist, Neon Cyberpunk and Pimp My Checkout. Use the dropdown or the arrow buttons to change theme. The selection is saved in `localStorage`.

## Run it

1. Copy `.env.example` to `.env` and set `VITE_PRIMER_API_KEY` to a Primer sandbox API key with the `client_tokens:write` scope.
2. `npm install`
3. `npm run dev`

The browser creates the client session with your API key, and Vite exposes `VITE_` variables to the browser. Use a sandbox key for local testing only. In production, create the client session on your server.

## How theming works

Each theme is a CSS class on the `primer-checkout` element that sets Primer's `--primer-*` variables. Light is the default and needs no class. Dark uses Primer's `primer-dark-theme` class.

```html
<primer-checkout class="primer-dark-theme"></primer-checkout>
```

When you pick a theme, `src/main.ts`:

1. Sets `data-theme` on the document root, which the page-level styles use.
2. Removes the current `primer-checkout` element and creates a new one with the theme's class, so no previous theme class carries over.
3. Saves the theme to `localStorage`.

Wallet buttons such as PayPal, Apple Pay and Google Pay have their own styling limits, so variables may not change them.

## Add your own theme

1. Create a CSS file that defines `--primer-*` variables under a custom class, for example `.my-theme`.
2. Add page-level styles under `:root[data-theme='my-theme']` if you want them.
3. Add an entry to `themeConfig` in `src/main.ts` and an `<option>` in `index.html`.
4. Import the file in `src/all-themes.css`.

## Learn more

- [UI styling](https://primer.io/docs/checkout/primer-checkout/build-your-ui/styling-customization)
- [Design Tokens Explorer — Web](https://primer.io/docs/checkout/primer-checkout/build-your-ui/design-tokens-explorer-web)
- [Client Session](https://primer.io/docs/checkout/client-session)
