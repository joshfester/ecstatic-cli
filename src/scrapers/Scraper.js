import { ensureDir, cleanDir } from '../utils/paths.js';
import { runCommand } from '../utils/process.js';
import { replaceDomains } from '../utils/domain-replacement.js';
import { resolvePath } from '../utils/config.js';
import { WgetCommandBuilder } from './WgetCommandBuilder.js';
import { HttrackCommandBuilder } from './HttrackCommandBuilder.js';
import path from 'path';

export class Scraper {
  constructor(commandBuilders = { wget: WgetCommandBuilder, httrack: HttrackCommandBuilder }) {
    this.builders = commandBuilders;
  }

  async scrape(url, options, config) {
    const finalOptions = this.buildFinalOptions(options, config);
    const outputDir = this.resolveOutputDir(finalOptions.output);

    // Clean and ensure output directory exists
    cleanDir(outputDir);

    if (finalOptions.method === 'httrack') {
      await this.executeHttrack(url, outputDir, finalOptions, config);
    } else if (finalOptions.method === 'wget') {
      await this.executeWget(url, outputDir, finalOptions, config);
    } else {
      throw new Error(`Unknown scraping method: ${finalOptions.method}`);
    }

    // Handle extra files if configured
    const extraFiles = config.scrape.extraFiles || [];
    if (extraFiles.length) {
      await this.handleExtraFiles(extraFiles, outputDir, config);
    }

    // Run post-processing
    await this.runPostProcessing(config);

    return { outputDir, finalOptions };
  }

  buildFinalOptions(options, config) {
    const finalOptions = {
      output: options.output || config.paths.scraped,
      depth: options.depth || config.scrape.depth,
      method: options.method || config.scrape.method,
      userAgent: options.userAgent || config.scrape.userAgent
    };

    // Build method-specific configuration
    if (finalOptions.method === 'wget') {
      finalOptions.wget = this.buildWgetOptions(options, config);
    } else if (finalOptions.method === 'httrack') {
      const httrackOpts = this.buildHttrackOptions(options, config);
      finalOptions.httrack = httrackOpts.httrack;
      finalOptions.includeFilters = httrackOpts.includeFilters;
      finalOptions.excludeFilters = httrackOpts.excludeFilters;
      finalOptions.proxy = httrackOpts.proxy;
      finalOptions.noProxy = httrackOpts.noProxy;
    }

    return finalOptions;
  }

  resolveOutputDir(outputPath) {
    return resolvePath(outputPath);
  }

  async executeHttrack(url, outputDir, finalOptions, config) {
    const mergedConfig = {
      ...finalOptions,
      timeout: config.scrape.timeout,
      httrack: finalOptions.httrack || config.scrape.httrack || {}
    };
    
    const commandSpec = this.builders.httrack.build(url, outputDir, mergedConfig);
    return this.executeCommand(commandSpec);
  }

  async executeWget(url, outputDir, finalOptions, config) {
    const mergedConfig = {
      ...finalOptions,
      timeout: config.scrape.timeout,
      wget: finalOptions.wget || (config.scrape && config.scrape.wget) || {}
    };
    
    const commandSpec = this.builders.wget.build(url, outputDir, mergedConfig);
    return this.executeCommand(commandSpec);
  }

  async executeCommand(commandSpec) {
    return runCommand(commandSpec.command, commandSpec.args);
  }

  buildHttrackOptions(options, config) {
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

  buildWgetOptions(options, config) {
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

  async handleExtraFiles(extraFiles, outputDir, config) {
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

  async runPostProcessing(config) {
    // Run domain replacement if configured
    const domainReplacement = config?.scrape?.domainReplacement;
    if (domainReplacement?.source && domainReplacement?.target) {
      const scrapedDir = resolvePath(config.paths.scraped);
      await replaceDomains(scrapedDir, domainReplacement.source, domainReplacement.target);
    }
  }
}