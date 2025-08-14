import { test } from 'node:test';
import assert from 'node:assert';
import { Scraper } from '../../../src/scrapers/Scraper.js';

// Mock command builders
class MockWgetCommandBuilder {
  static build(url, outputDir, config) {
    return {
      command: 'wget',
      args: ['--mock-wget', url, outputDir]
    };
  }
}

class MockHttrackCommandBuilder {
  static build(url, outputDir, config) {
    return {
      command: 'httrack',
      args: ['--mock-httrack', url, outputDir]
    };
  }
}

// Track command executions for testing
let executedCommands = [];

// Mock scraper that tracks command execution
class TestScraper extends Scraper {
  async executeCommand(commandSpec) {
    executedCommands.push(commandSpec);
    return { success: true };
  }

  async handleExtraFiles(extraFiles, outputDir, config) {
    // Mock implementation - don't actually download files
    return { extraFilesProcessed: extraFiles.length };
  }

  async runPostProcessing(config) {
    // Mock implementation - don't actually do domain replacement
    return { postProcessingRun: true };
  }

  resolveOutputDir(outputPath) {
    return `/resolved/${outputPath}`;
  }

  async scrape(url, options, config) {
    const finalOptions = this.buildFinalOptions(options, config);
    const outputDir = this.resolveOutputDir(finalOptions.output);

    // Mock the scraping execution without actually creating directories
    if (finalOptions.method === 'httrack') {
      await this.executeHttrack(url, outputDir, finalOptions, config);
    } else if (finalOptions.method === 'wget') {
      await this.executeWget(url, outputDir, finalOptions, config);
    } else {
      throw new Error(`Unknown scraping method: ${finalOptions.method}`);
    }

    // Mock extra files and post-processing
    const extraFiles = config.scrape.extraFiles || [];
    if (extraFiles.length) {
      await this.handleExtraFiles(extraFiles, outputDir, config);
    }

    await this.runPostProcessing(config);

    return { outputDir, finalOptions };
  }
}

test('Scraper - constructor with default builders', () => {
  const scraper = new Scraper();
  
  assert.ok(scraper.builders.wget);
  assert.ok(scraper.builders.httrack);
});

test('Scraper - constructor with custom builders', () => {
  const customBuilders = {
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  };
  
  const scraper = new Scraper(customBuilders);
  
  assert.strictEqual(scraper.builders.wget, MockWgetCommandBuilder);
  assert.strictEqual(scraper.builders.httrack, MockHttrackCommandBuilder);
});

test('Scraper - buildFinalOptions for wget', () => {
  const scraper = new Scraper();
  
  const options = {
    output: '/custom/output',
    depth: 5,
    method: 'wget',
    userAgent: 'CustomAgent'
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 2,
      method: 'httrack',
      userAgent: 'DefaultAgent',
      wget: { mirror: true }
    }
  };
  
  const finalOptions = scraper.buildFinalOptions(options, config);
  
  assert.strictEqual(finalOptions.output, '/custom/output');
  assert.strictEqual(finalOptions.depth, 5);
  assert.strictEqual(finalOptions.method, 'wget');
  assert.strictEqual(finalOptions.userAgent, 'CustomAgent');
  assert.ok(finalOptions.wget);
  assert.strictEqual(finalOptions.wget.mirror, true);
});

test('Scraper - buildFinalOptions for httrack', () => {
  const scraper = new Scraper();
  
  const options = {
    method: 'httrack',
    include: ['*.html'],
    exclude: ['*.pdf']
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 3,
      method: 'wget',
      userAgent: 'DefaultAgent',
      httrack: { mirror: true, include: ['*.css'] }
    }
  };
  
  const finalOptions = scraper.buildFinalOptions(options, config);
  
  assert.strictEqual(finalOptions.method, 'httrack');
  assert.strictEqual(finalOptions.depth, 3);
  assert.ok(finalOptions.httrack);
  assert.ok(Array.isArray(finalOptions.includeFilters));
  assert.ok(finalOptions.includeFilters.includes('*.css'));
  assert.ok(finalOptions.includeFilters.includes('*.html'));
  assert.ok(Array.isArray(finalOptions.excludeFilters));
  assert.ok(finalOptions.excludeFilters.includes('*.pdf'));
});

test('Scraper - executeWget calls correct builder', async () => {
  executedCommands = [];
  
  const scraper = new TestScraper({
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  });
  
  const finalOptions = {
    method: 'wget',
    wget: { mirror: true }
  };
  
  const config = {
    scrape: { timeout: 30 }
  };
  
  await scraper.executeWget('https://example.com', '/output', finalOptions, config);
  
  assert.strictEqual(executedCommands.length, 1);
  assert.strictEqual(executedCommands[0].command, 'wget');
  assert.ok(executedCommands[0].args.includes('--mock-wget'));
  assert.ok(executedCommands[0].args.includes('https://example.com'));
  assert.ok(executedCommands[0].args.includes('/output'));
});

