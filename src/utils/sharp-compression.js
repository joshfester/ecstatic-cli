import * as logger from './logger.js';
import { fileExists } from './paths.js';
import { getJampackSharpPath } from './jampack-binaries.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

/**
 * Dynamically load Sharp from extracted Jampack
 * @returns {Promise<object>} Sharp module
 */
async function loadSharp() {
  const sharpPath = await getJampackSharpPath();
  const require = createRequire(import.meta.url);
  return require(sharpPath);
}

/**
 * Parse comma-separated image list and validate paths
 * @param {string} imageString - Comma-separated list of image paths
 * @param {string} outputDir - Output directory to resolve relative paths
 * @returns {string[]} Array of validated image paths
 */
export function parseImageList(imageString, outputDir) {
  if (!imageString) return [];

  const images = imageString.split(',').map(img => img.trim()).filter(Boolean);
  const validatedImages = [];

  for (const imagePath of images) {
    // Always resolve paths against output directory
    // (even if they start with / since those are website-relative, not filesystem-absolute)
    const fullPath = imagePath.startsWith('/')
      ? path.join(outputDir, imagePath.substring(1))  // Remove leading / and join
      : path.join(outputDir, imagePath);               // Regular relative path

    if (fileExists(fullPath)) {
      validatedImages.push(fullPath);
    } else {
      logger.warning(`Image not found, skipping: ${imagePath}`);
    }
  }

  return validatedImages;
}

/**
 * Get compression settings based on file extension and metadata
 * @param {string} extension - File extension (with dot)
 * @param {object} metadata - Sharp metadata object (optional for PNG intelligent compression)
 * @returns {object} Compression settings for Sharp
 */
export function getCompressionSettings(extension, metadata = null) {
  const ext = extension.toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return {
        format: 'jpeg',
        options: {
          quality: 80,
          progressive: true,
          mozjpeg: true
        }
      };

    case '.png':
      const pngOptions = {
        compressionLevel: 9,
        adaptiveFiltering: true
      };

      // Intelligent PNG compression based on original metadata
      if (metadata && metadata.isPalette && metadata.bitsPerSample) {
        // Original was palette-based, preserve or improve efficiency
        const maxColors = Math.pow(2, metadata.bitsPerSample);
        pngOptions.palette = true;
        pngOptions.colors = maxColors;
      }

      return {
        format: 'png',
        options: pngOptions
      };

    case '.webp':
      return {
        format: 'webp',
        options: {
          quality: 80,
          effort: 6
        }
      };

    case '.avif':
      return {
        format: 'avif',
        options: {
          quality: 50,
          effort: 4
        }
      };

    case '.tiff':
    case '.tif':
      return {
        format: 'tiff',
        options: {
          quality: 80,
          compression: 'lzw'
        }
      };

    default:
      throw new Error(`Unsupported image format: ${ext}`);
  }
}

/**
 * Compress a single image while preserving its format
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<{originalSize: number, compressedSize: number}>}
 */
export async function compressImage(imagePath) {
  const extension = path.extname(imagePath);

  // Load Sharp dynamically from Jampack
  const sharp = await loadSharp();

  // Get original file size
  const originalStats = fs.statSync(imagePath);
  const originalSize = originalStats.size;

  // Get image metadata to make intelligent decisions
  const metadata = await sharp(imagePath).metadata();
  const needsResize = metadata.width > 1920 || metadata.height > 1920;

  // Get compression settings with metadata for intelligent PNG handling
  const settings = getCompressionSettings(extension, metadata);

  // Create Sharp instance
  let sharpInstance = sharp(imagePath);

  // Only resize if necessary
  if (needsResize) {
    sharpInstance = sharpInstance.resize(1920, 1920, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // Apply format-specific compression
  switch (settings.format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg(settings.options);
      break;
    case 'png':
      sharpInstance = sharpInstance.png(settings.options);
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp(settings.options);
      break;
    case 'avif':
      sharpInstance = sharpInstance.avif(settings.options);
      break;
    case 'tiff':
      sharpInstance = sharpInstance.tiff(settings.options);
      break;
  }

  // Compress to a temporary file, then replace the original
  const tempPath = `${imagePath}.tmp`;
  await sharpInstance.toFile(tempPath);

  // Check if compression actually helped
  const tempStats = fs.statSync(tempPath);
  const compressedSize = tempStats.size;

  if (compressedSize >= originalSize) {
    // Compression made it worse, keep original
    fs.unlinkSync(tempPath);
    return { originalSize, compressedSize: originalSize };
  }

  // Replace original with compressed version
  fs.renameSync(tempPath, imagePath);

  return { originalSize, compressedSize };
}

/**
 * Compress multiple images with Sharp
 * @param {string} imageList - Comma-separated list of image paths
 * @param {string} outputDir - Output directory to resolve relative paths
 * @param {boolean} suppressOutput - Whether to suppress detailed output
 * @returns {Promise<void>}
 */
export async function compressImages(imageList, outputDir, suppressOutput = false) {
  if (!imageList) return;

  const imagePaths = parseImageList(imageList, outputDir);

  if (imagePaths.length === 0) {
    logger.warning("No valid images found to compress");
    return;
  }

  if (!suppressOutput) {
    logger.info(`Compressing ${imagePaths.length} images with Sharp...`);
  }

  let totalOriginalSize = 0;
  let totalCompressedSize = 0;
  let successCount = 0;

  for (const imagePath of imagePaths) {
    try {
      const result = await compressImage(imagePath);
      totalOriginalSize += result.originalSize;
      totalCompressedSize += result.compressedSize;
      successCount++;

      if (!suppressOutput) {
        const reductionPercent = Math.round((1 - result.compressedSize / result.originalSize) * 100);
        const fileName = path.basename(imagePath);
        logger.info(`  ${fileName}: ${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (${reductionPercent}% reduction)`);
      }
    } catch (error) {
      logger.warning(`Failed to compress ${path.basename(imagePath)}: ${error.message}`);
    }
  }

  if (!suppressOutput && successCount > 0) {
    const totalReductionPercent = Math.round((1 - totalCompressedSize / totalOriginalSize) * 100);
    logger.success(`Successfully compressed ${successCount}/${imagePaths.length} images`);
    logger.info(`Total size reduction: ${formatBytes(totalOriginalSize)} → ${formatBytes(totalCompressedSize)} (${totalReductionPercent}% reduction)`);
  }
}

/**
 * Format bytes into human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}