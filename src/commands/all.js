import { Command } from 'commander';
import { getConfig, resolvePath } from '../utils/config.js';
import { findScrapedDomainFolder } from '../utils/paths.js';
import * as logger from '../utils/logger.js';
import { createCommand } from '../utils/command.js';

// Import the individual command functions
import { scrapeCommand } from './scrape.js';
import { optimizeCommand } from './optimize.js';
import { deployCommand } from './deploy.js';

export const allCommand = new Command('all')
  .description('Run complete pipeline: scrape → optimize → deploy')
  .argument('<url>', 'URL to scrape and optimize')
  .option('-o, --output <dir>', 'Final output directory (overrides config)')
  .option('-d, --depth <number>', 'Scraping mirror depth (overrides config)', parseInt)
  .option('-m, --method <method>', 'Scraping method: httrack|wget (overrides config)')
  .option('--skip-parcel', 'Skip Parcel optimization')
  .option('--skip-jampack', 'Skip Jampack optimization')
  .option('--skip-partytown', 'Skip Partytown setup')
  .option('--skip-deploy', 'Skip deployment step')
  .action(createCommand('Pipeline', runCompletePipeline));

async function runCompletePipeline(url, options) {
  const config = getConfig();
  const finalOutput = options.output || config.paths.dist;
  
  logger.info('🚀 Starting complete Ecstatic pipeline');
  logger.info(`URL: ${url}`);
  logger.info(`Final output: ${resolvePath(finalOutput)}`);
  
  const pipelineStart = Date.now();
  
  try {
    // Step 1: Scrape
    logger.info('\n' + '='.repeat(50));
    logger.info('📥 PHASE 1: SCRAPING');
    logger.info('='.repeat(50));
    
    await runScrapeStep(url, options);
    
    // Step 2: Optimize
    logger.info('\n' + '='.repeat(50));
    logger.info('⚡ PHASE 2: OPTIMIZATION');
    logger.info('='.repeat(50));
    
    await runOptimizeStep(options);
    
    // Step 3: Deploy (optional)
    if (!options.skipDeploy) {
      logger.info('\n' + '='.repeat(50));
      logger.info('🚀 PHASE 3: DEPLOYMENT');
      logger.info('='.repeat(50));
      
      await runDeployStep(options);
    } else {
      logger.info('\n📦 Skipping deployment step');
    }
    
    const pipelineEnd = Date.now();
    const duration = Math.round((pipelineEnd - pipelineStart) / 1000);
    
    logger.info('\n' + '='.repeat(50));
    logger.success(`🎉 PIPELINE COMPLETED IN ${duration}s`);
    logger.info('='.repeat(50));
    logger.success(`Your optimized website is ready at: ${resolvePath(finalOutput)}`);
    
  } catch (error) {
    const pipelineEnd = Date.now();
    const duration = Math.round((pipelineEnd - pipelineStart) / 1000);
    
    logger.info('\n' + '='.repeat(50));
    logger.error(`💥 PIPELINE FAILED AFTER ${duration}s`);
    logger.info('='.repeat(50));
    throw error;
  }
}

async function runScrapeStep(url, options) {
  const config = getConfig();
  
  // Create a new command instance and run it programmatically
  const scrapeOptions = {
    output: config.paths.scraped,
    depth: options.depth,
    method: options.method
  };
  
  // Simulate the scrape command action
  const scrapeAction = scrapeCommand._actionHandler;
  await scrapeAction(url, scrapeOptions);
}

async function runOptimizeStep(options) {
  const config = getConfig();
  
  // Find the scraped domain folder
  const scrapedDir = resolvePath(config.paths.scraped);
  const scrapingMethod = config.scrape?.method;
  const domainFolder = findScrapedDomainFolder(scrapedDir, scrapingMethod);
  if (!domainFolder) {
    const methodMsg = scrapingMethod ? ` (using ${scrapingMethod} method)` : '';
    throw new Error(`No scraped content found in ${scrapedDir}${methodMsg}. Scraping may have failed.`);
  }
  
  const optimizeOptions = {
    output: options.output,
    skipParcel: options.skipParcel,
    skipJampack: options.skipJampack,
    skipPartytown: options.skipPartytown
  };
  
  // Simulate the optimize command action
  const optimizeAction = optimizeCommand._actionHandler;
  await optimizeAction(domainFolder, optimizeOptions);
}

async function runDeployStep(options) {
  const deployOptions = {};
  
  // Simulate the deploy command action
  const deployAction = deployCommand._actionHandler;
  await deployAction(options.output, deployOptions);
}