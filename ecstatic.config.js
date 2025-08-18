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
        depth: 99999,
        method: 'siteone',
        timeout: 10,
        proxy: 'https://jerry:Jerry1999@5.78.119.93:8888',

        siteone: {
            workers: 3,
            maxReqsPerSec: 3,
            memoryLimit: '2048M',

            includeRegex: [],
            ignoreRegex: ['/.*\\/wp-json\\/.*/i', '/.*\\?p=.*/i'],
            ignoreRobotsTxt: true,
            offlineExportNoAutoRedirectHtml: false,
            offlineExportRemoveUnwantedCode: 1
        }
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
