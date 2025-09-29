# Ecstatic

## Overview

This project is a CLI tool that automates the process of website optimization. The goal is to take a slow website and turn it into one that passes Core Web Vitals and scores high in Google Pagespeed (Lighthouse).

The tool has these commands:
- scrape    
- optimize
- deploy

Some common pitfalls in this process:
- URL query params
    - Sometimes query params can be ignored (cache busting like app.css?ver=123), but sometimes they represent an entirely different resource (example.com/pages?id=123)
    - When wget downloads a resource with query params, it gets saved to a file like page.html?id=123
    - wget can use the --restrict-file-names to make valid filenames like page.html@id=123
        - This still doesn's solve the issue. Since the end result is a static site, each distinct page needs a distinct url without query params.
- Single Page Applications (SPA's)
    - Ideally these would be pre-rendered, however, I don't want to bother with that yet.
- Dynamic content
    - Some pages are mostly static but need some user-specific content like avatars, shopping carts, etc
- POST requests
    - Sometimes a POST request needs to happen to render content on the page. This can be solved with URL rewrite rules at the CDN level

## Tech Stack

The CLI tool is powered by the Commander library. The entry point is at ./bin/ecstatic. We use ./src/utils/config.js to load configuration from ecstatic.config.js files in the current working directory. Each command is authenticated by ./src/utils/auth.js

- scrape
    - Download the taget website as static files
    - This is handled by either `httrack`, `siteone`, or `wget2` (which is just 'wget' with some extra features/optimizations)
        - siteone is default
        - The siteone crawler is a third-party PHP library installed at ./packages/siteone/siteone-crawler
            - The library has been packaged into a tar.xz file at ./packages/siteone/siteone-dist.tar.xz
            - The tar.xz file gets unpacked and then executed via `swoole-cli src/crawler.php`
- optimize
    - Optimize HTML and all assets
    - Jampack is the core
        - minification
        - lazy load images
        - compress/convert images
        - critical css optimizations
        - defer scripts
        - At compile time, we compress the whole Jampack project into ./packages/jampack/jampack-dist.tar.xz
        - At runtime, we import the tar.xz file and extract it, then run jampack directly
- Deploy
    - Upload to CDN (currently only supporting BunnyCDN)

## Production

We use Bun to generate a single executable file. You can do this by running `npm run compile` to generate the file at ./dist-exec/ecstatic.

## Running locally

- Run the app via `bin/ecstatic`, which executes the app with Bun
- ALWAYS use the --admin flag to bypass authentication
- Use the --verbose flag to see output from third-party tools

## Documentation

- Commander: {PROJECT_ROOT}/docs/commander.md
- Defer.js: {PROJECT_ROOT}/docs/deferjs.txt
- Httrack: {PROJECT_ROOT}/docs/httrack.txt
- Jampack: {PROJECT_ROOT}/docs/jampack.md
- Siteone: {PROJECT_ROOT}/docs/siteone.md
- Wget: {PROJECT_ROOT}/docs/wget.txt
- Bun:
    - executables: {PROJECT_ROOT}/docs/bun-executable.md
    - define globals and constants: {PROJECT_ROOT}/docs/bun-define.md