import { test } from 'node:test';
import assert from 'node:assert';
import { HttrackCommandBuilder } from '../../../src/scrapers/HttrackCommandBuilder.js';

test('HttrackCommandBuilder - basic command generation', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      extDepth: 2,
      sockets: 16
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.strictEqual(result.command, 'httrack');
  assert.ok(Array.isArray(result.args));
  assert.ok(result.args.includes('https://example.com'));
  assert.ok(result.args.includes('-O'));
  assert.ok(result.args.includes('/tmp/output'));
  assert.ok(result.args.includes('--depth=2'));
  assert.ok(result.args.includes('--ext-depth=2'));
  assert.ok(result.args.includes('--sockets=16'));
  assert.ok(result.args.includes('--timeout=10'));
  assert.ok(result.args.includes('-a'));
});

test('HttrackCommandBuilder - custom ext-depth and sockets', () => {
  const config = {
    timeout: 10,
    depth: 3,
    httrack: {
      extDepth: 5,
      sockets: 8
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('--depth=3'));
  assert.ok(result.args.includes('--ext-depth=5'));
  assert.ok(result.args.includes('--sockets=8'));
});

test('HttrackCommandBuilder - boolean flags', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      debugLog: true,
      near: true,
      updatehack: true,
      mirror: true
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('--debug-log'));
  assert.ok(result.args.includes('--near'));
  assert.ok(result.args.includes('--updatehack'));
  assert.ok(result.args.includes('--mirror'));
});

test('HttrackCommandBuilder - directory traversal options', () => {
  // Test 'up' option
  let config = {
    timeout: 10,
    depth: 2,
    httrack: { dir_up_down: 'up' }
  };

  let result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);
  assert.ok(result.args.includes('-U'));
  assert.ok(!result.args.includes('-D'));
  assert.ok(!result.args.includes('-B'));

  // Test 'down' option
  config = {
    timeout: 10,
    depth: 2,
    httrack: { dir_up_down: 'down' }
  };

  result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);
  assert.ok(!result.args.includes('-U'));
  assert.ok(result.args.includes('-D'));
  assert.ok(!result.args.includes('-B'));

  // Test 'both' option
  config = {
    timeout: 10,
    depth: 2,
    httrack: { dir_up_down: 'both' }
  };

  result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);
  assert.ok(!result.args.includes('-U'));
  assert.ok(!result.args.includes('-D'));
  assert.ok(result.args.includes('-B'));
});

test('HttrackCommandBuilder - user agent', () => {
  const config = {
    timeout: 10,
    depth: 2,
    userAgent: 'CustomHttrackBot/1.0',
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes("--user-agent='CustomHttrackBot/1.0'"));
});

test('HttrackCommandBuilder - keep links and robots settings', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      keepLinks: 1,
      robots: 2
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('--keep-links=1'));
  assert.ok(result.args.includes('--robots=2'));
});

test('HttrackCommandBuilder - connections per second', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      connections_per_second: 5
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('-%c5'));
});

test('HttrackCommandBuilder - proxy configuration', () => {
  const config = {
    timeout: 10,
    depth: 2,
    proxy: 'http://proxy.example.com:8080',
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('-P proxy.example.com:8080'));
});

test('HttrackCommandBuilder - proxy with https protocol removed', () => {
  const config = {
    timeout: 10,
    depth: 2,
    proxy: 'https://secure-proxy.example.com:8443',
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('-P secure-proxy.example.com:8443'));
});

test('HttrackCommandBuilder - proxy with credentials', () => {
  const config = {
    timeout: 10,
    depth: 2,
    proxy: 'http://user:pass@proxy.example.com:8080',
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('-P user:pass@proxy.example.com:8080'));
});

test('HttrackCommandBuilder - no proxy flag disables proxy', () => {
  const config = {
    timeout: 10,
    depth: 2,
    proxy: 'http://proxy.example.com:8080',
    noProxy: true,
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(!result.args.some(arg => arg.startsWith('-P')));
});

test('HttrackCommandBuilder - config filters with domain placeholders', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      filters: [
        '+{domain}/*',
        '-{domain}/admin/*',
        '+*.css',
        '-*.exe'
      ]
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com/path', '/tmp/output', config);

  assert.ok(result.args.includes('+example.com/*'));
  assert.ok(result.args.includes('-example.com/admin/*'));
  assert.ok(result.args.includes('+*.css'));
  assert.ok(result.args.includes('-*.exe'));
});

test('HttrackCommandBuilder - CLI include and exclude filters', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: ['*.html', '*.css'],
    excludeFilters: ['*.exe', '*.zip'],
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('+*.html'));
  assert.ok(result.args.includes('+*.css'));
  assert.ok(result.args.includes('-*.exe'));
  assert.ok(result.args.includes('-*.zip'));
});

