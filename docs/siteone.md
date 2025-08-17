# Offline Website Generator (clone, mirror) • SiteOne Crawler
*   will help you **export the entire website** to offline form, where it is possible to browse the site through local HTML files (without HTTP server) including all document, images, styles, scripts, fonts, etc.
*   you can **limit what assets** you want to download and export (see [`--disable-all-assets`](about:/configuration/command-line-options/#--disable-all-assets) and other `--disable-*` directives) .. for some types of websites the best result is with the [`--disable-javascript`](about:/configuration/command-line-options/#--disable-javascript) option.
*   you can specify by [`--allowed-domain-for-external-files`](about:/configuration/command-line-options/#--allowed-domain-for-external-files) from which **external domains** it is possible to **download** assets (JS, CSS, fonts, images, documents) including `*` option for all domains.
*   you can specify by [`--allowed-domain-for-crawling`](about:/configuration/command-line-options/#--allowed-domain-for-crawling) which **other domains** should be included in the **crawling** if there are any links pointing to them. You can enable e.g. `mysite.*` to export all language mutations that have a different TLD or `*.mysite.tld` to export all subdomains.
*   you can try [`--disable-styles`](about:/configuration/command-line-options/#--disable-styles) and [`--disable-fonts`](about:/configuration/command-line-options/#--disable-fonts) and see how well you handle **accessibility** and **semantics**
*   you can use it to **export your website to a static form** and host it on GitHub Pages, Netlify, Vercel, etc. as a static backup and part of your **disaster recovery plan** or **archival/legal needs**
*   works great with **older conventional websites** but also **modern ones**, built on frameworks like Next.js, Nuxt.js, SvelteKit, Astro, Gatsby, etc. When a JS framework is detected, the export also performs some framework-specific code modifications for optimal results. For example, most frameworks can’t handle the relative location of a project and linking assets from root `/`, which doesn’t work with `file://` mode.
*   **try it** for your website, and you will be very pleasantly surprised :-)
*   roadmap: we are also planning to release a version of the export compatible with **Nginx** that will preserve all original URLs for your website and allow you to host it on your own infrastructure.
*   you can use [`--offline-export-remove-unwanted-code`](about:/configuration/command-line-options/#--offline-export-remove-unwanted-code) (default is 1) to remove unwanted code for offline mode - typically, JS of the analytics, social networks, cookie consent, cross origins, etc.
*   you can use [`--offline-export-no-auto-redirect-html`](about:/configuration/command-line-options/#--offline-export-no-auto-redirect-html) which disables the generation of automatic sub-folder.html with meta redirects to sub-folder/index.html.
*   you can use [`--replace-content`](about:/configuration/command-line-options/#--replace-content) option to replace content in HTML/JS/CSS before saving to disk (with strict text & regexp support). Can be specified multiple times.
*   you can use [`--replace-query-string`](about:/configuration/command-line-options/#--replace-query-string) to replace the default behavior where the query string is replaced by a short hash constructed from the query string in filenames. You can use simple format `foo -> bar` or regexp in PREG format, e.g. `'/([a-z]+)=([^&]*)(&|$)/i -> $1__$2'`. Can be specified multiple times.
*   you can use [`--ignore-store-file-error`](about:/configuration/command-line-options/#--ignore-store-file-error) to ignore any file storing errors. The export process will continue.

💡Further development ideas
---------------------------

[Section titled “💡Further development ideas”](#further-development-ideas)

In the future we would like to extend support for some specific JS frameworks. In the case of conventional websites, where only the backend generates HTML, this works reliably. Some modern JS frameworks, even if they have SSR (server-side rendering), still modify the HTML in various ways after the page is displayed - replacing links in it, etc.

SiteOne Crawler can handle a lot of these situations today (e.g. in the form of path substitution in JS code, or generating URL prefixes to composite JS chunk paths), but it’s not perfect.

The ideal would be to generate these pages using headless browsers - but this would make the application stack much more complex and the whole process much slower. Now processing one HTML takes a millisecond, then it would be seconds.



# Command-line options • SiteOne Crawler


* Parameter: --url
  * Description: Required. HTTP or HTTPS URL address of the website or sitemap xml to be crawled. If you only provide a domain name without a scheme, https:// will be added automatically. Use quotation marks if the URL contains query parameters.
  * Default: 
* Parameter: --single-page
  * Description: Load only one page to which the URL is given (and its assets), but do not follow other pages.
  * Default: 
* Parameter: --max-depth
  * Description: Maximum crawling depth (for pages, not assets). Default is 0 (no limit). 1 means /about or /about/, 2 means /about/contacts etc.
  * Default: 0
* Parameter: --device
  * Description: Device type for choosing a predefined User-Agent. Ignored when —user-agent is defined. Supported values: desktop, tablet, mobile. Ignored with --user-agent.
  * Default: desktop
* Parameter: --user-agent
  * Description: Override User-Agent selected by --device. Custom User-Agent header. Use quotation marks. If you add ! at the end, the siteone-crawler/version will not be added as a signature at the end of the final user-agent.
  * Default: 
* Parameter: --timeout
  * Description: Request timeout (in seconds).
  * Default: 5
* Parameter: --proxy
  * Description: HTTP proxy to use in host:port format. Host can be hostname, IPv4 or IPv6..
  * Default: 
* Parameter: --http-auth
  * Description: Basic HTTP authentication in username:password format.
  * Default: 
* Parameter: --help
  * Description: Show help and exit.
  * Default: 
* Parameter: --version
  * Description: Show crawler version and exit.
  * Default: 




* Parameter: --output
  * Description: Console output type. Supported values: text or json. The JSON output displays only one-line progress on STDERR during crawling and at the end generates JSON on STDOUT with crawling details.
  * Default: text
* Parameter: --extra-columns
  * Description: Comma delimited list of extra columns added to output table. It is possible to specify HTTP header names (e.g. X-Cache) or predefined Title, Keywords, Description or DOM for the number of DOM elements found in the HTML. You can set the expected length of the column in parentheses and > for do-not-truncate - e.g. DOM(6),X-Cache(10),Title(40>),Description(50>). For custom extraction, use the format Custom_column_name=method:pattern#group(length), where method is xpath or regexp, pattern is the extraction pattern, an optional #group specifies the capturing group (or node index for XPath) to return (defaulting to the entire match or first node), and an optional (length) sets the maximum output length (append > to disable truncation). For example, use Heading1=xpath://h1/text()(20>) to extract the text of the first H1 element from the HTML document, and ProductPrice=regexp:/Price:\s*\$?(\d+(?:\.\d{2})?)/i#1(10) to extract a numeric price (e.g., “29.99”) from a string like “Price: $29.99”.
  * Default: 
* Parameter: --url-column-size
  * Description: Basic URL column width. By default, it is calculated from the size of your terminal window.
  * Default: 
* Parameter: --rows-limit
  * Description: Max. number of rows to display in tables with analysis results (protection against very long and slow report). Default value is 200.
  * Default: 200
* Parameter: --timezone
  * Description: Timezone for datetimes in HTML reports and timestamps in output folders/files, e.g., Europe/Prague. Default is UTC. Available values can be found at Timezones Documentation.
  * Default: UTC
* Parameter: --show-inline-criticals
  * Description: Show criticals from the analyzer directly in the URL table.
  * Default: 
* Parameter: --show-inline-warnings
  * Description: Show warnings from the analyzer directly in the URL table.
  * Default: 
* Parameter: --do-not-truncate-url
  * Description: In the text output, long URLs are truncated by default to --url-column-size so the table does not wrap due to long URLs. With this option, you can turn off the truncation.
  * Default: 
* Parameter: --show-scheme-and-host
  * Description: On text output, show scheme and host also for origin domain URLs.
  * Default: 
* Parameter: --hide-progress-bar
  * Description: Hide progress bar visible in text and JSON output for more compact view.
  * Default: 
* Parameter: --no-color
  * Description: Disable colored output.
  * Default: 
* Parameter: --force-color
  * Description: Force colored output regardless of support detection.
  * Default: 




* Parameter: --upload
  * Description: Enable HTML report upload to --upload-to.
  * Default Value: 
* Parameter: --upload-to
  * Description: URL of the endpoint where to send the HTML report.
  * Default Value: https://crawler.siteone.io/up
* Parameter: --upload-retention
  * Description: How long should the HTML report be kept in the online version? Values: 1h / 4h / 12h / 24h / 3d / 7d / 30d / 365d / forever.
  * Default Value: 30d
* Parameter: --upload-password
  * Description: Optional password, which must be entered (the user will be crawler) to display the online HTML report.
  * Default Value: 
* Parameter: --upload-timeout
  * Description: Upload timeout in seconds.
  * Default Value: 3600


See [Online HTML report (upload)](https://crawler.siteone.io/features/online-html-report-upload/) for more information.

Resource Filtering
------------------

[Section titled “Resource Filtering”](#resource-filtering)

For example, it is very useful to disable JavaScript on modern websites, e.g. on React with NextJS, which have SSR, so they work fine without JavaScript from the point of view of content browsing and navigation.

It is particularly useful to disable JavaScript in the case of exporting websites built e.g. on React to offline form (without HTTP server), where it is almost impossible to get the website to work from any location on the disk only through the `file://` protocol.



* Parameter: --disable-all-assets
  * Description: Disables crawling of all assets and files and only crawls pages in href attributes. Shortcut for calling all other --disable-* flags.
  * Default: 
* Parameter: --disable-javascript
  * Description: Disables JavaScript downloading and removes all JavaScript code from HTML, including onclick and other on* handlers.
  * Default: 
* Parameter: --disable-styles
  * Description: Disables CSS file downloading and at the same time removes all style definitions by <style> tag or inline by style attributes.
  * Default: 
* Parameter: --disable-fonts
  * Description: Disables font downloading and also removes all font/font-face definitions from CSS.
  * Default: 
* Parameter: --disable-images
  * Description: Disables downloading of all images and replaces found images in HTML with placeholder image only.
  * Default: 
* Parameter: --disable-files
  * Description: Disables downloading of any files (typically downloadable documents) to which various links point.
  * Default: 


Advanced Crawler Settings
-------------------------

[Section titled “Advanced Crawler Settings”](#advanced-crawler-settings)



* Parameter: --workers / -w
  * Description: Maximum number of concurrent workers (threads). Crawler will not make more simultaneous requests to the server than this number. Use carefully! A high number of workers can cause a DoS attack.
  * Default: 3 (1 on Windows)
* Parameter: --max-reqs-per-sec / -rps
  * Description: Max requests/s for the whole crawler and all workers. Use carefully! A high number of workers can cause a DoS attack.
  * Default: 10
* Parameter: --memory-limit
  * Description: Memory limit in units M (Megabytes) or G (Gigabytes). If you crawl large website and you are encountering out of memory error, we recommend setting --result-storage=file.
  * Default: 2048M
* Parameter: --resolve
  * Description: The ability to force the domain+port to resolve to its own IP address, just like CURL —resolve does. Example: --resolve='www.mydomain.tld:80:127.0.0.1'. Can be specified multiple times.
  * Default: 
* Parameter: --allowed-domain-for-external-files
  * Description: Allows you to enable the domain (domains via multiple definitions) from which the crawler can download static external files (JS, CSS, fonts, images, etc). You can enable all via *, or *.my-domain.tld. Otherwise, only the file from the same domain will be downloaded.
  * Default: 
* Parameter: --allowed-domain-for-crawling
  * Description: Allows crawling of content from other linked domains. Useful e.g. for traversing *.my-domain.tld subdomains or other TLD-driven language mutations *.my-domain.*. If you set *, you are crazy and can start crawling the entire internet (based on external links on your website).
  * Default: 
* Parameter: --single-foreign-page
  * Description: If crawling of other domains is allowed (using --allowed-domain-for-crawling), it ensures that when another domain is not on same second-level domain, only that linked page and its assets are crawled from that foreign domain.
  * Default: 
* Parameter: --include-regex
  * Description: PCRE-compatible regular expression with for URLs that should be included. Argument can be specified multiple times. Example: --include-regex='/^\/public\//'
  * Default: 
* Parameter: --ignore-regex
  * Description: PCRE-compatible regular expression for URLs that should be ignored. Argument can be specified multiple times. Example: --ignore-regex='/^.*\/downloads\/.*\.pdf$/i'
  * Default: 
* Parameter: --regex-filtering-only-for-pages
  * Description: Set if you want filtering by *-regex rules apply only to page URLs, but static assets (JS, CSS, images, fonts, documents) have to be loaded regardless of filtering. Useful where you want to filter only /sub-pages/ by --include-regex='/\/sub-pages\//', but assets have to be loaded from any URLs.
  * Default: 
* Parameter: --analyzer-filter-regex
  * Description: PCRE-compatible regular expression applied to Analyzer class names for analyzers filtering. Example: /(content|accessibility)/i or /^(?:(?!best|access).)*$/i for all analyzers except BestPracticesAnalyzer and AccessibilityAnalyzer.
  * Default: 
* Parameter: --accept-encoding
  * Description: Custom Accept-Encoding request header.
  * Default: gzip, deflate, br
* Parameter: --remove-query-params
  * Description: Remove query parameters from found URLs. Useful on websites where a lot of links are made to the same pages, only with different irrelevant query parameters.
  * Default: 
* Parameter: --add-random-query-params
  * Description: Adds several random query parameters to each URL. With this, it is possible to bypass certain forms of server and CDN caches.
  * Default: 
* Parameter: --ignore-robots-txt
  * Description: Should robots.txt content be ignored? Useful for crawling an otherwise internal/private/unindexed site.
  * Default: 
* Parameter: --max-queue-length
  * Description: The maximum length of the waiting URL queue. Increase in case of large websites, but expect higher memory requirements.
  * Default: 9000
* Parameter: --max-visited-urls
  * Description: The maximum number of the visited URLs. Increase in case of large websites, but expect higher memory requirements.
  * Default: 10000
* Parameter: --max-skipped-urls
  * Description: The maximum number of the skipped URLs. Increase in case of large websites, but expect higher memory requirements. Default is 10000.
  * Default: 10000
* Parameter: --max-url-length
  * Description: The maximum supported URL length in chars. Increase in case of very long URLs, but expect higher memory requirements.
  * Default: 2083
* Parameter: --max-non200-responses-per-basename
  * Description: Protection against looping with dynamic non-200 URLs. If a basename (the last part of the URL after the last slash) has more non-200 responses than this limit, other URLs with same basename will be ignored/skipped. Default is 5.
  * Default: 5




* Parameter: --result-storage
  * Description: Result storage type for content and headers cache. Values: memory or file. Use file for large websites and lower memory consumption. See Caching section.
  * Default: memory
* Parameter: --result-storage-dir
  * Description: Directory for --result-storage=file.
  * Default: tmp/result-storage
* Parameter: --result-storage-compression
  * Description: Enable compression for results storage. Saves disk space, but uses more CPU.
  * Default: 
* Parameter: --http-cache-dir
  * Description: Cache dir for HTTP responses. You can disable HTTP cache by --http-cache-dir=''. See Caching section.
  * Default: tmp/http-client-cache
* Parameter: --http-cache-compression
  * Description: Enable compression for HTTP cache storage. Saves disk space, but uses more CPU.
  * Default: 
* Parameter: --websocket-server
  * Description: Start crawler with websocket server on given host:port. WebSocket is used, for example, by a desktop application, but you can use it for other purposes. Detailed documentation of sent messages is still missing.
  * Default: 
* Parameter: --console-width
  * Description: Enforce a fixed console width, disabling automatic detection.
  * Default: 


File Export Settings
--------------------

[Section titled “File Export Settings”](#file-export-settings)



* Parameter: --output-html-report
  * Description: Save HTML report into that file. Set to empty ” to disable HTML report.
  * Default: tmp/report.%domain%.%datetime%.html
* Parameter: --output-json-file
  * Description: Save report as JSON. Set to empty ” to disable JSON report.
  * Default: tmp/output.%domain%.%datetime%.json
* Parameter: --output-text-file
  * Description: Save output as TXT. Set to empty ” to disable TXT report.
  * Default: tmp/output.%domain%.%datetime%.txt
* Parameter: --add-host-to-output-file
  * Description: Append initial URL host to filename except sitemaps.
  * Default: 
* Parameter: --add-timestamp-to-output-file
  * Description: Append timestamp to filename except sitemaps.
  * Default: 




* Parameter: --mail-to
  * Description: Recipients of HTML e-mail reports. Optional but required for mailer activation. You can specify multiple emails separated by comma.
  * Default: 
* Parameter: --mail-from
  * Description: E-mail sender address.
  * Default: siteone-crawler@your-hostname.com
* Parameter: --mail-from-name
  * Description: E-mail sender name.
  * Default: SiteOne Crawler
* Parameter: --mail-subject-template
  * Description: E-mail subject template. You can use dynamic variables %domain% and %datetime%.
  * Default: Crawler Report for %domain% (%date%)
* Parameter: --mail-smtp-host
  * Description: SMTP host.
  * Default: localhost
* Parameter: --mail-smtp-port
  * Description: SMTP port. Unfortunately, only unencrypted SMTP port 25 is supported in the current version.
  * Default: 25
* Parameter: --mail-smtp-user
  * Description: SMTP user, if your SMTP server requires authentication.
  * Default: 
* Parameter: --mail-smtp-pass
  * Description: SMTP password, if your SMTP server requires authentication.
  * Default: 


Offline Exporter Options
------------------------

[Section titled “Offline Exporter Options”](#offline-exporter-options)

The feature of exporting a web page to offline form is activated by entering the `--offline-export-dir` parameter. All others are optional.



* Parameter: --offline-export-dir
  * Description: Path to directory for saving the offline version of the website.
  * Default: 
* Parameter: --offline-export-store-only-url-regex
  * Description: Store only URLs which match one of these PCRE regexes. Activates debug mode.
  * Default: 
* Parameter: --remove-all-anchor-listeners
  * Description: On all links on the page remove any event listeners. Useful on some types of sites with modern JS frameworks that would like to compose content dynamically (React, Svelte, Vue, Angular, etc.).
  * Default: 
* Parameter: --offline-export-remove-unwanted-code
  * Description: Remove unwanted code for offline mode? Typically JS of the analytics, social networks, cookie consent, cross origins, etc. Default value is 1.
  * Default: 1
* Parameter: --offline-export-no-auto-redirect-html
  * Description: Disable automatic creation of redirect HTML files for subfolders that contain an index.html file. This solves situations for URLs where sometimes the URL ends with a slash, sometimes it doesn’t.
  * Default: 
* Parameter: --replace-content
  * Description: Replace HTML/JS/CSS content with foo -> bar or regexp in PREG format: /card[0-9]/i -> card.
  * Default: 
* Parameter: --replace-query-string
  * Description: Instead of using a short hash instead of a query string in the filename, just replace some characters. You can use simple format ‘foo -> bar’ or regexp in PREG format, e.g. ’/([a-z]+)=([^&]*)(&
  * Default: $)/i -> $1__$2’.
* Parameter: --ignore-store-file-error
  * Description: Ignores any file storing errors. The export process will continue.
  * Default: 


Markdown exporter options
-------------------------

[Section titled “Markdown exporter options”](#markdown-exporter-options)

The feature of exporting a web page to markdown form is activated by entering the `--markdown-export-dir` parameter. All others are optional.



* Parameter: --markdown-export-dir
  * Description: Path to directory where to save the markdown version of the website. Directory will be created if it doesn’t exist.
  * Default: 
* Parameter: --markdown-export-single-file
  * Description: Path to a file where to save the combined markdown files into one document. Requires --markdown-export-dir to be set. Ideal for AI tools that need to process the entire website content in one go.
  * Default: 
* Parameter: --markdown-move-content-before-h1-to-end
  * Description: Move all content before the main H1 heading (typically the header with the menu) to the end of the markdown.
  * Default: 
* Parameter: --markdown-disable-images
  * Description: Do not export and show images in markdown files. Images are enabled by default.
  * Default: 
* Parameter: --markdown-disable-files
  * Description: Do not export and link files other than HTML/CSS/JS/fonts/images - eg. PDF, ZIP, etc. These files are enabled by default.
  * Default: 
* Parameter: --markdown-remove-links-and-images-from-single-file
  * Description: Remove links and images from the combined single markdown file. Useful for AI tools that don’t need these elements. Requires --markdown-export-single-file to be set.
  * Default: 
* Parameter: --markdown-exclude-selector
  * Description: Exclude some page content (DOM elements) from markdown export defined by CSS selectors like ‘header’, ‘.header’, ‘#header’, etc. Can be specified multiple times.
  * Default: 
* Parameter: --markdown-replace-content
  * Description: Replace text content with foo -> bar or regexp in PREG format: /card[0-9]/i -> card.
  * Default: 
* Parameter: --markdown-replace-query-string
  * Description: Instead of using a short hash instead of a query string in the filename, just replace some characters. You can use simple format ‘foo -> bar’ or regexp in PREG format, e.g. /([a-z]+)=([^&]*)(&|$)/i -> $1__$2.
  * Default: 
* Parameter: --markdown-export-store-only-url-regex
  * Description: For debug - when filled it will activate debug mode and store only URLs which match one of these PCRE regexes. Can be specified multiple times.
  * Default: 
* Parameter: --markdown-ignore-store-file-error
  * Description: Ignores any file storing errors. The export process will continue.
  * Default: 




* Parameter: --sitemap-xml-file
  * Description: File path where generated XML Sitemap will be saved. Extension .xml is automatically added if not specified.
  * Default: 
* Parameter: --sitemap-txt-file
  * Description: File path where generated TXT Sitemap will be saved. Extension .txt is automatically added if not specified.
  * Default: 
* Parameter: --sitemap-base-priority
  * Description: Base priority for XML sitemap.
  * Default: 0.5
* Parameter: --sitemap-priority-increase
  * Description: Priority increase value based on slashes count in the URL.
  * Default: 0.1


Fastest URL Analyzer
--------------------

[Section titled “Fastest URL Analyzer”](#fastest-url-analyzer)



* Parameter: --fastest-urls-top-limit
  * Description: Number of URL addresses in TOP fastest URL addresses.
  * Default: 20
* Parameter: --fastest-urls-max-time
  * Description: The maximum response time for an URL address to be evaluated as fast.
  * Default: 1


SEO and OpenGraph Analyzer
--------------------------

[Section titled “SEO and OpenGraph Analyzer”](#seo-and-opengraph-analyzer)


|Parameter          |Description                                |Default|
|-------------------|-------------------------------------------|-------|
|--max-heading-level|Maximal analyzed heading level from 1 to 6.|3      |


Slowest URL Analyzer
--------------------

[Section titled “Slowest URL Analyzer”](#slowest-url-analyzer)



* Parameter: --slowest-urls-top-limit
  * Description: Number of URL addresses in TOP slowest URL addresses.
  * Default: 20
* Parameter: --slowest-urls-min-time
  * Description: The minimum response time for an URL address to be added to TOP slow selection.
  * Default: 0.01
* Parameter: --slowest-urls-max-time
  * Description: The maximum response time for an URL address to be evaluated as very slow.
  * Default: 3
