---
title: Theming Implementation Guide
sidebar_label: Theming Implementation
sidebar_position: 3
description: How to properly implement themes with Primer Checkout components
---

# Theming Implementation Guide

This guide explains how to properly implement custom themes for the Primer Checkout components, including both light and dark themes, as well as how to create and apply your own custom themes.

## Understanding Theme Implementation

Primer Checkout provides two main approaches for styling your checkout experience:

1. **CSS Variables Method**: Apply styling directly in your CSS
2. **JSON Properties Method**: Apply styling through component attributes

Both methods use the same underlying styling variables, but are applied differently depending on your implementation needs.

## Basic Theme Implementation

The most basic theming implementation involves applying CSS variables to the `primer-checkout` component:

```css
/* Apply styling directly to the primer-checkout component */
primer-checkout {
  --primer-color-brand: #2f98ff;
  --primer-radius-medium: 8px;
  --primer-typography-brand: 'Inter', sans-serif;
}
```

## Using the Built-in Dark Theme

Primer Checkout includes a built-in dark theme that can be enabled by adding the `primer-dark-theme` class to your `primer-checkout` component:

```html
<primer-checkout class="primer-dark-theme" client-token="your-client-token"></primer-checkout>
```

:::important
The default light theme does not require a special class. Only apply the `primer-dark-theme` class when you want to switch to dark mode.
:::

## Creating Custom Themes

You can create custom themes by defining your own CSS classes with the appropriate variables:

```css
/* Define a custom theme class */
.my-custom-theme {
  /* Core variables */
  --primer-color-brand: #9c27b0;
  --primer-color-background: #f3e5f5;
  --primer-color-focus: #9c27b0;
  --primer-typography-brand: 'Roboto', sans-serif;
  
  /* Text colors */
  --primer-color-text-primary: #333333;
  --primer-color-text-placeholder: #9e9e9e;
  
  /* Border radius */
  --primer-radius-small: 4px;
  --primer-radius-medium: 8px;
  
  /* Additional variables as needed */
}
```

Then apply this class to your checkout component:

```html
<primer-checkout class="my-custom-theme" client-token="your-client-token"></primer-checkout>
```

## Dynamically Switching Themes

To dynamically switch between themes, you can use JavaScript to change the class on the `primer-checkout` component:

```javascript
// Function to toggle between themes
function applyTheme(themeName) {
  const checkoutElement = document.querySelector('primer-checkout');
  
  // Remove any existing theme classes
  checkoutElement.classList.remove('primer-dark-theme', 'my-custom-theme');
  
  // Apply the selected theme
  if (themeName === 'dark') {
    checkoutElement.classList.add('primer-dark-theme');
  } else if (themeName === 'custom') {
    checkoutElement.classList.add('my-custom-theme');
  }
  // If 'light' or default, no class is needed
}

// Examples
applyTheme('dark');    // Apply dark theme
applyTheme('custom');  // Apply custom theme
applyTheme('light');   // Apply light theme
```

## Common Issues and Solutions

### Theme Not Applying

If your theme is not being applied correctly, check the following:

1. **Class Application**: Ensure the theme class is applied directly to the `primer-checkout` component, not to a parent container.

   ```html
   <!-- Correct ✅ -->
   <primer-checkout class="primer-dark-theme"></primer-checkout>
   
   <!-- Incorrect ❌ -->
   <div class="primer-dark-theme">
     <primer-checkout></primer-checkout>
   </div>
   ```

2. **CSS Specificity**: Make sure your CSS selectors are specific enough and not being overridden.

   ```css
   /* More specific selector */
   primer-checkout.my-custom-theme {
     --primer-color-brand: #9c27b0;
   }
   ```

3. **Dynamic Changes**: When applying theme changes dynamically, ensure you're reinitializing the component properly.

### CSS Variables Not Working

If CSS variables are not being applied:

1. **Browser Support**: Ensure your target browsers support CSS variables.
2. **Naming Convention**: Verify that you're using the correct variable names from the Styling API documentation.
3. **Scope**: Make sure variables are scoped to the correct element or class.

## Best Practices

1. **Organize Theme Files**: Keep each theme in a separate CSS file for better maintainability.
2. **Use CSS Variables**: Leverage CSS variables for all customizations to ensure consistent styling.
3. **Test Across Browsers**: Validate your theme works correctly across different browsers.
4. **Document Your Themes**: Create a theme documentation file to track your customizations.
5. **Maintain Accessibility**: Ensure color contrasts meet accessibility standards, especially for custom themes.