test('HttrackCommandBuilder - CLI filters with existing prefixes', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: ['+*.html', '*.css'],  // One with prefix, one without
    excludeFilters: ['-*.exe', '*.zip'],   // One with prefix, one without
    httrack: {}
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  assert.ok(result.args.includes('+*.html'));  // Keeps existing prefix
  assert.ok(result.args.includes('+*.css'));   // Adds prefix
  assert.ok(result.args.includes('-*.exe'));   // Keeps existing prefix
  assert.ok(result.args.includes('-*.zip'));   // Adds prefix
});

test('HttrackCommandBuilder - CLI filters override config filters completely', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: ['*.js'],
    excludeFilters: ['*.tmp'],
    httrack: {
      filters: ['+{domain}/*', '-{domain}/private/*']
    }
  };

  const result = HttrackCommandBuilder.build('https://test.com', '/tmp/output', config);

  // Domain-specific filters should be present
  assert.ok(result.args.includes('-*'));
  assert.ok(result.args.includes('+https://test.com/*'));

  // CLI filters should be present
  const cliInclude = result.args.indexOf('+*.js');
  const cliExclude = result.args.indexOf('-*.tmp');
  assert.ok(cliInclude !== -1);
  assert.ok(cliExclude !== -1);

  // Config filters should NOT be present (overridden by CLI)
  const configStart = result.args.indexOf('+test.com/*');
  const configPrivate = result.args.indexOf('-test.com/private/*');
  assert.strictEqual(configStart, -1);
  assert.strictEqual(configPrivate, -1);
});

test('HttrackCommandBuilder - complex configuration', () => {
  const config = {
    timeout: 30,
    depth: 4,
    userAgent: 'TestHttrackBot/2.0',
    proxy: 'http://proxy.test.com:3128',
    includeFilters: ['*.html', '*.css', '*.js'],
    excludeFilters: ['*.pdf', '*.exe'],
    httrack: {
      extDepth: 6,
      sockets: 12,
      debugLog: true,
      near: true,
      dir_up_down: 'both',
      keepLinks: 1,
      robots: 0,
      connections_per_second: 3,
      updatehack: true,
      mirror: true,
      filters: [
        '+{domain}/*',
        '-{domain}/admin/*',
        '-{domain}/private/*'
      ]
    }
  };

  const result = HttrackCommandBuilder.build('https://complex.example.com/app', '/output/complex', config);

  // Verify all expected arguments are present
  assert.strictEqual(result.command, 'httrack');
  assert.ok(result.args.includes('https://complex.example.com/app'));
  assert.ok(result.args.includes('-O'));
  assert.ok(result.args.includes('/output/complex'));
  assert.ok(result.args.includes('--depth=4'));
  assert.ok(result.args.includes('--ext-depth=6'));
  assert.ok(result.args.includes('--sockets=12'));
  assert.ok(result.args.includes('--timeout=30'));
  assert.ok(result.args.includes('--debug-log'));
  assert.ok(result.args.includes('--near'));
  assert.ok(result.args.includes('-a'));
  assert.ok(result.args.includes('-B'));
  assert.ok(result.args.includes("--user-agent='TestHttrackBot/2.0'"));
  assert.ok(result.args.includes('-P proxy.test.com:3128'));
  assert.ok(result.args.includes('--keep-links=1'));
  assert.ok(result.args.includes('--robots=0'));
  assert.ok(result.args.includes('-%c3'));
  assert.ok(result.args.includes('--updatehack'));
  assert.ok(result.args.includes('--mirror'));

  // Domain-specific filters should be present
  assert.ok(result.args.includes('-*'));
  assert.ok(result.args.includes('+https://complex.example.com/*'));

  // Config filters should NOT be present (overridden by CLI filters)
  assert.ok(!result.args.includes('+complex.example.com/*'));
  assert.ok(!result.args.includes('-complex.example.com/admin/*'));
  assert.ok(!result.args.includes('-complex.example.com/private/*'));

  // Verify CLI filters
  assert.ok(result.args.includes('+*.html'));
  assert.ok(result.args.includes('+*.css'));
  assert.ok(result.args.includes('+*.js'));
  assert.ok(result.args.includes('-*.pdf'));
  assert.ok(result.args.includes('-*.exe'));
});

