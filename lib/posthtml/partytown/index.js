// PostHTML plugin that (1) marks matching third-party scripts with
// type="text/partytown" so they will run from a web-worker, **and**
// (2) injects the Partytown bootstrap snippet into the <head> with
// Google Tag Manager forwarding enabled by default.
//
// Options:
//   host        – substring to look for when deciding if a <script> should be
//                 off-loaded. Defaults to Google Tag Manager host.
//   hosts       – array of substrings. If provided, it supersedes `host` and the
//                 built-in defaults (GTM + TrustedForm).
//   snippet     – *string*  If provided, this exact code will be injected
//                 (allows full user control).
//   partytown   – *object*  Configuration object passed to partytownSnippet()
//                 to build the snippet (ignored when `snippet` is given).
//                 Default includes GTM forwarding: { forward: ["dataLayer.push"] }
//
// Usage in .posthtmlrc:
//
//   ["posthtml-partytown", {
//     host: "https://www.googletagmanager.com",
//     partytown: { forward: ["dataLayer.push", "fbq"] }  // extends default GTM forwarding
//   }]
//
import { partytownSnippet } from "@qwik.dev/partytown/integration";

/**
 * @param {object} opts
 * @returns {(tree: import("posthtml").Node) => import("posthtml").Node}
 */
export default function partytown(opts = {}) {
    /**
 * Build the list of substrings that, when found in a script's src or inline
 * code, should cause the script to be off-loaded to Partytown.
 *
 * Priority:
 *   1. opts.hosts – explicit array overrides everything else.
 *   2. opts.host  – explicit single host.
 *   3. Built-in defaults (GTM + TrustedForm).
 */
    let matchHosts;
    if (Array.isArray(opts.hosts) && opts.hosts.length) {
        matchHosts = opts.hosts;
    } else if (typeof opts.host === "string") {
        matchHosts = [opts.host];
    } else {
        matchHosts = ["https://www.googletagmanager.com", "api.trustedform.com"];
    }

    // Resolve (once) the snippet text that will be injected.
    const config = {
        debug: false,
        forward: ["dataLayer.push"], ...(opts.partytown || {}),
        resolveUrl: function (url, location, type) {
            if (type === "script") {
                var proxyUrl = new URL("https://reverse-proxy-rhx1u.bunny.run/");
                proxyUrl.searchParams.append("url", url.href);
                return proxyUrl;
            }
            return url;
        },
    };
    const snippetText = partytownSnippet(config);

    return function (tree) {
        let injected = false;
        /* ------------------------------------------------------------------ *
         * 1.  Tag 3rd-party scripts with  type="text/partytown"
         * ------------------------------------------------------------------ */
        tree.match({ tag: "script" }, (node) => {
            // Skip if already handled.
            if (node.attrs?.type === "text/partytown") return node;

            let shouldOffload = false;

            // External script – check src attribute.
            if (node.attrs?.src) {
                shouldOffload = matchHosts.some((h) => node.attrs.src.includes(h));
            }

            // Inline script – search its contents.
            if (!shouldOffload && Array.isArray(node.content)) {
                const code = node.content.join("");
                shouldOffload = matchHosts.some((h) => code.includes(h));
            }

            if (shouldOffload) {
                node.attrs = { ...(node.attrs || {}), type: "text/partytown" };
            }
            return node;
        });

        /* ------------------------------------------------------------------ *
         * 2.  Inject the bootstrap snippet into <head>, once per document.
         * ------------------------------------------------------------------ */
        tree.match({ tag: "head" }, (head) => {
            const snippetNode = { tag: "script", attrs: { "data-ecstatic-ignore": "" }, content: [snippetText] };
            // Prepend so config + snippet come before any partytown scripts.
            head.content = [snippetNode, ...(head.content || [])];
            injected = true;

            return head;
        });

        // Fallback: if snippet not injected (e.g., no <head> tag was present),
        // try to inject at the start of <html>, and if that still doesn't work,
        // prepend to the root node array.
        if (!injected) {
            tree.match({ tag: "html" }, (html) => {
                const snippetNode = { tag: "script", attrs: { "data-ecstatic-ignore": "" }, content: [snippetText] };
                html.content = [snippetNode, ...(html.content || [])];
                injected = true;
                return html;
            });
        }
        if (!injected) {
            const snippetNode = { tag: "script", attrs: { "data-ecstatic-ignore": "" }, content: [snippetText] };
            if (Array.isArray(tree)) {
                tree.unshift(snippetNode);
            }
        }

        return tree;
    };
}
