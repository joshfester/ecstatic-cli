import fs from 'fs';
import path from 'path';

// Check if a directory exists
export function dirExists(dirPath) {
  try {
    const stat = fs.statSync(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

// Check if a file exists
export function fileExists(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

// Ensure a directory exists, create if it doesn't
export function ensureDir(dirPath) {
  if (!dirExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Get all files in a directory recursively
export function getAllFiles(dir, baseDir = dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        localPath: fullPath,
        remotePath: relativePath.replace(/\\/g, '/')
      });
    }
  }
  
  return files;
}

// Clean directory (remove all contents)
export function cleanDir(dirPath) {
  if (dirExists(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  ensureDir(dirPath);
}

// Find the scraped domain folder in ./scraped directory
// Returns the path to the domain folder if found, null otherwise
export function findScrapedDomainFolder(scrapedDir) {
  if (!dirExists(scrapedDir)) {
    return null;
  }

  const items = fs.readdirSync(scrapedDir);
  
  // Look for directories that look like domain names
  const domainFolders = items.filter(item => {
    const itemPath = path.join(scrapedDir, item);
    if (!dirExists(itemPath)) {
      return false;
    }
    
    // Basic domain validation - contains dot and doesn't start with dot
    return item.includes('.') && !item.startsWith('.');
  });

  if (domainFolders.length === 0) {
    return null;
  }

  // If multiple domain folders exist, return the most recently modified one
  if (domainFolders.length > 1) {
    const folderStats = domainFolders.map(folder => {
      const folderPath = path.join(scrapedDir, folder);
      const stat = fs.statSync(folderPath);
      return { folder, mtime: stat.mtime, path: folderPath };
    });
    
    folderStats.sort((a, b) => b.mtime - a.mtime);
    return folderStats[0].path;
  }

  return path.join(scrapedDir, domainFolders[0]);
}