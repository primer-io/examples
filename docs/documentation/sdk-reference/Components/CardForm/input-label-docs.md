---
title: Input Label Component
sidebar_label: <primer-input-label>
description: A label component that provides consistent typography styling for input fields.
slug: /components/card-form/input-label
---

# Input Label Component

## \<primer-input-label\>

The `primer-input-label` component provides consistent label styling for input fields. It's used internally by card input components and can be used directly within `primer-input-wrapper` for custom form fields.

## Usage

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Discount Code</primer-input-label>
  <div slot="input">
    <primer-input id="discount-code"></primer-input>
  </div>
</primer-input-wrapper>
```

### Disabled State

```html
<primer-input-label disabled>Discount Code</primer-input-label>
```

## Properties

| Property   | Type      | Default | Description                           |
| ---------- | --------- | ------- | ------------------------------------- |
| `disabled` | `boolean` | `false` | Applies disabled styling to the label |

## CSS Custom Properties

### Typography

| Property                                        | Description          |
| ----------------------------------------------- | -------------------- |
| `--primer-typography-body-small-font`           | Label font family    |
| `--primer-typography-body-small-size`           | Label font size      |
| `--primer-typography-body-small-weight`         | Label font weight    |
| `--primer-typography-body-small-line-height`    | Label line height    |
| `--primer-typography-body-small-letter-spacing` | Label letter spacing |

### Color

| Property                       | Description                    |
| ------------------------------ | ------------------------------ |
| `--primer-color-text-primary`  | Default label text color       |
| `--primer-color-text-disabled` | Label text color when disabled |

## Related Components

- [Input Wrapper](/components/card-form/input-wrapper) - Parent wrapper component for inputs
- [Card Form](/sdk-reference/Components/CardForm/) - Card form container
