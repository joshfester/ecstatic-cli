import fs from 'fs';
import path from 'path';
import { getAllFiles, dirExists } from './paths.js';
import * as logger from './logger.js';

/**
 * Replace all occurrences of a source domain with a target domain in HTML files
 * @param {string} scrapedDir - Directory containing scraped files
 * @param {string} sourceDomain - Domain to replace (e.g., 'example.com')
 * @param {string} targetDomain - Domain to replace with (e.g., 'new-domain.com')
 * @returns {Promise<{processedFiles: number, totalReplacements: number}>}
 */
export async function replaceDomains(scrapedDir, sourceDomain, targetDomain) {
  if (!sourceDomain || !targetDomain) {
    throw new Error('Both source and target domains are required');
  }

  if (!dirExists(scrapedDir)) {
    throw new Error(`Scraped directory not found: ${scrapedDir}`);
  }

  logger.info(`Replacing '${sourceDomain}' with '${targetDomain}' in HTML files...`);

  // Get all files recursively
  const allFiles = getAllFiles(scrapedDir);
  
  // Filter for HTML files only
  const htmlFiles = allFiles.filter(file => 
    path.extname(file.localPath).toLowerCase() === '.html'
  );

  if (htmlFiles.length === 0) {
    logger.info('No HTML files found to process');
    return { processedFiles: 0, totalReplacements: 0 };
  }

  // Escape special regex characters in the source domain
  const escapedSourceDomain = sourceDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use negative lookbehind to avoid matching subdomains (e.g., api.example.com) and emails (e.g., user@example.com)
  // Don't require specific characters after domain - word boundary is sufficient
  const regex = new RegExp(`(^|[^.@-])${escapedSourceDomain}\\b`, 'g');

  let processedFiles = 0;
  let totalReplacements = 0;

  for (const file of htmlFiles) {
    try {
      // Read file content
      const content = fs.readFileSync(file.localPath, 'utf8');
      
      // Count matches before replacement
      const matches = content.match(regex);
      const replacementCount = matches ? matches.length : 0;
      
      if (replacementCount > 0) {
        // Replace all occurrences, preserving the captured prefix
        const updatedContent = content.replace(regex, `$1${targetDomain}`);
        
        // Write updated content back to file
        fs.writeFileSync(file.localPath, updatedContent, 'utf8');
        
        processedFiles++;
        totalReplacements += replacementCount;
        
        logger.info(`Processed ${file.remotePath}: ${replacementCount} replacements`);
      }
    } catch (error) {
      logger.warning(`Failed to process ${file.remotePath}: ${error.message}`);
    }
  }

  logger.info(`Domain replacement completed: ${processedFiles} files processed, ${totalReplacements} total replacements`);
  
  return { processedFiles, totalReplacements };
}