---
title: Input Component
sidebar_label: <primer-input>
description: A versatile input component that can be used for custom fields in your checkout forms.
slug: /components/input
---

# Input Component
## \<primer-input\>

The Input component is a versatile wrapper around the native HTML input element that provides consistent styling and additional functionality. It can be used to create custom fields that match the appearance of the card form fields.

## Usage

```html
<primer-input
  type="text"
  placeholder="Enter value"
  value="Initial value">
</primer-input>
```

## Properties

| Property       | Attribute      | Type        | Default  | Description                                   |
|----------------|----------------|-------------|----------|-----------------------------------------------|
| `value`        | `value`        | `string`    | `''`     | The input's current value                     |
| `placeholder`  | `placeholder`  | `string`    | `''`     | Placeholder text when the input is empty      |
| `disabled`     | `disabled`     | `boolean`   | `false`  | Whether the input is disabled                 |
| `name`         | `name`         | `string`    | `''`     | The name of the input for form submission     |
| `type`         | `type`         | `InputType` | `'text'` | The type of input (see supported types below) |
| `required`     | `required`     | `boolean`   | `false`  | Whether the input is required                 |
| `readonly`     | `readonly`     | `boolean`   | `false`  | Whether the input is read-only                |
| `pattern`      | `pattern`      | `string`    | `''`     | Regex pattern for validation                  |
| `minlength`    | `minlength`    | `number`    | —        | Minimum input length for validation           |
| `maxlength`    | `maxlength`    | `number`    | —        | Maximum input length for validation           |
| `min`          | `min`          | `string`    | `''`     | Minimum value for number/date inputs          |
| `max`          | `max`          | `string`    | `''`     | Maximum value for number/date inputs          |
| `step`         | `step`         | `string`    | `''`     | Step value for number inputs                  |
| `autocomplete` | `autocomplete` | `string`    | `''`     | Autocomplete attribute value                  |
| `id`           | `id`           | `string`    | `''`     | ID attribute for the input                    |

### Supported Input Types

The following input types are supported:
- `text`
- `password`
- `email`
- `number`
- `tel`
- `url`
- `search`
- `date`
- `time`
- `datetime-local`
- `month`
- `week`
- `color`

## Events

| Event Name | Description                                  | Event Detail             |
|------------|----------------------------------------------|--------------------------|
| `input`    | Fired when the input value changes           | Current input value      |
| `change`   | Fired when the input value is committed      | Current input value      |
| `focus`    | Fired when the input receives focus          | Standard FocusEvent      |
| `blur`     | Fired when the input loses focus             | Standard FocusEvent      |
| `invalid`  | Fired when the input fails validation        | Standard Event           |

## Methods

| Method              | Parameters                                       | Return Type | Description                              |
|---------------------|--------------------------------------------------|-------------|------------------------------------------|
| `focus`             | `options?: FocusOptions`                         | `void`      | Focus the input element                  |
| `blur`              | —                                                | `void`      | Remove focus from the input element      |
| `select`            | —                                                | `void`      | Select all text in the input element     |
| `setSelectionRange` | `start: number, end: number, direction?: string` | `void`      | Set the selection range of the input     |
| `checkValidity`     | —                                                | `boolean`   | Check if the input element is valid      |
| `reportValidity`    | —                                                | `boolean`   | Report the validity of the input element |

## CSS Parts

| Part      | Description                          |
|-----------|--------------------------------------|
| `input`   | The native input element             |

## CSS Custom Properties

The Input component inherits styling from your theme variables. It uses these key custom properties:

| Property                                     | Description                       |
|----------------------------------------------|-----------------------------------|
| `--primer-typography-body-large-line-height` | Line height for the input text    |
| `--primer-typography-body-large-size`        | Font size for the input text      |
| `--primer-typography-body-large-font`        | Font family for the input text    |
| `--primer-color-text-primary`                | Text color for the input          |
| `--primer-color-text-placeholder`            | Color for the placeholder text    |
| `--primer-color-text-disabled`               | Text color when input is disabled |

## Examples

### Basic Text Input

```html
<primer-input
  type="text"
  placeholder="Enter your name"
  name="customer-name">
</primer-input>
```

### Custom Field in Card Form

The Input component can be used to add custom fields to your payment form that match the style of the card form fields:

```html
<primer-card-form>
  <div slot="card-form-content">
    <primer-input-card-number></primer-input-card-number>
    <div style="display: flex; gap: 8px;">
      <primer-input-card-expiry></primer-input-card-expiry>
      <primer-input-cvv></primer-input-cvv>
    </div>

    <!-- Custom field using primer-input -->
    <primer-input-wrapper>
      <primer-input-label slot="label">Reference Number</primer-input-label>
      <primer-input
        slot="input"
        type="text"
        name="reference"
        placeholder="Enter your reference number">
      </primer-input>
    </primer-input-wrapper>

    <button type="submit">Pay Now</button>
  </div>
</primer-card-form>
```

### Discount Code Field

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Discount Code</primer-input-label>
  <div slot="input" style="display: flex; gap: 8px;">
    <primer-input id="discount-code"></primer-input>
    <primer-button>Apply</primer-button>
  </div>
</primer-input-wrapper>
```

### Form with Validation

```html
<form id="customer-details">
  <primer-input-wrapper>
    <primer-input-label slot="label">Email Address</primer-input-label>
    <primer-input
      slot="input"
      type="email"
      name="email"
      required
      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$">
    </primer-input>
  </primer-input-wrapper>

  <primer-input-wrapper>
    <primer-input-label slot="label">Phone Number</primer-input-label>
    <primer-input
      slot="input"
      type="tel"
      name="phone"
      pattern="[0-9]{10}">
    </primer-input>
  </primer-input-wrapper>
  
  <button type="submit">Submit</button>
</form>

<script>
  document.getElementById('customer-details').addEventListener('submit', (event) => {
    event.preventDefault();
    // Collect form data
    const formData = new FormData(event.target);
    const customerData = Object.fromEntries(formData.entries());
    console.log('Customer data:', customerData);
  });
</script>
```

## Notes

- For a complete form control with label and error handling, wrap this component with `primer-input-wrapper` and use appropriate slots
- The input component matches the styling of card form fields when used within the same layout
- When wrapped in `primer-input-wrapper`, clicking anywhere in the wrapper area will focus the input
- Use the `invalid` event to implement custom validation behavior
- For numeric inputs, use the `type="number"` and appropriate `min`, `max`, and `step` attributes
