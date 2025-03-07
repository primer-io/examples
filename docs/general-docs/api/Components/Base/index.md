---
title: Base Components
sidebar_position: 4
---

# Base Components

## Overview

The Base Components folder contains the fundamental UI building blocks of the Primer Composable Checkout SDK. These components are designed to be simple, reusable, and consistent across all checkout implementations.

Think of these components as the foundation of the design system - the essential elements that combine to create more complex interfaces.

## Purpose

Base Components serve several key purposes in the SDK architecture:

- **Consistency**: They ensure visual and interactive elements behave predictably throughout the checkout experience
- **Reusability**: They can be composed together to build more complex components and interfaces
- **Maintainability**: Changes to these core components automatically propagate to all implementations
- **Accessibility**: They implement accessibility best practices at the foundation level

## Available Components

The current Base Components collection includes:

| Component                                             | Description                                               |
|-------------------------------------------------------|-----------------------------------------------------------|
| [`<primer-button>`](/components/button)               | A versatile button component with multiple style variants |
| [`<primer-input>`](/components/input)                 | A customizable input field for text and other data types  |
| [`<primer-input-error>`](/components/input-error)     | A component for displaying validation error messages      |
| [`<primer-input-label>`](/components/input-label)     | A label component for form elements                       |
| [`<primer-input-wrapper>`](/components/input-wrapper) | A container component that enhances input interactions    |

Additional base components may be added in future releases to expand the design system capabilities.

## Styling

All Base Components automatically inherit styling variables from the primary checkout component, ensuring they respect your custom theme settings without additional configuration. This inheritance system means that:

- Base Components maintain visual consistency with your overall checkout design
- Theme changes are automatically applied to all Base Components
- Components adapt to both light and dark modes without extra code

## Usage Patterns

Base Components can be used:

- Directly within checkout forms when simple UI elements are needed
- As building blocks for creating more complex, composite components
- In custom implementations where standard form elements are required

For detailed implementation examples, refer to the documentation for each individual component.
