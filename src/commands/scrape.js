import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { ensureDir, cleanDir } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { runCommand } from '../utils/process.js';
import { createCommand } from '../utils/command.js';
import path from 'path';

export const scrapeCommand = new Command('scrape')
  .description('Download website as static files')
  .argument('<url>', 'URL to scrape')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('-d, --depth <number>', 'Mirror depth (overrides config)', parseInt)
  .option('-m, --method <method>', 'Scraping method: httrack|wget (overrides config)')
  .option('--include <pattern>', 'Include filter pattern (can be used multiple times)', collect, [])
  .option('--exclude <pattern>', 'Exclude filter pattern (can be used multiple times)', collect, [])
  .action(createCommand('Scraping', scrapeWebsite));

function collect(value, previous) {
  return previous.concat([value]);
}

async function scrapeWebsite(url, options) {
  const config = getConfig();

  // Merge CLI options with config, giving precedence to CLI options
  const finalOptions = {
    output: options.output || config.paths.scraped,
    depth: options.depth || config.scrape.depth,
    method: options.method || config.scrape.method,
    includeFilters: options.include || [],
    excludeFilters: options.exclude || []
  };

  const outputDir = resolvePath(finalOptions.output);

  const extraFiles = config.scrape.extraFiles || [];
  const totalSteps = extraFiles.length ? 4 : 3;

  logger.step(1, totalSteps, `Scraping ${url}`);
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

  let currentStep = 2;

  if (extraFiles.length) {
    logger.step(currentStep, totalSteps, 'Downloading additional files');
    await downloadExtraFiles(extraFiles, outputDir, config);
    currentStep++;
  }

  logger.step(currentStep, totalSteps, 'Running post-processing');
  await runPostProcessing();

  logger.step(currentStep + 1, totalSteps, 'Scraping completed');
  logger.success(`Website scraped successfully to ${outputDir}`);
}

async function runHttrack(url, outputDir, options, config) {
  const httrackConfig = config.scrape.httrack || {};
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

  // Process filters
  const filters = buildFilterList(url, httrackConfig, options);
  args.push(...filters);

  return runCommand('httrack', args);
}

function buildFilterList(url, httrackConfig, options) {
  const domain = new URL(url).hostname;
  const filters = [];

  // Start with config filters and substitute domain placeholders
  const configFilters = httrackConfig.filters || [];
  const processedConfigFilters = configFilters.map(filter =>
    filter.replace(/\{domain\}/g, domain)
  );

  // Add CLI exclude filters (with - prefix)
  const cliExcludeFilters = options.excludeFilters.map(filter =>
    filter.startsWith('-') ? filter : `-${filter}`
  );

  // Add CLI include filters (with + prefix)  
  const cliIncludeFilters = options.includeFilters.map(filter =>
    filter.startsWith('+') ? filter : `+${filter}`
  );

  // Combine all filters: config filters first, then CLI filters
  // CLI filters have precedence due to httrack's last-rule-wins behavior
  filters.push(...processedConfigFilters);
  filters.push(...cliExcludeFilters);
  filters.push(...cliIncludeFilters);

  return filters;
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

async function downloadExtraFiles(extraFiles, outputDir, config) {
  const restrict = config?.scrape?.wget?.restrictFileNames;

  for (const entry of extraFiles) {
    if (!entry?.url) continue;

    const destDir = path.join(outputDir, entry.prefix || '');
    ensureDir(destDir);

    const args = [];
    if (restrict) {
      args.push(`--restrict-file-names=${restrict}`);
    }
    args.push(`--directory-prefix=${destDir}`);
    args.push(entry.url);

    await runCommand('wget', args);
  }
}

async function runPostProcessing() {
  // Run the convert-http script to convert http: to https:
  const scriptPath = resolvePath('./bin/convert-http.sh');
  return runCommand(scriptPath, []);
}
