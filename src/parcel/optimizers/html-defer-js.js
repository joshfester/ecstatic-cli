import { Optimizer } from '@parcel/plugin';
import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default new Optimizer({
  async optimize({ contents, bundle }) {
    // Only process HTML bundles
    if (bundle.type !== 'html') {
      return { contents };
    }

    const html = typeof contents === 'string' ? contents : contents.toString();
    const $ = cheerio.load(html);

    // Find scripts marked with data-ecstatic and convert to type="text/plain"
    $('script[data-ecstatic-defer], script[data-ecstatic-offload]').each((_, element) => {
      const $script = $(element);
      $script.attr('type', 'text/plain');
    });

    // Inject defer.js and initialization
    // Read defer.js content
    const deferJsPath = join(__dirname, '../../../node_modules/@shinsenter/defer.js/dist/defer.min.js');
    const deferJsContent = readFileSync(deferJsPath, 'utf8');

    // Create the defer.js script
    const deferJsScript = `<script data-ecstatic-ignore>
      ${deferJsContent}
      Defer.all('script[type="text/plain"][data-ecstatic-defer]');
      Defer.all('script[type="text/plain"][data-ecstatic-offload]', 0, true);
    </script>`;

    // Inject at the end of body
    const $body = $('body');
    if ($body.length > 0) {
      $body.append(deferJsScript);
    } else {
      // Fallback: try to inject at end of <html>
      const $html = $('html');
      if ($html.length > 0) {
        $html.append(deferJsScript);
      } else {
        // Last resort: append to the document
        $.root().append(deferJsScript);
      }
    }

    return {
      contents: $.html()
    };
  }
});