test('HttrackCommandBuilder - minimal configuration', () => {
  const config = {
    timeout: 5,
    depth: 1,
    httrack: {
      extDepth: 1,
      sockets: 16
    }
  };

  const result = HttrackCommandBuilder.build('https://minimal.com', '/tmp/min', config);

  // Should still have required arguments
  assert.strictEqual(result.command, 'httrack');
  assert.ok(result.args.includes('https://minimal.com'));
  assert.ok(result.args.includes('-O'));
  assert.ok(result.args.includes('/tmp/min'));
  assert.ok(result.args.includes('--depth=1'));
  assert.ok(result.args.includes('--ext-depth=1'));
  assert.ok(result.args.includes('--sockets=16'));
  assert.ok(result.args.includes('--timeout=5'));
  assert.ok(result.args.includes('-a'));

  // Should not have optional flags
  assert.ok(!result.args.includes('--debug-log'));
  assert.ok(!result.args.includes('--near'));
  assert.ok(!result.args.includes('--mirror'));
  assert.ok(!result.args.some(arg => arg.startsWith('--user-agent=')));
});

test('HttrackCommandBuilder - empty filters arrays', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: [],
    excludeFilters: [],
    httrack: { filters: [] }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  // Should not have any custom filter arguments (only basic httrack options like -a, -O)
  // Custom filters are the ones that start with + or - followed by a domain or pattern
  const customFilterArgs = result.args.filter(arg =>
    (arg.startsWith('+') || arg.startsWith('-')) &&
    !arg.startsWith('-O') &&
    !arg.startsWith('-a') &&
    !arg.startsWith('-N') &&
    !arg.startsWith('-U') &&
    !arg.startsWith('-D') &&
    !arg.startsWith('-B') &&
    !arg.startsWith('-P') &&
    !arg.startsWith('-%c') &&
    !arg.startsWith('--')
  );
  assert.strictEqual(customFilterArgs.length, 2); // Should have domain-specific filters: "-*" and "+https://example.com/*"
});

test('HttrackCommandBuilder - domain-specific filters always added first', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      filters: ['+{domain}/api/*', '-{domain}/admin/*']
    }
  };

  const result = HttrackCommandBuilder.build('https://test.com', '/tmp/output', config);

  // Domain-specific filters should be first
  assert.strictEqual(result.args[result.args.indexOf('-*')], '-*');
  assert.strictEqual(result.args[result.args.indexOf('+https://test.com/*')], '+https://test.com/*');

  // Domain-specific filters should come before config filters
  const rejectAllIndex = result.args.indexOf('-*');
  const allowDomainIndex = result.args.indexOf('+https://test.com/*');
  const configFilterIndex = result.args.indexOf('+test.com/api/*');

  assert.ok(rejectAllIndex < allowDomainIndex);
  assert.ok(allowDomainIndex < configFilterIndex);
});

test('HttrackCommandBuilder - CLI filters override config filters', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: ['*.js'],
    excludeFilters: ['*.tmp'],
    httrack: {
      filters: ['+{domain}/should-be-ignored/*', '-{domain}/also-ignored/*']
    }
  };

  const result = HttrackCommandBuilder.build('https://test.com', '/tmp/output', config);

  // Should have domain-specific filters
  assert.ok(result.args.includes('-*'));
  assert.ok(result.args.includes('+https://test.com/*'));

  // Should have CLI filters
  assert.ok(result.args.includes('+*.js'));
  assert.ok(result.args.includes('-*.tmp'));

  // Should NOT have config filters
  assert.ok(!result.args.includes('+test.com/should-be-ignored/*'));
  assert.ok(!result.args.includes('-test.com/also-ignored/*'));
});

test('HttrackCommandBuilder - config filters used when no CLI filters', () => {
  const config = {
    timeout: 10,
    depth: 2,
    httrack: {
      filters: ['+{domain}/api/*', '-{domain}/admin/*']
    }
  };

  const result = HttrackCommandBuilder.build('https://example.com', '/tmp/output', config);

  // Should have domain-specific filters
  assert.ok(result.args.includes('-*'));
  assert.ok(result.args.includes('+https://example.com/*'));

  // Should have config filters with domain substitution
  assert.ok(result.args.includes('+example.com/api/*'));
  assert.ok(result.args.includes('-example.com/admin/*'));
});

test('HttrackCommandBuilder - empty CLI filters do not override config', () => {
  const config = {
    timeout: 10,
    depth: 2,
    includeFilters: [],
    excludeFilters: [],
    httrack: {
      filters: ['+{domain}/api/*']
    }
  };

  const result = HttrackCommandBuilder.build('https://test.com', '/tmp/output', config);

  // Should have domain-specific filters
  assert.ok(result.args.includes('-*'));
  assert.ok(result.args.includes('+https://test.com/*'));

  // Should have config filters (empty CLI arrays do not count as "CLI filters provided")
  assert.ok(result.args.includes('+test.com/api/*'));
});