---
title: Input Label Component
sidebar_label: <primer-input-label>
description: A label component for form elements that provides consistent styling and accessibility.
slug: /components/input-label
---

# Input Label Component
## \<primer-input-label\>

The Input Label component provides a standardized way to label form elements with consistent styling and proper accessibility. It's designed to work with Primer input components and maintains design consistency across your forms.

## Usage

```html
<primer-input-label for="email-input">Email Address</primer-input-label>
<primer-input id="email-input" type="email"></primer-input>
```

Or, more commonly, within an input wrapper:

```html
<primer-input-wrapper>
  <primer-input-label slot="label" for="name-input">Full Name</primer-input-label>
  <primer-input slot="input" id="name-input"></primer-input>
</primer-input-wrapper>
```

## Properties

| Property   | Attribute  | Type      | Default | Description                                          |
|------------|------------|-----------|---------|------------------------------------------------------|
| `for`      | `for`      | `string`  | `''`    | ID of the form control this label is associated with |
| `disabled` | `disabled` | `boolean` | `false` | Whether the label should appear disabled             |

## Slots

| Name       | Description                         |
|------------|-------------------------------------|
| `default`  | Content of the label (text content) |

## CSS Custom Properties

The Input Label component uses these CSS custom properties for styling:

| Property                                        | Description                       |
|-------------------------------------------------|-----------------------------------|
| `--primer-typography-body-small-weight`         | Font weight for the label         |
| `--primer-typography-body-small-size`           | Font size for the label           |
| `--primer-typography-body-small-letter-spacing` | Letter spacing for the label      |
| `--primer-typography-body-small-line-height`    | Line height for the label         |
| `--primer-color-text-primary`                   | Text color for the label          |
| `--primer-typography-body-small-font`           | Font family for the label         |
| `--primer-color-text-disabled`                  | Text color when label is disabled |

## Accessibility

This component generates a semantic `<label>` element that is properly associated with its input field via the `for` attribute. This ensures:

- Screen readers announce the label when users focus on the input
- Clicking the label focuses the associated input (when properly linked via the `for` attribute)
- The form remains accessible to all users

## Examples

### Basic Usage

```html
<primer-input-label for="email">Email Address</primer-input-label>
<primer-input id="email" type="email"></primer-input>
```

### With Disabled State

```html
<primer-input-label for="username" disabled>Username</primer-input-label>
<primer-input id="username" disabled></primer-input>
```

### Within Input Wrapper

```html
<primer-input-wrapper>
  <primer-input-label slot="label" for="phone">Phone Number</primer-input-label>
  <primer-input slot="input" id="phone" type="tel"></primer-input>
</primer-input-wrapper>
```

### With Required Field

```html
<primer-input-wrapper>
  <primer-input-label slot="label" for="email">
    Email Address <span style="color: red">*</span>
  </primer-input-label>
  <primer-input 
    slot="input" 
    id="email" 
    type="email" 
    required
  ></primer-input>
</primer-input-wrapper>
```

## Notes

- Always associate labels with inputs using the `for` attribute matched to the input's `id`
- When using the `disabled` attribute, ensure the associated input is also disabled for consistency
- Use the Input Label component inside the "label" slot of `primer-input-wrapper` for proper layout
- The label uses smaller text than the input field to maintain proper visual hierarchy
