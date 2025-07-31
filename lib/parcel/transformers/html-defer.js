import { Transformer } from '@parcel/plugin';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default new Transformer({
  async transform({ asset, options }) {
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
    let scriptIndex = 0;

    // Process all script tags
    $('script').each((index, element) => {
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

      // Mark scripts for PartyTown (will be processed by the optimizer)
      if (shouldOffload) {
        $script.attr('data-partytown', 'true');
        $script.removeAttr('async');
        return; // Don't defer PartyTown scripts
      }

      // Handle external scripts - add defer and remove async
      if (src) {
        $script.attr('defer', '');
        $script.removeAttr('async');
        return;
      }

      // Handle inline scripts - externalize them
      const scriptContent = $script.html();
      if (scriptContent && scriptContent.trim()) {
        // Create unique filename for this inline script
        const scriptFilename = `inline-script-${scriptIndex++}.js`;

        // Write script to the source directory so Parcel can find it
        const sourceDir = join(process.cwd(), 'scraped/web');
        const scriptPath = join(sourceDir, scriptFilename);

        // Write the script content directly to the filesystem
        // This bypasses Parcel's module system entirely
        writeFileSync(scriptPath, scriptContent, 'utf8');

        // Replace inline script with external script reference
        $script.attr('src', `./${scriptFilename}`);
        $script.attr('defer', '');
        $script.attr('type', 'text/javascript');
        $script.removeAttr('async');
        $script.html('');
      }
    });

    // Update the asset with the modified HTML
    asset.setCode($.html());

    return assets;
  }
});