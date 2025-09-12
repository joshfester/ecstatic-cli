import * as url from 'url';
import * as path from 'path';
import * as fsp from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { AllImageFormat } from '../compressors/images.js';
/**
 * File extension, mime and data are loaded only on demand, then cached.
 */
export class Resource {
    constructor(state, src, filePathAbsolute) {
        this.state = state;
        this.src = src;
        this.filePathAbsolute = filePathAbsolute;
    }
    async getData() {
        var _a;
        if (this.data === undefined) {
            this.data = await ((_a = this.state.vfs) !== null && _a !== void 0 ? _a : fsp).readFile(this.filePathAbsolute);
        }
        return this.data;
    }
    async getImageMeta() {
        if (this.image_meta === undefined) {
            const ext = await this.getExt();
            let isLossless = false;
            switch (ext) {
                case 'svg':
                case 'gif':
                case 'png':
                case 'tif':
                    isLossless = true;
                case 'webp':
                    if (!isLossless) {
                        try {
                            // TODO check if webp is lossless
                            // const info = await WebPInfo.from(await this.getData());
                            // isLossless = info.summary.isLossless;
                        }
                        catch (e) {
                            console.warn('Failed to get WebP info');
                        }
                    }
                case 'avif':
                // TODO
                // Check for lossless avif
                case 'jpg':
                    let sharpFile = sharp(await this.getData(), {
                        animated: true,
                    });
                    const meta = await sharpFile.metadata();
                    const stats = await sharpFile.stats();
                    this.image_meta = {
                        width: meta.width,
                        height: meta.height,
                        isProgressive: meta.isProgressive || false,
                        isOpaque: stats.isOpaque,
                        isLossless,
                    };
                    break;
            }
        }
        if (!this.image_meta) {
            console.log(await this.getExt());
        }
        return this.image_meta;
    }
    async getLen() {
        return (await this.getData()).length;
    }
    async getExt() {
        if (this.ext === undefined) {
            await this.loadFileType();
        }
        return this.ext;
    }
    async getImageFormat() {
        const ext = (await this.getExt());
        if (AllImageFormat.includes(ext))
            return ext;
        return undefined;
    }
    async getMime() {
        if (this.mime === undefined) {
            await this.loadFileType();
        }
        return this.mime;
    }
    async loadFileType() {
        const fileType = await fileTypeFromBuffer(await this.getData());
        if (this.filePathAbsolute.endsWith('.svg')) {
            this.ext = 'svg';
            this.mime = 'image/svg+xml';
        }
        else if (fileType) {
            this.ext = fileType.ext;
            this.mime = fileType.mime;
        }
        else {
            throw new Error(`Unknown file type "${this.src}"`);
        }
    }
    static async loadResource(state, relativeFile, src) {
        if (!isLocal(src)) {
            throw new Error('src should be local');
        }
        const u = url.parse(src);
        if (!u.pathname) {
            throw new Error(`Invalid src format "${src}"`);
        }
        const relativePath = path.join(state.dir, src.startsWith('/') ? '' : path.dirname(relativeFile), u.pathname);
        let absolutePath = path.resolve(relativePath);
        if (await fileExists(state, absolutePath)) {
            return new Resource(state, src, absolutePath);
        }
        return undefined;
    }
}
export function isLocal(src) {
    const u = url.parse(src);
    return !u.host;
}
async function fileExists(state, path) {
    var _a;
    try {
        await ((_a = state.vfs) !== null && _a !== void 0 ? _a : fsp).stat(path);
    }
    catch (e) {
        return false;
    }
    return true;
}
export function translateSrc(projectRoot, htmlRelativePath, src) {
    if (!isLocal(src)) {
        throw new Error('Source should be local');
    }
    const srcAbsolutePath = path.join(projectRoot, src.startsWith('/') ? '' : htmlRelativePath, src);
    return path.resolve(srcAbsolutePath);
}
