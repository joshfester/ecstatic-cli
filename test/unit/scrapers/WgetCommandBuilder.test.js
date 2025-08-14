import { test } from 'node:test';
import assert from 'node:assert';
import { WgetCommandBuilder } from '../../../src/scrapers/WgetCommandBuilder.js';

test('WgetCommandBuilder - basic command generation', () => {
  const config = {
    timeout: 10,
    depth: 2,
    wget: {}
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.strictEqual(result.command, 'wget');
  assert.ok(Array.isArray(result.args));
  assert.ok(result.args.includes('--domains'));
  assert.ok(result.args.includes('example.com'));
  assert.ok(result.args.includes('--timeout=10'));
  assert.ok(result.args.includes('--directory-prefix=/tmp/output'));
  assert.ok(result.args.includes('https://example.com'));
});

test('WgetCommandBuilder - mirror mode', () => {
  const config = {
    timeout: 10,
    wget: { mirror: true }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--mirror'));
  assert.ok(!result.args.includes('--recursive'));
  assert.ok(!result.args.includes('--level=2'));
});

test('WgetCommandBuilder - recursive mode', () => {
  const config = {
    timeout: 10,
    depth: 3,
    wget: { recursive: true }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(!result.args.includes('--mirror'));
  assert.ok(result.args.includes('--recursive'));
  assert.ok(result.args.includes('--level=3'));
});

test('WgetCommandBuilder - user agent', () => {
  const config = {
    timeout: 10,
    userAgent: 'CustomBot/1.0',
    wget: {}
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes("--user-agent='CustomBot/1.0'"));
});

test('WgetCommandBuilder - boolean flags', () => {
  const config = {
    timeout: 10,
    wget: {
      noClobber: true,
      noHostDirectories: true,
      adjustExtension: true,
      convertLinks: true,
      pageRequisites: true,
      noParent: true
    }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--no-clobber'));
  assert.ok(result.args.includes('--no-host-directories'));
  assert.ok(result.args.includes('--adjust-extension'));
  assert.ok(result.args.includes('--convert-links'));
  assert.ok(result.args.includes('--page-requisites'));
  assert.ok(result.args.includes('--no-parent'));
});

test('WgetCommandBuilder - exclude directories and reject patterns', () => {
  const config = {
    timeout: 10,
    wget: {
      excludeDirectories: 'admin,private',
      reject: ['*.exe', '*.zip']
    }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--exclude-directories=admin,private'));
  assert.ok(result.args.includes('--reject=*.exe,*.zip'));
});

test('WgetCommandBuilder - wait interval', () => {
  const config = {
    timeout: 10,
    wget: { wait: '1s' }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--wait=1s'));
});

test('WgetCommandBuilder - execute directives', () => {
  const config = {
    timeout: 10,
    wget: {
      execute: ['robots=off', 'user_agent=Mozilla/5.0']
    }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--execute'));
  assert.ok(result.args.includes('robots=off'));
  assert.ok(result.args.includes('user_agent=Mozilla/5.0'));
});

test('WgetCommandBuilder - restrict file names', () => {
  const config = {
    timeout: 10,
    wget: { restrictFileNames: 'windows' }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--restrict-file-names=windows'));
});

test('WgetCommandBuilder - proxy configuration http', () => {
  const config = {
    timeout: 10,
    wget: { proxy: 'http://proxy.example.com:8080' }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--execute'));
  assert.ok(result.args.includes('http_proxy=http://proxy.example.com:8080'));
});

test('WgetCommandBuilder - proxy configuration https', () => {
  const config = {
    timeout: 10,
    wget: { proxy: 'https://secure-proxy.example.com:8443' }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--execute'));
  assert.ok(result.args.includes('https_proxy=https://secure-proxy.example.com:8443'));
});

test('WgetCommandBuilder - proxy configuration without protocol', () => {
  const config = {
    timeout: 10,
    wget: { proxy: 'proxy.example.com:8080' }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--execute'));
  assert.ok(result.args.includes('http_proxy=http://proxy.example.com:8080'));
  assert.ok(result.args.includes('https_proxy=https://proxy.example.com:8080'));
});

test('WgetCommandBuilder - no proxy flag', () => {
  const config = {
    timeout: 10,
    wget: { noProxy: true }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--no-proxy'));
  assert.ok(!result.args.some(arg => arg.includes('proxy=')));
});

test('WgetCommandBuilder - proxy disabled overrides proxy setting', () => {
  const config = {
    timeout: 10,
    wget: { 
      proxy: 'http://proxy.example.com:8080',
      noProxy: true 
    }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(result.args.includes('--no-proxy'));
  assert.ok(!result.args.some(arg => arg.includes('proxy=')));
});

test('WgetCommandBuilder - complex configuration', () => {
  const config = {
    timeout: 30,
    depth: 5,
    userAgent: 'TestBot/2.0',
    wget: {
      mirror: true,
      convertLinks: true,
      pageRequisites: true,
      adjustExtension: true,
      wait: '2s',
      execute: ['robots=off'],
      excludeDirectories: 'tmp,cache',
      reject: ['*.pdf', '*.doc'],
      restrictFileNames: 'unix'
    }
  };
  
  const result = WgetCommandBuilder.build('https://test.example.com/path', '/output/dir', config);
  
  // Verify all expected arguments are present
  assert.ok(result.args.includes('--domains'));
  assert.ok(result.args.includes('test.example.com'));
  assert.ok(result.args.includes('--timeout=30'));
  assert.ok(result.args.includes('--directory-prefix=/output/dir'));
  assert.ok(result.args.includes("--user-agent='TestBot/2.0'"));
  assert.ok(result.args.includes('--mirror'));
  assert.ok(result.args.includes('--convert-links'));
  assert.ok(result.args.includes('--page-requisites'));
  assert.ok(result.args.includes('--adjust-extension'));
  assert.ok(result.args.includes('--wait=2s'));
  assert.ok(result.args.includes('--execute'));
  assert.ok(result.args.includes('robots=off'));
  assert.ok(result.args.includes('--exclude-directories=tmp,cache'));
  assert.ok(result.args.includes('--reject=*.pdf,*.doc'));
  assert.ok(result.args.includes('--restrict-file-names=unix'));
  assert.ok(result.args.includes('https://test.example.com/path'));
  
  // Verify command structure
  assert.strictEqual(result.command, 'wget');
  assert.strictEqual(result.args[result.args.length - 1], 'https://test.example.com/path');
});

test('WgetCommandBuilder - empty reject array ignored', () => {
  const config = {
    timeout: 10,
    wget: { reject: [] }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  assert.ok(!result.args.some(arg => arg.startsWith('--reject=')));
});

test('WgetCommandBuilder - empty execute array ignored', () => {
  const config = {
    timeout: 10,
    wget: { execute: [] }
  };
  
  const result = WgetCommandBuilder.build('https://example.com', '/tmp/output', config);
  
  // Should not have any --execute flags
  const executeCount = result.args.filter(arg => arg === '--execute').length;
  assert.strictEqual(executeCount, 0);
});