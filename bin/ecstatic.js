import Honeybadger from "@honeybadger-io/js";
import { isProductionEnvironment } from "../src/utils/environment.js";
import { Command, Option } from "commander";
import { scrapeCommand } from "../src/commands/scrape.js";
import { optimizeCommand } from "../src/commands/optimize.js";
import { deployCommand } from "../src/commands/deploy.js";

// Configure Honeybadger for production error reporting
if (isProductionEnvironment()) {
  Honeybadger.configure({
    apiKey: "hbp_G4YPgHYHyk7YQljcUAFKpOGWqZrUzB0mxbxO",
    environment: "production",
  });
}

// Hardcode package info for Bun compatibility
const packageJson = {
  version: "1.0.4",
  description:
    "CLI tool for website optimization - download, optimize, and deploy static sites",
};

const program = new Command();

program
  .name("ecstatic")
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(
    new Option(
      "--admin",
      "Run in admin mode (skips authentication)",
    ).hideHelp(),
  );

// Store admin flag globally for commands to access
let isAdminMode = false;

program.hook("preAction", (thisCommand, actionCommand) => {
  isAdminMode = program.opts().admin;
  // Pass admin flag to all commands
  actionCommand._isAdminMode = isAdminMode;
});

// Add commands
program.addCommand(scrapeCommand);
program.addCommand(optimizeCommand);
program.addCommand(deployCommand);

// Parse command line arguments
program.parse();

export { isAdminMode };
