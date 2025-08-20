import { getCrawlerPath } from '@ecstatic/siteone-crawler';

export class SiteOneCommandBuilder {
  static build(url, outputDir, mergedConfig) {
    // Get the siteone crawler path from the NPM package
    const crawlerPath = getCrawlerPath();
    const args = [
      `--url=${url}`,
      `--offline-export-dir=${outputDir}`,
      '--rows-limit=1',
      '--offline-export-remove-unwanted-code=0',
      //'--proxy=5.78.119.93:8888',
      //'--http-auth=jerry:Jerry1999',
      "--output-html-report=''",
      "--output-json-file=''",
      "--output-text-file=''",
      "--analyzer-filter-regex='/^$/'"
    ];

    // Add timeout if specified
    if (mergedConfig.timeout) {
      args.push(`--timeout=${mergedConfig.timeout}`);
    }

    // Add user agent if specified (wrap in quotes to handle spaces and special characters)
    if (mergedConfig.userAgent) {
      args.push(`--user-agent="${mergedConfig.userAgent}"`);
    }

    // Add depth limit if specified and not unlimited
    if (mergedConfig.depth && mergedConfig.depth !== 99999) {
      args.push(`--max-depth=${mergedConfig.depth}`);
    }

    // Add SiteOne-specific options from siteone config (which includes defaults)
    const siteoneConfig = mergedConfig.siteone;

    // Add workers (always apply as it has a numeric default)
    args.push(`--workers=${siteoneConfig.workers}`);

    // Add max requests per second (always apply as it has a numeric default)
    args.push(`--max-reqs-per-sec=${siteoneConfig.maxReqsPerSec}`);

    // Add memory limit (always apply as it has a string default)
    args.push(`--memory-limit=${siteoneConfig.memoryLimit}`);

    // Add include regex patterns (can be multiple, including empty array)
    if (Array.isArray(siteoneConfig.includeRegex) && siteoneConfig.includeRegex.length > 0) {
      siteoneConfig.includeRegex.forEach(pattern => {
        args.push(`--include-regex="${pattern}"`);
      });
    }

    // Add ignore regex patterns (can be multiple, including empty array)
    if (Array.isArray(siteoneConfig.ignoreRegex) && siteoneConfig.ignoreRegex.length > 0) {
      siteoneConfig.ignoreRegex.forEach(pattern => {
        args.push(`--ignore-regex="${pattern}"`);
      });
    }

    // Add ignore robots.txt flag (only when true, default false means no flag)
    if (siteoneConfig.ignoreRobotsTxt === true) {
      args.push('--ignore-robots-txt');
    }

    // Add offline export no auto redirect html flag (only when true, default false means no flag)
    if (siteoneConfig.offlineExportNoAutoRedirectHtml === true) {
      args.push('--offline-export-no-auto-redirect-html');
    }

    return {
      command: crawlerPath,
      args: args
    };
  }
}