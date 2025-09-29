import { getSiteOneBinaryPaths } from '../utils/siteone-binaries.js';
import path from 'path';

export class SiteOneCommandBuilder {
  static async build(url, outputDir, mergedConfig, extractDir = null) {
    // Get the binary paths (swoole-cli and extracted crawler.php)
    const { swooleCliPath, crawlerPhpPath } = await getSiteOneBinaryPaths(extractDir);

    // Create temp directories for siteone crawler working files
    const baseDir = extractDir || './tmp';
    const tempDir = path.join(baseDir, 'ecstatic-siteone-work');

    const args = [
      crawlerPhpPath, // First argument is the extracted PHP source
      `--url=${url}`,
      `--offline-export-dir=${outputDir}`,
      '--rows-limit=1',
      '--offline-export-remove-unwanted-code=0',
      //'--result-storage=file',
      `--result-storage-dir=tmp/result-storage`,
      `--http-cache-dir=tmp/http-cache`,
      //'--proxy=5.78.119.93:8888',
      //'--http-auth=jerry:Jerry1999',
      "--output-html-report=''",
      "--output-json-file=''",
      "--output-text-file=''",
      "--analyzer-filter-regex='/^$/'",
      "--replace-content='\/index.html -> \/'",
      "--replace-content='index.html -> \/'",
      "--replace-content='\/index.php.html -> \/'",
      "--replace-content='https_\/\/ -> https:\/\/'",
      "--replace-content='homepage-hero.png -> homepage-hero.avif",
      "--ignore-robots-txt"
    ];

    // Add timeout if specified
    if (mergedConfig.timeout) {
      args.push(`--timeout=${mergedConfig.timeout}`);
    }

    // Add user agent if specified (wrap in quotes to handle spaces and special characters)
    if (mergedConfig.userAgent) {
      args.push(`--user-agent="${mergedConfig.userAgent}"`);
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

    // Add offline export no auto redirect html flag (only when true, default false means no flag)
    if (siteoneConfig.offlineExportNoAutoRedirectHtml === true) {
      args.push('--offline-export-no-auto-redirect-html');
    }

    // Add single page flag (only when true, default false means no flag)
    if (siteoneConfig.singlePage === true) {
      args.push('--single-page');
    }

    return {
      command: swooleCliPath,
      args: args
    };
  }
}
