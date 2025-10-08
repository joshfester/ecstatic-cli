# wget

- No way to filter url's
    - accept/reject rules will download html files first, then delete them based on rules

# httrack

- Can't get proxy to work

# americor-apply

- don't deferjs the inline script that has addressDob
- don't deferjs http://toolkit.americor.com/dist/js/toolkit.js

# americor

- must delete extra index-N.html files and links to them
- don't defer mutiny scripts because they make the screen flash white
- AVIF background image causes error in Lighthouse

# shefinds

- Bunny.net needs image urls to be encoded
- encoded urls don't work through cloudflare, so link image directly to bunny domain