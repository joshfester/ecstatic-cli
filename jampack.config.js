export default {
  "css": {
    "inline_critical_css": true
  },
  "image": {
    "max_width": 1900
  },
  "js": {
    "compressor": "esbuild",
    "defer": {
      "when": "always",
      "src_include": [
        /.*client-registry\.mutinycdn\.com.*/,
        /.*wp-content\/themes\/americor-v2\/dist\/\js\/app\..*/,
        /.*toolkit\.americor\.com.*/,
        /.*plugins\/weglot.*/
      ],
      "content_include": [

      ]
    },
    "offload": {
      "when": "always",
      "src_include": [
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
      "content_include": [
        /.*gtag\(.*/,
        /.*wt.alcmpn.com.*/,
        /.*blogherads.*/,
        /.*createElement\(.*/,
        /.*cdn.native.ai.*/,
        /.*score.open-up.io.*/,
        /.*\$\(document\).ready.*/
      ]
    }
  }
};