## Dynamic Theme Switching Implementation

Here's a complete example of a theme-switching implementation with navigation buttons:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Themed Checkout</title>
  <style>
    /* Default (Light) Theme - No special class needed */
    primer-checkout {
      --primer-color-brand: #2f98ff;
      --primer-color-background: #ffffff;
      --primer-color-text-primary: #212121;
    }
    
    /* Dark Theme */
    primer-checkout.primer-dark-theme {
      --primer-color-gray-100: #292929;
      --primer-color-gray-200: #424242;
      --primer-color-gray-300: #575757;
      --primer-color-gray-400: #858585;
      --primer-color-gray-500: #767577;
      --primer-color-gray-600: #c7c7c7;
      --primer-color-gray-900: #efefef;
      --primer-color-gray-000: #171619;
      --primer-color-brand: #2f98ff;
      --primer-color-red-100: #321c20;
      --primer-color-red-500: #e46d70;
      --primer-color-red-900: #f6bfbf;
      --primer-color-blue-500: #3f93e4;
      --primer-color-blue-900: #4aaeff;
    }
    
    /* Custom Theme */
    primer-checkout.purple-theme {
      --primer-color-brand: #673ab7;
      --primer-color-background: #f5f0ff;
      --primer-color-text-primary: #311b92;
      --primer-color-text-placeholder: #9575cd;
    }
    
    /* Theme navigation buttons */
    .theme-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: 0.5rem;
    }
    
    .theme-nav-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #ddd;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 1.2rem;
    }
    
    .theme-nav-btn:hover {
      background-color: #2f98ff;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="theme-selector">
      <label for="theme-select">Select Theme:</label>
      <select id="theme-select">
        <option value="light">Light Theme</option>
        <option value="dark">Dark Theme</option>
        <option value="purple">Purple Theme</option>
      </select>
      <div class="theme-nav">
        <button id="prev-theme" class="theme-nav-btn" aria-label="Previous theme">←</button>
        <button id="next-theme" class="theme-nav-btn" aria-label="Next theme">→</button>
      </div>
    </div>
    
    <div id="checkout-container">
      <primer-checkout id="checkout"></primer-checkout>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const checkout = document.getElementById('checkout');
      const themeSelect = document.getElementById('theme-select');
      const prevThemeBtn = document.getElementById('prev-theme');
      const nextThemeBtn = document.getElementById('next-theme');
      
      // Apply theme based on selection
      function applyTheme(theme) {
        // Remove all theme classes
        checkout.className = '';
        
        // Apply the selected theme
        if (theme === 'dark') {
          checkout.classList.add('primer-dark-theme');
        } else if (theme === 'purple') {
          checkout.classList.add('purple-theme');
        }
        // No class needed for light theme
        
        // If needed, reinitialize the checkout
        if (checkout.clientToken) {
          // Store the current token
          const currentToken = checkout.clientToken;
          
          // Reset and reapply the token
          setTimeout(() => {
            checkout.clientToken = currentToken;
          }, 50);
        }
      }
      
      // Navigate through themes
      function navigateTheme(direction) {
        const options = Array.from(themeSelect.options);
        const currentIndex = themeSelect.selectedIndex;
        let newIndex;
        
        if (direction === 'prev') {
          newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        } else {
          newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1;
        }
        
        themeSelect.selectedIndex = newIndex;
        applyTheme(themeSelect.value);
        localStorage.setItem('preferred-theme', themeSelect.value);
      }
      
      // Handle theme changes
      themeSelect.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
        
        // Save preference if needed
        localStorage.setItem('preferred-theme', selectedTheme);
      });
      
      // Add navigation button events
      prevThemeBtn.addEventListener('click', () => navigateTheme('prev'));
      nextThemeBtn.addEventListener('click', () => navigateTheme('next'));
      
      // Load saved preference
      const savedTheme = localStorage.getItem('preferred-theme');
      if (savedTheme) {
        themeSelect.value = savedTheme;
        applyTheme(savedTheme);
      }
    });
  </script>
</body>
</html>
```

## Conclusion

Properly implementing themes in the Primer Checkout components requires applying the appropriate CSS classes directly to the `primer-checkout` component. The dark theme can be enabled with the `primer-dark-theme` class, and custom themes can be created by defining your own classes with the necessary CSS variables.

When switching themes dynamically, ensure you're applying the classes correctly and consider reinitializing the component to ensure the theme is fully applied.
