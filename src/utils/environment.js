// Environment detection utilities for ecstatic CLI

/**
 * Detect if we're running in production (compiled executable) vs development
 * Production: Running from compiled Bun executable with ECSTATIC_ENV=production
 * Development: Running from Node.js with source files
 */
export function isProductionEnvironment() {
  // Check explicit environment variable (set during compilation via --define)
  if (process.env.ECSTATIC_ENV === 'production') {
    return true;
  }

  return false;
}

/**
 * Get environment-specific paths based on production/development detection
 */
export function getEnvironmentPaths() {
  const isProduction = isProductionEnvironment();

  if (isProduction) {
    // Production: use current working directory
    return {
      scraped: '.',
      dist: '.'
    };
  } else {
    // Development: use subdirectories
    return {
      scraped: './scraped',
      dist: './dist'
    };
  }
}