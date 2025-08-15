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
  logger.info(`Output directory: ${outputDir}`);
  logger.info(`Method: ${finalOptions.method}`);
  logger.info(`Depth: ${finalOptions.depth}`);

  // Log options summary for traceability
  logOptionsSummary(finalOptions, config);

  // Execute scraping
  const result = await scraper.scrape(url, options, config);

  logger.info('Running post-processing');
  logger.info('Scraping completed');
  logger.success(`Website scraped successfully to ${result.outputDir}`);
}

function logOptionsSummary(finalOptions, config) {
  // Build method-specific configuration for logging
  if (finalOptions.method === 'wget') {
    const scraper = new Scraper();
    const wgetOpts = scraper.buildWgetOptions({ userAgent: finalOptions.userAgent }, config);
    logger.info(
      `Wget summary: ${wgetOpts.mirror ? '--mirror' : (wgetOpts.recursive ? `--recursive --level=${finalOptions.depth}` : 'non-recursive')}`
    );
    logger.info(
      `Wget flags: noClobber=${!!wgetOpts.noClobber}, noHostDirectories=${!!wgetOpts.noHostDirectories}, adjustExtension=${!!wgetOpts.adjustExtension}, wait=${wgetOpts.wait ?? 'none'}, userAgent=${finalOptions.userAgent ? 'custom' : 'default'}, proxy=${wgetOpts.proxy ?? 'none'}, noProxy=${!!wgetOpts.noProxy}, execute=[${(wgetOpts.execute || []).join(', ')}]`
    );
  } else if (finalOptions.method === 'httrack') {
    const httrackConfig = config.scrape.httrack || {};
    logger.info(
      `Httrack summary: mirror=${!!httrackConfig.mirror}, depth=${finalOptions.depth}, near=${!!httrackConfig.near}, dir_up_down=${httrackConfig.dir_up_down || 'none'}`
    );
    logger.info(
      `Httrack flags: debugLog=${!!httrackConfig.debugLog}, keepLinks=${httrackConfig.keepLinks ?? 'default'}, robots=${httrackConfig.robots ?? 'default'}, connections_per_second=${httrackConfig.connections_per_second ?? 'default'}, updatehack=${!!httrackConfig.updatehack}, userAgent=${finalOptions.userAgent ? 'custom' : 'default'}`
    );
  }
}
