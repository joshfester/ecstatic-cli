export default {
    // Directory paths
    paths: {
        scraped: './scraped',
        distParcel: './dist-parcel',
        distJampack: './dist-jampack',
        dist: './dist'
    },

    // Scraping configuration
    scrape: {
        depth: 3,
        method: 'httrack', // 'httrack' or 'wget'
        timeout: 10,
        sockets: 16,

        // HTTrack-specific configuration
        httrack: {
            debugLog: false,
            near: true,
            stay: true, // -a flag
            both: true, // -B flag
            structure: 4, // N4 structure
            keepLinks: 0,
            robots: 0,
            connections: 20,
            updatehack: true,
            mirror: true,
            cache: 2,
            excludeAll: true, // Add '-*' to exclude everything first

            // Filter patterns for httrack
            // These are applied in order: excludes first, then includes
            // Use {domain} placeholder for automatic domain substitution
            filters: [
                '-*', // Exclude everything first
                '+*{domain}/*.css', // Include CSS files from domain
                '+*{domain}/*.js', // Include JS files from domain
                '+*{domain}/apply/', // Include /apply/ path from domain
                '+*{domain}/_image*', // Include image patterns from domain
                '+*mage.mux.com*' // Include external CDN (mux.com for videos)
            ]
        },

        // Wget-specific configuration
        wget: {
            recursive: true,
            pageRequisites: true,
            adjustExtension: true,
            convertLinks: true,
            restrictFileNames: 'windows',
            noParent: true
        },
        extraFiles: [
            {
                url: "https://www.americanrelief.org/_astro/bootstrap.esm.BNVzI9OA.js",
                prefix: "/web/js"
            },
            {
                url: "https://www.americanrelief.org/_astro/077.astro_astro_type_script_index_0_lang.BBliHKjh.js",
                prefix: "/web/js"
            },
            {
                url: "https://www.americanrelief.org/_astro/lottie.BapSpgza.js",
                prefix: "/web/js"
            },
            {
                url: "https://www.americanrelief.org/_astro/lottie_light.CgpOreIb.js",
                prefix: "/web/js"
            },
            {
                url: "https://www.americanrelief.org/_astro/_commonjsHelpers.CqkleIqs.js",
                prefix: "/web/js"
            },
            /*{
                url: "https://www.americanrelief.org/_astro/075.astro_astro_type_script_index_0_lang.DrxwnLMJ.js",
                prefix: "./scraped/web/js"
            },
            {
                url: "https://www.americanrelief.org/_astro/_commonjsHelpers.CsCfRhM5.js",
                prefix: "./scraped/web/js"
            }*/
        ]
    },

    // Build configuration
    build: {
        parcel: {
            cache: true,
            minify: true
        }
    },

    // Optimization configuration
    optimize: {
        jampack: {
            enabled: true
        }
    },

    // HTML defer configuration
    htmlDefer: {

        // Patterns to match scripts that should be offloaded to PartyTown
        // These can be domain names, API endpoints, or code snippets
        offloadPatterns: [
            "googletagmanager.com",
            "window.dataLayer",
            "client-registry.mutinycdn.com",
            "wp-weglot-js-js",
            "widget.trustpilot.com",
            "posthog.com",
            "email-decode.min.js",
            "wp-hooks-js",
            "wp-i18n-js",
            "wp-i18n-js-after",
            "swv-js",
            "contact-form-7-js-before",
            "contact-form-7-js",
            "google.com/recaptcha",
            "wp-polyfill-js",
            "wpcf7-recaptcha-js-before",
            "wpcf7-recaptcha-js"
        ],

        // Patterns to match scripts that should be deferred with Defer.js (opt-in)
        // If empty or omitted, no scripts will be modified by default.
        // These can be domain names, paths, or inline code snippets to match.
        deferPatterns: [

        ]
    },

    // Deployment configuration
    deploy: {
        bunny: {
            // Fill these in with your BunnyCDN credentials
            accessKey: '1fda9529-c2ff-43cd-b0c4303916db-37cd-452e',
            globalApiKey: 'bb9baacc-200d-4ce9-abb3-28f72ad350b690e0ed11-8f18-4302-9c31-b4ff3bad0fcf',
            storageZone: 'americor',
            region: '', // Optional: e.g., 'ny' for New York
            purgeUrl: 'https://americor.b-cdn.net/' // Your CDN URL to purge
        }
    },

    // Logging configuration
    logging: {
        level: 'info' // 'silent', 'error', 'warning', 'info', 'debug'
    },

    // Environment-specific overrides
    $development: {
        logging: {
            level: 'debug'
        },
        build: {
            parcel: {
                minify: false
            }
        }
    },

    $production: {
        logging: {
            level: 'info'
        },
        optimize: {
            jampack: {
                enabled: true
            }
        }
    }
};
