import { loadEcstaticConfig } from './config.js';
import * as logger from './logger.js';
import { validateApiKey } from './auth.js';

function formatElapsedTime(milliseconds) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export function createCommand(name, actionFn) {
  return async (...args) => {
    const startTime = Date.now();
    
    try {
      // Extract dev flag from the command object (last argument)
      const commandObj = args[args.length - 1];
      const devFlag = commandObj && commandObj._isDevelopmentMode;
      
      await validateApiKey(devFlag);
      await loadEcstaticConfig(devFlag);
      await actionFn(...args);
      
      const elapsedTime = Date.now() - startTime;
      logger.info(`Completed in ${formatElapsedTime(elapsedTime)}`);
    } catch (error) {
      logger.error(`${name} failed: ${error.message}`);
      process.exit(1);
    }
  };
}