import { hashSync as hasha } from 'hasha';
import path from 'path';
import * as fsp from 'fs/promises';
import { CACHE_VERSIONS } from './packagejson.js';
const listOfCategories = ['img', 'img-ext'];
function getCacheFolder(state) {
    return state.args.cache_folder || '.jampack/cache';
}
async function cleanCache(state, full) {
    var _a;
    const CACHE_FOLDER = getCacheFolder(state);
    const fs = (_a = state.vfs) !== null && _a !== void 0 ? _a : fsp;
    if (full) {
        try {
            await fs.rm(CACHE_FOLDER, { recursive: true });
        }
        catch (e) {
            // Nothing to do, probably not present
        }
        return;
    }
    // Delete old cache category
    let catFolders = [];
    try {
        catFolders = await fs.readdir(CACHE_FOLDER);
    }
    catch (e) {
        // No problem
    }
    for (const f of catFolders) {
        // @ts-ignore
        if (!listOfCategories.includes(f))
            fs.rm(path.join(CACHE_FOLDER, f), { recursive: true });
    }
    // Loop cache folders
    for (const cat of listOfCategories) {
        const location = path.join(CACHE_FOLDER, cat);
        // List versions in cache
        let folders;
        try {
            folders = await fs.readdir(location);
        }
        catch (e) {
            continue;
        }
        // Delete old cache versions
        for (const f of folders) {
            if (f !== CACHE_VERSIONS[cat])
                fs.rm(path.join(location, f), { recursive: true });
        }
    }
}
function computeCacheHash(state, buffer, options) {
    if (state.args.nocache) {
        return '';
    }
    let hash = `${hasha(buffer, { algorithm: 'sha256' })}`;
    if (options) {
        hash += '/' + hasha(JSON.stringify(options), { algorithm: 'md5' });
    }
    return hash;
}
function getVersionOfCategory(category) {
    return CACHE_VERSIONS[category];
}
function getLocation(state, hash, category) {
    const CACHE_FOLDER = getCacheFolder(state);
    return path.join(CACHE_FOLDER, category, getVersionOfCategory(category), hash);
}
async function getFromCache(state, category, hash) {
    var _a;
    if (state.args.nocache) {
        return undefined;
    }
    const fs = (_a = state.vfs) !== null && _a !== void 0 ? _a : fsp;
    const location = getLocation(state, hash, category);
    try {
        const buffer = await fs.readFile(path.join(location, 'data'));
        const meta = JSON.parse((await fs.readFile(path.join(location, 'meta'))).toString());
        return { buffer, meta };
    }
    catch (e) {
        // Problem during cache loading or not in cache
    }
    return undefined;
}
async function addToCache(state, category, hash, data) {
    var _a;
    if (state.args.nocache) {
        return;
    }
    const fs = (_a = state.vfs) !== null && _a !== void 0 ? _a : fsp;
    const location = getLocation(state, hash, category);
    await fs.mkdir(location, { recursive: true });
    await fs.writeFile(path.join(location, 'data'), data.buffer);
    await fs.writeFile(path.join(location, 'meta'), JSON.stringify(data.meta));
}
export { cleanCache, computeCacheHash, getFromCache, addToCache };
