import { Command } from 'commander';
import { scrapeCommand } from '../src/commands/scrape.js';
import { optimizeCommand } from '../src/commands/optimize.js';
import { deployCommand } from '../src/commands/deploy.js';
import { allCommand } from '../src/commands/all.js';

// Hardcode package info for Bun compatibility
const packageJson = {
  version: '0.0.1',
  description: 'CLI tool for website optimization - download, optimize, and deploy static sites'
};

const program = new Command();

program
  .name('ecstatic')
  .description(packageJson.description)
  .version(packageJson.version);

// Add commands
program.addCommand(scrapeCommand);
program.addCommand(optimizeCommand);
program.addCommand(deployCommand);
program.addCommand(allCommand);

// Parse command line arguments
program.parse();