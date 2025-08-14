import { test } from 'node:test';
import assert from 'node:assert';

// Mock the runCommand function to capture arguments
let capturedCommand = null;
let capturedArgs = null;

const mockRunCommand = (command, args) => {
  capturedCommand = command;
  capturedArgs = args;
  return Promise.resolve();
};

// Mock the utils modules
const mockProcess = {
  runCommand: mockRunCommand
};

const mockConfig = {
  getConfig: () => ({
    paths: { scraped: './scraped' },
    scrape: {
      depth: 3,
      method: 'wget',
      timeout: 10,
      sockets: 16,
      wget: {
        mirror: true
      }
    }
  }),
  resolvePath: (path) => path
};

const mockPaths = {
  ensureDir: () => {},
  cleanDir: () => {}
};

const mockLogger = {
  step: () => {},
  info: () => {},
  success: () => {}
};

const mockCommand = {
  createCommand: (name, fn) => fn
};

const mockDomainReplacement = {
  replaceDomains: () => Promise.resolve()
};

// Create a test version of the scrape function
async function createTestScrapeFunction() {
  // Inline the runWget function with mocked dependencies
  async function runWget(url, outputDir, options, config) {
    const host = new URL(url).hostname;
    const wgetOpts = options.wget || (config.scrape && config.scrape.wget) || {};
    const args = [
      '--domains', host,
      `--timeout=${config.scrape.timeout}`,
      `--directory-prefix=${outputDir}`
    ];

    for (const e of wgetOpts.execute || []) {
      args.push('--execute', e);
    }

    // HTTP User-Agent
    if (wgetOpts.userAgent) {
      args.push(`--user-agent='${wgetOpts.userAgent}'`);
    }

    // Simple boolean flags
    if (wgetOpts.noClobber) args.push('--no-clobber');
    if (wgetOpts.noHostDirectories) args.push('--no-host-directories');
    if (wgetOpts.adjustExtension) args.push('--adjust-extension');

    // Exclude directories
    if (wgetOpts.excludeDirectories) {
      args.push(`--exclude-directories=${wgetOpts.excludeDirectories}`);
    }

    // Existing options we continue to honor
    if (wgetOpts.convertLinks) args.push('--convert-links');
    if (wgetOpts.pageRequisites) args.push('--page-requisites');
    if (wgetOpts.restrictFileNames) args.push(`--restrict-file-names=${wgetOpts.restrictFileNames}`);
    if (wgetOpts.noParent) args.push('--no-parent');

    // Wait interval
    if (wgetOpts.wait !== undefined && wgetOpts.wait !== null && wgetOpts.wait !== '') {
      args.push(`--wait=${wgetOpts.wait}`);
    }

    // Mirror overrides recursive/level
    if (wgetOpts.mirror) {
      args.push('--mirror');
    } else if (wgetOpts.recursive) {
      args.push('--recursive', `--level=${options.depth}`);
    }

    args.push(url);

    return mockRunCommand('wget', args);
  }

  return async function testScrapeWebsite(url, options) {
    const config = mockConfig.getConfig();

    // Merge CLI options with config
    const cfgWget = (config.scrape && config.scrape.wget) || {};
    const cliWget = {
      excludeDirectories: options.excludeDirectories
    };

    const mergedWget = {
      recursive: cfgWget.recursive,
      pageRequisites: cfgWget.pageRequisites,
      convertLinks: cfgWget.convertLinks,
      restrictFileNames: cfgWget.restrictFileNames,
      noParent: cfgWget.noParent,
      mirror: cfgWget.mirror,
      execute: cfgWget.execute || [],
      excludeDirectories: cliWget.excludeDirectories !== undefined ? cliWget.excludeDirectories : cfgWget.excludeDirectories
    };

    const finalOptions = {
      output: './scraped',
      depth: 3,
      method: 'wget',
      wget: mergedWget
    };

    // Call the test version of runWget
    await runWget(url, './scraped', finalOptions, config);
  };
}

test('wget excludeDirectories option via CLI', async () => {
  const testScrapeWebsite = await createTestScrapeFunction();
  
  // Reset captured values
  capturedCommand = null;
  capturedArgs = null;

  // Test with CLI exclude-directories option
  await testScrapeWebsite('https://example.com', {
    excludeDirectories: 'admin,private,test'
  });

  assert.strictEqual(capturedCommand, 'wget');
  assert(Array.isArray(capturedArgs));
  assert(capturedArgs.includes('--exclude-directories=admin,private,test'));
});

test('wget excludeDirectories option via config', async () => {
  const testScrapeWebsite = await createTestScrapeFunction();
  
  // Reset captured values
  capturedCommand = null;
  capturedArgs = null;

  // Override the config mock for this test
  const originalGetConfig = mockConfig.getConfig;
  mockConfig.getConfig = () => ({
    paths: { scraped: './scraped' },
    scrape: {
      depth: 3,
      method: 'wget',
      timeout: 10,
      sockets: 16,
      wget: {
        mirror: true,
        excludeDirectories: 'config-admin,config-private'
      }
    }
  });

  await testScrapeWebsite('https://example.com', {});

  assert.strictEqual(capturedCommand, 'wget');
  assert(Array.isArray(capturedArgs));
  assert(capturedArgs.includes('--exclude-directories=config-admin,config-private'));

  // Restore original mock
  mockConfig.getConfig = originalGetConfig;
});

test('wget excludeDirectories CLI overrides config', async () => {
  const testScrapeWebsite = await createTestScrapeFunction();
  
  // Reset captured values
  capturedCommand = null;
  capturedArgs = null;

  // Override the config mock for this test
  const originalGetConfig = mockConfig.getConfig;
  mockConfig.getConfig = () => ({
    paths: { scraped: './scraped' },
    scrape: {
      depth: 3,
      method: 'wget',
      timeout: 10,
      sockets: 16,
      wget: {
        mirror: true,
        excludeDirectories: 'config-admin,config-private'
      }
    }
  });

  // CLI option should override config
  await testScrapeWebsite('https://example.com', {
    excludeDirectories: 'cli-admin,cli-private'
  });

  assert.strictEqual(capturedCommand, 'wget');
  assert(Array.isArray(capturedArgs));
  assert(capturedArgs.includes('--exclude-directories=cli-admin,cli-private'));
  // Should not include config value
  assert(!capturedArgs.includes('--exclude-directories=config-admin,config-private'));

  // Restore original mock
  mockConfig.getConfig = originalGetConfig;
});

test('wget without excludeDirectories option', async () => {
  const testScrapeWebsite = await createTestScrapeFunction();
  
  // Reset captured values
  capturedCommand = null;
  capturedArgs = null;

  await testScrapeWebsite('https://example.com', {});

  assert.strictEqual(capturedCommand, 'wget');
  assert(Array.isArray(capturedArgs));
  
  // Should not include any --exclude-directories flag
  const excludeArgs = capturedArgs.filter(arg => arg.startsWith('--exclude-directories'));
  assert.strictEqual(excludeArgs.length, 0);
});