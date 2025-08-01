import { Command } from 'commander';
import https from 'https';
import fs from 'fs';
import { loadEcstaticConfig, getConfig, validateDeployConfig, resolvePath } from '../utils/config.js';
import { dirExists, getAllFiles } from '../utils/paths.js';
import * as logger from '../utils/logger.js';

export const deployCommand = new Command('deploy')
  .description('Upload optimized files to CDN')
  .argument('[dist-dir]', 'Distribution directory to deploy (overrides config)')
  .action(async (distDir, options) => {
    try {
      await loadEcstaticConfig();
      await deployWebsite(distDir);
    } catch (error) {
      logger.error(`Deployment failed: ${error.message}`);
      process.exit(1);
    }
  });

async function deployWebsite(distDir) {
  const config = getConfig();
  const finalDistDir = distDir || config.paths.dist;
  const resolvedDistDir = resolvePath(finalDistDir);
  
  logger.info(`Deploying from ${resolvedDistDir}`);
  
  // Validate distribution directory exists
  if (!dirExists(resolvedDistDir)) {
    throw new Error(`Distribution directory does not exist: ${resolvedDistDir}`);
  }
  
  // Validate deployment configuration
  const deployConfig = validateDeployConfig(config);
  
  logger.step(1, 4, 'Listing remote files');
  const remoteItems = await listFiles(deployConfig);
  logger.info(`Found ${remoteItems.length} remote items`);
  
  // Delete all remote items
  if (remoteItems.length > 0) {
    logger.step(2, 4, 'Deleting remote files');
    for (const item of remoteItems) {
      await deleteItem(item, deployConfig);
    }
  }
  
  // Upload local files
  logger.step(3, 4, 'Uploading local files');
  const localFiles = getAllFiles(resolvedDistDir);
  logger.info(`Found ${localFiles.length} local files to upload`);
  
  let uploadCount = 0;
  for (const file of localFiles) {
    const success = await uploadFile(file.localPath, file.remotePath, deployConfig);
    if (success) uploadCount++;
  }
  
  logger.info(`Uploaded ${uploadCount}/${localFiles.length} files`);
  
  // Purge cache
  logger.step(4, 4, 'Purging CDN cache');
  await purgeCache(deployConfig);
  
  logger.success('Deployment completed successfully!');
  
  // Explicitly exit to ensure the process doesn't hang
  process.exit(0);
}

async function listFiles(config) {
  const url = `https://storage.bunnycdn.com/${config.storageZone}/`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        AccessKey: config.accessKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const items = await response.json();
    return items.map(item => ({
      name: item.ObjectName,
      isDirectory: item.IsDirectory
    }));
  } catch (error) {
    logger.error(`Error listing files: ${error.message}`);
    return [];
  }
}

async function deleteItem(item, config) {
  const deletePath = item.isDirectory ? `${item.name}/` : item.name;
  const url = `https://storage.bunnycdn.com/${config.storageZone}/${deletePath}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { AccessKey: config.accessKey }
    });
    
    if (response.ok) {
      logger.info(`Deleted: ${item.name}`);
      return true;
    } else {
      logger.warning(`Failed to delete ${item.name}: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logger.warning(`Error deleting ${item.name}: ${error.message}`);
    return false;
  }
}

async function uploadFile(localPath, remotePath, config) {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(localPath);
    
    const baseHostname = 'storage.bunnycdn.com';
    const hostname = config.region ? `${config.region}.${baseHostname}` : baseHostname;
    
    const options = {
      method: 'PUT',
      host: hostname,
      path: `/${config.storageZone}/${remotePath}`,
      headers: {
        AccessKey: config.accessKey,
        'Content-Type': 'application/octet-stream',
      },
    };
    
    const cleanup = () => {
      if (!readStream.destroyed) {
        readStream.destroy();
      }
    };
    
    const req = https.request(options, (res) => {
      // Consume the response to prevent hanging
      res.on('data', () => {});
      res.on('end', () => {
        cleanup();
        if (res.statusCode === 201) {
          logger.info(`Uploaded: ${remotePath}`);
          resolve(true);
        } else {
          logger.warning(`Failed to upload ${remotePath}: HTTP ${res.statusCode}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      cleanup();
      logger.warning(`Error uploading ${remotePath}: ${error.message}`);
      resolve(false);
    });
    
    readStream.on('error', (error) => {
      cleanup();
      req.destroy();
      logger.warning(`Error reading ${localPath}: ${error.message}`);
      resolve(false);
    });
    
    readStream.pipe(req);
  });
}

async function purgeCache(config) {
  const url = `https://api.bunny.net/purge?url=${encodeURIComponent(config.purgeUrl)}&async=false`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        AccessKey: config.globalApiKey
      }
    });
    
    if (response.ok) {
      logger.success('Cache purged successfully');
      return true;
    } else {
      logger.warning(`Failed to purge cache: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    logger.warning(`Error purging cache: ${error.message}`);
    return false;
  }
}