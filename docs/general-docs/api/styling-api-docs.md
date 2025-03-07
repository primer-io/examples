---
title: Composable Checkout Styling API
sidebar_label: Styling API
sidebar_position: 1
description: Customizable styling variables for Composable Checkout
---

# Composable Checkout Styling API

Composable Checkout uses CSS Custom Properties (CSS Variables) to maintain a consistent design language across components. These variables provide a standardized way to customize the appearance of your checkout UI.

You can apply styling in two ways:

1. Using CSS Custom Properties directly in your stylesheets
2. Using JSON properties through the `customStyles` attribute on components

:::tip CSS Usage Example

```css
/* Example: Changing the primary brand color */
:root {
    --primer-color-brand: #2f98ff;
}
```

:::

:::tip JSON Usage Example

```html
<primer-checkout
  customStyles='{"primerColorBrand":"#2f98ff"}'
></primer-checkout>
```

:::

## Core Variables

These core variables control the fundamental aspects of your checkout UI, from colors to spacing.

| CSS Variable | JSON Property | Type | Description | Default Value | Affects |
|-------------|--------------|------|-------------|---------------|---------|
| `--primer-color-brand` | `primerColorBrand` | color | Controls the brand color across the checkout | `#2F98FF` | Background color of the primary button, focus outline in all components |
| `--primer-typography-brand` | `primerTypographyBrand` | font family | Controls the brand font family across the checkout | `Inter` | All typography styles |
| `--primer-color-background` | `primerColorBackground` | color | Controls the background color across the checkout | `#FFFFFF` | Default background color of all components except the primary button |
| `--primer-radius-base` | `primerRadiusBase` | radius | Controls the base radius unit across the checkout | `4px` | Border radii of all components |
| `--primer-space-base` | `primerSpaceBase` | spacing | Controls the base spacing unit across the checkout | `4px` | Spacings of all components |
| `--primer-size-base` | `primerSizeBase` | size | Controls the base size unit across the checkout | `4px` | Asset size in the checkout like icons, card network, loader |
| `--primer-color-loader` | `primerColorLoader` | color | Controls the loader color across the checkout | `--primer-color-brand` | Background color of the loader component |
| `--primer-color-focus` | `primerColorFocus` | color | Controls the interactive focus color across the checkout | `--primer-color-brand` | Focus outline in all components |

## Text Colors

These variables control the appearance of text throughout your checkout UI.

| CSS Variable | JSON Property | Type | Description | Default Value | Affects |
|-------------|--------------|------|-------------|---------------|---------|
| `--primer-color-text-primary` | `primerColorTextPrimary` | color | Controls the primary text color across the checkout | `#212121` | Input text color, input label text color, redirect payment method button label text, label text in buttons, title text in checkout state |
| `--primer-color-text-placeholder` | `primerColorTextPlaceholder` | color | Controls the placeholder text color across the checkout | `#9E9E9E` | Placeholder text color in input component |
| `--primer-color-text-secondary` | `primerColorTextSecondary` | color | Controls the secondary text color across the checkout | `#757575` | Description text color in checkout state component |
| `--primer-color-text-disabled` | `primerColorTextDisabled` | color | Controls the disabled text color across the checkout | `#BDBDBD` | Input text color in disabled state, placeholder text, input label text, button label text in disabled state |
| `--primer-color-text-negative` | `primerColorTextNegative` | color | Controls the negative text color across the checkout | `#B4324B` | Error text color in input component |

## Spacing

| CSS Variable | JSON Property | Type | Description | Default Value |
|-------------|--------------|------|-------------|---------------|
| `--primer-space-xxsmall` | `primerSpaceXxsmall` | spacing | Controls the xx-small spacing across the checkout | `2px` |
| `--primer-space-xsmall` | `primerSpaceXsmall` | spacing | Controls the x-small spacing across the checkout | `4px` |
| `--primer-space-small` | `primerSpaceSmall` | spacing | Controls the small spacing across the checkout | `8px` |
| `--primer-space-medium` | `primerSpaceMedium` | spacing | Controls the medium spacing across the checkout | `12px` |

## Border Radius

| CSS Variable | JSON Property | Type | Description | Default Value |
|-------------|--------------|------|-------------|---------------|
| `--primer-radius-small` | `primerRadiusSmall` | radius | Controls the small border radius across the checkout | `4px` |
| `--primer-radius-medium` | `primerRadiusMedium` | radius | Controls the medium border radius across the checkout | `8px` |

## Typography

The following variables control text appearance across components, ensuring consistent text styling and readability.

### Title Large

