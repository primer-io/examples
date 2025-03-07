---
title: Input Wrapper Component
sidebar_label: <primer-input-wrapper>
description: A container component that provides enhanced interaction and styling for input elements.
slug: /components/input-wrapper
---

# Input Wrapper Component
## \<primer-input-wrapper\>

The Input Wrapper component provides a consistent container for input elements, handling focus states, error styling, and enhancing user interactions. It improves the user experience by making the entire wrapper clickable to focus the inner input.

## Usage

The Input Wrapper component is designed to be used with input components and provides slots for labels, inputs, and error messages:

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Email Address</primer-input-label>
  <primer-input slot="input" type="email" placeholder="you@example.com"></primer-input>
  <span slot="error">Please enter a valid email address.</span>
</primer-input-wrapper>
```

## Properties

| Property      | Attribute      | Type      | Default | Description                                 |
|---------------|----------------|-----------|---------|---------------------------------------------|
| `focusWithin` | `focus-within` | `boolean` | `false` | Indicates if the contained input is focused |
| `hasError`    | `has-error`    | `boolean` | `false` | Applies error styling when true             |

## Slots

| Name    | Description                                           |
|---------|-------------------------------------------------------|
| `label` | Container for the input label (typically `primer-input-label`) |
| `input` | Container for the input element                       |
| `error` | Container for error messages                          |

## Events

| Event Name     | Description                                         | Event Detail |
|----------------|-----------------------------------------------------|--------------|
| `wrapper-click` | Fired when the wrapper is clicked (not its children) | `{}`         |

## Features

- **Enhanced Focus Behavior**: Clicking anywhere on the wrapper automatically focuses the contained input element
- **Intuitive Cursor Styling**: The wrapper displays a text cursor to indicate text input functionality
- **Automatic Input Detection**: Automatically detects and focuses `primer-input` elements when clicked
- **Support for Hosted Inputs**: Works with both standard inputs and secure hosted iframe inputs
- **Focus and Error States**: Visual indicators for focus and error states

## CSS Custom Properties

The Input Wrapper component uses these CSS custom properties for styling:

| Property                                   | Description                             |
|--------------------------------------------|-----------------------------------------|
| `--primer-color-border-outlined-focus`     | Border color when focused               |
| `--primer-color-border-outlined-error`     | Border color when in error state        |
| `--primer-color-background-outlined-error` | Background color when in error state    |
| `--primer-space-xsmall`                    | Spacing between wrapper elements        |
| `--primer-space-medium`                    | Internal padding of the input container |
| `--primer-radius-small`                    | Border radius for the input container   |

## Examples

### Basic Usage with Simple Input

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Full Name</primer-input-label>
  <primer-input slot="input" placeholder="Enter your full name"></primer-input>
</primer-input-wrapper>
```

### With Error State and Message

```html
<primer-input-wrapper has-error>
  <primer-input-label slot="label">Password</primer-input-label>
  <primer-input slot="input" type="password"></primer-input>
  <span slot="error">Password must be at least 8 characters</span>
</primer-input-wrapper>
```

### With Card Form Inputs

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Card Number</primer-input-label>
  <div slot="input" id="card-number-container"></div>
</primer-input-wrapper>
```

### With Nested Input Components

```html
<primer-input-wrapper>
  <primer-input-label slot="label">Search</primer-input-label>
  <div slot="input" style="display: flex; gap: 8px;">
    <primer-input placeholder="Search products..."></primer-input>
    <primer-button>Search</primer-button>
  </div>
</primer-input-wrapper>
```

## Notes

- The wrapper detects and automatically focuses `primer-input` elements when clicked
- For hosted inputs (like secure card inputs), it dispatches a `wrapper-click` event that these components can listen for
- The cursor changes to a text cursor (`cursor: text`) when hovering over the input area to indicate text input functionality
- When a wrapper has an error, both the focus and hover states will display error styling
- Use with `primer-input-label` for consistent label styling across your application
