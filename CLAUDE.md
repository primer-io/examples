# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Yarn workspaces monorepo using Turbo for task orchestration. It contains:

- `/docs` - Docusaurus documentation site for Primer's Beta SDK Components
- `/examples` - Multiple standalone integration examples demonstrating `@primer-io/primer-js` SDK usage
- Root workspace - Shared tooling (Prettier, Turbo, git hooks) and monorepo coordination

**Note**: The `/docs` directory has its own `CLAUDE.md` with detailed documentation-specific guidelines. When working on documentation, refer to `/docs/CLAUDE.md`.

## Common Commands

### Root Level (Turbo-Managed)

- `yarn dev` - Start all development servers (docs + examples) in parallel
- `yarn lint:es` - Run ESLint across all workspaces
- `yarn lint:ts` - Run TypeScript type checking across all workspaces
- `yarn format` - Format all files with Prettier (auto-fix)
- `yarn lint:format` - Check Prettier formatting without fixing

### Working with Individual Workspaces

Navigate to the specific workspace directory and run:

- `cd docs && yarn dev` - Start docs site on port 9000
- `cd examples/primer-checkout-basic && yarn dev` - Start specific example

### Git Hooks

Pre-commit hook runs `lint-staged` which formats staged files with Prettier automatically.

## Monorepo Architecture

### Turbo Configuration

Turbo manages task dependencies via `turbo.json`:

- `build` tasks depend on dependencies being built first (`^build`)
- `dev` tasks run persistently without caching
- `lint` and `check-types` depend on `transit` tasks

### Yarn Workspaces

Workspaces are defined in root `package.json`:

- `packages/*` - Shared utilities (currently empty)
- `docs` - Documentation site workspace
- `examples/*` - Each example is an independent workspace

Nohoist configuration prevents hoisting of React, TypeScript, and related packages to ensure version consistency per workspace.

## Examples Structure

Each example in `/examples` is a standalone demonstration:

### Common Patterns Across Examples

- **Build Tool**: Vite with TypeScript
- **SDK Version**: `@primer-io/primer-js` 0.3.3
- **Entry Point**: `index.html` → `src/main.ts`
- **Client Token Utility**: Most examples include `fetchClientToken.ts` helper
- **Standard Commands**: `yarn dev`, `yarn build`, `yarn preview`

### Example Types

1. **Basic Examples** (`primer-checkout-basic`)
   - Vanilla TypeScript + Vite
   - Minimal dependencies
   - Focus on SDK fundamentals

2. **React Examples** (`primer-checkout-custom-layout`, `primer-checkout-custom-form`)
   - React 19 + Vite + TypeScript
   - Include ESLint configuration
   - Demonstrate component integration patterns
   - Commands: `yarn dev`, `yarn build`, `yarn lint`, `yarn check-types`

3. **Theme/Customization Examples** (`primer-checkout-themes`, `primer-checkout-vaulted`)
   - Show styling and theming capabilities
   - Demonstrate advanced SDK features

### Working with Examples

When creating or modifying examples:

- Follow the existing structure pattern (Vite + TypeScript)
- Include README.md with setup instructions
- Use `@primer-io/primer-js` SDK for payment integrations
- Ensure examples are self-contained and runnable
- Test with `yarn dev` before committing

## Code Style

### TypeScript

- Use TypeScript for all code (examples and docs components)
- Strict mode enabled in most workspaces
- Define explicit types for Props and function returns

### Formatting

- 2-space indentation (enforced by Prettier)
- Single quotes for strings (except JSX attributes)
- Trailing commas in multi-line structures
- Pre-commit hook auto-formats staged files

### Component Patterns (React Examples)

- Functional components with arrow functions
- Named exports preferred
- Import order: React → third-party → local
- PascalCase for components, camelCase for functions/variables

## Development Workflow

### Starting Development

1. Install dependencies: `yarn install` (run at root)
2. Start everything: `yarn dev` (starts all workspaces)
3. Or start specific workspace: `cd docs && yarn dev`

### Testing Changes

- Type checking: `yarn lint:ts` (root) or `yarn check-types` (workspace)
- Linting: `yarn lint:es` (root) or `yarn lint` (workspace with ESLint)
- Format checking: `yarn lint:format`
- Build verification: Navigate to workspace and run `yarn build`

### Adding New Examples

1. Create new directory in `/examples`
2. Set up Vite + TypeScript with standard structure
3. Add workspace to root `package.json` (auto-detected via glob)
4. Include README.md with setup instructions
5. Use consistent commands: `dev`, `build`, `preview`

## Key Technical Details

### Primer SDK Integration

The `@primer-io/primer-js` SDK requires:

- Client token from Primer API (obtain via backend)
- Modern browser (ES2020+ features)
- Checkout session for payment flows
- Event handlers for payment lifecycle

**⚠️ CRITICAL: Correct SDK Initialization Pattern**

The Primer SDK uses **web components**, NOT class constructors. When writing documentation or examples:

❌ **WRONG - DO NOT USE THIS PATTERN:**

```typescript
// This is INCORRECT and should NEVER appear in docs or examples
import { PrimerCheckout } from '@primer-io/primer-js';
const checkout = new PrimerCheckout({ clientToken: 'token', ...options });
```

✅ **CORRECT - ALWAYS USE THIS PATTERN:**

```javascript
// This is the CORRECT web component pattern
const checkout = document.querySelector('primer-checkout');
checkout.setAttribute('client-token', 'your-client-token');
checkout.options = {
  // SDK options here (locale, enabledPaymentMethods, etc.)
};
```

**Key points:**

- There is NO `PrimerCheckout` class to import
- `client-token` is set via `setAttribute()` (it's a component property)
- SDK options are set via the `options` property (NOT in a constructor)
- Do NOT mix component properties with SDK options

This pattern must be consistent across ALL documentation, examples, and code snippets.

### Documentation Site (Docusaurus)

- Runs on port 9000 in development
- Uses MDX for interactive documentation
- Supports Mermaid.js diagrams
- Includes custom search via `@easyops-cn/docusaurus-search-local`

## Troubleshooting

### Build Issues

- Clear Turbo cache: `rm -rf .turbo`
- Clear Docusaurus cache: `cd docs && yarn clear`
- Reinstall dependencies: `rm -rf node_modules && yarn install`

### Type Errors

- Ensure workspace has TypeScript installed locally
- Check `nohoist` configuration if React types are missing
- Run `yarn install` after adding new dependencies

### Vite/Dev Server Issues

- Check port availability (docs uses 9000, examples use 5173 by default)
- Clear Vite cache: Delete `node_modules/.vite` in affected workspace
- Restart dev server with clean cache
