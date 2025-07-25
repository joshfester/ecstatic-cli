# Run third-party scripts from a web worker
Partytown is a lazy-loaded library to help relocate resource intensive scripts into a web worker, and off of the main thread. Its goal is to help speed up sites by dedicating the main thread to your code, and offloading third-party scripts to a web worker.

Note: Partytown is still in beta and not guaranteed to work in every scenario. Please see our FAQ and Trade-Off sections for more info.

Even with a fast and highly tuned website following all of today's best practices, it's all too common for your performance wins to be erased the moment third-party scripts are added. By third-party scripts we mean code that is embedded within your site, but not directly under your control. A few examples include: analytics, metrics, ads, A/B testing, trackers, etc.

Partytown is maintained by QwikDev and is currently in Beta.

Partytown, Google Slides Presentation
Smashing Magazine: How Partytown Eliminates Website Bloat From Third-Party Scripts
Goals
We set out to solve this situation, so that apps of all sizes will be able to continue to use third-party scripts without the performance hit. Some of Partytown's goals include:

Free up main thread resources to be used only for the primary web app execution.
Sandbox third-party scripts and allow or deny their access to main thread APIs.
Isolate long-running tasks within the web worker thread.
Reduce layout thrashing coming from third-party scripts by batching DOM setters/getter into group updates.
Throttle third-party scripts' access to the main thread.
Allow third-party scripts to run exactly how they're coded and without any alterations.
Read and write main thread DOM operations synchronously from within a web worker, allowing scripts running from the web worker to execute as expected.
Web Workers
Partytown's philosophy is that the main thread should be dedicated to your code, and any scripts that are not required to be in the critical path should be moved to a web worker. Main thread performance is, without question, more important than web worker thread performance. Please see the test pages for some live demos.

Without Partytown and With Partytown: Your code and third-party code compete for main thread resources

Negative Impacts from Third-Party Scripts
Below is a summary of potential issues after adding third-party scripts, referenced from Loading Third-Party JavaScript:

Firing too many network requests to multiple servers. The more requests a site has to make, the longer it can take to load.
Sending too much JavaScript which keeps the main thread busy. Too much JavaScript can block DOM construction, delaying how quickly pages can render.
CPU-intensive script parsing and execution can delay user interaction and cause battery drain.
Third-party scripts that were loaded without care can be a single-point of failure (SPOF).
Insufficient HTTP caching, forcing resources to be fetched from the network often.
The use of legacy APIs (e.g document.write()), which are known to be harmful to the user experience.
Excessive DOM elements or expensive CSS selectors.
Including multiple third-party embeds that can lead to multiple frameworks and libraries being pulled in several times, which exacerbates the performance issues.
Third-party scripts also often use embed techniques that can block window.onload, even if the embed is using async or defer.
Use-Cases
While full webapps "can" run from within Partytown, it's actually best intended for code that doesn't need to be in the critical rendering path. Most third-party scripts fall into this category, as they're not required for the first-paint. Additionally, the asynchronous nature of most third-party script works well with Partytown, as they can lazily receive user events and post data to their respective services.

Below are just a few examples of third-party scripts that might be a good candidate to run from within a web worker. The goal is to continue validating commonly used services to ensure Partytown has the correct API, but Partytown itself does not hardcode to any specific services. Help us test and contribute to this page in Github when you find good working scripts!

Google Tag Manager (GTM)
Google Analytics (GA)
Facebook Pixel
Mixpanel
Hubspot
Segment
Amplitude
"Ready to Party" Plugins / Libraries
We try and keep a list of all the plugins and libraries that we know of that work out-of-the-box in Partytown, but we would love your help as plugin & library authors and contributors to keep this list growing.

We have some documentation on how you could create and check-in an integration test that shows how your library / plugin works on Partytown. And if it works, then we would love to have the configuration needed (if any) on our Common Services page


# How Does Partytown Work
How Partytown's Service Worker Sync Communication Works
Traditionally, communicating between the main thread and worker thread must be asynchronous. Meaning that for the two threads to communicate, they cannot use blocking calls.

