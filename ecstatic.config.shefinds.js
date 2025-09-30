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
            ignoreRegex: [/.*\/wp-json\/.*/i, /.*\?p=.*/i],
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
                    /.*client-registry\.mutinycdn\.com.*/,
                    /.*wp-content\/themes\/americor-v2\/dist\/\js\/app\..*/,
                    /.*toolkit\.americor\.com.*/,
                    /.*plugins\/weglot.*/,
                ],
                content_include: [

                ],
            },
            offload: {
                when: 'always',
                src_include: [
                    /.*bc.marfeelcache.com.*/,
                    /.*query.min.js.*/,
                    /.*googletagmanager.com.*/,
                    /.*blogherads.*/,
                    /.*bootstrap.min.js.*/,
                    /.*lightboxcdn.com.*/,
                    /.*wp-content\/themes\/shefinds_14\/js\/min.*/,
                    /.*amazon-adsystem.com.*/,
                    /.*sellwild.com\.*/
                ],
                content_include: [
                    /.*gtag\(.*/,
                    /.*wt.alcmpn.com.*/,
                    /.*blogherads.*/,
                    /.*createElement\(.*/,
                    /.*cdn.native.ai.*/,
                    /.*score.open-up.io.*/,
                    /.*\$\(document\).ready.*/,
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
