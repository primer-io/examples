# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Architecture

This is a monorepo for Primer's Composable Checkout documentation and examples using Turbo and Yarn workspaces:

- `/docs` - Docusaurus documentation site for SDK Components
- `/examples` - Multiple standalone integration examples using `@primer-io/primer-js`
- Root manages shared tooling (Prettier, Turbo) and workspace coordination

## Commands

### Root Level (Turbo-managed)

- `yarn dev` - Starts all development servers (docs + examples)
- `yarn lint:es` - Run ESLint across all workspaces
- `yarn lint:ts` - TypeScript checking across all workspaces
- `yarn format` - Format all files with Prettier
- `yarn lint:format` - Check Prettier formatting

### Documentation Site (/docs)

- `yarn dev` - Start Docusaurus on port 9000
- `yarn build` - Build static documentation site
- `yarn typecheck` - TypeScript checking for docs
- `yarn clear` - Clear Docusaurus cache
- `yarn serve` - Serve built documentation site

### Examples

Each example has its own package.json with standard commands:

- `yarn dev` - Start development server (usually Vite)
- `yarn build` - Build for production
- `yarn lint` - Run linting (where configured)
- `yarn check-types` - TypeScript checking

## Code Style Guidelines

- **TypeScript**: Use TypeScript for all components and functions
- **Components**: Functional components with arrow functions
- **Exports**: Named exports for components
- **Types**: Define Props using interfaces, specify ReactNode return types
- **Imports**: React imports first, then third-party libs, then local imports
- **Formatting**: 2-space indentation, single quotes for JSX strings
- **CSS**: Use CSS modules with kebab-case filenames (\*.module.css)
- **Naming**: PascalCase for components, camelCase for functions/variables
- **JSX**: Self-close tags when empty
- **File Structure**: Group related components in directories

## Documentation Guidelines

- **Frontmatter**: Include title, sidebar_position, description in all .md/.mdx files
- **Structure**: Use # for titles, ## for sections, consistent heading hierarchy
- **Code Blocks**: Use syntax highlighting with language tags (```javascript)
- **Admonitions**: Use Docusaurus admonitions (:::tip, :::note, :::warning)
- **Tabs**: Use tab components for alternative implementations/themes
- **Diagrams**: Use Mermaid.js for flowcharts and diagrams
- **Tables**: Structure API references and comparison data as tables
- **Examples**: Provide working code examples with comments
- **Components**: Utilize Docusaurus components and MDX when appropriate

## Key Integration Details

### Primer SDK Usage

All examples use `@primer-io/primer-js` version 0.2.0 and require:

- Client token from Primer API for initialization
- Modern browser support (no IE11/legacy Edge)
- Checkout session management with payment event handling

### Example Structure Patterns

- Basic examples: Vanilla TypeScript with Vite
- React examples: React 19 with Vite + TypeScript
- All examples include `fetchClientToken.ts` utility
- Styling ranges from basic CSS to theme systems

### Documentation Integration

- Uses Context7 for LLM-friendly API documentation
- MDX support for interactive documentation
- Auto-generated component API references
- Mermaid.js diagrams for complex flows

## Documentation Engineering Guidelines

### Documentation Types & Approach

This project documents a web component-based SDK with two primary documentation types:

1. **API Reference Documentation** - Component props, methods, events, and usage patterns
2. **Guides & Explanatory Pages** - Best practices, integration patterns, and troubleshooting

### Documentation Standards

- **Target Audience**: Developers of all skill levels with focus on clarity and real-world usability
- **File Format**: All documentation must be written in Markdown (.md) files in the `/docs` folder
- **Tone**: Helpful, concise, and developer-friendly for guides; structured and precise for API docs
- **Structure**: Logical organization with consistent headings, lists, and code blocks

### Content Guidelines

- **API Documentation**: Extract structured data from code, format with clear headings, lists, and code blocks
- **Guide Documentation**: Include practical examples, use helpful tone, structure with headings and bullet points
- **Accuracy Priority**: Keep documentation synchronized with code changes
- **Discoverability**: Ensure content is easily findable and logically organized
- **Consistency**: Use consistent formatting patterns across all documentation
