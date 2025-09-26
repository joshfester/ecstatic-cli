import { Command } from "commander";
import { getConfig, resolvePath, writeJampackConfig } from "../utils/config.js";
import {
  ensureDirSafe,
  dirExists,
  fileExists,
  findScrapedDomainFolder,
} from "../utils/paths.js";
import * as logger from "../utils/logger.js";
import { runCommand } from "../utils/process.js";
import { createCommand } from "../utils/command.js";
import fs from "fs";
import path from "path";

export const optimizeCommand = new Command("optimize")
  .description("Optimize HTML and assets")
  .argument(
    "[input-dir]",
    "Input directory containing HTML to optimize (overrides config)",
  )
  .option("--output <dir>", "Output directory (overrides config)")
  .option("--config <path>", "Path to jampack config file")
  .option("--preload-images <images>", "Comma-separated list of images to preload")
  .option("--fetchpriority-high <selectors>", "Comma-separated CSS selectors for high fetchpriority")
  .action(createCommand("Optimization", optimizeWebsite));

async function optimizeWebsite(inputDir, options, command) {
  const config = getConfig();

  // Override config suppressOutput if --verbose flag is provided with --admin
  if (command._isVerboseMode) {
    config.logging.suppressOutput = false;
  }

  // Determine input directory - either CLI provided, or find domain folder in scraped directory
  let defaultInputDir = inputDir;
  if (!defaultInputDir) {
    const scrapedDir = resolvePath(config.paths.scraped);
    const scrapingMethod = config.scrape?.method;

    // Handle production mode where scraped path is current directory
    if (config.paths.scraped === "." && scrapingMethod === "siteone") {
      // In production mode with siteone, files are scraped directly to current directory
      const indexPath = path.join(scrapedDir, "index.html");
      if (fileExists(indexPath)) {
        defaultInputDir = scrapedDir;
      } else {
        throw new Error(
          `No scraped content found in current directory. Please run 'scrape' command first.`,
        );
      }
    } else {
      // Use existing domain folder detection for development mode and other methods
      const domainFolder = findScrapedDomainFolder(scrapedDir, scrapingMethod);
      if (!domainFolder) {
        const methodMsg = scrapingMethod
          ? ` (using ${scrapingMethod} method)`
          : "";
        throw new Error(
          `No scraped content found in ${scrapedDir}${methodMsg}. Please run 'scrape' command first.`,
        );
      }
      defaultInputDir = domainFolder;
    }
  }

  // Merge CLI options with config, giving precedence to CLI options
  const finalOptions = {
    inputDir: defaultInputDir,
    output: options.output || config.paths.dist,
  };

  const resolvedInputDir = resolvePath(finalOptions.inputDir);
  const outputDir = resolvePath(finalOptions.output);

  logger.info(`Optimizing website from ${resolvedInputDir}`);
  logger.info(`Final output directory: ${outputDir}`);

  // Validate input directory exists
  if (!dirExists(resolvedInputDir)) {
    throw new Error(`Input directory does not exist: ${resolvedInputDir}`);
  }

  // Check for index.html
  const indexPath = path.join(resolvedInputDir, "index.html");
  if (!fileExists(indexPath)) {
    throw new Error(
      `index.html not found in input directory: ${resolvedInputDir}`,
    );
  }

  // Jampack optimization
  logger.info("Running Jampack optimization");

  // Determine config path - either user provided or auto-generated
  let jampackConfigPath;
  if (options.config) {
    jampackConfigPath = resolvePath(options.config);
    if (!fileExists(jampackConfigPath)) {
      throw new Error(`Jampack config file not found: ${jampackConfigPath}`);
    }
  } else {
    // Generate dynamic jampack.config.js before running jampack
    jampackConfigPath = await writeJampackConfig(config);
  }

  // Check if we're doing in-place optimization (when input and output are the same)
  const isInPlaceOptimization = resolvedInputDir === outputDir;

  if (isInPlaceOptimization) {
    // In-place optimization: run jampack directly on the directory
    logger.info("Running in-place optimization");
    await runJampack(resolvedInputDir, config, jampackConfigPath, command, options);
  } else {
    // Copy from input to output directory, then optimize in-place in output
    logger.info("Copying to output directory");
    ensureDirSafe(outputDir);
    await copyDirectory(resolvedInputDir, outputDir, config);

    logger.info("Running optimization in output directory");
    await runJampack(outputDir, config, jampackConfigPath, command, options);
  }

  logger.success(`Website optimized successfully! Output: ${outputDir}`);
}

async function runJampack(distDir, config, jampackConfigPath, command, options) {
  const suppressOutput = config?.logging?.suppressOutput;

  // Clean up _jampack directory if it exists
  const jampackDir = path.join(distDir, '_jampack');
  if (dirExists(jampackDir)) {
    fs.rmSync(jampackDir, { recursive: true, force: true });
  }

  // Get jampack binary path from our bundled version
  const { getJampackBinaryPath } = await import(
    "../utils/jampack-binaries.js"
  );
  const jampackPath = await getJampackBinaryPath(command._extractDir);

  // Build jampack command arguments
  const jampackArgs = [jampackPath, distDir];
  if (jampackConfigPath) {
    jampackArgs.push("--config", jampackConfigPath);
  }

  // Add preload-images option if provided
  if (options.preloadImages) {
    jampackArgs.push("--preload-images", options.preloadImages);
  }

  // Add fetchpriority-high option if provided
  if (options.fetchpriorityHigh) {
    jampackArgs.push("--fetchpriority-high", options.fetchpriorityHigh);
  }

  // Run jampack as a separate process with proper stdio control
  await runCommand(process.execPath, jampackArgs, suppressOutput, { BUN_BE_BUN: '1' });
}

async function copyDirectory(src, dest, config) {
  const suppressOutput = config?.logging?.suppressOutput || false;
  return runCommand("cp", ["-r", `${src}/.`, dest], suppressOutput);
}
