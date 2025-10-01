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
  version: "1.1.10",
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
  )
  .addOption(
    new Option(
      "--verbose",
      "Show output from third-party tools (requires --admin)",
    ).hideHelp(),
  )
  .addOption(
    new Option(
      "--extract-dir <path>",
      "Directory to extract temporary binaries (defaults to system temp directory)",
    ),
  );

// Store global flags for commands to access
let isAdminMode = false;
let isVerboseMode = false;
let extractDir = null;

program.hook("preAction", (thisCommand, actionCommand) => {
  const opts = program.opts();
  isAdminMode = opts.admin;
  isVerboseMode = opts.verbose;
  extractDir = opts.extractDir;

  // Validate that --verbose requires --admin
  if (isVerboseMode && !isAdminMode) {
    console.error("Error: --verbose invalid");
    process.exit(1);
  }

  // Pass flags to all commands
  actionCommand._isAdminMode = isAdminMode;
  actionCommand._isVerboseMode = isVerboseMode;
  actionCommand._extractDir = extractDir;
});

// Add commands
program.addCommand(scrapeCommand);
program.addCommand(optimizeCommand);
program.addCommand(deployCommand);

// Parse command line arguments
program.parse();

export { isAdminMode, isVerboseMode, extractDir };
