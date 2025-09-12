import { GlobalState } from '../state.js';
export declare const defaultTargets: () => import("lightningcss").Targets;
export declare function compressCSS({ targets }: GlobalState, originalCode: Buffer, type?: 'inline' | undefined): Promise<Buffer>;
export declare function loadConfigCSS(state: GlobalState): void;
