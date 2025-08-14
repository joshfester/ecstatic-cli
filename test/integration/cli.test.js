import { test } from 'node:test';
import { spawn } from 'node:child_process';
import assert from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from '../../package.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, '../../bin/ecstatic');

function runCLI(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

test('CLI shows help when run without arguments', async () => {
  const result = await runCLI();

  // Commander.js exits with 1 when no command is provided but shows help
  assert.strictEqual(result.code, 1);
  assert.match(result.stderr, /Usage:/);
  assert.match(result.stderr, /ecstatic/);
});

test('CLI shows version with --version flag', async () => {
  const result = await runCLI(['--version']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, new RegExp(packageJson.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('CLI shows help with --help flag', async () => {
  const result = await runCLI(['--help']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /Commands:/);
  assert.match(result.stdout, /scrape/);
  assert.match(result.stdout, /optimize/);
  assert.match(result.stdout, /deploy/);
});

test('CLI shows error for invalid command', async () => {
  const result = await runCLI(['invalid-command']);

  assert.notStrictEqual(result.code, 0);
  assert.match(result.stderr, /error: unknown command 'invalid-command'/);
});

test('CLI shows help for scrape command', async () => {
  const result = await runCLI(['scrape', '--help']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /scrape/);
  assert.match(result.stdout, /Download website as static files/);
});

test('CLI shows exclude-directories option in scrape help', async () => {
  const result = await runCLI(['scrape', '--help']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /--exclude-directories <list>/);
  assert.match(result.stdout, /Comma-separated list of directories to exclude/);
});

test('CLI shows help for optimize command', async () => {
  const result = await runCLI(['optimize', '--help']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /optimize/);
  assert.match(result.stdout, /Optimize HTML and assets/);
});

test('CLI shows help for deploy command', async () => {
  const result = await runCLI(['deploy', '--help']);

  assert.strictEqual(result.code, 0);
  assert.match(result.stdout, /Usage:/);
  assert.match(result.stdout, /deploy/);
});