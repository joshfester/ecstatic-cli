import fs from 'fs';
import path from 'path';
import os from 'os';

// Import jampack dist tar.xz for embedding - Bun will automatically embed this when compiling
import jampackDistTarXz from '../../packages/jampack/jampack-dist.tar.xz' with { type: 'file' };

/**
 * Get path to jampack binary - always extracts to temp directory for consistent behavior
 * @param {string} [extractDir] - Custom directory to extract binaries (defaults to system temp directory)
 * @returns {Promise<string>} Path to jampack's main entry point (index.js)
 */
export async function getJampackBinaryPath(extractDir = null) {
  return await extractJampackToTemp(extractDir);
}

/**
 * Extract jampack dist contents to temporary directory
 * @param {string} [extractDir] - Custom directory to extract binaries (defaults to system temp directory)
 * @returns {Promise<string>} Path to jampack's main entry point
 */
async function extractJampackToTemp(extractDir = null) {
  // Create temp directory for extracted jampack
  const baseDir = extractDir || os.tmpdir();
  const tempDir = path.join(baseDir, 'ecstatic-jampack-binaries');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const jampackExtractDir = path.join(tempDir, 'jampack-extracted');
  const jampackIndexPath = path.join(jampackExtractDir, 'dist', 'index.js');
  
  try {
    // Extract jampack tar.xz contents
    if (!fs.existsSync(jampackExtractDir)) {
      // First, write the tar.xz to temp location
      const tempTarXzPath = path.join(tempDir, 'jampack-dist.tar.xz');
      if (!fs.existsSync(tempTarXzPath)) {
        const jampackTarXzFile = Bun.file(jampackDistTarXz);
        const jampackTarXzBuffer = await jampackTarXzFile.arrayBuffer();
        fs.writeFileSync(tempTarXzPath, new Uint8Array(jampackTarXzBuffer));
      }
      
      // Create extraction directory
      fs.mkdirSync(jampackExtractDir, { recursive: true });
      
      // Use tar to extract contents (now includes both dist/ and node_modules/)
      const { runCommand } = await import('../utils/process.js');
      await runCommand('tar', ['-xJf', tempTarXzPath, '-C', jampackExtractDir], false);
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
 * @param {string} [extractDir] - Custom directory where binaries were extracted (defaults to system temp directory)
 */
export function cleanupTempJampack(extractDir = null) {
  const baseDir = extractDir || os.tmpdir();
  const tempDir = path.join(baseDir, 'ecstatic-jampack-binaries');
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