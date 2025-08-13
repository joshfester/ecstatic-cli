#!/usr/bin/env bash
# replace-domains.sh
# Replace all occurrences of a source domain with a target domain in HTML files

set -euo pipefail

# Check if both source and target domains are provided
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <source-domain> <target-domain>" >&2
  echo "Example: $0 example.com new-domain.com" >&2
  exit 1
fi

SOURCE_DOMAIN="$1"
TARGET_DOMAIN="$2"
SCRAPED_DIR="./scraped"

# Check if scraped directory exists
if [[ ! -d "$SCRAPED_DIR" ]]; then
  echo "Error: $SCRAPED_DIR directory not found" >&2
  exit 1
fi

# Escape dots in domain names for regex
SOURCE_ESCAPED=$(echo "$SOURCE_DOMAIN" | sed 's/\./\\./g')
TARGET_ESCAPED="$TARGET_DOMAIN"

echo "Replacing '$SOURCE_DOMAIN' with '$TARGET_DOMAIN' in HTML files..."

# Find HTML files containing the source domain and replace with target domain
find "$SCRAPED_DIR" -name "*.html" -type f -exec grep -l "$SOURCE_DOMAIN" {} \; | \
  xargs -r sed -i "s/$SOURCE_ESCAPED/$TARGET_ESCAPED/g"

echo "Domain replacement completed"