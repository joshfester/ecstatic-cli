import { Resolver } from '@parcel/plugin';
import path from 'path';

export default new Resolver({
  async resolve({ specifier, dependency, options }) {

    // Skip if resolveFrom is null (entry point)
    if (!dependency.resolveFrom) {
      return null;
    }

    // Skip external URLs (let default resolver handle them)
    if (
      specifier.startsWith('http://') ||
      specifier.startsWith('https://') ||
      specifier.startsWith('data:') ||
      specifier.startsWith('//')
    ) {
      return null;
    }

    // Clean the specifier to remove query params and hash fragments
    let cleanSpecifier;
    // Only use URL constructor for URLs that might have query params/fragments
    if (specifier.includes('?') || specifier.includes('#')) {
      try {
        const url = new URL(specifier, 'http://example.com');
        cleanSpecifier = url.pathname;
      } catch {
        // If URL parsing fails, fall back to the original specifier
        cleanSpecifier = specifier;
      }
    } else {
      // For simple relative paths without query params, use as-is
      cleanSpecifier = specifier;
    }

    let filePath;

    // Handle explicit relative paths (./file or ../file)
    if (cleanSpecifier.startsWith('./') || cleanSpecifier.startsWith('../')) {
      filePath = path.resolve(path.dirname(dependency.resolveFrom), cleanSpecifier);
    }
    // Handle absolute paths
    else if (path.isAbsolute(cleanSpecifier)) {
      filePath = cleanSpecifier;
    }
    // Handle root-relative paths (/file)
    else if (cleanSpecifier.startsWith('/')) {
      filePath = path.join(options.projectRoot, cleanSpecifier);
    }
    // Handle simple relative paths (feed/index.html)
    else {
      filePath = path.resolve(path.dirname(dependency.resolveFrom), cleanSpecifier);
    }

    try {
      // Check if file exists
      const exists = await options.inputFS.exists(filePath);

      if (!exists) {
        // File doesn't exist - exclude it from the build entirely
        // This prevents errors and allows the build to continue gracefully
        return { isExcluded: true };
      }

      // File exists - return null to let the default resolver handle it normally
      return null;

    } catch (err) {
      // If we can't check file existence, exclude it to be safe
      return { isExcluded: true };
    }
  }
});