import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { cleanDir, dirExists, fileExists, findScrapedDomainFolder } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { runCommand } from '../utils/process.js';
import { createCommand } from '../utils/command.js';
import fs from 'fs';
import path from 'path';

export const optimizeCommand = new Command('optimize')
  .description('Optimize HTML and asset')
  .argument('[input-dir]', 'Input directory containing HTML to optimize (overrides config)')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('-q, --quiet', 'Suppress output from third-party tools')
  .action(createCommand('Optimization', optimizeWebsite));

async function optimizeWebsite(inputDir, options) {
  const config = getConfig();

  // Override config suppressOutput if --quiet flag is provided
  if (options.quiet) {
    config.logging.suppressOutput = true;
  }

  // Determine input directory - either CLI provided, or find domain folder in scraped directory
  let defaultInputDir = inputDir;
  if (!defaultInputDir) {
    const scrapedDir = resolvePath(config.paths.scraped);
    const scrapingMethod = config.scrape?.method;
    const domainFolder = findScrapedDomainFolder(scrapedDir, scrapingMethod);
    if (!domainFolder) {
      const methodMsg = scrapingMethod ? ` (using ${scrapingMethod} method)` : '';
      throw new Error(`No scraped content found in ${scrapedDir}${methodMsg}. Please run 'scrape' command first.`);
    }
    defaultInputDir = domainFolder;
  }

  // Merge CLI options with config, giving precedence to CLI options
  const finalOptions = {
    inputDir: defaultInputDir,
    output: options.output || config.paths.dist
  };

  const resolvedInputDir = resolvePath(finalOptions.inputDir);
  const outputDir = resolvePath(finalOptions.output);
  const jampackDistDir = resolvePath(config.paths.distJampack);

  logger.info(`Optimizing website from ${resolvedInputDir}`);
  logger.info(`Final output directory: ${outputDir}`);

  // Validate input directory exists
  if (!dirExists(resolvedInputDir)) {
    throw new Error(`Input directory does not exist: ${resolvedInputDir}`);
  }

  // Check for index.html
  const indexPath = path.join(resolvedInputDir, 'index.html');
  if (!fileExists(indexPath)) {
    throw new Error(`index.html not found in input directory: ${resolvedInputDir}`);
  }

  let currentOutputDir = resolvedInputDir;

  // Jampack optimization
  logger.info('Running Jampack optimization');

  // Copy current output to jampack directory
  cleanDir(jampackDistDir);
  await copyDirectory(currentOutputDir, jampackDistDir, config);

  await runJampack(jampackDistDir, config);
  currentOutputDir = jampackDistDir;

  // Copy to final output directory
  logger.info('Copying to final output directory');
  if (currentOutputDir !== outputDir) {
    cleanDir(outputDir);
    await copyDirectory(currentOutputDir, outputDir, config);
  }

  logger.success(`Website optimized successfully! Output: ${outputDir}`);
}

async function runJampack(distDir, config) {
  const args = [distDir];
  const suppressOutput = config?.logging?.suppressOutput || false;
  return runCommand('npx', ['jampack', ...args], suppressOutput);
}

async function copyDirectory(src, dest, config) {
  const suppressOutput = config?.logging?.suppressOutput || false;
  return runCommand('cp', ['-r', `${src}/.`, dest], suppressOutput);
}

