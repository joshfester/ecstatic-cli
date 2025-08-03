import { spawn } from 'child_process';
import * as logger from './logger.js';

export function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    logger.info(`Running: ${command} ${args.join(' ')}`);

    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start command "${command}": ${error.message}`));
    });
  });
}