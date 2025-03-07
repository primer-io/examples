---
title: Button Component
sidebar_label: <primer-button>
description: A versatile button component with multiple style variants for actions in checkout forms.
slug: /components/button
---

# Button Component
## \<primer-button\>

The Button component provides a consistent, styled button for user interactions throughout the checkout experience.

## Usage

```html
<primer-button>Click me</primer-button>
```

## Properties

| Property     | Attribute    | Type                                     | Default     | Description                      |
|--------------|--------------|------------------------------------------|-------------|----------------------------------|
| `variant`    | `variant`    | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | The button's visual style        |
| `disabled`   | `disabled`   | `boolean`                                | `false`     | Whether the button is disabled   |
| `buttonType` | `buttonType` | `'button' \| 'submit' \| 'reset'`        | `'button'`  | The button's HTML type attribute |

## Slots

| Name      | Description                          |
|-----------|--------------------------------------|
| `default` | Content to display inside the button |

## Variants

### Primary
The primary variant is used for main actions and has high visual prominence.

```html
<primer-button variant="primary">Pay Now</primer-button>
```

### Secondary
The secondary variant is used for secondary actions with medium visual prominence.

```html
<primer-button variant="secondary">Save for Later</primer-button>
```

### Tertiary
The tertiary variant is used for minor actions with minimal visual prominence.

```html
<primer-button variant="tertiary">Cancel</primer-button>
```

## Examples

### Submit Button in Form

```html
<form>
  <!-- Form fields here -->
  <primer-button buttonType="submit">Complete Purchase</primer-button>
</form>
```

### Disabled Button

```html
<primer-button disabled>Processing...</primer-button>
```

### Using with Card Form

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>
    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>
    <primer-input-card-holder-name></primer-input-card-holder-name>
    
    <primer-button buttonType="submit" variant="primary">
      Pay Now
    </primer-button>
  </div>
</primer-card-form>
```

### Discount Code Application

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Discount Code</primer-input-label>
  <div slot="input" style="display: flex; gap: 8px;">
    <primer-input id="discount-code"></primer-input>
    <primer-button variant="secondary">Apply</primer-button>
  </div>
</primer-input-wrapper>
```

## CSS Custom Properties

The Button component uses the following CSS custom properties for styling:

| Property                                         | Description                                                           |
|--------------------------------------------------|-----------------------------------------------------------------------|
| `--primer-radius-medium`                         | Border radius for primary/secondary buttons                           |
| `--primer-radius-small`                          | Border radius for tertiary buttons                                    |
| `--primer-typography-title-large-weight`         | Font weight                                                           |
| `--primer-typography-title-large-size`           | Font size                                                             |
| `--primer-typography-title-large-letter-spacing` | Letter spacing                                                        |
| `--primer-typography-title-large-line-height`    | Line height                                                           |
| `--primer-typography-title-large-font`           | Font family                                                           |
| `--primer-space-medium`                          | Padding for primary/secondary buttons                                 |
| `--primer-space-xxsmall`                         | Padding for tertiary buttons                                          |
| `--primer-color-brand`                           | Background color for primary variant                                  |
| `--primer-color-background-outlined-default`     | Text color for primary variant, background colorfor secondary variant |
| `--primer-color-text-primary`                    | Text color for secondary/tertiary variants                            |
| `--primer-color-border-outlined-default`         | Border color for secondary variant                                    |
| `--primer-color-text-disabled`                   | Text color when disabled                                              |

## Notes

- For form submission, set `buttonType="submit"` when the button should submit a form
- Use the `primary` variant for the main action in a form (like payment submission)
- Use the `secondary` variant for alternative actions
- Use the `tertiary` variant for minor actions that should have minimal visual weight
