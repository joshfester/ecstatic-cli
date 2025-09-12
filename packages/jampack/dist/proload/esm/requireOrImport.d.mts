/**
 *
 * @param {string} filePath
 */
export default function requireOrImport(filePath: string, { middleware }?: {
    middleware?: never[] | undefined;
}): Promise<any>;
