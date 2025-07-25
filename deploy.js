import 'dotenv/config';
import https from 'https';
import fs from 'fs';
import path from 'path';

const ACCESS_KEY = process.env.BUNNY_ACCESS_KEY;
const GLOBAL_API_KEY = process.env.BUNNY_GLOBAL_API_KEY;
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const REGION = process.env.BUNNY_REGION || '';
const PURGE_URL = process.env.BUNNY_PURGE_URL;

const BASE_HOSTNAME = 'storage.bunnycdn.com';
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const DIST_DIR = './dist-jampack';

if (!ACCESS_KEY || !GLOBAL_API_KEY || !STORAGE_ZONE || !PURGE_URL) {
  console.error('Missing required environment variables:');
  console.error('BUNNY_ACCESS_KEY, BUNNY_GLOBAL_API_KEY, BUNNY_STORAGE_ZONE, BUNNY_PURGE_URL');
  process.exit(1);
}

async function listFiles() {
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        AccessKey: ACCESS_KEY
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
    console.error('Error listing files:', error.message);
    return [];
  }
}

async function deleteItem(item) {
  const deletePath = item.isDirectory ? `${item.name}/` : item.name;
  const url = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${deletePath}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { AccessKey: ACCESS_KEY }
    });
    
    if (response.ok) {
      console.log(`Deleted: ${item.name}`);
      return true;
    } else {
      console.error(`Failed to delete ${item.name}: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting ${item.name}:`, error.message);
    return false;
  }
}

async function uploadFile(localPath, remotePath) {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(localPath);
    
    const options = {
      method: 'PUT',
      host: HOSTNAME,
      path: `/${STORAGE_ZONE}/${remotePath}`,
      headers: {
        AccessKey: ACCESS_KEY,
        'Content-Type': 'application/octet-stream',
      },
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 201) {
        console.log(`Uploaded: ${remotePath}`);
        resolve(true);
      } else {
        console.error(`Failed to upload ${remotePath}: HTTP ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.error(`Error uploading ${remotePath}:`, error.message);
      resolve(false);
    });
    
    readStream.pipe(req);
  });
}

function getAllLocalFiles(dir, baseDir = dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllLocalFiles(fullPath, baseDir));
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

async function purgeCache() {
  const url = `https://api.bunny.net/purge?url=${encodeURIComponent(PURGE_URL)}&async=false`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        AccessKey: GLOBAL_API_KEY
      }
    });
    
    if (response.ok) {
      console.log('Cache purged successfully');
      return true;
    } else {
      console.error(`Failed to purge cache: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error purging cache:', error.message);
    return false;
  }
}

async function deploy() {
  console.log('Starting deployment...');
  
  // Step 1: List all remote items
  console.log('\n1. Listing remote items...');
  const remoteItems = await listFiles();
  console.log(`Found ${remoteItems.length} remote items`);
  
  // Step 2: Delete all remote items
  if (remoteItems.length > 0) {
    console.log('\n2. Deleting remote items...');
    for (const item of remoteItems) {
      await deleteItem(item);
    }
  }
  
  // Step 3: Upload local files
  console.log('\n3. Uploading local files...');
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`Distribution directory ${DIST_DIR} does not exist`);
    process.exit(1);
  }
  
  const localFiles = getAllLocalFiles(DIST_DIR);
  console.log(`Found ${localFiles.length} local files to upload`);
  
  let uploadCount = 0;
  for (const file of localFiles) {
    const success = await uploadFile(file.localPath, file.remotePath);
    if (success) uploadCount++;
  }
  
  console.log(`\nUploaded ${uploadCount}/${localFiles.length} files`);
  
  // Step 4: Purge cache
  console.log('\n4. Purging cache...');
  await purgeCache();
  
  console.log('\nDeployment complete!');
  process.exit(0);
}

deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
});