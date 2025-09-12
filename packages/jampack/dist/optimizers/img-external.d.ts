import { GlobalState } from '../state.js';
import '../utils/polyfill-fetch.js';
export declare function downloadExternalImage(state: GlobalState, htmlfile: string, href: string): Promise<string>;
