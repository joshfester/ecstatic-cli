#!/bin/bash

#set -e

rm -rf ./scraped/*

wget2 'https://www.americanrelief.org/apply/' \
  --no-clobber \
  --execute robots=off \
  --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.48 Safari/537.36" \
  --directory-prefix=./scraped \
  --no-host-directories \
  --page-requisites \
  --span-hosts \
  --convert-links \
  --adjust-extension

wget --directory-prefix=./scraped/_astro https://www.americanrelief.org/_astro/Debt.astro_astro_type_script_index_0_lang.RqXlQd7H.js
wget --directory-prefix=./scraped/_astro https://www.americanrelief.org/_astro/bootstrap.esm.BNVzI9OA.js
wget --directory-prefix=./scraped/_astro https://www.americanrelief.org/_astro/057.astro_astro_type_script_index_0_lang.iHgxWTEP.js