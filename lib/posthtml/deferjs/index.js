// PostHTML plugin that (1) marks matching third-party scripts with
// type="text/plain" so they will be deferred using defer.js, **and**
// (2) injects the defer.js library inline at the end of HTML with
// activation call for deferred scripts.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
//
// Options:
//   host        – substring to look for when deciding if a <script> should be
//                 deferred. Defaults to Google Tag Manager host.
//   hosts       – array of substrings. If provided, it supersedes `host` and the
//                 built-in defaults (GTM + TrustedForm).
//   deferLibrary – *string* Custom defer.js library URL or inline code.
//                 Defaults to CDN version.
//   delay       – *number* Delay in milliseconds for Defer.all() call.
//                 Defaults to 0.
//   waitForUserAction – *boolean|number* Whether to wait for user interaction.
//                      Defaults to false.
//
// Usage in .posthtmlrc:
//
//   ["posthtml-deferjs", {
//     host: "https://www.googletagmanager.com",
//     delay: 1000,
//     waitForUserAction: true
//   }]
//

/**
 * @param {object} opts
 * @returns {(tree: import("posthtml").Node) => import("posthtml").Node}
 */
export default function deferjs(opts = {}) {
    /**
     * Build the list of substrings that, when found in a script's src or inline
     * code, should cause the script to be deferred with defer.js.
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

    // Build defer.js library content
    let deferLibraryContent;
    if (opts.deferLibrary) {
        // If user provides custom defer library, use it (could be URL or inline code)
        deferLibraryContent = opts.deferLibrary;
    } else {
        // Read defer.js from local node_modules
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const deferJsPath = join(__dirname, '../../../node_modules/@shinsenter/defer.js/dist/defer.min.js');
        deferLibraryContent = readFileSync(deferJsPath, 'utf8');
    }

    // Configure defer.js activation
    const delay = opts.delay || 0;
    const waitForUserAction = opts.waitForUserAction || true;

    // Build the activation script
    const activationScript = `
        // Defer.js activation for deferred scripts
        Defer.all('[type="text/plain"]', ${delay}, ${waitForUserAction});
    `.trim();

    return function (tree) {
        let injected = false;
        /* ------------------------------------------------------------------ *
         * 1.  Tag 3rd-party scripts with  type="text/plain"
         * ------------------------------------------------------------------ */
        tree.match({ tag: "script" }, (node) => {
            // Skip if already handled.
            if (node.attrs?.type === "text/plain") return node;

            // Skip scripts marked to be ignored
            if (node.attrs?.['data-ecstatic-ignore'] !== undefined) return node;

            let shouldDefer = false;

            // External script – check src attribute.
            if (node.attrs?.src) {
                shouldDefer = matchHosts.some((h) => node.attrs.src.includes(h));
            }

            // Inline script – search its contents.
            if (!shouldDefer && Array.isArray(node.content)) {
                const code = node.content.join("");
                shouldDefer = matchHosts.some((h) => code.includes(h));
            }

            if (shouldDefer) {
                node.attrs = { ...(node.attrs || {}), type: "text/plain" };
            }
            return node;
        });

        /* ------------------------------------------------------------------ *
         * 2.  Inject the defer.js library and activation at the end of HTML, once per document.
         * ------------------------------------------------------------------ */
        tree.match({ tag: "body" }, (body) => {
            // Inject defer.js library inline
            const libraryNode = {
                tag: "script",
                attrs: {
                    "data-ecstatic-ignore": ""
                },
                content: [deferLibraryContent]
            };

            // Inject activation script
            const activationNode = {
                tag: "script",
                attrs: { "data-ecstatic-ignore": "" },
                content: [activationScript]
            };

            // Append to the end of body so scripts load after all deferred content.
            body.content = [...(body.content || []), libraryNode, activationNode];
            injected = true;

            return body;
        });

        // Fallback: if not injected (e.g., no <body> tag was present),
        // try to inject at the end of <html>, and if that still doesn't work,
        // append to the root node array.
        if (!injected) {
            tree.match({ tag: "html" }, (html) => {
                const libraryNode = {
                    tag: "script",
                    attrs: {
                        "data-ecstatic-ignore": ""
                    },
                    content: [deferLibraryContent]
                };
                const activationNode = {
                    tag: "script",
                    attrs: { "data-ecstatic-ignore": "" },
                    content: [activationScript]
                };
                html.content = [...(html.content || []), libraryNode, activationNode];
                injected = true;
                return html;
            });
        }
        if (!injected) {
            const libraryNode = {
                tag: "script",
                attrs: {
                    "data-ecstatic-ignore": ""
                },
                content: [deferLibraryContent]
            };
            const activationNode = {
                tag: "script",
                attrs: { "data-ecstatic-ignore": "" },
                content: [activationScript]
            };
            if (Array.isArray(tree)) {
                tree.push(libraryNode);
                tree.push(activationNode);
            }
        }

        return tree;
    };
}