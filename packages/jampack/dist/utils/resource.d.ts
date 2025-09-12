import { FileExtension, MimeType } from 'file-type';
import { ImageFormat } from '../compressors/images.js';
import { GlobalState } from '../state.js';
type ImageMeta = {
    width: number | undefined;
    height: number | undefined;
    isProgressive: boolean;
    isOpaque: boolean;
    isLossless: boolean;
};
/**
 * File extension, mime and data are loaded only on demand, then cached.
 */
export declare class Resource {
    private state;
    readonly src: string;
    readonly filePathAbsolute: string;
    private ext;
    private mime;
    private data;
    private image_meta;
    constructor(state: GlobalState, src: string, filePathAbsolute: string);
    getData(): Promise<Buffer>;
    getImageMeta(): Promise<ImageMeta | null | undefined>;
    getLen(): Promise<number>;
    getExt(): Promise<FileExtension | 'svg'>;
    getImageFormat(): Promise<ImageFormat | undefined>;
    getMime(): Promise<MimeType | 'image/svg+xml'>;
    private loadFileType;
    static loadResource(state: GlobalState, relativeFile: string, src: string): Promise<Resource | undefined>;
}
export declare function isLocal(src: string): boolean;
export declare function translateSrc(projectRoot: string, htmlRelativePath: string, src: string): string;
export {};
