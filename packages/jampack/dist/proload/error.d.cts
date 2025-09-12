/**
 * @type import('./error.cjs').ProloadError
 */
export class ProloadError extends Error {
    constructor(opts?: {});
    code: any;
}
/**
 * @type import('./error.cjs').assert
 */
export function assert(bool: any, message: any, code: any): any;