| CSS Variable | JSON Property | Type | Description |
|-------------|--------------|------|-------------|
| `--primer-typography-title-large-font` | `primerTypographyTitleLargeFont` | font family | Controls the font family of the title-large typography style |
| `--primer-typography-title-large-weight` | `primerTypographyTitleLargeWeight` | font weight | Controls the font weight of the title-large typography style |
| `--primer-typography-title-large-size` | `primerTypographyTitleLargeSize` | font size | Controls the font size of the title-large typography style |
| `--primer-typography-title-large-line-height` | `primerTypographyTitleLargeLineHeight` | line height | Controls the line height of the title-large typography style |
| `--primer-typography-title-large-letter-spacing` | `primerTypographyTitleLargeLetterSpacing` | letter spacing | Controls the letter spacing of the title-large typography style |

### Body Large

| CSS Variable | JSON Property | Type | Description |
|-------------|--------------|------|-------------|
| `--primer-typography-body-large-font` | `primerTypographyBodyLargeFont` | font family | Controls the font family of the body-large typography style |
| `--primer-typography-body-large-weight` | `primerTypographyBodyLargeWeight` | font weight | Controls the font weight of the body-large typography style |
| `--primer-typography-body-large-size` | `primerTypographyBodyLargeSize` | font size | Controls the font size of the body-large typography style |
| `--primer-typography-body-large-line-height` | `primerTypographyBodyLargeLineHeight` | line height | Controls the line height of the body-large typography style |
| `--primer-typography-body-large-letter-spacing` | `primerTypographyBodyLargeLetterSpacing` | letter spacing | Controls the letter spacing of the body-large typography style |

### Body Medium

| CSS Variable | JSON Property | Type | Description |
|-------------|--------------|------|-------------|
| `--primer-typography-body-medium-font` | `primerTypographyBodyMediumFont` | font family | Controls the font family of the body-medium typography style |
| `--primer-typography-body-medium-weight` | `primerTypographyBodyMediumWeight` | font weight | Controls the font weight of the body-medium typography style |
| `--primer-typography-body-medium-size` | `primerTypographyBodyMediumSize` | font size | Controls the font size of the body-medium typography style |
| `--primer-typography-body-medium-line-height` | `primerTypographyBodyMediumLineHeight` | line height | Controls the line height of the body-medium typography style |
| `--primer-typography-body-medium-letter-spacing` | `primerTypographyBodyMediumLetterSpacing` | letter spacing | Controls the letter spacing of the body-medium typography style |

### Body Small

| CSS Variable | JSON Property | Type | Description |
|-------------|--------------|------|-------------|
| `--primer-typography-body-small-font` | `primerTypographyBodySmallFont` | font family | Controls the font family of the body-small typography style |
| `--primer-typography-body-small-weight` | `primerTypographyBodySmallWeight` | font weight | Controls the font weight of the body-small typography style |
| `--primer-typography-body-small-size` | `primerTypographyBodySmallSize` | font size | Controls the font size of the body-small typography style |
| `--primer-typography-body-small-line-height` | `primerTypographyBodySmallLineHeight` | line height | Controls the line height of the body-small typography style |
| `--primer-typography-body-small-letter-spacing` | `primerTypographyBodySmallLetterSpacing` | letter spacing | Controls the letter spacing of the body-small typography style |

## Using Variables in Practice

You can apply styling variables in two ways: using CSS Custom Properties or by passing a JSON object through component attributes.

### CSS Custom Properties Method

#### Component Customization

To customize a specific component:

```css
/* Example: Customizing a specific button */
primer-button {
  --primer-color-brand: blue;
  --primer-radius-medium: 8px;
}
```

#### Global Customization

To customize all components:

```css
:root {
  /* Colors */
  --primer-color-brand: #663399;
  --primer-color-text-primary: #333333;

  /* Typography */
  --primer-typography-body-large-font: 'Helvetica Neue', sans-serif;

  /* Spacing */
  --primer-space-medium: 16px;

  /* Border Radius */
  --primer-radius-medium: 8px;
}
```

### JSON Properties Method

You can also pass styling variables as a stringified JSON object through the `customStyles` attribute. This is particularly useful when working with JavaScript frameworks or when you need to apply styles programmatically.

#### Example Usage:

```html
<!-- Direct HTML attribute usage -->
<primer-checkout
  customStyles='{"primerColorBrand":"#663399","primerRadiusMedium":"8px"}'
></primer-checkout>
```

```javascript
// JavaScript example
const myCustomStyles = {
  primerColorBrand: '#663399',
  primerColorTextPrimary: '#333333',
  primerTypographyBodyLargeFont: 'Helvetica Neue, sans-serif',
  primerSpaceMedium: '16px',
  primerRadiusMedium: '8px',
};

// Pass as stringified JSON attribute
const checkoutElement = document.querySelector('primer-checkout');
checkoutElement.setAttribute('customStyles', JSON.stringify(myCustomStyles));
```

The component will parse the JSON and automatically apply the styles as CSS Custom Properties internally.

:::info Variable Conversion
When using the JSON method, convert kebab-case CSS variables to camelCase properties:

- CSS: `--primer-color-brand` → JSON: `primerColorBrand`
- CSS: `--primer-space-medium` → JSON: `primerSpaceMedium`
  :::
