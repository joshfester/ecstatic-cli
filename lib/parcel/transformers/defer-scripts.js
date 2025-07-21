import { Transformer } from '@parcel/plugin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants
const SCRIPT_TAG_PATTERN = '<script';
const DATA_ATTRS = {
  SCRIPT_ORDER: 'data-script-order',
  DATA_SRC: 'data-src',
  ORIGINAL_TYPE: 'data-original-type'
};
const SCRIPT_TYPE_PLAIN = 'text/plain';
const SCRIPT_TYPE_MODULE = 'module';

// Cache for script executor content to avoid repeated file reads
let scriptExecutorContent = null;

/**
 * Parcel transformer that defers script execution to improve page load performance.
 * 
 * This transformer modifies HTML files to:
 * - Mark all script tags with type="text/plain" to prevent immediate execution
 * - Preserve original script attributes and execution order
 * - Inject a script executor that runs deferred scripts in correct order
 * 
 * @type {Transformer}
 */
export default new Transformer({
  /**
   * Transform HTML assets to defer script execution
   * 
   * @param {Object} params - Transform parameters
   * @param {Asset} params.asset - The HTML asset to transform
   * @param {Object} params.options - Parcel options including packageManager
   * @returns {Promise<Asset[]>} Array containing the transformed asset
   */
  async transform({ asset, options }) {
    if (asset.type !== 'html') {
      return [asset];
    }

    try {
      const code = await asset.getCode();

      // Early exit if no script tags found
      if (!code.includes(SCRIPT_TAG_PATTERN)) {
        return [asset];
      }

      // Lazy load posthtml only when needed
      const posthtml = await options.packageManager.require(
        'posthtml',
        asset.filePath,
        {
          range: '^0.16.5',
        },
      );

      let scriptOrder = 0;

      /**
       * PostHTML plugin that processes script tags for deferred execution
       * 
       * @param {Object} tree - PostHTML AST tree
       * @returns {Object} Modified tree
       */
      const deferScriptsPlugin = function (tree) {
        // Process every <script> tag for deferred execution
        tree.match({ tag: 'script' }, (node) => {
          if (!node.attrs) node.attrs = {};

          // Add script order tracking
          node.attrs[DATA_ATTRS.SCRIPT_ORDER] = scriptOrder++;

          // For external scripts, move src to data-src to prevent auto-loading
          if (node.attrs.src) {
            node.attrs[DATA_ATTRS.DATA_SRC] = node.attrs.src;
            delete node.attrs.src;
          }

          // Store original type if it exists and isn't default
          if (node.attrs.type) {
            node.attrs[DATA_ATTRS.ORIGINAL_TYPE] = node.attrs.type;
          }

          // ALL scripts use type="text/plain" to prevent execution
          node.attrs.type = SCRIPT_TYPE_PLAIN;
          return node;
        });

        // Inject script executor
        // Read script executor content and inline it (with caching)
        if (!scriptExecutorContent) {
          try {
            const scriptExecutorPath = join(__dirname, 'script-executor.js');
            scriptExecutorContent = readFileSync(scriptExecutorPath, 'utf8');
          } catch (error) {
            throw new Error(`Failed to read script-executor.js: ${error.message}`);
          }
        }

        const deferScript = {
          tag: 'script',
          attrs: { type: 'module' },
          content: [scriptExecutorContent],
        };

        // Add the script executor to the end of <body>
        tree.match({ tag: 'body' }, (node) => {
          node.content = node.content || [];
          node.content.push(deferScript);
          return node;
        });

        return tree;
      };

      const res = await posthtml([deferScriptsPlugin]).process(code, {
        xmlMode: asset.type === 'xhtml',
        closingSingleTag: asset.type === 'xhtml' ? 'slash' : undefined,
      });

      asset.setCode(res.html);
      return [asset];
    } catch (error) {
      // Log error but don't break the build - return original asset
      console.error(`Error in defer-scripts transformer: ${error.message}`);
      return [asset];
    }
  },
});