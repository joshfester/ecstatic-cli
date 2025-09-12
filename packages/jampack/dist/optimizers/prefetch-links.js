import { createRequire } from 'node:module';
import { install_dependency } from '../utils/install-dep.js';
const require = createRequire(import.meta.url);
export async function prefetch_links_in_viewport(state, html_file, appendToBody) {
    await install_dependency(state, html_file, {
        source: {
            npm_package_name: 'quicklink',
            absolute_path_to_file: '/dist',
            filename: 'quicklink.mjs',
        },
        destination: {
            folder_name: 'quicklink-2.3.0',
            code_loader: `import { listen } from "./quicklink.mjs";
    listen();`,
        },
    }, appendToBody);
}
