import { loadEcstaticConfig } from './config.js';
import * as logger from './logger.js';

export function createCommand(name, actionFn) {
  return async (...args) => {
    try {
      await loadEcstaticConfig();
      await actionFn(...args);
    } catch (error) {
      logger.error(`${name} failed: ${error.message}`);
      process.exit(1);
    }
  };
}