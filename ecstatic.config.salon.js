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
    sockets: 16
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
      "api.trustedform.com",
      "trustpilot.com",
      "posthog.com",
      "vi.ml314.com", // salon
      "ml314.com/tag", //salon
      "fundingchoicesmessages.google.com", // salon
      "connect.facebook.net", // salon
      "static.chartbeat.com", // salon
      "accounts.google.com", // salon
      "www.google-analytics.com", // salon
      "ga(", // salon 
    ],

    // Patterns to match scripts that should be deferred with Defer.js (opt-in)
    // If empty or omitted, no scripts will be modified by default.
    // These can be domain names, paths, or inline code snippets to match.
    deferPatterns: [
      "https://htlbid.com",
      "homepage-salon-js"
    ]
  },

  // Deployment configuration
  deploy: {
    bunny: {
      // Fill these in with your BunnyCDN credentials
      accessKey: '1a2d7dbf-a1b5-4828-a84ee08ca35d-240f-4ac0',
      globalApiKey: 'bb9baacc-200d-4ce9-abb3-28f72ad350b690e0ed11-8f18-4302-9c31-b4ff3bad0fcf',
      storageZone: 'salon',
      region: '', // Optional: e.g., 'ny' for New York
      purgeUrl: 'https://ecs-salon.b-cdn.net/' // Your CDN URL to purge
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
