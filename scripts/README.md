# Documentation Scripts

This directory contains utility scripts for managing the documentation.

## LLM Guide Generator

The `generate-llm-guide.js` script automatically combines all documentation and API reference files into the LLM guide page, maintaining the proper order based on sidebar positions.

### How It Works

The script:

1. Collects all markdown files from:
   - `docs/general-docs/documentation` (excluding the LLM guide itself)
   - `docs/general-docs/api` (including all subfolders)

2. Orders the files by:
   - `sidebar_position` from frontmatter (if available)
   - For files without a position, it checks if their folder has an `index.md` with a position
   - Falls back to alphabetical order for files without positions

3. Processes each file by removing frontmatter and adding a horizontal rule separator

4. Inserts the combined content between designated markers in the LLM guide

### Usage

The script runs automatically as part of the build process:

```bash
yarn build
```

You can also run it manually:

```bash
yarn generate-llm-guide
```

### Maintenance

When updating the script, keep in mind:

- The LLM guide must contain the markers `<!-- DOCUMENTATION_CONTENT_START -->` and `<!-- DOCUMENTATION_CONTENT_END -->` to indicate where content should be inserted
- The script relies on the `gray-matter` package to parse frontmatter
- If you add new documentation folders, you may need to update the script to include them
