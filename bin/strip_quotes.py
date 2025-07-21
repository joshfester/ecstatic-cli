"""
Strip single quotes out of url(...) in inline styles.

Example before:
    style="background-image:url(&#039;https://example.com/img.png&#039;);"

Example after:
    style="background-image:url(https://example.com/img.png);"
"""
import html
import re
from mitmproxy import http

# ── one regex to catch: url('…'), url("…"), url(&#039;…&#039;)
URL_QUOTE_RE = re.compile(
    r"url\(\s*(?:['\"]|&#0*39;)([^'\"()]+?)(?:['\"]|&#0*39;)\s*\)",
    flags=re.IGNORECASE,
)

class StripStyleQuotes:
    def response(self, flow: http.HTTPFlow) -> None:
        # Only touch HTML payloads
        if "text/html" not in flow.response.headers.get("content-type", ""):
            return

        # Get body as text (mitmproxy transparently decompresses & decodes)
        body = flow.response.get_text()

        # Convert entities so &#039; becomes a real single quote.
        unescaped = html.unescape(body)

        # Remove the surrounding quotes.
        patched = URL_QUOTE_RE.sub(r"url(\1)", unescaped)

        # Put the modified body back into the response
        if patched != body:               # tiny speed guard
            flow.response.set_text(patched)

# mitmproxy looks for a list called “addons”
addons = [StripStyleQuotes()]