Partytown is different. It allows code executed from the web worker to access DOM synchronously. The benefit from this is that third-party scripts can continue to work exactly how they're coded.

For example, the code below works as expected within a web worker:

const rect = element.getBoundingClientRect();
console.log(rect.x, rect.y);
First thing you'll notice is that there's no async/await, promise or callback. Instead, the call to getBoundingClientRect() is blocking, and the returned rect value contains the expected x and y properties.

Partytown relies on Web Workers, Service Workers, JavaScript Proxies, and a communication layer between them all.

There are currently two ways to communicate synchronously between the web worker and main thread, and that's sync xhr requests combined with Service Workers, and Atomics.

Designating Web Worker Scripts
It's important to note that Partytown does not automatically move all scripts to the web worker, but prefers an opt-in approach. Meaning, it's best that the developer can pick and choose exactly which scripts should use Partytown, while all the others would go unchanged. Please see the Partytown Scripts for more info.

Partytown is only enabled for specific scripts when they have the type="text/partytown" attribute. This type attribute does two things:

Prevent the main thread from executing the script.
Provides a selector for Partytown to query, such as document.querySelectorAll('script[type="text/partytown"]')
Adding Partytown Attribute
Below is an example of adding the type="text/partytown" attribute to an existing <script>.

- <script>...</script>
+ <script type="text/partytown">...</script>
Service Worker
Scripts are disabled from running on the main thread by using the type="text/partytown" attribute on the <script/> tag.
Service worker creates an onfetch handler to intercept specific requests.
Web worker is given the scripts to execute within the worker thread.
Web worker creates JavaScript Proxies to replicate and forward calls to the main thread APIs (such as DOM operations).
Any call to the JS proxy uses synchronous XHR requests.
Service worker intercepts requests, then is able to asynchronously communicate with the main thread.
When the service worker receives the results from the main thread, it responds to the web worker's request.
From the point of view of code executing on the web worker, everything was synchronous, and each call to the document was blocking.
Atomics
Please see the Atomics communication layer docs on how to enable them. When Atomics are not enabled, the fallback is to use the Service Worker instead. In the end, Atomics are preferred because they're roughly 10x faster in transfering data between the web worker and main thread.

Scripts are disabled from running on the main thread by using the type="text/partytown" attribute on the <script/> tag.
Main thread detects Atomics communication can be used, and loads the Atomics build instead of the Service Worker build.
Web worker is given the scripts to execute within the worker thread.
Web worker creates JavaScript Proxies to replicate and forward calls to the main thread APIs (such as DOM operations).
Any call to the JS proxy will use Atomics.store() and postMessage() to send the data to the main thread, and run Atomics.wait().
Atomics.load() is used once the web worker receives the results data from the main thread.
From the point of view of code executing on the web worker, everything was synchronous, and each call to the document was blocking.
Serialization
Data passed between the main thread and web worker must be serializable. Partytown automatically handles the serializing and deserializing of data passed between threads. This works for primitive values, such as a string, boolean or number, and also functions, which get unique IDs assigned that are passed to the opposite thread and can be called.


# Getting Started
Partytown is fairly different from most web development libraries in mainly what’s required for its setup and configuration. At the lowest level, Partytown can work with just vanilla HTML, meaning it doesn’t need to be a part of a build process, doesn’t need a bundler, doesn’t require a specific framework, etc. Because it can integrate with any HTML page, it also makes it much easier to then create wrapper components or plugins for almost any ecosystem, such as Shopify, WordPress, Nextjs, Gatsby and much more.

What's different from most web development libraries is that Partytown does not get bundled with your existing site's JavaScript. Instead it purposely wants to stay separate from your code so that it can run within a web worker, and allow your code to run on the main thread. If the two were bundled we've already lost the battle.

Install NPM package
npm install @qwik.dev/partytown
Next Steps
Add Partytown type attribute to Third-Party Scripts
Add Partytown snippet to the <head>
Copy Partytown library files


# Partytown Scripts
Partytown Script Type
Add the type="text/partytown" attribute to each individual third-party script to run from a web worker. Note that each script is opt-in, meaning that the updated type attribute should only be added to scripts that should run with Partytown. Partytown will not automatically upgrade any scripts unless this attribute is added.