test('Scraper - executeHttrack calls correct builder', async () => {
  executedCommands = [];
  
  const scraper = new TestScraper({
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  });
  
  const finalOptions = {
    method: 'httrack',
    httrack: { mirror: true }
  };
  
  const config = {
    scrape: { timeout: 30 }
  };
  
  await scraper.executeHttrack('https://example.com', '/output', finalOptions, config);
  
  assert.strictEqual(executedCommands.length, 1);
  assert.strictEqual(executedCommands[0].command, 'httrack');
  assert.ok(executedCommands[0].args.includes('--mock-httrack'));
  assert.ok(executedCommands[0].args.includes('https://example.com'));
  assert.ok(executedCommands[0].args.includes('/output'));
});

test('Scraper - scrape method with wget', async () => {
  executedCommands = [];
  
  const scraper = new TestScraper({
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  });
  
  const options = {
    output: 'custom/output',
    method: 'wget'
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 2,
      method: 'httrack',
      extraFiles: []
    }
  };
  
  const result = await scraper.scrape('https://test.com', options, config);
  
  assert.strictEqual(executedCommands.length, 1);
  assert.strictEqual(executedCommands[0].command, 'wget');
  assert.strictEqual(result.outputDir, '/resolved/custom/output');
  assert.ok(result.finalOptions);
});

test('Scraper - scrape method with httrack', async () => {
  executedCommands = [];
  
  const scraper = new TestScraper({
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  });
  
  const options = {
    output: 'custom/output',
    method: 'httrack'
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 2,
      method: 'wget',
      extraFiles: []
    }
  };
  
  const result = await scraper.scrape('https://test.com', options, config);
  
  assert.strictEqual(executedCommands.length, 1);
  assert.strictEqual(executedCommands[0].command, 'httrack');
  assert.strictEqual(result.outputDir, '/resolved/custom/output');
});

test('Scraper - scrape method with extra files', async () => {
  executedCommands = [];
  
  const scraper = new TestScraper({
    wget: MockWgetCommandBuilder,
    httrack: MockHttrackCommandBuilder
  });
  
  const options = {
    method: 'wget'
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 2,
      method: 'wget',
      extraFiles: [
        { url: 'https://cdn.example.com/file1.css' },
        { url: 'https://cdn.example.com/file2.js' }
      ]
    }
  };
  
  const result = await scraper.scrape('https://test.com', options, config);
  
  // Should execute main scraping command
  assert.strictEqual(executedCommands.length, 1);
  assert.strictEqual(executedCommands[0].command, 'wget');
});

test('Scraper - scrape method throws error for unknown method', async () => {
  const scraper = new TestScraper();
  
  const options = {
    method: 'unknown-method'
  };
  
  const config = {
    paths: { scraped: '/default/scraped' },
    scrape: {
      depth: 2,
      extraFiles: []
    }
  };
  
  await assert.rejects(
    async () => {
      await scraper.scrape('https://test.com', options, config);
    },
    {
      message: /Unknown scraping method: unknown-method/
    }
  );
});

test('Scraper - buildWgetOptions merges CLI and config', () => {
  const scraper = new Scraper();
  
  const options = {
    mirror: true,
    noClobber: true,
    execute: ['robots=off'],
    proxy: 'http://cli-proxy:8080'
  };
  
  const config = {
    scrape: {
      proxy: 'http://config-proxy:8080',
      wget: {
        recursive: true,
        convertLinks: true,
        execute: ['user_agent=Mozilla'],
        noClobber: false,
        wait: '1s'
      }
    }
  };
  
  const result = scraper.buildWgetOptions(options, config);
  
  // CLI options should take precedence
  assert.strictEqual(result.mirror, true);
  assert.strictEqual(result.noClobber, true);
  assert.strictEqual(result.proxy, 'http://cli-proxy:8080');
  assert.deepStrictEqual(result.execute, ['robots=off']);
  
  // Config options should be included when not overridden
  assert.strictEqual(result.recursive, true);
  assert.strictEqual(result.convertLinks, true);
  assert.strictEqual(result.wait, '1s');
});

test('Scraper - buildHttrackOptions merges filters correctly', () => {
  const scraper = new Scraper();
  
  const options = {
    include: ['*.html', '*.css'],
    exclude: ['*.pdf'],
    proxy: 'http://cli-proxy:3128'
  };
  
  const config = {
    scrape: {
      userAgent: 'ConfigAgent',
      proxy: 'http://config-proxy:3128',
      httrack: {
        include: ['*.js'],
        exclude: ['*.exe', '*.zip']
      }
    }
  };
  
  const result = scraper.buildHttrackOptions(options, config);
  
  // Should merge include filters
  assert.ok(result.includeFilters.includes('*.js'));
  assert.ok(result.includeFilters.includes('*.html'));
  assert.ok(result.includeFilters.includes('*.css'));
  
  // Should merge exclude filters
  assert.ok(result.excludeFilters.includes('*.exe'));
  assert.ok(result.excludeFilters.includes('*.zip'));
  assert.ok(result.excludeFilters.includes('*.pdf'));
  
  // CLI proxy should take precedence
  assert.strictEqual(result.proxy, 'http://cli-proxy:3128');
});

test('Scraper - resolveOutputDir returns correct path', () => {
  const scraper = new Scraper();
  
  const result = scraper.resolveOutputDir('relative/path', {});
  
  // Should return the resolved path (actual implementation uses resolvePath)
  // The real resolvePath function returns an absolute path
  assert.ok(result.startsWith('/'));
  assert.ok(result.includes('relative/path'));
});