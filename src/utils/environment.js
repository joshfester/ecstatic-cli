// Environment detection utilities for ecstatic CLI

/**
 * Detect if we're running in production (compiled executable) vs development
 * Production: Running from compiled Bun executable
 * Development: Running from Node.js with source files
 */
export function isProductionEnvironment() {
  // Check if we're running from a Bun compiled executable
  // Bun sets process.isBun to true when running compiled executables
  if (typeof process.isBun !== 'undefined' && process.isBun) {
    // Additional check: compiled executables typically have different argv[0] patterns
    const execPath = process.argv[0];
    // If the executable path contains 'ecstatic' and doesn't contain node_modules or src
    if (execPath.includes('ecstatic') && !execPath.includes('node_modules') && !execPath.includes('src')) {
      return true;
    }
  }
  
  // Fallback: check if process.argv[0] ends with our executable name
  // This handles cases where the compiled executable is being run directly
  const executableName = process.argv[0];
  if (executableName.endsWith('ecstatic') || executableName.endsWith('ecstatic.exe')) {
    return true;
  }
  
  // Development environment: running via node or npm
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