import fs from 'fs';
import path from 'path';
import os from 'os';

// Import siteone distribution for embedding - Bun will automatically embed this when compiling
import siteOneDistTarXz from '../../packages/siteone/siteone-dist.tar.xz' with { type: 'file' };

/**
 * Get paths to siteone binaries - always extracts to temp directory for consistent behavior
 * @param {string} [extractDir] - Custom directory to extract binaries (defaults to system temp directory)
 * @returns {Promise<{swooleCliPath: string, crawlerPhpPath: string}>}
 */
export async function getSiteOneBinaryPaths(extractDir = null) {
  return await extractBinariesToTemp(extractDir);
}

/**
 * Extract siteone distribution to temporary directory
 * @param {string} [extractDir] - Custom directory to extract binaries (defaults to system temp directory)
 * @returns {Promise<{swooleCliPath: string, crawlerPhpPath: string}>}
 */
async function extractBinariesToTemp(extractDir = null) {
  // Create temp directory for extracted binaries
  const baseDir = extractDir || os.tmpdir();
  const tempDir = path.join(baseDir, 'ecstatic-siteone-binaries');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const siteoneExtractDir = path.join(tempDir, 'siteone-extracted');
  const swooleCliPath = path.join(siteoneExtractDir, 'bin', 'swoole-cli');
  const crawlerPhpPath = path.join(siteoneExtractDir, 'src', 'crawler.php');
  
  try {
    // Extract siteone tar.xz contents
    if (!fs.existsSync(siteoneExtractDir)) {
      // First, write the tar.xz to temp location
      const tempTarXzPath = path.join(tempDir, 'siteone-dist.tar.xz');
      if (!fs.existsSync(tempTarXzPath)) {
        const siteOneTarXzFile = Bun.file(siteOneDistTarXz);
        const siteOneTarXzBuffer = await siteOneTarXzFile.arrayBuffer();
        fs.writeFileSync(tempTarXzPath, new Uint8Array(siteOneTarXzBuffer));
      }
      
      // Create extraction directory
      fs.mkdirSync(siteoneExtractDir, { recursive: true });
      
      // Use tar to extract contents
      const { runCommand } = await import('../utils/process.js');
      await runCommand('tar', ['-xJf', tempTarXzPath, '-C', siteoneExtractDir], false);
      
      // Make swoole-cli executable
      if (fs.existsSync(swooleCliPath)) {
        fs.chmodSync(swooleCliPath, 0o755);
      }
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
 * @param {string} [extractDir] - Custom directory where binaries were extracted (defaults to system temp directory)
 */
export function cleanupTempBinaries(extractDir = null) {
  const baseDir = extractDir || os.tmpdir();
  const tempDir = path.join(baseDir, 'ecstatic-siteone-binaries');
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