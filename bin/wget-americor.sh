#!/bin/bash

#set -e

rm -rf ./scraped/*

wget2 'https://americor.com/' \
  --no-clobber \
  --execute robots=off \
  --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36" \
  --directory-prefix=./scraped \
  --no-host-directories \
  --page-requisites \
  --adjust-extension \
  --restrict-file-names=windows \
  --wait=1 \
  -D americor.com 