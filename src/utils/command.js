import { loadEcstaticConfig } from './config.js';
import * as logger from './logger.js';
import { validateApiKey } from './auth.js';

export function createCommand(name, actionFn) {
  return async (...args) => {
    try {
      validateApiKey();
      await loadEcstaticConfig();
      await actionFn(...args);
    } catch (error) {
      logger.error(`${name} failed: ${error.message}`);
      process.exit(1);
    }
  };
}