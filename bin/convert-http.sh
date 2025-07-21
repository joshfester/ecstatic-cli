#!/usr/bin/env bash
# post-download.sh
# Simple helper script run after wget/httrack scraping stage.
# It rewrites every occurrence of 'http:' to 'https:' inside
# ./scraped/web/index.html in-place.

set -euo pipefail

HTML_FILE="./scraped/web/index.html"

if [[ ! -f "$HTML_FILE" ]]; then
  echo "Error: $HTML_FILE not found" >&2
  exit 1
fi

# Replace all plain http: schemes with https:
# -i : in-place edit
# g  : apply replacement globally on each line
sed -i 's/http:/https:/g' "$HTML_FILE"

echo "Replaced all 'http:' with 'https:' in $HTML_FILE"