# Cross-origin fetch probe

One question, answered from inside a real browser: can a page on this origin fetch a
file from a given host? Three requests per URL (plain GET, HEAD, and a GET with
`Range: bytes=0-99`, which sharded model loading needs) and a verdict per request from
whether the browser let the page read the response. Prefilled with two GitHub release
assets on `oaustegard/experiments` and a Hugging Face file as the known-good control.

Written to settle whether GitHub release assets can host ONNX weights for an in-browser
demo. The Hugging Face answer was verified from a server (`access-control-allow-origin: *`
on the CDN redirect); the GitHub answer could not be, because the session that built this
page sits behind a proxy that rejects the release-download redirect. The browser is the
authority either way.
