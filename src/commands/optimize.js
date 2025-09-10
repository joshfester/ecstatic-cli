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
import { isProductionEnvironment } from "../utils/environment.js";
import fs from "fs";
import path from "path";

export const optimizeCommand = new Command("optimize")
  .description("Optimize HTML and assets")
  .argument(
    "[input-dir]",
    "Input directory containing HTML to optimize (overrides config)",
  )
  .option("--output <dir>", "Output directory (overrides config)")
  .option("--quiet", "Suppress output from third-party tools")
  .action(createCommand("Optimization", optimizeWebsite));

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

  // Generate dynamic jampack.config.js before running jampack
  await writeJampackConfig(config);

  // Check if we're doing in-place optimization (when input and output are the same)
  const isInPlaceOptimization = resolvedInputDir === outputDir;

  if (isInPlaceOptimization) {
    // In-place optimization: run jampack directly on the directory
    logger.info("Running in-place optimization");
    await runJampack(resolvedInputDir, config);
  } else {
    // Copy from input to output directory, then optimize in-place in output
    logger.info("Copying to output directory");
    ensureDirSafe(outputDir);
    await copyDirectory(resolvedInputDir, outputDir, config);

    logger.info("Running optimization in output directory");
    await runJampack(outputDir, config);
  }

  logger.success(`Website optimized successfully! Output: ${outputDir}`);
}

async function runJampack(distDir, config) {
  const suppressOutput =
    config?.logging?.suppressOutput || isProductionEnvironment();

  // Clean up _jampack directory if it exists
  const jampackDir = path.join(distDir, '_jampack');
  if (dirExists(jampackDir)) {
    fs.rmSync(jampackDir, { recursive: true, force: true });
  }

  // Get jampack binary path from our bundled version
  const { getJampackBinaryPath } = await import(
    "../utils/jampack-binaries.js"
  );
  const jampackPath = await getJampackBinaryPath();

  // Run jampack as a separate process with proper stdio control
  await runCommand(process.execPath, [jampackPath, distDir, "--cleancache"], suppressOutput, { BUN_BE_BUN: '1' });
}

async function copyDirectory(src, dest, config) {
  const suppressOutput = config?.logging?.suppressOutput || false;
  return runCommand("cp", ["-r", `${src}/.`, dest], suppressOutput);
}
