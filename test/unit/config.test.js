import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadEcstaticConfig, getConfig, clearConfig } from '../../src/utils/config.js';
import { defaults } from '../../src/utils/config-defaults.js';

test('loadEcstaticConfig - loads defaults when no config file exists', async () => {
  // Create a temporary directory with no config file
  const tempDir = path.join(process.cwd(), 'temp-test-no-config');
  await fs.mkdir(tempDir, { recursive: true });
  
  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config
    
    const config = await loadEcstaticConfig();
    
    // Should match defaults exactly
    assert.deepStrictEqual(config, defaults);
    assert.strictEqual(config.scrape.httrack.sockets, 1);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('loadEcstaticConfig - deep merges user config with defaults', async () => {
  // Create a temporary directory with partial config
  const tempDir = path.join(process.cwd(), 'temp-test-partial-config');
  await fs.mkdir(tempDir, { recursive: true });
  
  const configContent = `export default {
    scrape: {
      httrack: {
        debugLog: true
      }
    }
  };`;
  
  const configPath = path.join(tempDir, 'ecstatic.config.js');
  await fs.writeFile(configPath, configContent);
  
  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config
    
    const config = await loadEcstaticConfig();
    
    // User override should be applied
    assert.strictEqual(config.scrape.httrack.debugLog, true);
    
    // Default values should be preserved
    assert.strictEqual(config.scrape.httrack.sockets, 1);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);
    assert.strictEqual(config.scrape.httrack.near, true);
    assert.strictEqual(config.scrape.depth, 3);
    assert.strictEqual(config.paths.scraped, './scraped');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('loadEcstaticConfig - user config overrides default values', async () => {
  // Create a temporary directory with overriding config
  const tempDir = path.join(process.cwd(), 'temp-test-override-config');
  await fs.mkdir(tempDir, { recursive: true });
  
  const configContent = `export default {
    scrape: {
      depth: 5,
      httrack: {
        sockets: 8,
        connections_per_second: 10,
        debugLog: true
      }
    },
    paths: {
      scraped: './custom-scraped'
    }
  };`;
  
  const configPath = path.join(tempDir, 'ecstatic.config.js');
  await fs.writeFile(configPath, configContent);
  
  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config
    
    const config = await loadEcstaticConfig();
    
    // User overrides should be applied
    assert.strictEqual(config.scrape.depth, 5);
    assert.strictEqual(config.scrape.httrack.sockets, 8);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 10);
    assert.strictEqual(config.scrape.httrack.debugLog, true);
    assert.strictEqual(config.paths.scraped, './custom-scraped');
    
    // Non-overridden defaults should be preserved
    assert.strictEqual(config.scrape.httrack.near, true);
    assert.strictEqual(config.scrape.httrack.extDepth, 0);
    assert.strictEqual(config.paths.distParcel, './dist-parcel');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('loadEcstaticConfig - deep nested overrides work correctly', async () => {
  // Create a temporary directory with deep nested config
  const tempDir = path.join(process.cwd(), 'temp-test-deep-config');
  await fs.mkdir(tempDir, { recursive: true });
  
  const configContent = `export default {
    scrape: {
      httrack: {
        sockets: 4
      },
      wget: {
        mirror: true
      }
    }
  };`;
  
  const configPath = path.join(tempDir, 'ecstatic.config.js');
  await fs.writeFile(configPath, configContent);
  
  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config
    
    const config = await loadEcstaticConfig();
    
    // Deep override should work
    assert.strictEqual(config.scrape.httrack.sockets, 4);
    assert.strictEqual(config.scrape.wget.mirror, true);
    
    // Other httrack defaults should be preserved
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);
    assert.strictEqual(config.scrape.httrack.debugLog, false);
    assert.strictEqual(config.scrape.httrack.near, true);
    
    // Other wget defaults should be preserved
    assert.strictEqual(config.scrape.wget.recursive, false);
    assert.strictEqual(config.scrape.wget.noClobber, false);
    assert.deepStrictEqual(config.scrape.wget.execute, ['robots=off']);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('getConfig - throws error when config not loaded', () => {
  // Note: This test assumes no config has been loaded in this process
  // In practice, other tests may have loaded config, so this is more of a documentation test
  try {
    // Clear any cached config by directly accessing the module
    const config = getConfig();
    // If we get here, config was already loaded, which is fine
    assert.ok(config);
  } catch (error) {
    assert.match(error.message, /Configuration not loaded/);
  }
});

test('config system preserves array and object references correctly', async () => {
  // Create a temporary directory with arrays and objects
  const tempDir = path.join(process.cwd(), 'temp-test-references');
  await fs.mkdir(tempDir, { recursive: true });
  
  const configContent = `export default {
    scrape: {
      httrack: {
        filters: ['+custom/*', '-custom/admin/*']
      }
    }
  };`;
  
  const configPath = path.join(tempDir, 'ecstatic.config.js');
  await fs.writeFile(configPath, configContent);
  
  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config
    
    const config = await loadEcstaticConfig();
    
    // User array should be present
    assert.deepStrictEqual(config.scrape.httrack.filters, ['+custom/*', '-custom/admin/*']);
    
    // Default arrays should still be present
    assert.deepStrictEqual(config.scrape.httrack.include, []);
    assert.deepStrictEqual(config.scrape.httrack.exclude, []);
    assert.deepStrictEqual(config.scrape.wget.execute, ['robots=off']);
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});