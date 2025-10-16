# Custom-Styled Checkout Demo

This example demonstrates the power of Primer Checkout's style tokens by allowing you to toggle between eight different visual themes. The implementation uses pure HTML with a minimal TypeScript script and relies primarily on CSS variables for styling.

## Overview

The example showcases how you can use Primer's documented style variables to create completely different looks for your checkout experience without changing the underlying HTML structure.

## Features

- Eight themed variations of the checkout UI, plus a special "Pimp My Checkout" Easter egg theme
- Pure CSS implementation using CSS variables
- Dynamic theme switching without page reload
- Theme navigation with arrow buttons for easy browsing through themes
- Preservation of user theme preferences via localStorage
- Animated visual effects in special themes

## Implementation Details

### Proper Theme Implementation

This example demonstrates the correct way to apply themes to the Primer Checkout component:

1. The theme classes are applied directly to the `primer-checkout` element, not to parent containers
2. For the dark theme, the `primer-dark-theme` class is used
3. For custom themes, custom classes are applied to the `primer-checkout` element
4. The default (light) theme doesn't require any class

```html
<!-- Light theme (default) -->
<primer-checkout></primer-checkout>

<!-- Dark theme -->
<primer-checkout class="primer-dark-theme"></primer-checkout>

<!-- Custom theme -->
<primer-checkout class="my-custom-theme"></primer-checkout>
```

### Dynamic Theme Switching

When switching themes dynamically:

1. The appropriate class is applied directly to the `primer-checkout` element
2. The checkout component is reinitialized to ensure the theme is fully applied
3. The page's data-theme attribute is updated for page-level styling

## File Structure

- `index.html` - Main HTML file containing the checkout component
- `src/main.ts` - TypeScript file handling theme switching functionality
- CSS files:
  - `src/all-themes.css` - Imports all other CSS files
  - `src/base-styles.css` - Contains base styles and container styles
  - `src/minimal-theme.css` - Minimal theme styles
  - `src/high-contrast-theme.css` - High contrast theme for accessibility
  - `src/kawaii-theme.css` - Cute, colorful kawaii-inspired theme
  - `src/brutalist-theme.css` - Raw, bold brutalist web design theme
  - `src/neon-cyberpunk-theme.css` - Vibrant neon colors on dark backgrounds
  - `src/pimp-my-checkout-theme.css` - Flashy "Pimp My Ride" inspired theme

## Available Themes

1. **Light Theme**: The standard Primer checkout styling
2. **Dark Theme**: A dark-themed checkout for low-light environments
3. **Minimal**: A clean, simplified design with subtle styling
4. **High Contrast**: Enhanced visual contrast for better accessibility
5. **Kawaii**: A cute, colorful design with playful elements
6. **Brutalist**: Raw, minimal design with strong contrast and bold elements
7. **Neon Cyberpunk**: Vibrant neon colors on dark backgrounds with futuristic styling
8. **Pimp My Checkout** 🔥: Flashy, chrome-like styling inspired by the TV show "Pimp My Ride"

## CSS Variables Used

The example exclusively uses the documented CSS variables from Primer's styling API:

### Core Variables

- `--primer-color-brand` - Primary brand color for buttons and focus states
- `--primer-color-background` - Base background color
- `--primer-color-focus` - Focus indicator color
- `--primer-typography-brand` - Main font family

### Text Colors

- `--primer-color-text-primary` - Primary text color
- `--primer-color-text-placeholder` - Placeholder text color
- `--primer-color-text-disabled` - Text color for disabled elements
- `--primer-color-text-negative` - Text color for error messages

### Border Radius

- `--primer-radius-small` - Small border radius
- `--primer-radius-medium` - Medium border radius

### Spacing

- `--primer-space-xsmall` - Extra small spacing
- `--primer-space-small` - Small spacing
- `--primer-space-medium` - Medium spacing

### Typography

- Font family, weight, size, line height, and letter spacing variables for different text styles

### Outlined Container

- Various background and border colors for different states (default, hover, active, error, disabled)

## How Theme Switching Works

1. The theme switcher dropdown in the UI allows selecting a theme
2. When a theme is selected, the `data-theme` attribute on the document root is updated
3. CSS selectors use this attribute to apply the appropriate theme variables
4. The checkout component's class is updated to include the appropriate theme class
5. Theme preferences are saved to localStorage for persistence across sessions
6. The checkout component is reinitialized to ensure the theme is fully applied

## Common Issues and Solutions

### Theme Classes Not Applied Correctly

If themes are not working correctly:

1. Make sure theme classes are applied directly to the `primer-checkout` element, not to parent containers
2. For the dark theme, use the special `primer-dark-theme` class
3. The default (light) theme should have no class applied
4. When switching themes dynamically, remove existing theme classes before applying a new one

### Checkout Component Not Responding to Theme Changes

If the checkout component isn't recognizing theme changes:

1. Consider reinitializing the checkout component after applying a new theme
2. Ensure CSS variables are defined at the correct scope

## Creating Your Own Theme

To create your own theme:

1. Create a new CSS file (e.g., `my-theme.css`)
2. Define CSS variables for your theme using a custom class
3. Add custom styles for page elements using the `:root[data-theme='my-theme']` selector
4. Add your theme to the `themeConfig` object in `main.ts`
5. Add an option for your theme in the dropdown in `index.html`
6. Import your CSS file in `all-themes.css`

## Important Notes

- Some elements like PayPal, Apple Pay, and Google Pay have their own styling limitations
- This example uses only documented Primer style variables for maximum compatibility
- The proper approach for theming is to apply the theme class directly to the `primer-checkout` element
