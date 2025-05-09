#!/usr/bin/env node

/**
 * This script combines all documentation and API files into the LLM guide.
 * It maintains the ordering based on sidebar_position or falls back to alphabetical order.
 * 
 * Usage:
 *   npm run generate-llm-guide
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const DOCS_FOLDER = path.join(__dirname, '..', 'docs');
const DOCUMENTATION_FOLDER = path.join(DOCS_FOLDER, 'general-docs', 'documentation');
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
      hasPosition: true 
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
          hasPosition: true 
        };
      }
    }
  }
  
  // No position found
  return { 
    position: Infinity, 
    hasPosition: false 
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
      } else if (entry.isFile() && entry.name.endsWith('.md') && !excludeFiles.includes(entry.name)) {
        const content = readMarkdownFile(fullPath);
        if (content) {
          const { position, hasPosition } = getSidebarPosition(fullPath, content);
          
          results.push({
            path: fullPath,
            relativePath: entryRelativePath,
            content,
            position,
            hasPosition,
            fileName: entry.name
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

function processContent(content) {
  // Extract the markdown content without frontmatter
  const { content: markdownContent } = extractFrontMatter(content);
  
  // Add a horizontal rule before each document
  return `\n\n---\n\n${markdownContent.trim()}`;
}

function generateCombinedContent() {
  console.log('Collecting documentation files...');
  const documentationFiles = collectFiles(
    DOCUMENTATION_FOLDER, 
    ['llm-guide.md'] // Exclude the LLM guide itself
  );
  
  console.log('Collecting API files...');
  const apiFiles = collectFiles(API_FOLDER);
  
  // Combine and sort all files
  const allFiles = [...documentationFiles, ...apiFiles];
  const sortedFiles = sortFilesByPosition(allFiles);
  
  console.log(`Processing ${sortedFiles.length} files...`);
  
  // Process and combine all content
  let combinedContent = '';
  for (const file of sortedFiles) {
    console.log(`Adding: ${file.relativePath}`);
    combinedContent += processContent(file.content);
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
    llmGuideContent.substring(0, startMarkerIndex + CONTENT_START_MARKER.length) + 
    '\n\n' + combinedContent + '\n\n' + 
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
