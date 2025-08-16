import { defaults } from './config-defaults.js';
import deepmerge from 'deepmerge';
import path from 'path';

let _config = null;

// Load configuration with simple custom loader
export async function loadEcstaticConfig() {
  if (_config) return _config;

  const configPath = path.join(process.cwd(), 'ecstatic.config.js');
  let userConfig = {};

  try {
    const module = await import(configPath);
    userConfig = module.default || {};
  } catch {
    // No config file found - use defaults only
  }

  _config = deepmerge(defaults, userConfig);
  return _config;
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

// Clear cached config (for testing)
export function clearConfig() {
  _config = null;
}
