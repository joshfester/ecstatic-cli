import { GlobalState } from './state.js';
declare const listOfCategories: readonly ["img", "img-ext"];
export type Category = (typeof listOfCategories)[number];
export type CacheData = {
    buffer: Buffer;
    meta: any;
};
declare function cleanCache(state: GlobalState, full?: boolean): Promise<void>;
declare function computeCacheHash(state: GlobalState, buffer: Buffer, options?: any): string;
declare function getFromCache(state: GlobalState, category: Category, hash: string): Promise<CacheData | undefined>;
declare function addToCache(state: GlobalState, category: Category, hash: string, data: CacheData): Promise<void>;
export { cleanCache, computeCacheHash, getFromCache, addToCache };
