import sharp from 'sharp';
import { MimeType } from 'file-type';
import { GlobalState } from '../state.js';
export type ImageMimeType = MimeType | 'image/svg+xml';
export declare const AllImageFormat: string[];
export type ImageFormat = (typeof AllImageFormat)[number] | undefined;
export type Image = {
    format: ImageFormat;
    data: Buffer;
};
export type ImageOutputOptions = {
    resize?: sharp.ResizeOptions;
    toFormat?: 'webp' | 'avif' | 'png' | 'jpeg' | 'unchanged';
};
export declare function compressImage(state: GlobalState, data: Buffer, options: ImageOutputOptions): Promise<Image | undefined>;
