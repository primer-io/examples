# Primer Skills for Claude Code

Official Primer skills for Claude Code and compatible AI coding assistants. Skills provide comprehensive reference documentation and best practices for building payment experiences with Primer.

## What are Skills?

Skills are packaged knowledge bases that AI coding assistants can reference while you work. They contain:

- Component API documentation
- Integration patterns and examples
- Best practices and common pitfalls
- Troubleshooting guides
- Framework-specific instructions

## Available Skills

### primer-web-components

**Version:** 1.0.0

**What it includes:**

- Complete component reference for Primer Checkout web components
- React integration patterns (React 18 & 19)
- Critical best practices (stable object references, event handling)
- SSR support documentation (Next.js, SvelteKit)
- CSS theming guide
- Common troubleshooting scenarios

**Directory:** [`primer-web-components/`](./primer-web-components)

## Installation

### Method 1: Via Marketplace (Recommended)

The easiest way to install Primer skills is through the Claude Code marketplace:

```bash
# Add Primer marketplace
/plugin marketplace add primer-io/examples

# Install the web components skill
/plugin install primer-web-components@primer-skills
```

After installation, restart Claude Code. The skill will automatically activate when you're working with Primer components.

### Method 2: Manual Installation

For Claude Code, Cursor, or other AI coding assistants:

```bash
cd ~/.claude/skills  # or ~/.cursor/skills for Cursor
git clone --depth 1 https://github.com/primer-io/examples.git temp
mv temp/claude-code-skills/primer-web-components ./
rm -rf temp
```

Or download directly from GitHub:

1. Navigate to [`claude-code-skills/primer-web-components`](https://github.com/primer-io/examples/tree/main/claude-code-skills/primer-web-components)
2. Download the folder (use repo's "Code" → "Download ZIP" and extract the skill folder)
3. Copy to your skills directory:
   - **macOS/Linux:** `~/.claude/skills/primer-web-components/`
   - **Windows:** `%USERPROFILE%\.claude\skills\primer-web-components\`
4. Restart your AI assistant

## Verifying Installation

After installation, verify the skill is loaded by asking your AI assistant:

```
Do you have access to the Primer web components skill?
```

The assistant should confirm it has access to the skill documentation.

## When to Use Skills vs Context7

**Use Primer Skills when:**

- You're working in your IDE and want integrated assistance
- You need offline access to documentation
- You want best practices and patterns included automatically
- You're focused on implementation and troubleshooting

**Use Context7 when:**

- You want the absolute latest documentation updates
- You're using web-based LLMs (ChatGPT, Claude.ai)
- You need to verify against the live documentation
- You're researching new features or API changes

**Best Practice:** Use both together! The skill provides workflow guidance while Context7 ensures you have the latest API information.

## Version History

### v1.0.0 (2025-10-28)

- Initial release
- Comprehensive component reference
- React 18 & 19 integration patterns
- SSR support documentation
- CSS theming guide
- Common troubleshooting scenarios

## Contributing

If you find errors in the skill documentation or have suggestions for improvements, please open an issue or pull request in the [examples repository](https://github.com/primer-io/examples).

## License

These skills are provided under the same license as the Primer examples repository.
