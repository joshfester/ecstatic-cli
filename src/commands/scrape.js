import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { ensureDir, cleanDir } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { runCommand } from '../utils/process.js';
import { createCommand } from '../utils/command.js';
import { replaceDomains } from '../utils/domain-replacement.js';
import path from 'path';

export const scrapeCommand = new Command('scrape')
  .description('Download website as static files')
  .argument('<url>', 'URL to scrape')
  .option('--output <dir>', 'Output directory (overrides config)')
  .option('--depth <number>', 'Mirror depth (overrides config)', parseInt)
  .option('--method <method>', 'Scraping method: httrack|wget (overrides config)')
  .option('--include <pattern>', 'Include filter pattern for httrack (can be used multiple times)', collect, [])
  .option('--exclude <pattern>', 'Exclude filter pattern for httrack (can be used multiple times)', collect, [])
  // Wget-specific CLI flags (CLI overrides config)
  .option('--mirror', 'Use wget --mirror (overrides --recursive and --level)')
  .option('--no-clobber', 'Do not overwrite existing files')
  .option('--execute <command>', 'Wget --execute directive (repeatable)', collect, [])
  .option('--user-agent <string>', 'HTTP User-Agent string for wget')
  .option('--no-host-directories', 'Disable host-prefixed directories')
  .option('--adjust-extension', 'Append .html/.css extensions to matching content types')
  .option('--wait <interval>', 'Wait interval between requests (e.g., 1, 1d, 1m, 1h)')
  .option('--exclude-directories <list>', 'Comma-separated list of directories to exclude')
  .option('--reject <pattern>', 'Reject files matching pattern (can be used multiple times)', collect, [])
  .option('--proxy <url>', 'HTTP/HTTPS proxy URL (supports username:password@proxy.com:port)')
  .option('--no-proxy', 'Disable proxy usage even if environment variables are set')
  .action(createCommand('Scraping', scrapeWebsite));

function collect(value, previous) {
  return previous.concat([value]);
}

async function scrapeWebsite(url, options) {
  const config = getConfig();

  const finalOptions = {
    output: options.output || config.paths.scraped,
    depth: options.depth || config.scrape.depth,
    method: options.method || config.scrape.method,
    userAgent: options.userAgent || config.scrape.userAgent
  };

  // Build method-specific configuration
  if (finalOptions.method === 'wget') {
    finalOptions.wget = buildWgetOptions(options, config);
  } else if (finalOptions.method === 'httrack') {
    const httrackOpts = buildHttrackOptions(options, config);
    finalOptions.httrack = httrackOpts.httrack;
    finalOptions.includeFilters = httrackOpts.includeFilters;
    finalOptions.excludeFilters = httrackOpts.excludeFilters;
    finalOptions.proxy = httrackOpts.proxy;
    finalOptions.noProxy = httrackOpts.noProxy;
  }

  const outputDir = resolvePath(finalOptions.output);

  const extraFiles = config.scrape.extraFiles || [];
  const totalSteps = extraFiles.length ? 4 : 3;

  logger.step(1, totalSteps, `Scraping ${url}`);
  logger.info(`Output directory: ${outputDir}`);
  logger.info(`Method: ${finalOptions.method}`);
  logger.info(`Depth: ${finalOptions.depth}`);

  // Summarize effective options for traceability
  if (finalOptions.method === 'wget') {
    const w = finalOptions.wget || {};
    logger.info(
      `Wget summary: ${w.mirror ? '--mirror' : (w.recursive ? `--recursive --level=${finalOptions.depth}` : 'non-recursive')}`
    );
    logger.info(
      `Wget flags: noClobber=${!!w.noClobber}, noHostDirectories=${!!w.noHostDirectories}, adjustExtension=${!!w.adjustExtension}, wait=${w.wait ?? 'none'}, userAgent=${finalOptions.userAgent ? 'custom' : 'default'}, proxy=${w.proxy ?? 'none'}, noProxy=${!!w.noProxy}, execute=[${(w.execute || []).join(', ')}]`
    );
  } else if (finalOptions.method === 'httrack') {
    const h = finalOptions.httrack || {};
    logger.info(
      `Httrack summary: mirror=${!!h.mirror}, depth=${finalOptions.depth}, near=${!!h.near}, dir_up_down=${h.dir_up_down || 'none'}`
    );
    logger.info(
      `Httrack flags: debugLog=${!!h.debugLog}, keepLinks=${h.keepLinks ?? 'default'}, robots=${h.robots ?? 'default'}, connections_per_second=${h.connections_per_second ?? 'default'}, updatehack=${!!h.updatehack}, userAgent=${finalOptions.userAgent ? 'custom' : 'default'}, proxy=${finalOptions.proxy ?? 'none'}, noProxy=${!!finalOptions.noProxy}`
    );
  }

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
  await runPostProcessing(config);

  logger.step(currentStep + 1, totalSteps, 'Scraping completed');
  logger.success(`Website scraped successfully to ${outputDir}`);
}

