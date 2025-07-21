import { Transformer } from '@parcel/plugin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default new Transformer({
  async transform({ asset, options }) {
    if (asset.type !== 'html') {
      return [asset];
    }

    const posthtml = await options.packageManager.require(
      'posthtml',
      asset.filePath,
      {
        range: '^0.16.5',
      },
    );

    const code = await asset.getCode();
    let hasDeferLib = false;

    let scriptOrder = 0;

    const deferScriptsPlugin = function (tree) {
      // Mark every <script> so Defer.js can handle it
      tree.match({ tag: 'script' }, (node) => {
        if (node.attrs?.src && /@shinsenter\/defer\.js/.test(node.attrs.src)) {
          hasDeferLib = true;
          return node;
        }
        if (!node.attrs) node.attrs = {};

        // Add script order tracking
        node.attrs['data-script-order'] = scriptOrder++;

        // For external scripts, move src to data-src to prevent auto-loading
        if (node.attrs.src) {
          node.attrs['data-src'] = node.attrs.src;
          delete node.attrs.src;
          // External scripts use type="deferjs"
          node.attrs['type'] = 'deferjs';
        } else {
          // Inline scripts use type="text/plain" to prevent execution
          node.attrs['type'] = 'text/plain';
        }
        return node;
      });

      // Inject Defer.js (and an init stub) once
      if (!hasDeferLib) {
        // Read defer.js content and inline it
        const deferJsPath = join(__dirname, '../../defer.min.js');
        const deferJsContent = readFileSync(deferJsPath, 'utf8');

        const sequentialExecutionLogic = `
window.Defer.executeInOrder = function() {
  var scripts = Array.from(document.querySelectorAll('script[data-script-order]')).sort(function(a, b) {
    return parseInt(a.getAttribute('data-script-order')) - parseInt(b.getAttribute('data-script-order'));
  });
  
  var currentIndex = 0;
  
  function executeNext() {
    if (currentIndex >= scripts.length) return;
    
    var script = scripts[currentIndex++];
    var dataSrc = script.getAttribute('data-src');
    
    if (dataSrc) {
      // External script - load with Defer.js and wait for completion
      window.Defer.js(dataSrc, script.id || 'script-' + currentIndex, 0, executeNext);
    } else {
      // Inline script - execute content and continue
      try {
        var scriptContent = script.textContent || script.innerHTML;
        if (scriptContent.trim()) {
          eval(scriptContent);
        }
      } catch (e) {
        console.error('Error executing inline script:', e);
      }
      executeNext();
    }
  }
  
  executeNext();
};
`;

        const deferScript = {
          tag: 'script',
          content: [deferJsContent + sequentialExecutionLogic + '\nwindow.Defer.executeInOrder();'],
        };

        // Move the combined defer script to the end of <body>
        tree.match({ tag: 'body' }, (node) => {
          node.content = node.content || [];
          node.content.push(deferScript);
          return node;
        });
      }

      return tree;
    };

    const res = await posthtml([deferScriptsPlugin]).process(code, {
      xmlMode: asset.type === 'xhtml',
      closingSingleTag: asset.type === 'xhtml' ? 'slash' : undefined,
    });

    asset.setCode(res.html);
    return [asset];
  },
});