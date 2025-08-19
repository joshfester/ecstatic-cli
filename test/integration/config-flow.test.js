import { test } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadEcstaticConfig, clearConfig } from '../../src/utils/config.js';
import { HttrackCommandBuilder } from '../../src/scrapers/HttrackCommandBuilder.js';

test('config flow - sockets and connections_per_second flow from defaults to httrack command', async () => {
  // Create a temporary directory with no config file (pure defaults)
  const tempDir = path.join(process.cwd(), 'temp-test-flow-defaults');
  await fs.mkdir(tempDir, { recursive: true });

  const originalCwd = process.cwd();
  try {
    process.chdir(tempDir);
    clearConfig(); // Clear any cached config

    const config = await loadEcstaticConfig();

    // Verify config has default values
    assert.strictEqual(config.scrape.httrack.sockets, 1);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);

    // Build httrack command with the config
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://example.com', '/tmp/test', mergedConfig);

    // Verify the command includes the correct arguments
    assert.ok(result.args.includes('--sockets=1'));
    assert.ok(result.args.includes('-%c1'));
    assert.strictEqual(result.command, 'httrack');
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('config flow - partial user config preserves default sockets and connections_per_second', async () => {
  // Create a temporary directory with partial config
  const tempDir = path.join(process.cwd(), 'temp-test-flow-partial');
  await fs.mkdir(tempDir, { recursive: true });

  const configContent = `export default {
    scrape: {
      httrack: {
        debugLog: true,
        near: false
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

    // Verify user overrides are applied
    assert.strictEqual(config.scrape.httrack.debugLog, true);
    assert.strictEqual(config.scrape.httrack.near, false);

    // Verify defaults are preserved
    assert.strictEqual(config.scrape.httrack.sockets, 1);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);

    // Build httrack command with the merged config
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://test.com', '/tmp/test', mergedConfig);

    // Verify the command includes both user settings and preserved defaults
    assert.ok(result.args.includes('--debug-log'));
    assert.ok(!result.args.includes('--near'));
    assert.ok(result.args.includes('--sockets=1'));
    assert.ok(result.args.includes('-%c1'));
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('config flow - user overrides for sockets and connections_per_second work correctly', async () => {
  // Create a temporary directory with override config
  const tempDir = path.join(process.cwd(), 'temp-test-flow-override');
  await fs.mkdir(tempDir, { recursive: true });

  const configContent = `export default {
    scrape: {
      httrack: {
        sockets: 8,
        connections_per_second: 5,
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

    // Verify user overrides are applied
    assert.strictEqual(config.scrape.httrack.sockets, 8);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 5);
    assert.strictEqual(config.scrape.httrack.debugLog, true);

    // Verify non-overridden defaults are preserved
    assert.strictEqual(config.scrape.httrack.near, true);
    assert.strictEqual(config.scrape.httrack.extDepth, 0);

    // Build httrack command with the merged config
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://custom.com', '/tmp/test', mergedConfig);

    // Verify the command includes the user-specified values
    assert.ok(result.args.includes('--sockets=8'));
    assert.ok(result.args.includes('-%c5'));
    assert.ok(result.args.includes('--debug-log'));
    assert.ok(result.args.includes('--near'));
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('config flow - deep nested config maintains proper structure', async () => {
  // Create a temporary directory with deep nested config
  const tempDir = path.join(process.cwd(), 'temp-test-flow-deep');
  await fs.mkdir(tempDir, { recursive: true });

  const configContent = `export default {
    scrape: {
      depth: 4,
      httrack: {
        sockets: 6
      },
      wget: {
        mirror: true,
        wait: 2
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

    // Verify deep overrides work
    assert.strictEqual(config.scrape.depth, 4);
    assert.strictEqual(config.scrape.httrack.sockets, 6);
    assert.strictEqual(config.scrape.wget.mirror, true);
    assert.strictEqual(config.scrape.wget.wait, 2);
    assert.strictEqual(config.paths.scraped, './custom-scraped');

    // Verify defaults are preserved in each nested object
    assert.strictEqual(config.scrape.httrack.connections_per_second, 1);
    assert.strictEqual(config.scrape.httrack.debugLog, false);
    assert.strictEqual(config.scrape.wget.recursive, false);
    assert.strictEqual(config.scrape.wget.noClobber, false);

    // Build httrack command with the merged config
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://deep.test', '/tmp/test', mergedConfig);

    // Verify the command reflects the complete merged configuration
    assert.ok(result.args.includes('--depth=4'));
    assert.ok(result.args.includes('--sockets=6'));
    assert.ok(result.args.includes('-%c1')); // Default connections_per_second preserved
    assert.ok(!result.args.includes('--debug-log')); // Default debugLog preserved
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('config flow - httrack command never gets undefined values', async () => {
  // Create a temporary directory with minimal config
  const tempDir = path.join(process.cwd(), 'temp-test-flow-minimal');
  await fs.mkdir(tempDir, { recursive: true });

  const configContent = `export default {
    scrape: {
      httrack: {
        // Only set one value, everything else should come from defaults
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

    // Build httrack command with the merged config
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://minimal.test', '/tmp/test', mergedConfig);

    // Verify no arguments contain 'undefined'
    const hasUndefined = result.args.some(arg =>
      typeof arg === 'string' && arg.includes('undefined')
    );
    assert.strictEqual(hasUndefined, false, 'Command should not contain undefined values');

    // Verify expected arguments are present with proper values
    assert.ok(result.args.includes('--sockets=1'));
    assert.ok(result.args.includes('-%c1'));
    assert.ok(result.args.includes('--mirror'));

    // Verify structure
    assert.strictEqual(result.command, 'httrack');
    assert.ok(Array.isArray(result.args));
    assert.ok(result.args.includes('https://minimal.test'));
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});

test('config flow - configuration isolation between tests', async () => {
  // This test ensures that config loading doesn't affect other tests
  const tempDir = path.join(process.cwd(), 'temp-test-flow-isolation');
  await fs.mkdir(tempDir, { recursive: true });

  const configContent = `export default {
    scrape: {
      httrack: {
        sockets: 99,
        connections_per_second: 88
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

    // Verify this test's config
    assert.strictEqual(config.scrape.httrack.sockets, 99);
    assert.strictEqual(config.scrape.httrack.connections_per_second, 88);

    // Build command and verify
    const mergedConfig = {
      ...config.scrape,
      httrack: config.scrape.httrack
    };

    const result = HttrackCommandBuilder.build('https://isolation.test', '/tmp/test', mergedConfig);
    assert.ok(result.args.includes('--sockets=99'));
    assert.ok(result.args.includes('-%c88'));
  } finally {
    process.chdir(originalCwd);
    await fs.rm(tempDir, { recursive: true });
  }
});