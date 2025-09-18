import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import * as logger from '../utils/logger.js';
import { createCommand } from '../utils/command.js';
import { Scraper } from '../scrapers/Scraper.js';

export const scrapeCommand = new Command('scrape')
  .description('Download website as static files')
  .argument('<url>', 'URL to scrape')
  .option('--output <dir>', 'Output directory (overrides config)')
  .option('--depth <number>', 'Mirror depth (overrides config)', parseInt)
  .option('--method <method>', 'Scraping method: httrack|wget|siteone (overrides config)')
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
  .option('--single-file', 'Download single file using wget with limited options')
  .option('--retries <number>', 'Number of retries for timeout or non-fatal errors (httrack)', parseInt)
  .option('--host-control <number>', 'Host abandoning: 0=never, 1=timeout, 2=slow, 3=timeout or slow (httrack)', parseInt)
  // SiteOne-specific CLI options
  .option('--workers <number>', 'Maximum number of concurrent workers for siteone (overrides config)', parseInt)
  .option('--max-reqs-per-sec <number>', 'Max requests/s for siteone crawler (overrides config)', parseInt)
  .option('--memory-limit <size>', 'Memory limit for siteone in M or G units (e.g., 512M, 2G) (overrides config)')
  .option('--include-regex <pattern>', 'Include URLs matching regex pattern for siteone (can be used multiple times)', collect, [])
  .option('--ignore-regex <pattern>', 'Ignore URLs matching regex pattern for siteone (can be used multiple times)', collect, [])
  .option('--ignore-robots-txt', 'Ignore robots.txt content for siteone')
  .option('--offline-export-no-auto-redirect-html', 'Disable automatic redirect HTML file creation for siteone')
  .option('--single-page', 'Load only one page and its assets, but do not follow other pages for siteone')
  .action(createCommand('Scraping', scrapeWebsite));

function collect(value, previous) {
  return previous.concat([value]);
}

async function scrapeWebsite(url, options, command) {
  const config = getConfig();

  // Override config suppressOutput if --verbose flag is provided with --admin
  if (command._isVerboseMode) {
    config.logging.suppressOutput = false;
  }

  const scraper = new Scraper();

  // Build final options to maintain the same logging behavior
  const finalOptions = {
    output: options.output || config.paths.scraped,
    depth: options.depth || config.scrape.depth,
    method: options.method || config.scrape.method,
    userAgent: options.userAgent || config.scrape.userAgent
  };

  const outputDir = resolvePath(finalOptions.output);
  logger.info(`Scraping ${url}`);

  // Execute scraping
  const result = await scraper.scrape(url, options, config, command._extractDir);

  logger.info('Running post-processing');
  logger.success(`Website scraped successfully to ${result.outputDir}`);
}
