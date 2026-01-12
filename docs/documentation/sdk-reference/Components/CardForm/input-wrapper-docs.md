---
title: Input Wrapper Component
sidebar_label: <primer-input-wrapper>
description: A flexible wrapper component that provides consistent styling for input fields in custom layouts.
slug: /components/card-form/input-wrapper
---

# Input Wrapper Component

## \<primer-input-wrapper\>

The `primer-input-wrapper` component provides consistent styling and structure for input fields. While it's used internally by card input components, you can also use it directly in custom layouts to create additional form fields that match the visual style of Primer's card inputs.

## Usage

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Discount Code</primer-input-label>
  <div slot="input">
    <primer-input id="discount-code"></primer-input>
  </div>
</primer-input-wrapper>
```

### Custom Layout Example

You can use `primer-input-wrapper` to add custom fields like discount codes alongside card inputs:

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-holder-name></primer-input-card-holder-name>
    <primer-input-card-number></primer-input-card-number>

    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>

    <!-- Custom discount code field using primer-input-wrapper -->
    <primer-input-wrapper>
      <primer-input-label slot="label">Discount Code</primer-input-label>
      <div slot="input" style="display: flex; gap: 8px; align-items: center;">
        <primer-input id="discount-code" style="flex: 1;"></primer-input>
        <button type="button" onclick="applyDiscount()">Apply</button>
      </div>
    </primer-input-wrapper>

    <button type="submit">Pay Now</button>
  </div>
</primer-card-form>
```

## Slots

| Slot        | Description                                         |
| ----------- | --------------------------------------------------- |
| `label`     | Slot for the input label (use `primer-input-label`) |
| `input`     | Slot for the input field content                    |
| `help-text` | Slot for helper text or success messages            |

## CSS Custom Properties

### Spacing

| Property                | Description                        |
| ----------------------- | ---------------------------------- |
| `--primer-space-xsmall` | Gap between label and input field  |
| `--primer-space-medium` | Padding inside the input container |

### Border

| Property                                  | Description                         |
| ----------------------------------------- | ----------------------------------- |
| `--primer-width-default`                  | Default border width                |
| `--primer-width-focus`                    | Border/outline width on focus       |
| `--primer-width-error`                    | Border/outline width in error state |
| `--primer-radius-small`                   | Input border radius                 |
| `--primer-color-border-outlined-default`  | Default border color                |
| `--primer-color-border-outlined-hover`    | Border color on hover               |
| `--primer-color-border-outlined-active`   | Border color when active            |
| `--primer-color-border-outlined-focus`    | Border/outline color on focus       |
| `--primer-color-border-outlined-error`    | Border/outline color in error state |
| `--primer-color-border-outlined-disabled` | Border color when disabled          |

### Background

| Property                                      | Description                     |
| --------------------------------------------- | ------------------------------- |
| `--primer-color-background-outlined-default`  | Default background color        |
| `--primer-color-background-outlined-hover`    | Background color on hover       |
| `--primer-color-background-outlined-active`   | Background color when active    |
| `--primer-color-background-outlined-error`    | Background color in error state |
| `--primer-color-background-outlined-disabled` | Background color when disabled  |

### Typography

| Property                                     | Description                    |
| -------------------------------------------- | ------------------------------ |
| `--primer-typography-body-large-line-height` | Used to calculate input height |

## State Behavior

### Default State

The input displays with default border and background colors, using `--primer-width-default` for border width.

### Focus State

When focused, the input shows an outline using `--primer-color-border-outlined-focus` with width `--primer-width-focus`.

### Hover State

On hover, border and background colors transition to their hover variants.

### Error State

When the `has-error` attribute is present:

- Border color changes to `--primer-color-border-outlined-error`
- Background color changes to `--primer-color-background-outlined-error`
- Border width increases to `--primer-width-error`

```html
<primer-input-wrapper has-error>
  <primer-input-label slot="label">Discount Code</primer-input-label>
  <div slot="input">
    <primer-input id="discount-code"></primer-input>
  </div>
</primer-input-wrapper>
```

### Disabled State

When disabled:

- Background changes to `--primer-color-background-outlined-disabled`
- Border changes to `--primer-color-border-outlined-disabled`
- Cursor changes to `not-allowed`

## Related Components

- [Card Form](/sdk-reference/Components/CardForm/) - Parent container for card inputs
- [Card Number Input](/components/card-form/input-card-number) - Uses input wrapper internally
- [Card Expiry Input](/components/card-form/input-card-expiry) - Uses input wrapper internally
- [CVV Input](/components/card-form/input-cvv) - Uses input wrapper internally
- [Cardholder Name Input](/components/card-form/input-card-holder-name) - Uses input wrapper internally
