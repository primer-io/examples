#!/usr/bin/env node

/**
 * This script combines all documentation and API files into the LLM guide.
 * It places documentation guides first, then API files, while maintaining proper ordering
 * within each section based on sidebar_position.
 * It also cleans up internal links that would break in a single-page context.
 *
 * Usage:
 *   npm run generate-llm-guide
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration - paths are relative to docs directory
const DOCS_FOLDER = path.join(__dirname, '..');
const DOCUMENTATION_FOLDER = path.join(
  DOCS_FOLDER,
  'general-docs',
  'documentation',
);
const API_FOLDER = path.join(DOCS_FOLDER, 'general-docs', 'api');
const LLM_GUIDE_PATH = path.join(DOCUMENTATION_FOLDER, 'llm-guide.md');
const CONTENT_START_MARKER = '<!-- DOCUMENTATION_CONTENT_START -->';
const CONTENT_END_MARKER = '<!-- DOCUMENTATION_CONTENT_END -->';

// Utility functions
function readMarkdownFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

function extractFrontMatter(content) {
  try {
    return matter(content);
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { data: {}, content: content };
  }
}

function getSidebarPosition(filePath, content) {
  const { data } = extractFrontMatter(content);

  // Check if this file has a sidebar_position
  if (data.sidebar_position !== undefined) {
    return {
      position: data.sidebar_position,
      hasPosition: true,
    };
  }

  // Check if this is a subfolder without position but has an index.md with position
  const dirName = path.dirname(filePath);
  const indexPath = path.join(dirName, 'index.md');

  if (fs.existsSync(indexPath)) {
    const indexContent = readMarkdownFile(indexPath);
    if (indexContent) {
      const { data: indexData } = extractFrontMatter(indexContent);
      if (indexData.sidebar_position !== undefined) {
        return {
          position: indexData.sidebar_position,
          hasPosition: true,
        };
      }
    }
  }

  // No position found
  return {
    position: Infinity,
    hasPosition: false,
  };
}

function collectFiles(directory, excludeFiles = []) {
  const results = [];

  function traverseDirectory(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        traverseDirectory(fullPath, entryRelativePath);
      } else if (
        entry.isFile() &&
        entry.name.endsWith('.md') &&
        !excludeFiles.includes(entry.name)
      ) {
        const content = readMarkdownFile(fullPath);
        if (content) {
          const { position, hasPosition } = getSidebarPosition(
            fullPath,
            content,
          );

          results.push({
            path: fullPath,
            relativePath: entryRelativePath,
            content,
            position,
            hasPosition,
            fileName: entry.name,
          });
        }
      }
    }
  }

  traverseDirectory(directory);
  return results;
}

function sortFilesByPosition(files) {
  return files.sort((a, b) => {
    // First, sort by whether they have a position
    if (a.hasPosition && !b.hasPosition) return -1;
    if (!a.hasPosition && b.hasPosition) return 1;

    // If both have positions, sort by position
    if (a.hasPosition && b.hasPosition) {
      return a.position - b.position;
    }

    // If neither has a position, sort alphabetically by relative path
    return a.relativePath.localeCompare(b.relativePath);
  });
}

/**
 * Clean up links in markdown content that would be problematic in a single-page context
 * @param {string} content The markdown content to process
 * @param {string} filePath The path of the current file
 * @returns {string} Processed content with cleaned up links
 */
function cleanupLinks(content, filePath) {
  const { content: markdownContent } = extractFrontMatter(content);

  // Clean up different types of links
  let processedContent = markdownContent;

  // 1. Replace relative links to other documentation files with their text content only
  // Match markdown links: [link text](link url)
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\((?!http|https|mailto|#)([^)]+)\)/g,
    (match, linkText, linkUrl) => {
      // Skip image links
      if (match.startsWith('![')) {
        return match;
      }

      // If it's a relative link to another documentation page, just keep the text
      if (
        linkUrl.endsWith('.md') ||
        linkUrl.includes('/documentation/') ||
        linkUrl.includes('/api/') ||
        !linkUrl.includes('#')
      ) {
        return linkText; // Keep just the text, remove the link
      }

      return match; // Keep other links intact
    },
  );

  // 2. Replace API reference links with their text
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(\/api\/[^)]+\)/g,
    (match, linkText) => {
      return linkText; // Keep just the text, remove the link
    },
  );

  // 3. Process links with custom URL formats (like Docusaurus paths)
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\((?!http|https|mailto|#)([^)]+)\)/g,
    (match, linkText) => {
      return linkText; // Keep just the text, remove the link
    },
  );

  return processedContent.trim();
}

function processContent(file, isApiFile = false) {
  // Clean up the content with link processing
  const processedContent = cleanupLinks(file.content, file.path);

  // Add section header and original filename as a comment
  const fileBaseName = path.basename(file.path, '.md');
  const sectionType = isApiFile ? 'API Reference' : 'Guide';

  return `\n\n---\n\n<!-- Source: ${fileBaseName} (${sectionType}) -->\n\n${processedContent}`;
}

function generateCombinedContent() {
  // 1. First collect and process documentation guides
  console.log('Collecting documentation guide files...');
  const documentationFiles = collectFiles(
    DOCUMENTATION_FOLDER,
    ['llm-guide.md'], // Exclude the LLM guide itself
  );
  const sortedDocFiles = sortFilesByPosition(documentationFiles);

  // 2. Then collect and process API files
  console.log('Collecting API files...');
  const apiFiles = collectFiles(API_FOLDER);
  const sortedApiFiles = sortFilesByPosition(apiFiles);

  console.log(
    `Processing ${sortedDocFiles.length} documentation guides and ${sortedApiFiles.length} API files...`,
  );

  // 3. Generate content from documentation guides first
  let combinedContent = '\n\n## Documentation Guides\n';
  for (const file of sortedDocFiles) {
    console.log(`Adding documentation guide: ${file.relativePath}`);
    combinedContent += processContent(file, false);
  }

  // 4. Then add API documentation
  combinedContent += '\n\n## API Reference\n';
  for (const file of sortedApiFiles) {
    console.log(`Adding API file: ${file.relativePath}`);
    combinedContent += processContent(file, true);
  }

  return combinedContent;
}

function updateLLMGuide() {
  const llmGuideContent = readMarkdownFile(LLM_GUIDE_PATH);
  if (!llmGuideContent) {
    console.error('Could not read LLM guide file.');
    process.exit(1);
  }

  const startMarkerIndex = llmGuideContent.indexOf(CONTENT_START_MARKER);
  const endMarkerIndex = llmGuideContent.indexOf(CONTENT_END_MARKER);

  if (startMarkerIndex === -1 || endMarkerIndex === -1) {
    console.error('Could not find content markers in LLM guide file.');
    process.exit(1);
  }

  // Generate the combined content from all files
  const combinedContent = generateCombinedContent();

  // Replace the content between markers
  const newContent =
    llmGuideContent.substring(
      0,
      startMarkerIndex + CONTENT_START_MARKER.length,
    ) +
    '\n\n' +
    combinedContent +
    '\n\n' +
    llmGuideContent.substring(endMarkerIndex);

  // Write the updated content back to the LLM guide
  fs.writeFileSync(LLM_GUIDE_PATH, newContent, 'utf8');
  console.log('LLM guide successfully updated!');
}

// Main execution
try {
  updateLLMGuide();
} catch (error) {
  console.error('Error generating LLM guide:', error);
  process.exit(1);
}
