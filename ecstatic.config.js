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
                ],
                content_include: [

                ],
            },
            offload: {
                when: 'always',
                src_include: [
                    /.*bootstrap.min.js.*/,
                    /.*googletagmanager.com.*/,
                    /.*weglot.*/,
                ],
                content_include: [
                    /.*gtag\(.*/,
                    /.*Weglot.*/,
                    /.*bootstrap.esm.*/,
                    /.*googletagmanager.com.*/
                ],
            },
        }
    },

    // Deployment configuration
    deploy: {
        bunny: {
            // Fill these in with your BunnyCDN credentials
            accessKey: '9cb2f654-964d-4121-a53ff8722a7e-a8b1-402c',
            globalApiKey: 'bb9baacc-200d-4ce9-abb3-28f72ad350b690e0ed11-8f18-4302-9c31-b4ff3bad0fcf',
            storageZone: 'americor-dev',
            region: '', // Optional: e.g., 'ny' for New York
            purgeUrl: 'https://americor-dev.b-cdn.net/' // Your CDN URL to purge
        }
    }
};