- <script>...</script>
+ <script type="text/partytown">...</script>
Why type="text/partytown"?
The type="text/partytown" attribute does two things:

Informs the browser to not process the script. By giving the script a type attribute which the browser does not recognize: "The embedded content is treated as a data block which won't be processed by the browser."
Provides a query selector so Partytown can find all the scripts to run from within the web worker. When the document is ready and Partytown has initialized, Partytown will then query selector for all of the script[type="text/partytown"] script elements. You'll notice that after a script has been executed in the web worker, it'll then get an updated type attribute of type="text/partytown-x".
Dynamically Appending Scripts
Commonly, scripts will already be a part of the DOM when the document loads, and once the document is ready and the window has loaded, Partytown will find the scripts and start executing them in the web worker. However, if a script is dynamically appended to the DOM, after Partytown has initialized, you can still dispatch the ptupdate custom event on window to notify Partytown there are new scripts to find.

Below is an example of dynamically appending a script to the document, then notifying Partytown to run its update again. Notice that before the script is appended, the type property (or attribute) is already set to text/partytown.

const script = document.createElement("script");
script.type = "text/partytown";
script.innerHTML = `console.log("New partytown script!")`;
document.head.appendChild(script);
 
window.dispatchEvent(new CustomEvent("ptupdate"));
Integrations
Please see the integration guides for more information on how to setup Partytown.


# HTML Integration
At the lowest level, Partytown is not tied to one specific framework or build tool. Because of this, Partytown can be used in any webpage as long as the HTML is updated, and the library scripts are hosted from the origin.

While the partytown.js file could be an external request, it's recommended to inline the script instead. How the Partytown snippet is inlined into the page depends on each site's setup and an integration may already exist for your framework.

<head>
  <script>
    /* Inlined Partytown Snippet */
  </script>
  <script type="text/partytown" src="https://example.com/analytics.js"></script>
</head>
One option to load the snippet is from the partytownSnippet() function, exported from the @qwik.dev/partytown/integration submodule.

import { partytownSnippet } from "@qwik.dev/partytown/integration";
 
const snippetText = partytownSnippet();
Configure
The configuration should be added to window using the partytown global object.

Below is an HTML example of setting up the forwarding for Google Tag Manager. Note that the config is before the inlined partytown script.

<head>
  <script>
    partytown = {
      forward: ["dataLayer.push"],
    };
  </script>
  <script>
    /* Inlined Partytown Snippet */
  </script>
</head>
Partytown Script
Add the type="text/partytown" attribute for each script that should run from a web worker.

<script type="text/partytown">
  /* Inlined Third-Party Script */
</script>
Copy Library Files
How the files are copied or served from your site is up to each site's setup. A partytown copylib CLI copy task has been provided for convenience which helps copy the Partytown library files to the public directory.


# Copy Library Files
The @qwik.dev/partytown NPM package provides the static lib files that need to be served from your site. Since Partytown is using a service worker, these files must be served from the same origin as your site, and cannot be hosted from a CDN. Each site is different, and how the Partytown lib files are hosted depends on individual setup.

The /~partytown/ directory should serve the static files found within @qwik.dev/partytown/lib. The quickest way is to copy the lib directory into a public /~partytown directory within your static server. Another option would be to set up a copy task within the project's bundler, or create a build step.

You can also use the lib config if your site must host these files from a directory other than the default /~partytown/. Please see the integration guides for more info on copying library files.

Copy Task Command
For convenience, the Partytown CLI provides a copylib task. The last argument should be the directory where the Partytown lib files should be copied to. In the example below, the lib files are copying to the directory public/~partytown, relative to the current working directory:

partytown copylib 'public/~partytown'
This command can be used before a build script. Below is an example of copying the Partytown lib files before a Nextjs build command, using npm scripts:

{
  "scripts": {
    "build": "npm run partytown && next build",
    "partytown": "partytown copylib 'public/~partytown'"
  }
}
Copy Task API
The same code that the partytown copylib CLI task uses, is also exposed as an API and can be imported by any NodeJS script. Below is an example of importing the @qwik.dev/partytown/utils API and copying the lib files to the given directory. Both examples of an ESM import or CommonJS require should work.

