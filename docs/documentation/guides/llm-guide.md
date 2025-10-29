---
title: LLM Guide
sidebar_label: LLM Guide
description: Learn how to integrate and use Large Language Models with Primer Checkout
---

# LLM Guide

## Introduction

This guide explains how to effectively use our documentation with Large Language Models (LLMs) and AI coding assistants like Claude Code, ChatGPT, GitHub Copilot, and Cursor. We provide two complementary approaches for accessing our documentation with AI:

1. **Claude Code Skills** - Offline, comprehensive reference for IDE-integrated AI assistants
2. **Context7** - Live, always-up-to-date documentation for web-based and MCP-enabled AI tools

Both approaches have their strengths, and you can use them together for the best experience.

## Option 1: Claude Code Skill (Recommended for IDEs)

For developers using AI coding assistants in their IDE, we provide a comprehensive Claude Code skill that packages our complete documentation, integration patterns, and best practices into an easily installable format.

### What is a Claude Code Skill?

A Claude Code skill is a packaged knowledge base that your AI coding assistant can reference while you work. It provides instant access to documentation, code patterns, and troubleshooting guidance without requiring internet access.

### What Does the Primer Skill Include?

- **Complete Component Reference** - All web component APIs, props, events, and methods
- **React Integration Patterns** - React 18 & 19 specific guidance with hooks and patterns
- **Critical Best Practices** - Common mistakes and how to avoid them (like object reference stability)
- **SSR Support** - Server-side rendering with Next.js and SvelteKit
- **CSS Theming Guide** - Custom styling and theme customization
- **Troubleshooting** - Solutions to common integration issues

### Installation Instructions

Installation differs by platform. Choose your AI assistant:

#### For Claude Code (claude.ai/code)

**Via Marketplace (Recommended):**

```bash
# Add Primer marketplace
/plugin marketplace add primer-io/examples

# Install the skill
/plugin install primer-web-components@primer-skills
```

Restart Claude Code, and the skill activates automatically when working with Primer components.

**Manual Installation:**

```bash
cd ~/.claude/skills
git clone --depth 1 https://github.com/primer-io/examples.git temp
mv temp/claude-code-skills/primer-web-components ./
rm -rf temp
```

