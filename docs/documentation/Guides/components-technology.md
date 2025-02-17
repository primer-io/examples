---
sidebar_position: 2
title: Technology
---

# Understanding Primer Components Technology

This guide introduces the core technologies that power Primer Components. While you won't need to implement these technologies directly, understanding them will help you better use and customize Primer Components in your projects.

:::tip What you'll learn
- The technologies that make Primer Components work
- How these technologies enable component isolation and customization
- What these technical foundations mean for your development experience
  :::

## Web Components: The Foundation

Primer Components are built on Web Components - a set of web platform features that enable reusable, encapsulated components. Think of them as specialized HTML elements that:

- Keep their internal workings private and protected
- Can be easily customized through properties and attributes
- Work consistently across different frameworks and environments

### What This Means For You

- **Framework Independence**: Primer Components work in any JavaScript environment
- **Consistent Behavior**: Components behave the same way regardless of your tech stack
- **Future-Proof**: Built on web standards that browsers will support long-term

## Shadow DOM: Style Isolation

Shadow DOM is like a protective bubble around each component that:
- Keeps component styles from affecting your application
- Prevents your application styles from breaking components
- Enables consistent component appearance across different contexts

```html
<!-- Your application styles won't affect the internal structure -->
<primer-button>
  #shadow-root (open)
    <!-- Protected internal component structure -->
    <button class="primer-button">
      <slot></slot>
    </button>
</primer-button>
```

### What This Means For You

- **Reliability**: Components maintain their intended appearance
- **No Style Conflicts**: Your CSS won't accidentally break components
- **Predictable Behavior**: Components work consistently across different style environments

## Slots: A Native Content Distribution System

Slots are a built-in browser feature that allows components to receive and display content from their consumers. Think of slots as designated "spaces" in a component where you can insert your own HTML content - similar to how a physical binder has slots for inserting different sections of paper.

### Why Slots?

Slots were introduced as part of the Web Components standard to solve a common problem: how can reusable components accept and display arbitrary content while maintaining their encapsulation? The slot system provides a native, performant solution that:

- Works directly in the browser without additional libraries
- Maintains proper DOM structure and events
- Enables dynamic content updates without component rebuilds

### How Slots Work

```html
<!-- A primer-card component with multiple slots -->
<primer-card>
  <!-- Named slot: specifically for header content -->
  <h2 slot="header">Quarterly Report</h2>
  
  <!-- Default slot: content without a slot name -->
  <p>Primary content goes here automatically</p>
  <ul>
    <li>Can include any HTML elements</li>
    <li>All nicely organized in the default slot</li>
  </ul>
  
  <!-- Named slot: specifically for footer content -->
  <button slot="footer">Download PDF</button>
</primer-card>
```

### Types of Slots

1. **Default Slots**
   ```html
   <primer-alert>
     <!-- Content automatically goes into the default slot -->
     <p>This is a simple alert message</p>
   </primer-alert>
   ```

2. **Named Slots**
   ```html
   <primer-dialog>
     <!-- Specific content areas using named slots -->
     <h3 slot="title">Settings</h3>
     <div slot="body">
       <p>Configure your preferences here</p>
     </div>
     <div slot="footer">
       <button>Save</button>
       <button>Cancel</button>
     </div>
   </primer-dialog>
   ```

3. **Multiple Content Elements in One Slot**
   ```html
   <primer-sidebar>
     <!-- Multiple elements can go into the same slot -->
     <a href="/home" slot="navigation">Home</a>
     <a href="/profile" slot="navigation">Profile</a>
     <a href="/settings" slot="navigation">Settings</a>
   </primer-sidebar>
   ```

### What This Means For You

- **Natural HTML Structure**: Write your content using standard HTML - slots organize it automatically
- **Flexible Content**: Insert any HTML elements, components, or text into slots
- **Dynamic Updates**: Add, remove, or modify slotted content anytime - the component adapts automatically
- **Framework Compatible**: Slots work with any framework's templating system
- **Performance**: Browser-native feature means optimal performance without additional overhead

:::tip Pro Tip
Think of slots as labeled sections in your component. Just like you'd put specific papers in specific sections of a binder, you put specific content in specific slots of your component. The component handles displaying everything in the right place!
:::

## Lit: Enhanced Functionality

Lit provides the reactive foundation for Primer Components, enabling them to:
- Update efficiently when data changes
- Handle events consistently
- Manage component state effectively

### What This Means For You

- **Performance**: Components update quickly and efficiently
- **Reliability**: Consistent behavior across different scenarios
- **Modern Features**: Access to modern web capabilities while maintaining compatibility

## Understanding Component Customization

Primer Components can be customized in several ways:

1. **Properties and Attributes**:
```html
<!-- Customize behavior through attributes -->
<primer-button variant="primary" size="large">
  Submit
</primer-button>
```

2. **Content Slots**:
```html
<!-- Insert custom content in designated areas -->
<primer-dialog>
  <span slot="title">Settings</span>
  <div slot="body">Dialog content here</div>
</primer-dialog>
```

3. **CSS Custom Properties**:
```css
/* Customize component appearance using CSS variables */
primer-button {
  --primer-button-border-radius: 8px;
}
```

## Browser Support

Primer Components work in all modern browsers:

| Browser | Support |
|---------|----------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |

:::note
Primer Components handle browser compatibility for you - you don't need to worry about polyfills or compatibility layers.
:::

## Key Takeaways

Understanding these technologies helps you:
- **Use Components Effectively**: Know where and how to customize
- **Debug More Easily**: Understand component boundaries and behavior
- **Build Better UIs**: Take advantage of component isolation and composition

:::tip Remember
You don't need to implement these technologies yourself - Primer Components handle the complexity for you. This knowledge simply helps you use the components more effectively.
:::
