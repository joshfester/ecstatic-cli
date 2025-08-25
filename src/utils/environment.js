// Environment detection utilities for ecstatic CLI

/**
 * Detect if we're running in production (compiled executable) vs development
 * Production: Running from compiled Bun executable with ECSTATIC_ENV=production
 * Development: Running from Node.js with source files or with --dev flag
 */
export function isProductionEnvironment() {
  // Check explicit environment variable (set during compilation via --define)
  if (process.env.ECSTATIC_ENV === 'production') {
    return true;
  }

  return false;
}

/**
 * Check if running in development mode (--dev flag override)
 */
export function isDevelopmentMode(devFlag = false) {
  // Dev flag takes highest priority
  if (devFlag) {
    return true;
  }
  
  // Fall back to production environment detection
  return !isProductionEnvironment();
}

/**
 * Get environment-specific paths based on production/development detection
 */
export function getEnvironmentPaths(devFlag = false) {
  const isDev = isDevelopmentMode(devFlag);

  if (isDev) {
    // Development: use subdirectories
    return {
      scraped: './scraped',
      dist: './dist'
    };
  } else {
    // Production: use current working directory
    return {
      scraped: '.',
      dist: '.'
    };
  }
}