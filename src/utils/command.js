import { loadEcstaticConfig } from './config.js';
import * as logger from './logger.js';
import { validateApiKey } from './auth.js';

export function createCommand(name, actionFn) {
  return async (...args) => {
    try {
      // Extract dev flag from the command object (last argument)
      const commandObj = args[args.length - 1];
      const devFlag = commandObj && commandObj._isDevelopmentMode;
      
      await validateApiKey(devFlag);
      await loadEcstaticConfig(devFlag);
      await actionFn(...args);
    } catch (error) {
      logger.error(`${name} failed: ${error.message}`);
      process.exit(1);
    }
  };
}