export default {
    // Directory paths
    paths: {
        scraped: './scraped',
        dist: './dist'
    },

    // Scraping configuration
    scrape: {
        depth: 99999,
        method: 'siteone',
        timeout: 10,
        proxy: 'https://jerry:Jerry1999@5.78.70.195:8888',

        siteone: {
            workers: 3,
            maxReqsPerSec: 3,
            memoryLimit: '2048M',

            includeRegex: [],
            ignoreRegex: [/.*\/wp-json\/.*/i, /.*\?p=.*/i, /.*\/cdn-cgi\/.*/i],
            ignoreRobotsTxt: true,
            offlineExportNoAutoRedirectHtml: true,
            offlineExportRemoveUnwantedCode: 1
        }
    },

    // Optimization configuration
    optimize: {
        js: {
            compressor: 'esbuild',
            defer: {
                when: 'always',
                src_include: [
                    /.*googletagmanager\.com.*/,
                    /.*client-registry\.mutinycdn\.com.*/,
                    /.*plugins\/weglot.*/,
                    /.*widget\.trustpilot\.com.*/,
                    /.*email-decode\.min\.js.*/,
                    /.*wp-includes\/js\/dist\/hooks.*/,
                    /.*wp-includes\/js\/dist\/i18n.*/,
                    /.*wp-content\/plugins\/contact-form-7.*/,
                    /.*google\.com\/recaptcha.*/,
                    /.*wp-includes\/js\/dist\/vendor\/wp-polyfill.*/
                ],
                content_include: [
                    /.*window\.dataLayer.*/,
                    /.*posthog\.com.*/,
                    /.*wp\.i18n\.setLocaleData.*/,
                    /.*var wpcf7.*/
                ],
            },
            offload: {
                when: 'always',
                src_include: [
                    /.*cdn.jsdelivr.net.*/
                ],
                content_include: [
                    /.*document.getElementById.*/
                ],
            },
        }
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
    }
};
