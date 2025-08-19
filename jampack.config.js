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
      "content_include": [
        /.*window\.dataLayer.*/,
        /.*posthog\.com.*/,
        /.*wp\.i18n\.setLocaleData.*/,
        /.*var wpcf7.*/
      ]
    },
    "offload": {
      "when": "always",
      "src_include": [
        /.*cdn.jsdelivr.net.*/
      ],
      "content_include": [
        /.*document.getElementById.*/
      ]
    }
  }
};
