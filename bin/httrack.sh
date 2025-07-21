#!/bin/bash

#set -e

# !!! This is meant to be run from the theme root dir !!!

export NETLIFY_AUTH_TOKEN=nfp_sodxxBqzc3VX898kzNSYfBThLWFtomeva3b9
#export http_proxy=http://127.0.0.1:8080
#export https_proxy=$http_proxy 

rm -rf ./scraped/*

# --no-check-certificate
#wget2 'https://truefire.com/list.html?store=audio_lessons&viewauthor=1043' \
#  --mirror \
#  --no-clobber \
#  --execute robots=off \
#  --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36" \
#  --directory-prefix=./scraped \
#  --page-requisites \
#  --convert-links \
#  --restrict-file-names=unix 
#  
#./lib/flatten_url_params.sh

#netlify deploy --prod

httrack "https://do512.com/" \
  -O "./scraped" \
  --depth=3 ${comment# set the mirror depth to N} \
  --ext-depth=3 ${comment# set the external links depth to N} \
  --near ${comment# get non-html files 'near' an html file} \
  -a ${comment# stay on the same address} \
  -B ${comment# can both go up&down into the directory structure} \
  -N4 ${comment# HTML in web/, images/other in web/xxx, where xxx is the file extension} \
  --sockets=16 ${comment# number of multiple connections} \
  --keep-links=3 ${comment# keep original links (K0 *relative link, K absolute links, K3 absolute URI links)} \
  --robots=0 ${comment# follow robots.txt and meta robots tags (0=never,1=sometimes,* 2=always) } \
  -%c20 ${comment# maximum number of connections/seconds} \
  --timeout=10 ${comment# timeout, number of seconds after a non-responding link is shutdown} \
  --updatehack ${comment# update hacks: various hacks to limit re-transfers when updating (identical size, bogus response..)} \
  --mirror ${comment# mirror web sites} \
  --cache=2 ${comment# create/use a cache for updates and retries (C0 no cache,C1 cache is prioritary,* C2 test update before)} \
  '-*' \
  '+*do512.com/*.css' '+*do512.com/*.js' '+*do512.com/*.css' '+*do512.com/' \
  '+*dostuffmedia.com/*' '+*dostuff-assets.s3*'

mkdir -p ./scraped/web/features \
         ./scraped/web/locales/en \
         ./scraped/web/events \
         ./scraped/web/users

wget --output-document=./scraped/web/features/links.json "https://do512.com/features/links.json" 
wget --header="Accept: application/json" --output-document=./scraped/web/locales/en/translation "https://do512.com/locales/en/translation" 
wget --header="Accept: application/json" --output-document=./scraped/web/layout "https://do512.com/layout" 
wget --output-document=./scraped/web/users/current.json "https://do512.com/users/current.json" 
wget --output-document=./scraped/web/events/top_ongoing_and_repeating.json "https://do512.com/events/top_ongoing_and_repeating.json" 
wget --output-document=./scraped/web/events/votes.json "https://do512.com/events/votes.json" 
wget --output-document=./scraped/web/features/1064.json "https://do512.com/features/1064.json" 
wget --output-document=./scraped/web/feeds/check_alert.json "https://do512.com/feeds/check_alert.json" 