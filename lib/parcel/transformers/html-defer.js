import { Transformer } from '@parcel/plugin';
import * as cheerio from 'cheerio';

export default new Transformer({
  async transform({ asset }) {
    // Only process HTML assets
    if (asset.type !== 'html') {
      return [asset];
    }

    const html = await asset.getCode();
    const $ = cheerio.load(html);

    // Host patterns for PartyTown tagging (matching the original plugin)
    const matchHosts = [
      "googletagmanager.com",
      "window.dataLayer",
      "api.trustedform.com",
      "trustpilot.com",
      "posthog.com"
    ];

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
      if (type && type !== 'text/javascript') {
        return;
      }

      // Check if this script should be offloaded to PartyTown
      let shouldOffload = false;

      // Check external scripts
      if (src) {
        shouldOffload = matchHosts.some(host => src.includes(host));
      }

      // Check inline scripts
      if (!shouldOffload) {
        const scriptContent = $script.html();
        if (scriptContent) {
          shouldOffload = matchHosts.some(host => scriptContent.includes(host));
        }
      }

      $script.removeAttr('async');
      $script.removeAttr('defer');

      // Mark scripts for offloading or deferring (will be processed by the optimizer)
      if (shouldOffload) {
        $script.attr('data-ecstatic-offload', '');
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