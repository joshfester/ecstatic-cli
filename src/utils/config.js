import { loadConfig } from 'c12';
import path from 'path';

// Default configuration values
const defaults = {
  paths: {
    scraped: './scraped',
    scrapedWeb: './scraped/web',
    distParcel: './dist-parcel',
    distJampack: './dist-jampack',
    dist: './dist'
  },
  scrape: {
    depth: 3,
    method: 'httrack',
    timeout: 10,
    sockets: 16,
    extraFiles: [],
    // Custom HTTP User-Agent string for both httrack and wget
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36',
    httrack: {
      debugLog: false,
      near: true,
      dir_up_down: 'down',  // 'up' (-U), 'down' (-D), 'both' (-B)
      keepLinks: 0,
      robots: 0,
      connections: 20,      // -%c20 flag
      updatehack: true,
      mirror: true
    },
    wget: {
      recursive: true,
      pageRequisites: true,
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

      // proxy: 'http://proxy.company.com:8080',              // Basic proxy
      // noProxy: false                                       // Disable proxy usage
    }
  },
  build: {
    parcel: {
      cache: true,
      minify: true
    }
  },
  optimize: {
    jampack: {
      enabled: true
    }
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
    level: 'info'
  }
};

let _config = null;

// Load configuration using c12
export async function loadEcstaticConfig() {
  if (_config) return _config;

  const { config } = await loadConfig({
    name: 'ecstatic',
    defaults
  });

  _config = config;
  return config;
}

// Get config synchronously (assumes loadEcstaticConfig was called first)
export function getConfig() {
  if (!_config) {
    throw new Error('Configuration not loaded. Call loadEcstaticConfig() first.');
  }
  return _config;
}

// Validate required deployment configuration
export function validateDeployConfig(config = getConfig()) {
  const { bunny } = config.deploy;
  const required = ['accessKey', 'globalApiKey', 'storageZone', 'purgeUrl'];
  const missing = required.filter(key => !bunny[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required deployment configuration: deploy.bunny.${missing.join(', deploy.bunny.')}`);
  }

  return bunny;
}

// Helper to resolve paths relative to project root
export function resolvePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}
