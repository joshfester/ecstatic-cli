import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { ensureDir, cleanDir } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { runCommand } from '../utils/process.js';
import { createCommand } from '../utils/command.js';

export const scrapeCommand = new Command('scrape')
  .description('Download website as static files')
  .argument('<url>', 'URL to scrape')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('-d, --depth <number>', 'Mirror depth (overrides config)', parseInt)
  .option('-m, --method <method>', 'Scraping method: httrack|wget (overrides config)')
  .action(createCommand('Scraping', scrapeWebsite));

async function scrapeWebsite(url, options) {
  const config = getConfig();

  // Merge CLI options with config, giving precedence to CLI options
  const finalOptions = {
    output: options.output || config.paths.scraped,
    depth: options.depth || config.scrape.depth,
    method: options.method || config.scrape.method
  };

  const outputDir = resolvePath(finalOptions.output);

  logger.step(1, 3, `Scraping ${url}`);
  logger.info(`Output directory: ${outputDir}`);
  logger.info(`Method: ${finalOptions.method}`);
  logger.info(`Depth: ${finalOptions.depth}`);

  // Clean and ensure output directory exists
  cleanDir(outputDir);

  if (finalOptions.method === 'httrack') {
    await runHttrack(url, outputDir, finalOptions, config);
  } else if (finalOptions.method === 'wget') {
    await runWget(url, outputDir, finalOptions, config);
  } else {
    throw new Error(`Unknown scraping method: ${finalOptions.method}`);
  }

  logger.step(2, 3, 'Running post-processing');
  await runPostProcessing();

  logger.step(3, 3, 'Scraping completed');
  logger.success(`Website scraped successfully to ${outputDir}`);
}

async function runHttrack(url, outputDir, options, config) {
  const httrackConfig = config.scrape.httrack;
  const args = [
    url,
    '-O', outputDir,
    `--depth=${options.depth}`,
    `--ext-depth=${options.depth}`,
    `--sockets=${config.scrape.sockets}`,
    `--timeout=${config.scrape.timeout}`
  ];

  // Add configurable options
  if (httrackConfig.debugLog) args.push('--debug-log');
  if (httrackConfig.near) args.push('--near');
  if (httrackConfig.stay) args.push('-a');
  if (httrackConfig.both) args.push('-B');
  if (httrackConfig.structure) args.push(`-N${httrackConfig.structure}`);
  if (httrackConfig.keepLinks !== undefined) args.push(`--keep-links=${httrackConfig.keepLinks}`);
  if (httrackConfig.robots !== undefined) args.push(`--robots=${httrackConfig.robots}`);
  if (httrackConfig.connections) args.push(`-%c${httrackConfig.connections}`);
  if (httrackConfig.updatehack) args.push('--updatehack');
  if (httrackConfig.mirror) args.push('--mirror');
  if (httrackConfig.cache !== undefined) args.push(`--cache=${httrackConfig.cache}`);
  if (httrackConfig.excludeAll) args.push('-*');

  // Add URL-specific filters based on the domain
  const domain = new URL(url).hostname;
  args.push(`+*${domain}/*.css`);
  args.push(`+*${domain}/*.js`);
  args.push(`+*${domain}/apply/`);
  args.push(`+*${domain}/_image*`);
  args.push('+*mage.mux.com*');

  return runCommand('httrack', args);
}

async function runWget(url, outputDir, options, config) {
  const wgetConfig = config.scrape.wget;
  const args = [
    '--domains', new URL(url).hostname,
    `--level=${options.depth}`,
    `--timeout=${config.scrape.timeout}`,
    `--directory-prefix=${outputDir}`
  ];

  // Add configurable options
  if (wgetConfig.recursive) args.push('--recursive');
  if (wgetConfig.pageRequisites) args.push('--page-requisites');
  if (wgetConfig.htmlExtension) args.push('--html-extension');
  if (wgetConfig.convertLinks) args.push('--convert-links');
  if (wgetConfig.restrictFileNames) args.push(`--restrict-file-names=${wgetConfig.restrictFileNames}`);
  if (wgetConfig.noParent) args.push('--no-parent');

  args.push(url);

  return runCommand('wget', args);
}

async function runPostProcessing() {
  // Run the convert-http script to convert http: to https:
  const scriptPath = resolvePath('./bin/convert-http.sh');
  return runCommand(scriptPath, []);
}

