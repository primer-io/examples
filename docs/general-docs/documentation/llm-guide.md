---
title: LLM Guide
sidebar_label: LLM Guide
sidebar_position: 5
description: Learn how to integrate and use Large Language Models with Primer Checkout
---

# LLM Guide

## Introduction

This guide explains how to effectively use our documentation with Large Language Models (LLMs) like ChatGPT, Claude, or GitHub Copilot. We've moved away from manual attempts at generating LLM-friendly guides and now use Context7 to provide optimized documentation access for AI models.

## Using Context7 with Our Documentation

We've partnered with Context7 to provide LLM-friendly versions of our documentation that are always up-to-date and optimized for AI consumption.

### What is Context7?

Context7 is a service that pulls up-to-date, version-specific documentation and code examples directly from the source, making it easier for LLMs to provide accurate assistance with our SDK.

### Benefits of Using Context7 for Our Documentation

- **Always up-to-date**: Documentation stays in sync with the latest version of our components
- **No hallucinations**: LLMs receive accurate API information, reducing incorrect code suggestions
- **Context-aware**: The LLM understands the full context of our component library
- **Improved code examples**: Get working code snippets that follow our best practices
- **Reduced token usage**: Optimized documentation that focuses on what matters

## How to Access Our LLM-Friendly Documentation

You can access our LLM-friendly documentation in several ways:

### Option 1: Reference the Raw Link in Your Prompt

You can directly ask an LLM to retrieve and analyze our documentation by providing the Context7 link:

```
Please analyze the Primer Checkout documentation at https://context7.com/primer-io/examples/llms.txt
```

### Option 2: Copy the Documentation Text

Browse our LLM-friendly documentation versions at:
[https://context7.com/primer-io/examples](https://context7.com/primer-io/examples)

Then copy the relevant sections and paste them into your conversation with the LLM.

### Option 3: Use the Context7 MCP Server

For an even better experience, you can use the Context7 MCP server with compatible AI tools. This allows the AI to automatically pull the latest documentation without you needing to copy/paste anything.

#### Compatible Applications

- Cursor
- Windsurf
- VS Code (with MCP Support extension)
- Zed
- Claude Desktop
- Claude (claude.ai/code)
- BoltAI

## Example Prompts

Here are some effective prompt examples for using our documentation with LLMs:

### Using the Raw Link

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
