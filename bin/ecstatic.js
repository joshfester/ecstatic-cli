import Honeybadger from "@honeybadger-io/js";
import { isProductionEnvironment } from '../src/utils/environment.js';
import { Command } from 'commander';
import { scrapeCommand } from '../src/commands/scrape.js';
import { optimizeCommand } from '../src/commands/optimize.js';
import { deployCommand } from '../src/commands/deploy.js';

// Configure Honeybadger for production error reporting
if (isProductionEnvironment()) {
  Honeybadger.configure({
    apiKey: "hbp_G4YPgHYHyk7YQljcUAFKpOGWqZrUzB0mxbxO",
    environment: "production"
  });
}

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

// Parse command line arguments
program.parse();