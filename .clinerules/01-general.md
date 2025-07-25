# Ecstatic

## Overview

This project is a web app that automates the process of website optimization. The goal is to take a slow website and turn it into one that passes Core Web Vitals and scores high in Google Pagespeed (Lighthouse).

The app is run via NPM scripts in the package.json file.

The app should work by this process:
- Download the taget website as static files
    - This part is handled by 'wget2', which is just 'wget' with some extra features/optimizations
    - Documentation for wget is here: https://www.gnu.org/software/wget/manual/wget.html
- Optimize the HTML and assets (js, css, images, fonts, etc)
- Upload to a CDN

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

I want to use ParcelJS as the core library for optimizations. Out of the box it provides minification and hashing. Other optimization steps can be added as plugins for Parcel or one of the libraries it uses like PostHTML/SWC/LightningCSS/etc.

## Run the app

1. `npm run scrape`
2. `npm run convert-http`
3. `npm run parcel`
4. `npm run jampack`
5. `npm run zip`

I'm currently focused on the Parcel step. Do not worry about other steps.

## Parcel

- ParcelJS is configured at {PROJECT_ROOT}/.parcelrc
- Parcel uses PostHTML to parse each HTML file
    - Config is at {PROJECT_ROOT}/.posthtmlrc
    - Currently there are two plugins. Each are setup as a local NPM package (see {PROJECT_ROOT}/package.json):
        - partytown
            - This plugin offloads scripts to a Web Worker
            - PartyTown docs are at {PROJECT_ROOT}/docs/partytown.md
        - defer-scripts
            - This plugin externalizes inline scripts and defers all (non-partytown) scripts