import { copyLibFiles } from "@qwik.dev/partytown/utils"; // ESM
// const { copyLibFiles } = require('@qwik.dev/partytown/utils'); // CommonJS
 
async function myBuildTask() {
  await copyLibFiles("path/to/public/~partytown");
}


# Configuration
Partytown does not require a config for it to work, however a config can be set to change the defaults. At the lowest level, it's configured by setting the window.partytown = {...} object before the Partytown snippet script. However, higher-level integrations, such as the <Partytown/> component found in @qwik.dev/partytown/react, should provide utilities to make setting the config easier

Config	Description
debug	When true, Partytown scripts are not inlined and not minified. See the Debugging docs on how to enable more logging.
forward	An array of strings representing function calls on the main thread to forward to the web worker. See Forwarding Events and Triggers for more info.
lib	Path where the Partytown library can be found your server. Note that the path must both start and end with a / character, and the files must be hosted from the same origin as the webpage. Default is /~partytown/
loadScriptsOnMainThread	An array of strings or regular expressions (RegExp) used to filter out which script are executed via Partytown and the main thread. An example is as follows: loadScriptsOnMainThread: ["https://test.com/analytics.js", "inline-script-id", /regex-matched-script\.js/].
resolveUrl	Hook that is called to resolve URLs which can be used to modify URLs. The hook uses the API: resolveUrl(url: URL, location: URL, method: string). See the Proxying Requests for more information.
nonce	The nonce property may be set on script elements created by Partytown. This should be set only when dealing with content security policies and when the use of unsafe-inline is disabled (using nonce-* instead).
fallbackTimeout	A timeout in ms until Partytown initialization is considered as failed & fallbacks to the regular execution in main thread. Default is 9999
Vanilla Config
What we mean by "vanilla config", is that the Partytown config can be set without any higher-level integration. Below is an example of setting the debug config. Notice that the config script tag is before the Partytown snippet script. Additionally, the config or snippet scripts should NOT contain the type="text/partytown" attribute (this small amount of JavaScript we need to run on the main thread to initialize everything).

<html>
  <head>
    <title>Vanilla Config Example</title>
    <script>
      partytown = {
        debug: true,
      };
    </script>
    <script>
      /* Inlined Partytown Snippet */
    </script>
  </head>
  <body>
    ...
  </body>
</html>


# Forwarding Events And Triggers
Many third-party scripts add a global variable to window which user code calls in order to send data to the service. For example, Google Tag Manager uses a Data Layer array, and by pushing data to the array, the data is then sent on to GTM Servers. Because we're moving third-party scripts to a web worker, the main thread needs to know which variables to patch on window, and when these services are called, the data is correctly forwarded to the web worker. This includes queuing any events that may have happened before Partytown has even finished initializing.

For example, Google Tag Manager adds the dataLayer array to window, and Facebook Pixel adds the fbq function. Below is some quick pseudo code of what they're doing:

// Google Tag Manager
window.dataLayer = [];
 
// Facebook Events
window.fbq = function(){...};
Because GTM and Facebook Pixel objects are added immediately in the <head> by each service, then anywhere within the webpage, your code and their code, can safely call dataLayer.push(...) or fbq(...).

However, since GTM and Facebook Pixel were actually loaded in the web worker, then we need to forward these calls. The forward config is used to set which window variables should be patched and forwarded on. The forward string value is of the function to call, and since GTM is pushing to an array, the function to call is dataLayer.push.

<script>
  partytown = {
    forward: ['dataLayer.push', 'fbq']
  };
</script>
Notice the forward configs are just strings, not actual objects. We're using strings here so we can easily serialize what service variable was called, along with the function argument values. When the web worker receives the information, it then knows how to correctly apply the call and arguments that were fired from the main thread.

If your script declares global functions or variables, make sure they are explicitly declared with window and forwarded to the web worker. This example shows the gtag function from Google Tag Manager. Note window.gtag = function gtag() instead of function gtag().

