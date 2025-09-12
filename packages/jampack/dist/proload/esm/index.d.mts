export default load;
import { ProloadError } from "../error.cjs";
/**
 *
 * @param {string} namespace
 * @param {import('../index').LoadOptions} opts
 */
declare function load(namespace: string, opts?: any): Promise<{
    filePath: any;
    raw: any;
    value: {};
} | undefined>;
declare namespace load {
    export { defaultPlugins as plugins };
    export function use(plugins: any): void;
}
/**
 *
 * @param {string} namespace
 * @param {import('../index').LoadOptions} opts
 */
declare function resolveConfig(namespace: string, opts?: any): Promise<any>;
declare const defaultPlugins: {
    name: string;
    transform(mdl: any): any;
}[];
export { ProloadError, resolveConfig as resolve };