function buildHttrackOptions(options, config) {
  const httrackConfig = config.scrape.httrack || {};
  const scrapeConfig = config.scrape || {};

  // Merge config include/exclude with CLI options (CLI takes precedence)
  const configInclude = httrackConfig.include || [];
  const configExclude = httrackConfig.exclude || [];
  const cliInclude = options.include || [];
  const cliExclude = options.exclude || [];

  return {
    httrack: httrackConfig,
    userAgent: options.userAgent || config.scrape.userAgent,
    includeFilters: [...configInclude, ...cliInclude],
    excludeFilters: [...configExclude, ...cliExclude],
    proxy: options.proxy !== undefined ? options.proxy : scrapeConfig.proxy,
    noProxy: options.noProxy !== undefined ? options.noProxy : scrapeConfig.noProxy
  };
}

async function runHttrack(url, outputDir, options, config) {
  const httrackConfig = options.httrack || config.scrape.httrack || {};
  const extDepth = httrackConfig.extDepth || options.depth;
  const sockets = httrackConfig.sockets || 16;
  const args = [
    url,
    '-O', outputDir,
    `--depth=${options.depth}`,
    `--ext-depth=${extDepth}`,
    `--sockets=${sockets}`,
    `--timeout=${config.scrape.timeout}`
  ];

  // Add configurable options
  if (httrackConfig.debugLog) args.push('--debug-log');
  if (httrackConfig.near) args.push('--near');

  // Always pass -a flag (stay on same host)
  args.push('-a');

  // Always pass -N1004 structure flag
  args.push('-N1004');

  // Handle dir_up_down option for directory traversal
  if (httrackConfig.dir_up_down === 'up') {
    args.push('-U');
  } else if (httrackConfig.dir_up_down === 'down') {
    args.push('-D');
  } else if (httrackConfig.dir_up_down === 'both') {
    args.push('-B');
  }

  // HTTP User-Agent
  if (options.userAgent) {
    args.push(`--user-agent=${options.userAgent}`);
  }

  // Proxy settings
  if (options.noProxy) {
    // Skip proxy configuration even if proxy is set
  } else if (options.proxy) {
    // Handle proxy URL - httrack uses -P format: proxy:port or user:pass@proxy:port
    let proxyArg = options.proxy;

    // Remove protocol prefix if present since httrack -P doesn't expect it
    proxyArg = proxyArg.replace(/^https?:\/\//, '');

    args.push(`-P ${proxyArg}`);
  }

  if (httrackConfig.keepLinks !== undefined) args.push(`--keep-links=${httrackConfig.keepLinks}`);
  if (httrackConfig.robots !== undefined) args.push(`--robots=${httrackConfig.robots}`);
  if (httrackConfig.connections_per_second) args.push(`-%c${httrackConfig.connections_per_second}`);
  if (httrackConfig.updatehack) args.push('--updatehack');
  if (httrackConfig.mirror) args.push('--mirror');

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

function buildWgetOptions(options, config) {
  const cfgWget = (config.scrape && config.scrape.wget) || {};
  const cfgScrape = config.scrape || {};
  const cliWget = {
    mirror: options.mirror,
    noClobber: options.noClobber,
    execute: options.execute,
    userAgent: options.userAgent,
    noHostDirectories: options.noHostDirectories,
    adjustExtension: options.adjustExtension,
    wait: options.wait,
    excludeDirectories: options.excludeDirectories,
    reject: options.reject,
    proxy: options.proxy,
    noProxy: options.noProxy
  };

  return {
    recursive: cfgWget.recursive,
    pageRequisites: cfgWget.pageRequisites,
    convertLinks: cfgWget.convertLinks,
    restrictFileNames: cfgWget.restrictFileNames,
    noParent: cfgWget.noParent,
    mirror: cliWget.mirror !== undefined ? cliWget.mirror : cfgWget.mirror,
    noClobber: cliWget.noClobber !== undefined ? cliWget.noClobber : cfgWget.noClobber,
    execute: Array.isArray(cliWget.execute) && cliWget.execute.length ? cliWget.execute : (cfgWget.execute || []),
    noHostDirectories: cliWget.noHostDirectories !== undefined ? cliWget.noHostDirectories : cfgWget.noHostDirectories,
    adjustExtension: cliWget.adjustExtension !== undefined ? cliWget.adjustExtension : cfgWget.adjustExtension,
    wait: cliWget.wait !== undefined ? cliWget.wait : cfgWget.wait,
    excludeDirectories: cliWget.excludeDirectories !== undefined ? cliWget.excludeDirectories : cfgWget.excludeDirectories,
    reject: Array.isArray(cliWget.reject) && cliWget.reject.length ? cliWget.reject : (cfgWget.reject || []),
    proxy: cliWget.proxy !== undefined ? cliWget.proxy : cfgScrape.proxy,
    noProxy: cliWget.noProxy !== undefined ? cliWget.noProxy : cfgScrape.noProxy
  };
}

async function runWget(url, outputDir, options, config) {
  const host = new URL(url).hostname;
  const wgetOpts = options.wget || (config.scrape && config.scrape.wget) || {};
  const args = [
    '--domains', host,
    `--timeout=${config.scrape.timeout}`,
    `--directory-prefix=${outputDir}`
  ];

  for (const e of wgetOpts.execute) {
    args.push('--execute', e);
  }

  // HTTP User-Agent
  if (options.userAgent) {
    args.push(`--user-agent='${options.userAgent}'`);
  }

  // Simple boolean flags
  if (wgetOpts.noClobber) args.push('--no-clobber');
  if (wgetOpts.noHostDirectories) args.push('--no-host-directories');
  if (wgetOpts.adjustExtension) args.push('--adjust-extension');

  // Exclude directories
  if (wgetOpts.excludeDirectories) {
    args.push(`--exclude-directories=${wgetOpts.excludeDirectories}`);
  }

  // Reject patterns
  if (wgetOpts.reject && Array.isArray(wgetOpts.reject) && wgetOpts.reject.length > 0) {
    args.push(`--reject=${wgetOpts.reject.join(',')}`);
  }

  // Proxy settings
  if (wgetOpts.noProxy) {
    args.push('--no-proxy');
  } else if (wgetOpts.proxy) {
    // For wget, we use environment variables or --execute to set proxy
    // Using --execute is more explicit and reliable
    const proxyUrl = wgetOpts.proxy;
    if (proxyUrl.startsWith('http://')) {
      args.push('--execute', `http_proxy=${proxyUrl}`);
    } else if (proxyUrl.startsWith('https://')) {
      args.push('--execute', `https_proxy=${proxyUrl}`);
    } else {
      args.push('--execute', `http_proxy=${'http://' + proxyUrl}`);
      args.push('--execute', `https_proxy=${'https://' + proxyUrl}`);
    }
  }

  // Existing options we continue to honor
  if (wgetOpts.convertLinks) args.push('--convert-links');
  if (wgetOpts.pageRequisites) args.push('--page-requisites');
  if (wgetOpts.restrictFileNames) args.push(`--restrict-file-names=${wgetOpts.restrictFileNames}`);
  if (wgetOpts.noParent) args.push('--no-parent');

  // Wait interval
  if (wgetOpts.wait !== undefined && wgetOpts.wait !== null && wgetOpts.wait !== '') {
    args.push(`--wait=${wgetOpts.wait}`);
  }

  // Mirror overrides recursive/level
  if (wgetOpts.mirror) {
    args.push('--mirror');
  } else if (wgetOpts.recursive) {
    args.push('--recursive', `--level=${options.depth}`);
  }

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

async function runPostProcessing(config) {
  // Run domain replacement if configured
  const domainReplacement = config?.scrape?.domainReplacement;
  if (domainReplacement?.source && domainReplacement?.target) {
    const scrapedDir = resolvePath(config.paths.scraped);
    await replaceDomains(scrapedDir, domainReplacement.source, domainReplacement.target);
  }
}
