import { Command } from 'commander';
import { spawn } from 'child_process';
import { loadEcstaticConfig, getConfig, resolvePath } from '../utils/config.js';
import { cleanDir, dirExists, fileExists } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const optimizeCommand = new Command('optimize')
  .description('Optimize HTML and assets using Parcel and Jampack')
  .argument('[input-dir]', 'Input directory containing HTML to optimize (overrides config)')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('--skip-parcel', 'Skip Parcel optimization')
  .option('--skip-jampack', 'Skip Jampack optimization')
  .option('--skip-partytown', 'Skip Partytown setup')
  .action(async (inputDir, options) => {
    try {
      await loadEcstaticConfig();
      await optimizeWebsite(inputDir, options);
    } catch (error) {
      logger.error(`Optimization failed: ${error.message}`);
      process.exit(1);
    }
  });

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
  let stepCount = 0;
  let totalSteps = 1; // Final copy step

  if (!finalOptions.skipParcel) totalSteps++;
  if (!finalOptions.skipPartytown) totalSteps++;
  if (!finalOptions.skipJampack) totalSteps++;

  // Step 1: Parcel optimization
  if (!finalOptions.skipParcel) {
    logger.step(++stepCount, totalSteps, 'Running Parcel optimization');
    await runParcel(indexPath, parcelDistDir);
    currentOutputDir = parcelDistDir;

    // Step 2: Partytown setup (if not skipped)
    if (!finalOptions.skipPartytown) {
      logger.step(++stepCount, totalSteps, 'Setting up Partytown');
      await runPartytown(parcelDistDir);
    }
  }

  // Step 3: Jampack optimization
  if (!finalOptions.skipJampack) {
    logger.step(++stepCount, totalSteps, 'Running Jampack optimization');

    // Copy current output to jampack directory
    cleanDir(jampackDistDir);
    await copyDirectory(currentOutputDir, jampackDistDir);

    await runJampack(jampackDistDir);
    currentOutputDir = jampackDistDir;
  }

  // Final step: Copy to final output directory
  logger.step(++stepCount, totalSteps, 'Copying to final output directory');
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

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    logger.info(`Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start command "${command}": ${error.message}`));
    });
  });
}