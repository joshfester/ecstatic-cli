#!/bin/bash

#set -e

rm -rf ./scraped/*

wget2 'https://do512.com/' \
  --no-clobber \
  --execute robots=off \
  --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36" \
  --directory-prefix=./scraped \
  --no-host-directories \
  --page-requisites \
  --span-hosts \
  --convert-links \
  --restrict-file-names=unix  \
  --adjust-extension

mkdir -p ./scraped/features \
  ./scraped/locales/en \
  ./scraped/events \
  ./scraped/users \
  ./scraped/feeds

wget --output-document=./scraped/features/links.json "https://do512.com/features/links.json" 
wget --header="Accept: application/json" --output-document=./scraped/locales/en/translation "https://do512.com/locales/en/translation" 
wget --header="Accept: application/json" --output-document=./scraped/layout "https://do512.com/layout" 
wget --output-document=./scraped/users/current.json "https://do512.com/users/current.json" 
wget --output-document=./scraped/events/top_ongoing_and_repeating.json "https://do512.com/events/top_ongoing_and_repeating.json" 
wget --output-document=./scraped/events/votes.json "https://do512.com/events/votes.json" 
wget --output-document=./scraped/features/1064.json "https://do512.com/features/1064.json" 
wget --output-document=./scraped/feeds/check_alert.json "https://do512.com/feeds/check_alert.json" 