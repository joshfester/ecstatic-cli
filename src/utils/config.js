import { defaults, getDefaults } from './config-defaults.js';
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
export async function loadEcstaticConfig(devFlag = false) {
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

  // Use dev-aware defaults
  const defaultsToUse = devFlag ? getDefaults(devFlag) : defaults;
  _config = deepmerge(defaultsToUse, userConfig);
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

// Generate jampack configuration from ecstatic config
export function generateJampackConfig(config = getConfig()) {
  // Base jampack config with static settings
  const jampackConfig = {
    css: {
      inline_critical_css: true
    },
    image: {
      max_width: 1900
    }
  };

  // Add optimize configuration if it exists
  if (config.optimize) {
    // Map js configuration
    if (config.optimize.js) {
      jampackConfig.js = { ...config.optimize.js };
    }

    // Add any other optimize sections as needed
    // (css, image overrides could go here in the future)
  }

  return jampackConfig;
}

// Write jampack configuration to jampack.config.js
export async function writeJampackConfig(config = getConfig()) {
  const jampackConfig = generateJampackConfig(config);
  
  // Custom serialization to handle regex objects properly
  function serializeValue(value, indent = 0) {
    const spaces = '  '.repeat(indent);
    
    if (value instanceof RegExp) {
      return value.toString();
    } else if (Array.isArray(value)) {
      const items = value.map(item => `${spaces}  ${serializeValue(item, indent + 1)}`).join(',\n');
      return `[\n${items}\n${spaces}]`;
    } else if (value && typeof value === 'object') {
      const entries = Object.entries(value).map(([key, val]) => 
        `${spaces}  "${key}": ${serializeValue(val, indent + 1)}`
      ).join(',\n');
      return `{\n${entries}\n${spaces}}`;
    } else {
      return JSON.stringify(value);
    }
  }
  
  const configContent = `export default ${serializeValue(jampackConfig)};\n`;
  
  const configPath = path.resolve(process.cwd(), 'jampack.config.js');
  
  try {
    fs.writeFileSync(configPath, configContent, 'utf8');
    return configPath;
  } catch (error) {
    throw new Error(`Failed to write jampack.config.js: ${error.message}`);
  }
}

// Clear cached config (for testing)
export function clearConfig() {
  _config = null;
}
