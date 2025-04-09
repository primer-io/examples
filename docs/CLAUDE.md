# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Development: `yarn dev` (starts Docusaurus on port 9000)
- Build: `yarn build` (builds Docusaurus site)
- TypeScript checking: `yarn typecheck`
- Clear cache: `yarn clear`
- Serve built site: `yarn serve`

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

## JetBrains MCP Usage

- Support proper syntax highlighting in code blocks
- Format documentation to render correctly in Markdown preview
- Include complete type information for code examples
- Follow existing patterns for new documentation files
