---
title: Input Error Component
sidebar_label: <primer-input-error>
description: A component for displaying validation error messages with proper styling and accessibility features.
slug: /components/input-error
---

# Input Error Component
## \<primer-input-error\>

The Input Error component displays validation error messages with consistent styling and proper accessibility features. It's designed to work with Primer form components to provide clear feedback when validation fails.

## Usage

```html
<primer-input-error for="email-input" active>
  Please enter a valid email address
</primer-input-error>
```

Or, more commonly, within an input wrapper:

```html
<primer-input-wrapper has-error>
  <primer-input-label slot="label" for="password-input">Password</primer-input-label>
  <primer-input slot="input" id="password-input" type="password"></primer-input>
  <primer-input-error slot="error" for="password-input">
    Password must be at least 8 characters
  </primer-input-error>
</primer-input-wrapper>
```

## Properties

| Property | Attribute | Type      | Default | Description                                                  |
|----------|-----------|-----------|---------|--------------------------------------------------------------|
| `for`    | `for`     | `string`  | `''`    | ID of the form control this error message is associated with |
| `active` | `active`  | `boolean` | `true`  | Whether the error is currently active/visible                |

## Slots

| Name      | Description                                        |
|-----------|----------------------------------------------------|
| `default` | Content of the error message (text content)        |

## Accessibility

The Input Error component includes proper accessibility attributes:

- Uses `role="alert"` to ensure screen readers announce the error
- Uses `aria-live="polite"` to announce changes when they occur
- Correctly associates with the input via the `for` attribute

## CSS Custom Properties

The Input Error component uses these CSS custom properties for styling:

| Property                                | Description                            |
|-----------------------------------------|----------------------------------------|
| `--primer-color-text-negative`          | Text color for error messages          |
| `--primer-typography-body-small-size`   | Font size for error messages           |
| `--primer-typography-body-small-line-height` | Line height for error messages    |
| `--primer-typography-body-small-font`   | Font family for error messages         |

## Examples

### Basic Usage

```html
<primer-input-error for="ccnumber" active>
  Credit card number is invalid
</primer-input-error>
```

### Toggling Error Visibility

```html
<primer-input id="email" type="email"></primer-input>
<primer-input-error id="email-error" for="email" active="false">
  Please enter a valid email address
</primer-input-error>

<script>
  const input = document.querySelector('#email');
  const error = document.querySelector('#email-error');
  
  input.addEventListener('blur', () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    error.active = !isValid;
    
    // Also update wrapper if being used
    const wrapper = input.closest('primer-input-wrapper');
    if (wrapper) {
      wrapper.hasError = !isValid;
    }
  });
</script>
```

### Within Input Wrapper

```html
<primer-input-wrapper id="password-wrapper">
  <primer-input-label slot="label" for="password">Create Password</primer-input-label>
  <primer-input 
    slot="input" 
    id="password" 
    type="password"
    minlength="8"
  ></primer-input>
  <primer-input-error slot="error" id="password-error" for="password" active="false">
    Password must be at least 8 characters
  </primer-input-error>
</primer-input-wrapper>

<script>
  const input = document.querySelector('#password');
  const error = document.querySelector('#password-error');
  const wrapper = document.querySelector('#password-wrapper');
  
  input.addEventListener('invalid', () => {
    error.active = true;
    wrapper.hasError = true;
  });
  
  input.addEventListener('input', () => {
    if (input.validity.valid) {
      error.active = false;
      wrapper.hasError = false;
    }
  });
</script>
```

### Multiple Errors

```html
<primer-input-wrapper id="password-wrapper">
  <primer-input-label slot="label" for="password">Create Password</primer-input-label>
  <primer-input 
    slot="input" 
    id="password" 
    type="password"
  ></primer-input>
  <div slot="error">
    <primer-input-error id="length-error" for="password" active="false">
      Password must be at least 8 characters
    </primer-input-error>
    <primer-input-error id="uppercase-error" for="password" active="false">
      Password must contain at least one uppercase letter
    </primer-input-error>
    <primer-input-error id="number-error" for="password" active="false">
      Password must contain at least one number
    </primer-input-error>
  </div>
</primer-input-wrapper>
```

## Notes

- The error is displayed by default when created (`active=true`)
- Set `active="false"` to hide the error initially
- When used inside a `primer-input-wrapper`, add the `has-error` attribute to the wrapper to apply error styling to the input field
- Use the `slot="error"` attribute when placing inside a `primer-input-wrapper`
- For complex validation, toggle different error components based on specific validation rules
