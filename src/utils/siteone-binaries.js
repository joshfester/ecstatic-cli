import fs from 'fs';
import path from 'path';
import os from 'os';

// Import binaries for embedding - Bun will automatically embed these when compiling
import swooleCliBinary from '../../packages/siteone/swoole-cli' with { type: 'file' };
import siteOnePhar from '../../packages/siteone/siteone.phar' with { type: 'file' };

/**
 * Get paths to siteone binaries - always extracts to temp directory for consistent behavior
 * @returns {Promise<{swooleCliPath: string, siteOnePharPath: string}>}
 */
export async function getSiteOneBinaryPaths() {
  return await extractBinariesToTemp();
}

/**
 * Extract binaries and PHAR contents to temporary directory
 * @returns {Promise<{swooleCliPath: string, crawlerPhpPath: string}>}
 */
async function extractBinariesToTemp() {
  // Create temp directory for extracted binaries
  const tempDir = path.join(os.tmpdir(), 'ecstatic-siteone-binaries');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const swooleCliPath = path.join(tempDir, 'swoole-cli');
  const pharExtractDir = path.join(tempDir, 'siteone-extracted');
  const crawlerPhpPath = path.join(pharExtractDir, 'src', 'crawler.php');
  
  try {
    // Extract swoole-cli binary
    if (!fs.existsSync(swooleCliPath)) {
      const swooleCliFile = Bun.file(swooleCliBinary);
      const swooleCliBuffer = await swooleCliFile.arrayBuffer();
      fs.writeFileSync(swooleCliPath, new Uint8Array(swooleCliBuffer));
      fs.chmodSync(swooleCliPath, 0o755); // Make executable
    }
    
    // Extract PHAR contents using swoole-cli
    if (!fs.existsSync(pharExtractDir)) {
      // First, write the PHAR to temp location
      const tempPharPath = path.join(tempDir, 'siteone.phar');
      if (!fs.existsSync(tempPharPath)) {
        const siteOnePharFile = Bun.file(siteOnePhar);
        const siteOnePharBuffer = await siteOnePharFile.arrayBuffer();
        fs.writeFileSync(tempPharPath, new Uint8Array(siteOnePharBuffer));
      }
      
      // Create extraction directory
      fs.mkdirSync(pharExtractDir, { recursive: true });
      
      // Use swoole-cli to extract PHAR contents
      const { runCommand } = await import('../utils/process.js');
      
      // Write PHP extraction script to temp file
      const extractScriptPath = path.join(tempDir, 'extract.php');
      const phpScript = `<?php
$phar = new Phar('${tempPharPath}');
$phar->extractTo('${pharExtractDir}');
?>`;
      fs.writeFileSync(extractScriptPath, phpScript);
      
      // Run the extraction script
      await runCommand(swooleCliPath, [extractScriptPath], false);
    }
    
    return {
      swooleCliPath,
      crawlerPhpPath
    };
  } catch (error) {
    throw new Error(`Failed to extract SiteOne binaries: ${error.message}`);
  }
}

/**
 * Clean up temporary binary files (optional, called during shutdown)
 */
export function cleanupTempBinaries() {
  const tempDir = path.join(os.tmpdir(), 'ecstatic-siteone-binaries');
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cleanup errors, they're not critical
    console.warn('Failed to cleanup temp binaries:', error.message);
  }
}

// Register cleanup on process exit
process.on('exit', cleanupTempBinaries);
process.on('SIGINT', () => {
  cleanupTempBinaries();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanupTempBinaries();
  process.exit(0);
});