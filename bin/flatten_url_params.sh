#!/usr/bin/env bash
# flatten.sh  <path-to-mirror-root>
# ---------------------------------
set -euo pipefail
shopt -s globstar nullglob

ROOT="../build/truefire.com/"

for f in "$ROOT"/**/*\?*; do
  [[ -e "$f" ]] || continue         # nothing matched
  dir=$(dirname "$f")
  base=$(basename "$f")

  # Split filename from the query string
  page=${base%%\?*}                  # before '?', e.g. index.html
  qs=${base#*\?}                     # after '?',  e.g. author_id=123&lang=en

  # Build a folder path out of *all* params in order
  #  "author_id=123&lang=en"  ->  author_id/123/lang/en
  IFS='&' read -r -a PAIRS <<< "$qs"
  NEWPATH=""
  for p in "${PAIRS[@]}"; do
    key=${p%%=*}
    val=${p#*=}
    # replace unsafe chars just in case
    key=${key//[^A-Za-z0-9._-]/_}
    val=${val//[^A-Za-z0-9._-]/_}
    NEWPATH+="$key/$val/"
  done

  target="$dir/$NEWPATH"            # full folder chain under the current dir
  mkdir -p "$target"
  mv "$f"  "$target/index.html"
done