<script>
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    dataLayer.push(arguments);
  };
  gtag("js", new Date());
 
  gtag("config", "YOUR-ID-HERE");
</script>
You can customize each forwarded variable with the following settings:

preserveBehavior
In addition to the forward config, we also provide a preserveBehavior property. This property allows you to customize each forwarded property, preserving the original behavior of the function.

When preserveBehavior is set to true, the original function's behavior on the main thread is maintained, while also forwarding the calls to partytown. This is useful in cases where the function has side effects on the main thread that you want to keep.

If preserveBehavior is not explicitly set, its default value is false. This means that, by default, calls will only be forwarded to partytown and won't execute on the main thread.

Here's an example of how to use it:

<script>
  partytown = {
    forward: [
      ['dataLayer.push', { preserveBehavior: true }],
      ['fbq', { preserveBehavior: false }],
      'gtm.push'
    ]
  };
</script>
In this example, calls to dataLayer.push will execute as normal on the main thread and also be forwarded to partytown. Calls to fbq will only be forwarded to partytown, and won't execute on the main thread. For gtm.push, since preserveBehavior is not explicitly set, it will behave as if preserveBehavior was set to false, meaning it will only be forwarded to partytown.


# Proxying Requests
Often third-party scripts are added to the page by appending a script tag, such as:

var script = document.createElement("script");
script.url = "http://some-third-party-script.com/tracking.js";
document.head.appendChild(script);
When the <script> element is appended to the <head> using this traditional approach, the script's HTTP response does not require Cross-Origin Resource Sharing (CORS) headers.

However, because Partytown requests the scripts within a web worker using fetch(), then the script's response requires the correct CORS headers.

Many third-party scripts already provide the correct CORS headers, but not all do. For services that do not add the correct headers, then a reverse proxy to another domain must be used in order to provide the CORS headers.

CORS Response Header
Access-Control-Allow-Origin: *
Configuring URL Proxies
When executed from within Partytown, every URL is resolved by Partytown, which also gives users the ability to inspect and modify any and every URL being resolved. The resolveUrl() config can be used to check for a specific URL, and optionally return the proxied URL instead. For example, in the code below we're checking if the URL to be resolved is for Google Analytics, and if so, return a different URL that points to a reverse proxy.

Vanilla Config Example
partytown = {
  resolveUrl: function (url, location, type) {
    if (type === "script") {
      var proxyUrl = new URL("https://my-reverse-proxy.com/");
      proxyUrl.searchParams.append("url", url.href);
      return proxyUrl;
    }
    return url;
  },
};
Please see the integration guides and configuration for more information.

Reverse Proxy
Below are a few examples of reverse proxies that could be used.

Apache
AWS: Creating a Reverse Proxy for Partytown with AWS Cloudfront
Cloudflare
Gatsby Cloud: Redirects and Rewrites
Netlify: Proxy to another service
NGINX
Vercel: Rewrites
Serving Resources Locally
Another option to work around the Access-Control-Allow-Origin issue without using a proxy is to serve your third-party JavaScript and other resources locally.

So instead of inserting something like this on your page for Google Analytics:

<!-- Google Analytics -->
<script type="text/partytown">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
 
  ga('create', 'UA-XXXXX-Y', 'auto');
  ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
You instead download the analytics.js JavaScript resource, and serve it locally from your domain like this:

<!-- Google Analytics -->
<script type="text/partytown">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://example.com/analytics.js','ga');
 
  ga('create', 'UA-XXXXX-Y', 'auto');
  ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
Since you are serving the resource from your own server, you control the headers that come along with it, including the Access-Control-Allow-Origin header that the proxy work-around is sometimes needed for.

As a bonus, serving these resources locally is one less DNS lookup that needs to happen before the client can load your site.

You can manually download these self-hosted third-party JavaScript resources, or you can use a webpack plugin like save-remote-file-webpack-plugin to do it as part of your build process:

const SaveRemoteFilePlugin = require("save-remote-file-webpack-plugin");
module.exports = {
  plugins: [
    new SaveRemoteFilePlugin([
      {
        url: "https://google-analytics.com/analytics.js",
        filepath: "js/analytics.js",
      },
    ]),
  ],
};