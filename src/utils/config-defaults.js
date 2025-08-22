// Default configuration values for ecstatic
import { getEnvironmentPaths } from './environment.js';

export const defaults = {
  paths: getEnvironmentPaths(),
  scrape: {
    depth: 3,
    method: 'siteone', // or 'wget'
    timeout: 10,
    extraFiles: [],
    // Custom HTTP User-Agent string for both httrack and wget
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36',
    // Proxy settings (used by both httrack and wget)
    // proxy: 'http://proxy.company.com:8080',              // Basic proxy
    // noProxy: false,                                      // Disable proxy usage
    httrack: {
      debugLog: false,
      near: true,
      dir_up_down: 'down',  // 'up' (-U), 'down' (-D), 'both' (-B)
      extDepth: 0,          // httrack --ext-depth option
      sockets: 1,          // httrack --sockets option
      keepLinks: 0,
      robots: 0,
      connections_per_second: 1,      // -%c flag
      updatehack: true,
      mirror: false,
      include: [],  // Include filter patterns (get + prefix)
      exclude: []   // Exclude filter patterns (get - prefix)
    },
    wget: {
      recursive: false,
      pageRequisites: false,
      convertLinks: false,
      restrictFileNames: 'windows',
      noParent: true,

      // When true, use wget --mirror (overrides --recursive and --level)
      mirror: false,
      // Do not overwrite existing files
      noClobber: false,
      // .wgetrc-style commands (repeatable). Defaults to robots=off.
      // Example: ['robots=off', 'cookies=on']
      execute: ['robots=off'],
      // Disable host-prefixed directories (wget -nH/--no-host-directories)
      noHostDirectories: true,
      adjustExtension: true,
      // Wait between requests, e.g. 1, 500ms, 1m, 1h
      wait: 1,
      // File patterns to reject during scraping
      reject: []
    },
    siteone: {
      workers: 2,                              // Default: 3 (1 on Windows)
      maxReqsPerSec: 2,                       // Default: 10 req/s
      memoryLimit: '2048M',                    // Default: 2048M
      includeRegex: [],                        // Array of regex patterns to include
      ignoreRegex: [],                         // Array of regex patterns to ignore
      ignoreRobotsTxt: false,                  // Default: false (respect robots.txt)
      offlineExportNoAutoRedirectHtml: true,  // Default: false (create auto redirect files)
    }
  },
  optimize: {
    deferPatterns: [],
    offloadPatterns: []
  },
  htmlDefer: {
    offloadPatterns: [],
    deferPatterns: []
  },
  deploy: {
    bunny: {
      accessKey: '',
      globalApiKey: '',
      storageZone: '',
      region: '',
      purgeUrl: ''
    }
  },
  logging: {
    level: 'info',
    suppressOutput: false  // Suppress output from third-party tools (httrack, wget, siteone, parcel, jampack)
  }
};
