import * as cheerio from '@divriots/cheerio';
import type { GlobalState } from '../state.js';
export declare function processScript(state: GlobalState, _htmlfile: string, script: cheerio.Cheerio<cheerio.Element>, isAboveTheFold: boolean, _appendToBody: Record<string, string>): Promise<void>;