Or download from [GitHub](https://github.com/primer-io/examples/tree/main/claude-code-skills/primer-web-components) and copy to `~/.claude/skills/primer-web-components/`

#### For Cursor

Use the same manual installation method as Claude Code, but copy to `~/.cursor/skills/` instead.

#### For Other AI Assistants

Most AI coding assistants support directory-based skills. Check your tool's documentation for the skills directory location and use the manual installation method above.

### Verifying Installation

Ask your AI assistant:

```
Do you have access to the Primer web components skill?
```

The assistant should confirm it has loaded the skill documentation.

### When to Use the Claude Code Skill

- ✅ Working in your IDE with integrated AI assistance
- ✅ Need offline access to documentation
- ✅ Want best practices and common pitfalls highlighted automatically
- ✅ Focused on implementation and debugging
- ✅ Working with React, Next.js, or SvelteKit integrations

## Option 2: Using Context7 for Live Documentation

We've partnered with Context7 to provide LLM-friendly versions of our documentation that are always up-to-date and optimized for AI consumption.

### What is Context7?

Context7 is a service that pulls up-to-date, version-specific documentation and code examples directly from the source, making it easier for LLMs to provide accurate assistance with our SDK.

### Benefits of Using Context7 for Our Documentation

- **Always up-to-date**: Documentation stays in sync with the latest version of our components
- **No hallucinations**: LLMs receive accurate API information, reducing incorrect code suggestions
- **Context-aware**: The LLM understands the full context of our component library
- **Improved code examples**: Get working code snippets that follow our best practices
- **Reduced token usage**: Optimized documentation that focuses on what matters

### When to Use Context7

- ✅ Using web-based LLMs (ChatGPT, Claude.ai web interface)
- ✅ Need to verify against the absolute latest documentation
- ✅ Researching new features or recent API changes
- ✅ Working with tools that support MCP (Model Context Protocol)
- ✅ Want dynamic documentation fetching during conversations

### How to Access Context7 Documentation

You can access our Context7 documentation in several ways:

#### Method 1: Reference the Raw Link in Your Prompt

You can directly ask an LLM to retrieve and analyze our documentation by providing the Context7 link:

```
Please analyze the Primer Checkout documentation at https://context7.com/primer-io/examples/llms.txt
```

#### Method 2: Copy the Documentation Text

Browse our LLM-friendly documentation versions at:
[https://context7.com/primer-io/examples](https://context7.com/primer-io/examples)

Then copy the relevant sections and paste them into your conversation with the LLM.

#### Method 3: Use the Context7 MCP Server

For an even better experience, you can use the Context7 MCP server with compatible AI tools. This allows the AI to automatically pull the latest documentation without you needing to copy/paste anything.

##### Compatible Applications

- Cursor
- Windsurf
- VS Code (with MCP Support extension)
- Zed
- Claude Desktop
- Claude (claude.ai/code)
- BoltAI

## Combining Both Approaches

For the best experience, use both the Claude Code skill and Context7 together:

- **Claude Code skill** provides immediate access to patterns and best practices while coding
- **Context7** ensures you're working with the latest API documentation when needed

The skill documentation is comprehensive but static (updated with new versions), while Context7 is always current but requires an active connection. Together, they provide both convenience and accuracy.

## Example Prompts

Here are some effective prompt examples for using our documentation with LLMs:

### With Claude Code Skill (in your IDE)

```
Using the Primer web components skill, create a React component that implements the checkout flow with PayPal as the primary payment method and CardForm as a fallback.
```

```
Show me how to properly handle onCheckoutComplete events in React while avoiding the stable object reference issue mentioned in the skill documentation.
```

```
I'm getting a "Cannot read property of undefined" error with primer-checkout. Help me debug this using the troubleshooting section of the Primer skill.
```

### Using Context7 Raw Link

```
Please visit https://context7.com/primer-io/examples/llms.txt and use the documentation to implement a checkout flow with Primer's components that includes PayPal as the first payment method and CardForm as the second.
```

### Using Context7 MCP Server

```
use context7

Create a basic implementation of Primer's Checkout components using TypeScript. Customize the payment method order to place PayPal on top, CardForm second, and then let the other methods follow.
```

### General Documentation Request

```
Based on Primer's documentation, show me how to implement error handling in the checkout flow. Use context7 to get the most up-to-date information.
```

### Combining Both

```
Using the Primer skill for patterns and Context7 for the latest API, implement a Next.js 14 App Router page with server-side rendering support for Primer Checkout.
```

## Installing the Context7 MCP Server

The Context7 MCP server can be integrated with various development environments to provide seamless documentation access.

### Installation Instructions

The Context7 MCP server is available on GitHub at: [https://github.com/upstash/context7](https://github.com/upstash/context7)

Each client requires slightly different configuration:

#### For Cursor

Add this to your `~/.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### For Claude Desktop

Add this to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "Context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

#### For Claude.ai/Code

Run this command:

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

For installation instructions with other tools and troubleshooting guidance, please refer to the [Context7 GitHub repository](https://github.com/upstash/context7).

## Best Practices for Using LLMs with Our Documentation

1. **Be specific**: Clearly state which components you want to use and what functionality you need
2. **Provide context**: Mention your framework (React, Vue, etc.) and any specific requirements
3. **Ask for step-by-step explanations**: Request that the LLM explain how the code works
4. **Validate the output**: Always verify generated code against our official documentation
5. **Iterate**: If the initial response isn't quite right, refine your prompt with more details

By following this guide, you can efficiently leverage LLMs to build with our component library while ensuring accuracy and best practices.
