import { defaults } from './config-defaults.js';
import deepmerge from 'deepmerge';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

let _config = null;

// Find the project root by looking for ecstatic.config.js file
function findProjectRoot() {
  // Start from the current working directory
  let currentDir = process.cwd();
  
  // Check if we're already in a directory that has ecstatic.config.js
  while (currentDir !== path.dirname(currentDir)) { // Stop at filesystem root
    const configPath = path.join(currentDir, 'ecstatic.config.js');
    try {
      // Try to access the file to see if it exists
      if (fs.existsSync(configPath)) {
        return currentDir;
      }
    } catch (error) {
      // Continue searching
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback: use current working directory
  return process.cwd();
}

// Load configuration with simple custom loader
export async function loadEcstaticConfig() {
  if (_config) return _config;

  const projectRoot = findProjectRoot();
  const configPath = path.join(projectRoot, 'ecstatic.config.js');
  let userConfig = {};

  try {
    const module = await import(configPath);
    userConfig = module.default || {};
  } catch (error) {
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
