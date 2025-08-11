import { Transformer } from '@parcel/plugin';
import * as cheerio from 'cheerio';
import { loadEcstaticConfig } from '../../utils/config.js';

export default new Transformer({
  async transform({ asset }) {
    // Only process HTML assets
    if (asset.type !== 'html') {
      return [asset];
    }

    const html = await asset.getCode();
    const $ = cheerio.load(html);

    // Get offload/defer patterns from configuration
    const config = await loadEcstaticConfig();
    const offloadPatterns = config.htmlDefer?.offloadPatterns || [];
    const deferPatterns = config.htmlDefer?.deferPatterns || [];

    const assets = [asset];

    // Process all script tags
    $('script').each((_, element) => {
      const $script = $(element);
      const type = $script.attr('type');
      const src = $script.attr('src');
      const id = $script.attr('id');

      // Skip scripts marked to be ignored
      if ($script.attr('data-ecstatic-ignore') !== undefined) {
        return;
      }

      // Skip scripts with non-JavaScript types
      if (type && type !== 'text/javascript' && type !== 'module') {
        return;
      }

      // Check if this script should be offloaded to PartyTown
      let shouldOffload = false;

      // Check external scripts
      if (src) {
        shouldOffload = offloadPatterns.some(pattern => src.includes(pattern));
      }

      // Check ids
      if (id && !shouldOffload) {
        shouldOffload = offloadPatterns.some(pattern => id.includes(pattern));
      }

      // Check inline scripts
      if (!shouldOffload) {
        const scriptContent = $script.html();
        if (scriptContent) {
          shouldOffload = offloadPatterns.some(pattern => scriptContent.includes(pattern));
        }
      }

      // Check if this script should be deferred with Defer.js (opt-in)
      let shouldDefer = false;

      if (!shouldOffload) {
        // Check external scripts
        if (src) {
          shouldDefer = deferPatterns.some(pattern => src.includes(pattern));
        }

        // Check ids
        if (id && !shouldDefer) {
          shouldDefer = deferPatterns.some(pattern => id.includes(pattern));
        }

        // Check inline scripts
        if (!shouldDefer) {
          const scriptContent = $script.html();
          if (scriptContent) {
            shouldDefer = deferPatterns.some(pattern => scriptContent.includes(pattern));
          }
        }
      }

      // Mark scripts for offloading or deferring (will be processed by the optimizer)
      if (shouldOffload) {
        if (type === 'module') {
          // Preserve original module type for later handling
          $script.attr('data-type', 'module');
        }
        $script.attr('data-ecstatic-offload', '');
        $script.removeAttr('async');
        $script.attr('defer', '');
      } else if (shouldDefer) {
        if (type === 'module') {
          // Preserve original module type for later handling
          $script.attr('data-type', 'module');
        }
        $script.attr('data-ecstatic-defer', '');
      } else {
        // Default: do not modify the script
      }

      return;
    });

    // Update the asset with the modified HTML
    asset.setCode($.html());

    return assets;
  }
});
