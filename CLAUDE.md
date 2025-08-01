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

The CLI tool is powered by the Commander library. The entry point is at ./bin/ecstatic. Configuration is loaded via the c12 library.

- scrape
    - Download the taget website as static files
    - This is handled by either `httrack` or `wget2` (which is just 'wget' with some extra features/optimizations)
- optimize
    - Optimize HTML and all assets
    - Parcel is the core. New features should be added as a Parcel plugin.
        - Out of the box, Parcel provides minification and content hashing.
        - Configuration is at {PROJECT_ROOT}/.parcelrc
        - Custom plugins:
            - html-defer
                - This plugin is a Parcel Transformer
                - This plugin adds attributes to scripts. The attributes determine if the script will get ignored, deferred, or offloaded
            - html-defer-js
                - This plugin is a Parcel Optimizer
                - This plugin uses the defer.js library to defer/offload scripts
    - Jampack is used to handle lazy loading assets and critical CSS optimizations.
- Deploy
    - Upload to CDN (currently only supporting BunnyCDN)

## Documentation

- c12: {PROJECT_ROOT}/docs/c12.md
- Commander: {PROJECT_ROOT}/docs/commander.md
- Defer.js: {PROJECT_ROOT}/docs/deferjs.txt
- Httrack: {PROJECT_ROOT}/docs/httrack.txt
- Jampack: https://jampack.divriots.com/
- Parcel:
    - {PROJECT_ROOT}/docs/parcel-cli.txt
    - {PROJECT_ROOT}/docs/parcel-html.txt
    - {PROJECT_ROOT}/docs/parcel-production.txt
    - {PROJECT_ROOT}/docs/parcel-plugins.txt
    - {PROJECT_ROOT}/docs/parcel-plugins-transformer.txt
    - {PROJECT_ROOT}/docs/parcel-plugins-optimizer.txt
- Wget: {PROJECT_ROOT}/docs/wget.txt