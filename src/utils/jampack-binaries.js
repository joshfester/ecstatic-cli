import fs from 'fs';
import path from 'path';
import os from 'os';

// Import jampack dist zip for embedding - Bun will automatically embed this when compiling
import jampackDistZip from '../../packages/jampack/jampack-dist.zip' with { type: 'file' };

/**
 * Get path to jampack binary - always extracts to temp directory for consistent behavior
 * @returns {Promise<string>} Path to jampack's main entry point (index.js)
 */
export async function getJampackBinaryPath() {
  return await extractJampackToTemp();
}

/**
 * Extract jampack dist contents to temporary directory
 * @returns {Promise<string>} Path to jampack's main entry point
 */
async function extractJampackToTemp() {
  // Create temp directory for extracted jampack
  const tempDir = path.join(os.tmpdir(), 'ecstatic-jampack-binaries');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const jampackExtractDir = path.join(tempDir, 'jampack-extracted');
  const jampackIndexPath = path.join(jampackExtractDir, 'dist', 'index.js');
  
  try {
    // Extract jampack zip contents
    if (!fs.existsSync(jampackExtractDir)) {
      // First, write the zip to temp location
      const tempZipPath = path.join(tempDir, 'jampack-dist.zip');
      if (!fs.existsSync(tempZipPath)) {
        const jampackZipFile = Bun.file(jampackDistZip);
        const jampackZipBuffer = await jampackZipFile.arrayBuffer();
        fs.writeFileSync(tempZipPath, new Uint8Array(jampackZipBuffer));
      }
      
      // Create extraction directory
      fs.mkdirSync(jampackExtractDir, { recursive: true });
      
      // Use unzip to extract contents
      const { runCommand } = await import('../utils/process.js');
      await runCommand('unzip', ['-q', tempZipPath, '-d', jampackExtractDir], false);
    }
    
    // Verify the index.js file exists
    if (!fs.existsSync(jampackIndexPath)) {
      throw new Error(`Jampack index.js not found at expected path: ${jampackIndexPath}`);
    }
    
    return jampackIndexPath;
  } catch (error) {
    throw new Error(`Failed to extract jampack binaries: ${error.message}`);
  }
}

/**
 * Clean up temporary jampack files (optional, called during shutdown)
 */
export function cleanupTempJampack() {
  const tempDir = path.join(os.tmpdir(), 'ecstatic-jampack-binaries');
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cleanup errors, they're not critical
    console.warn('Failed to cleanup temp jampack binaries:', error.message);
  }
}

// Register cleanup on process exit
process.on('exit', cleanupTempJampack);
process.on('SIGINT', () => {
  cleanupTempJampack();
  process.exit(0);
});
process.on('SIGTERM', () => {
  cleanupTempJampack();
  process.exit(0);
});