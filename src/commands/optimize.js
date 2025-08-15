import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { cleanDir, dirExists, fileExists } from '../utils/paths.js';
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
  .action(createCommand('Optimization', optimizeWebsite));

async function optimizeWebsite(inputDir, options) {
  const config = getConfig();

  // Merge CLI options with config, giving precedence to CLI options
  const finalOptions = {
    inputDir: inputDir || config.paths.scrapedWeb,
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
    await runParcel(indexPath, parcelDistDir);
    currentOutputDir = parcelDistDir;

    // Partytown setup (if not skipped)
    if (!finalOptions.skipPartytown) {
      logger.info('Setting up Partytown');
      await runPartytown(parcelDistDir);
    }
  }

  // Jampack optimization
  if (!finalOptions.skipJampack) {
    logger.info('Running Jampack optimization');

    // Copy current output to jampack directory
    cleanDir(jampackDistDir);
    await copyDirectory(currentOutputDir, jampackDistDir);

    await runJampack(jampackDistDir);
    currentOutputDir = jampackDistDir;
  }

  // Copy to final output directory
  logger.info('Copying to final output directory');
  if (currentOutputDir !== outputDir) {
    cleanDir(outputDir);
    await copyDirectory(currentOutputDir, outputDir);
  }

  logger.success(`Website optimized successfully! Output: ${outputDir}`);
}

async function runParcel(indexPath, outputDir) {
  // Clean parcel cache and output directory
  const parcelCacheDir = resolvePath('.parcel-cache');
  if (dirExists(parcelCacheDir)) {
    fs.rmSync(parcelCacheDir, { recursive: true, force: true });
  }
  cleanDir(outputDir);

  const args = [
    'build',
    indexPath,
    '--dist-dir',
    outputDir
  ];

  return runCommand('npx', ['parcel', ...args]);
}

async function runPartytown(distDir) {
  const partytownDir = path.join(distDir, '~partytown');
  const args = [
    'copylib',
    partytownDir
  ];

  return runCommand('npx', ['partytown', ...args]);
}

async function runJampack(distDir) {
  const args = [distDir];
  return runCommand('npx', ['jampack', ...args]);
}

async function copyDirectory(src, dest) {
  return runCommand('cp', ['-r', `${src}/.`, dest]);
}

