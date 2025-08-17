export class SiteOneCommandBuilder {
  static build(url, outputDir, mergedConfig) {
    const args = [
      `--url=${url}`,
      `--offline-export-dir=${outputDir}`
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
      command: './siteone/crawler',
      args: args
    };
  }
}