import { Command } from 'commander';
import { spawn } from 'child_process';
import { loadEcstaticConfig, getConfig, resolvePath } from '../utils/config.js';
import { ensureDir, cleanDir } from '../utils/paths.js';
import * as logger from '../utils/logger.js';

export const scrapeCommand = new Command('scrape')
  .description('Download website as static files')
  .argument('<url>', 'URL to scrape')
  .option('-o, --output <dir>', 'Output directory (overrides config)')
  .option('-d, --depth <number>', 'Mirror depth (overrides config)', parseInt)
  .option('-m, --method <method>', 'Scraping method: httrack|wget (overrides config)')
  .action(async (url, options) => {
    try {
      await loadEcstaticConfig();
      await scrapeWebsite(url, options);
    } catch (error) {
      logger.error(`Scraping failed: ${error.message}`);
      process.exit(1);
    }
  });

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
  const args = [
    url,
    '-O', outputDir,
    '--debug-log',
    `--depth=${options.depth}`,
    `--ext-depth=${options.depth}`,
    '--near',
    '-a',
    '-B',
    '-N4',
    `--sockets=${config.scrape.sockets}`,
    '--keep-links=0',
    '--robots=0',
    '-%c20',
    `--timeout=${config.scrape.timeout}`,
    '--updatehack',
    '--mirror',
    '--cache=2',
    '-*'
  ];

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
  const args = [
    '--recursive',
    '--page-requisites',
    '--html-extension',
    '--convert-links',
    '--restrict-file-names=windows',
    '--domains', new URL(url).hostname,
    '--no-parent',
    `--level=${options.depth}`,
    `--timeout=${config.scrape.timeout}`,
    `--directory-prefix=${outputDir}`,
    url
  ];

  return runCommand('wget', args);
}

async function runPostProcessing() {
  // Run the convert-http script to convert http: to https:
  return runCommand('./bin/convert-http.sh', []);
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