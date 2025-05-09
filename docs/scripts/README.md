# Documentation Scripts

This directory contains utility scripts for managing the documentation.

## LLM Guide Generator

The `generate-llm-guide.js` script automatically combines all documentation and API reference files into the LLM guide page, maintaining the proper order based on sidebar positions.

### How It Works

The script:

1. Organizes content in two main sections:
   - **Documentation Guides** first (from `docs/general-docs/documentation`)
   - **API Reference** second (from `docs/general-docs/api`)

2. Within each section, orders files by:
   - `sidebar_position` from frontmatter (if available)
   - For files without a position, it checks if their folder has an `index.md` with a position
   - Falls back to alphabetical order for files without positions

3. Processes each file:
   - Removes frontmatter
   - Cleans up internal links that would break in a single-page context
   - Adds a horizontal rule and source comment separator

4. Inserts the combined content between designated markers in the LLM guide

### Link Cleanup

The script specifically addresses links that would be problematic when all documentation is combined into a single page:

- **Internal documentation links**: Links to other documentation files are converted to plain text (keeping just the link text)
- **API reference links**: Links to API documentation are converted to plain text
- **Relative paths**: Other relative paths that aren't http/https are converted to plain text
- **Source tracking**: Each document section includes a comment with its original filename for debugging

This ensures that the combined document doesn't have broken links while preserving the meaning of the original text.

### Organization Structure

The resulting document has a clear structure:

```
# LLM Guide
  ## How to Use This Guide
  ...
  ## Component Library Documentation
    ## Documentation Guides
      [All guide content in sidebar_position order]
    ## API Reference
      [All API documentation in sidebar_position order]
```

This organization makes it easier for LLMs to understand the relationship between different types of content.

### Usage

The script runs automatically as part of the build process (via the prebuild hook):

```bash
npm run build
```

You can also run it manually:

```bash
npm run generate-llm-guide
```

### Maintenance

When updating the script, keep in mind:

- The LLM guide must contain the markers `<!-- DOCUMENTATION_CONTENT_START -->` and `<!-- DOCUMENTATION_CONTENT_END -->` to indicate where content should be inserted
- The script relies on the `gray-matter` package to parse frontmatter
- If you add new documentation folders, you may need to update the script to include them
- The link cleanup process may need adjustment if your documentation uses unique link formats
