import { ensureDir, cleanDir } from '../utils/paths.js';
import { runCommand } from '../utils/process.js';
import { replaceDomains } from '../utils/domain-replacement.js';
import { resolvePath } from '../utils/config.js';
import { WgetCommandBuilder } from './WgetCommandBuilder.js';
import { HttrackCommandBuilder } from './HttrackCommandBuilder.js';
import { SiteOneCommandBuilder } from './SiteOneCommandBuilder.js';
import path from 'path';

export class Scraper {
  constructor(commandBuilders = { wget: WgetCommandBuilder, httrack: HttrackCommandBuilder, siteone: SiteOneCommandBuilder }) {
    this.builders = commandBuilders;
  }

  async scrape(url, options, config) {
    const finalOptions = this.buildFinalOptions(options, config);
    let outputDir = this.resolveOutputDir(finalOptions.output);

    // Handle single-file mode: modify output path to include URL path
    if (finalOptions.singleFile) {
      const urlPath = new URL(url).pathname;
      outputDir = path.join(outputDir, urlPath);
    }

    // Clean and ensure output directory exists
    cleanDir(outputDir);

    if (finalOptions.method === 'httrack') {
      await this.executeHttrack(url, outputDir, finalOptions, config);
    } else if (finalOptions.method === 'wget') {
      await this.executeWget(url, outputDir, finalOptions, config);
    } else if (finalOptions.method === 'siteone') {
      await this.executeSiteOne(url, outputDir, finalOptions, config);
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
    let finalOptions = {
      output: options.output || config.paths.scraped,
      depth: options.depth || config.scrape.depth,
      method: options.method || config.scrape.method,
      userAgent: options.userAgent || config.scrape.userAgent
    };

    // Handle single-file mode
    if (options.singleFile) {
      finalOptions.method = 'wget'; // Force wget method
      finalOptions.singleFile = true;
    }

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
    } else if (finalOptions.method === 'siteone') {
      finalOptions.siteone = this.buildSiteOneOptions(options, config);
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
    return this.executeCommand(commandSpec, config);
  }

  async executeWget(url, outputDir, finalOptions, config) {
    const mergedConfig = {
      ...finalOptions,
      timeout: config.scrape.timeout,
      wget: finalOptions.wget || (config.scrape && config.scrape.wget) || {}
    };
    
    const commandSpec = this.builders.wget.build(url, outputDir, mergedConfig);
    return this.executeCommand(commandSpec, config);
  }

  async executeSiteOne(url, outputDir, finalOptions, config) {
    const mergedConfig = {
      ...finalOptions,
      timeout: config.scrape.timeout,
      siteone: finalOptions.siteone || (config.scrape && config.scrape.siteone) || {}
    };
    
    const commandSpec = this.builders.siteone.build(url, outputDir, mergedConfig);
    return this.executeCommand(commandSpec, config);
  }

  async executeCommand(commandSpec, config) {
    const suppressOutput = config?.logging?.suppressOutput || false;
    return runCommand(commandSpec.command, commandSpec.args, suppressOutput);
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
      noProxy: options.noProxy !== undefined ? options.noProxy : scrapeConfig.noProxy,
      retries: options.retries !== undefined ? options.retries : httrackConfig.retries,
      hostControl: options.hostControl !== undefined ? options.hostControl : httrackConfig.hostControl
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

    // Handle single-file mode: only allow specific options
    if (options.singleFile) {
      const noProxy = cliWget.noProxy !== undefined ? cliWget.noProxy : cfgScrape.noProxy;
      const proxy = cliWget.proxy !== undefined ? cliWget.proxy : cfgScrape.proxy;
      
      return {
        // Force adjust-extension for single-file mode
        adjustExtension: true,
        // Only allow these options: host (handled in WgetCommandBuilder), timeout (handled in mergedConfig), 
        // outputDir (handled in WgetCommandBuilder), userAgent, proxy, and noProxy
        userAgent: cliWget.userAgent,
        proxy: noProxy ? undefined : proxy, // Disable proxy if noProxy is true
        noProxy: noProxy
      };
    }

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

  buildSiteOneOptions(options, config) {
    const cfgSiteOne = config.scrape.siteone;
    
    // Handle CLI options for SiteOne with priority over config (which includes defaults)
    return {
      ...cfgSiteOne,
      workers: options.workers !== undefined ? options.workers : cfgSiteOne.workers,
      maxReqsPerSec: options.maxReqsPerSec !== undefined ? options.maxReqsPerSec : cfgSiteOne.maxReqsPerSec,
      memoryLimit: options.memoryLimit !== undefined ? options.memoryLimit : cfgSiteOne.memoryLimit,
      includeRegex: Array.isArray(options.includeRegex) && options.includeRegex.length ? options.includeRegex : cfgSiteOne.includeRegex,
      ignoreRegex: Array.isArray(options.ignoreRegex) && options.ignoreRegex.length ? options.ignoreRegex : cfgSiteOne.ignoreRegex,
      ignoreRobotsTxt: options.ignoreRobotsTxt !== undefined ? options.ignoreRobotsTxt : cfgSiteOne.ignoreRobotsTxt,
      offlineExportNoAutoRedirectHtml: options.offlineExportNoAutoRedirectHtml !== undefined ? options.offlineExportNoAutoRedirectHtml : cfgSiteOne.offlineExportNoAutoRedirectHtml
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

      const suppressOutput = config?.logging?.suppressOutput || false;
      await runCommand('wget', args, suppressOutput);
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