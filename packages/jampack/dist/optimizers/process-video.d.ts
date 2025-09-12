import * as cheerio from '@divriots/cheerio';
import type { GlobalState } from '../state.js';
export declare function processVideo(state: GlobalState, htmlfile: string, video: cheerio.Cheerio<cheerio.Element>, isAboveTheFold: boolean, appendToBody: Record<string, string>): Promise<void>;
