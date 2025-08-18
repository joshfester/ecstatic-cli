import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { cleanDir, dirExists, fileExists, findScrapedDomainFolder } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { runCommand } from '../utils/process.js';
import { createCommand } from '../utils/command.js';
import fs from 'fs';
import path from 'path';

export const optimizeCommand = new Command('optimize')
  .description('Optimize HTML and assets using Parcel and Jampack')
  .argument('[input-dir]', 'Input directory containing HTML to optimize (overrides config)')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('--skip-parcel', 'Skip Parcel optimization')
  .option('--skip-jampack', 'Skip Jampack optimization')
  .option('--skip-partytown', 'Skip Partytown setup')
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
    output: options.output || config.paths.dist,
    skipParcel: options.skipParcel || false,
    skipJampack: options.skipJampack || !config.optimize.jampack.enabled,
    skipPartytown: options.skipPartytown || false
  };

  const resolvedInputDir = resolvePath(finalOptions.inputDir);
  const outputDir = resolvePath(finalOptions.output);
  const parcelDistDir = resolvePath(config.paths.distParcel);
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

  // Parcel optimization
  if (!finalOptions.skipParcel) {
    logger.info('Running Parcel optimization');
    await runParcel(indexPath, parcelDistDir, config);
    currentOutputDir = parcelDistDir;

    // Partytown setup (if not skipped)
    if (!finalOptions.skipPartytown) {
      //logger.info('Setting up Partytown');
      //await runPartytown(parcelDistDir, config);
    }
  }

  // Jampack optimization
  if (!finalOptions.skipJampack) {
    logger.info('Running Jampack optimization');

    // Copy current output to jampack directory
    cleanDir(jampackDistDir);
    await copyDirectory(currentOutputDir, jampackDistDir, config);

    await runJampack(jampackDistDir, config);
    currentOutputDir = jampackDistDir;
  }

  // Copy to final output directory
  logger.info('Copying to final output directory');
  if (currentOutputDir !== outputDir) {
    cleanDir(outputDir);
    await copyDirectory(currentOutputDir, outputDir, config);
  }

  logger.success(`Website optimized successfully! Output: ${outputDir}`);
}

async function runParcel(indexPath, outputDir, config) {
  // Clean parcel cache and output directory
  const parcelCacheDir = resolvePath('.parcel-cache');
  if (dirExists(parcelCacheDir)) {
    fs.rmSync(parcelCacheDir, { recursive: true, force: true });
  }
  cleanDir(outputDir);

  // Change working directory to the directory containing index.html
  // This ensures the namer plugin preserves internal structure without wrapper paths
  const originalCwd = process.cwd();
  const inputDir = path.dirname(indexPath);
  const inputFile = path.basename(indexPath);
  const absoluteOutputDir = path.resolve(outputDir);

  try {
    process.chdir(inputDir);

    const args = [
      'build',
      inputFile,
      '--dist-dir',
      absoluteOutputDir,
      '--no-source-maps',
      '--no-scope-hoist',
      //'2>&1 | tee parcel-output.log'
    ];

    const suppressOutput = config?.logging?.suppressOutput || false;
    return await runCommand('npx', ['parcel', ...args], suppressOutput);
  } finally {
    // Always restore the original working directory
    process.chdir(originalCwd);
  }
}

async function runPartytown(distDir, config) {
  const partytownDir = path.join(distDir, '~partytown');
  const args = [
    'copylib',
    partytownDir
  ];

  const suppressOutput = config?.logging?.suppressOutput || false;
  return runCommand('npx', ['partytown', ...args], suppressOutput);
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

