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

    // Get offload patterns from configuration
    const config = await loadEcstaticConfig();
    const offloadPatterns = config.htmlDefer?.offloadPatterns || [];

    const assets = [asset];

    // Process all script tags
    $('script').each((_, element) => {
      const $script = $(element);
      const type = $script.attr('type');
      const src = $script.attr('src');
      const dataEcstaticIgnore = $script.attr('data-ecstatic-ignore');

      // Skip scripts marked to be ignored
      if (dataEcstaticIgnore !== undefined) {
        return;
      }

      // Skip scripts with non-JavaScript types
      if (type && type !== 'text/javascript' && type !== 'module') {
        return;
      }
      else if (type === 'module') {
        $script.attr('data-type', 'module');
      }

      // Check if this script should be offloaded to PartyTown
      let shouldOffload = false;

      // Check external scripts
      if (src) {
        shouldOffload = offloadPatterns.some(pattern => src.includes(pattern));
      }

      // Check inline scripts
      if (!shouldOffload) {
        const scriptContent = $script.html();
        if (scriptContent) {
          shouldOffload = offloadPatterns.some(pattern => scriptContent.includes(pattern));
        }
      }

      // Mark scripts for offloading or deferring (will be processed by the optimizer)
      if (shouldOffload) {
        $script.attr('data-ecstatic-offload', '');
        $script.removeAttr('defer');
        $script.attr('async', '');
      }
      else {
        $script.attr('data-ecstatic-defer', '');
      }

      return;
    });

    // Update the asset with the modified HTML
    asset.setCode($.html());

    return assets;
  }
});