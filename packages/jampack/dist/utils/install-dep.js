import * as fsp from 'fs/promises';
import * as path from 'path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export async function install_dependency(state, html_file, options, appendToBody) {
    var _a;
    const path_html = path.dirname('/' + html_file);
    const folder = `/_jampack/${options.destination.folder_name}`;
    const src_filename = options.source.filename;
    const url_loader = `${folder}/loader.js`;
    const fs = (_a = state.vfs) !== null && _a !== void 0 ? _a : fsp;
    // Install dependency in /_jampack if not done yet
    if (!state.installed_dependencies.has(options.source.npm_package_name)) {
        const quickLinkDestination = path.join(state.dir, folder, src_filename);
        const path_loader = path.join(state.dir, url_loader);
        await fs.mkdir(path.join(state.dir, folder), { recursive: true });
        // Write loader
        const code_loader = options.destination.code_loader;
        await fs.writeFile(path_loader, code_loader);
        // Write quicklink code
        const source = require.resolve(`${options.source.npm_package_name}${options.source.absolute_path_to_file}/${src_filename}`);
        if (state.vfs) {
            await state.vfs.writeFile(quickLinkDestination, await fsp.readFile(source));
        }
        else {
            await fs.copyFile(source, quickLinkDestination);
        }
        state.installed_dependencies.add(options.source.npm_package_name);
    }
    // Add custom code to the end of body if not done yet
    if (!(options.source.npm_package_name in appendToBody)) {
        appendToBody[options.source.npm_package_name] = `<script type="module" src="${path.relative(path_html, url_loader)}"></script>`;
    }
}
export async function install_lozad(state, html_file, appendToBody) {
    return install_dependency(state, html_file, {
        source: {
            npm_package_name: 'lozad',
            absolute_path_to_file: '/dist',
            filename: 'lozad.es.js',
        },
        destination: {
            folder_name: 'lozad-1.16',
            code_loader: `import lozad from "./lozad.es.js";
      const observer = lozad('.jampack-lozad', { rootMargin: '100px 0px', threshold: [0.1] });
      observer.observe();`,
        },
    }, appendToBody);
}
export async function install_defer_js(state, _html_file, appendToBody) {
    var _a;
    const fs = (_a = state.vfs) !== null && _a !== void 0 ? _a : fsp;
    // Read defer.js content using require.resolve for proper package resolution
    const deferJsPath = require.resolve('@shinsenter/defer.js/dist/defer.min.js');
    const deferJsContent = await fs.readFile(deferJsPath, 'utf8');
    // Add defer.js inline script if not already added
    if (!('defer-js' in appendToBody)) {
        appendToBody['defer-js'] = `
        <script defer>
          ${deferJsContent}
          Defer.all('[data-offload]', 0, true);
        </script>
      `;
    }
}
