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

      ],
      "content_include": [

      ]
    },
    "offload": {
      "when": "always",
      "src_include": [
        /.*bootstrap.min.js.*/,
        /.*googletagmanager.com.*/,
        /.*weglot.*/
      ],
      "content_include": [
        /.*gtag\(.*/,
        /.*Weglot.*/,
        /.*bootstrap.esm.*/,
        /.*googletagmanager.com.*/
      ]
    }
  }
};
