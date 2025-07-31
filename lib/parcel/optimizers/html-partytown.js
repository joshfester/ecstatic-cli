import { Optimizer } from '@parcel/plugin';
import { partytownSnippet } from '@qwik.dev/partytown/integration';
import * as cheerio from 'cheerio';

export default new Optimizer({
  async optimize({ contents, bundle }) {
    // Only process HTML bundles
    if (bundle.type !== 'html') {
      return { contents };
    }

    const html = typeof contents === 'string' ? contents : contents.toString();
    const $ = cheerio.load(html);

    // PartyTown configuration
    const partytownConfig = {
      debug: true,
      forward: ["dataLayer.push"],
      resolveUrl: function (url, location, type) {
        if (type === "script") {
          var proxyUrl = new URL("https://reverse-proxy-rhx1u.bunny.run/");
          proxyUrl.searchParams.append("url", url.href);
          return proxyUrl;
        }
        return url;
      },
    };

    const snippetText = partytownSnippet(partytownConfig);
    let shouldInjectSnippet = false;

    // Find scripts marked with data-partytown and convert to type="text/partytown"
    $('script[data-partytown]').each((index, element) => {
      const $script = $(element);
      
      // Convert data-partytown to type="text/partytown"
      $script.attr('type', 'text/partytown');
      $script.removeAttr('data-partytown');
      
      shouldInjectSnippet = true;
    });

    // Inject PartyTown bootstrap snippet if needed
    if (shouldInjectSnippet) {
      const snippetScript = `<script data-ecstatic-ignore defer>${snippetText}</script>`;
      
      const $head = $('head');
      if ($head.length > 0) {
        $head.prepend(snippetScript);
      } else {
        // Fallback: try to inject at start of <html>
        const $html = $('html');
        if ($html.length > 0) {
          $html.prepend(snippetScript);
        } else {
          // Last resort: prepend to body
          $('body').prepend(snippetScript);
        }
      }
    }

    return {
      contents: $.html()
    };
  }
});