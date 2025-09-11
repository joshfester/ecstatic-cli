import fs from 'fs';
import path from 'path';
import { getAllFiles, dirExists, fileExists } from './paths.js';
import * as logger from './logger.js';

/**
 * Rename .php.html files to .html files for SiteOne scraped content
 * @param {string} scrapedDir - Directory containing scraped files
 * @returns {Promise<{renamedFiles: number, conflicts: number}>}
 */
export async function renamePHPHtmlFiles(scrapedDir) {
  if (!dirExists(scrapedDir)) {
    throw new Error(`Scraped directory not found: ${scrapedDir}`);
  }

  logger.info('Renaming .php.html files to .html files...');

  // Get all files recursively
  const allFiles = getAllFiles(scrapedDir);
  
  // Filter for .php.html files
  const phpHtmlFiles = allFiles.filter(file => 
    file.localPath.endsWith('.php.html')
  );

  if (phpHtmlFiles.length === 0) {
    logger.info('No .php.html files found to rename');
    return { renamedFiles: 0, conflicts: 0 };
  }

  let renamedFiles = 0;
  let conflicts = 0;

  for (const file of phpHtmlFiles) {
    try {
      // Generate target filename by removing .php from .php.html
      const targetPath = file.localPath.replace(/\.php\.html$/, '.html');
      
      // Check if target file already exists
      if (fileExists(targetPath)) {
        logger.warning(`Target file already exists, skipping rename: ${path.relative(scrapedDir, targetPath)}`);
        conflicts++;
        continue;
      }

      // Rename the file
      fs.renameSync(file.localPath, targetPath);
      
      renamedFiles++;
      logger.info(`Renamed ${path.relative(scrapedDir, file.localPath)} → ${path.relative(scrapedDir, targetPath)}`);
      
    } catch (error) {
      logger.warning(`Failed to rename ${path.relative(scrapedDir, file.localPath)}: ${error.message}`);
    }
  }

  logger.info(`File renaming completed: ${renamedFiles} files renamed, ${conflicts} conflicts skipped`);
  
  return { renamedFiles, conflicts };
}