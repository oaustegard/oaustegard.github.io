# oaustegard.github.io
### The source code for austegard.com

A collection of client-side web tools, experiments, and utilities. Recent developments:

### AI Tools ([ai-tools/](ai-tools/))
* [Claude Pruner](ai-tools/claude-pruner_README.md) - Process Claude conversations with block ordering and trimming
* [Claude Skills Releases](ai-tools/claude-skill-releases_README.md) - Live listing of releases from claude-skills repository
* [Claude Enterprise Log Viewer](ai-tools/claude-enterprise-log-viewer_README.md) - Parse and analyze Claude Enterprise audit logs
* [Anthropic JSON](ai-tools/anthropic-json_README.md) and other LLM utilities

### Bluesky/AT Protocol Tools ([bsky/](bsky/))
* [AT Protocol Browser Extension](bsky/at-protocol-extension_README.md) - Enhanced Bluesky browsing with quote post support ([popular](https://austegard.com/bsky/at-protocol-extension.html?sort=popular) or [chronological](https://austegard.com/bsky/at-protocol-extension.html?sort=chronological))
* [GitHub Search for Bluesky](bsky/github-search_README.md) - Find Bluesky users from GitHub profiles
* [Bluesky Processor](bsky/processor_README.md), [List Tools](bsky/list-to-list_README.md), [Starterpack Converter](bsky/starterpack-to-list_README.md), and [Report Viewer](bsky/report_README.md)

### Web Utilities ([web-utilities/](web-utilities/))
* [PDF Text Extractor](web-utilities/pdf-text-extractor_README.md) - Client-side extraction with URL API support for LLM workflows
* [PDF Highlighter](web-utilities/pdf-highlighter_README.md) and [PDF Compressor](web-utilities/pdf-compressor_README.md)
* [AWS Ping](web-utilities/aws-ping_README.md) - Test latency to AWS regions
* [Bookmarklet Installer](web-utilities/bookmarklet-installer_README.md), [Webex Link Redirector](web-utilities/webex_README.md), [OneNote Trimmer](web-utilities/onenote_README.md)

### Found Item System ([found/](found/))
* [QR code generator](found/generator.html) and [recovery system](found/index.html) for lost-and-found with client-side encryption ([details](found/generator_README.md))

### Fun and Games ([fun-and-games/](fun-and-games/))
* [Speedometer](fun-and-games/speedo.html) - GPS-based speedometer with HUD mode and pace display ([details](fun-and-games/speedo_README.md))
* [Cadence for Dummies](fun-and-games/cadence-for-dummies_README.md), [Poetry Playground](fun-and-games/poetry-playground_README.md)
* Games: [Asteroids](fun-and-games/asteroids_README.md), [Blaster](fun-and-games/blaster_README.md), [Emoji Collage](fun-and-games/emoji-collage_README.md), [Yin Yang](fun-and-games/yingyang_README.md)

### Scripts and Utilities
* [pv.html](pv.html) with [sub-gist support](https://austegard.com/pv?a1902d995b5c6157a9eaf69afa355723) - cleaner gist preview URLs
* [github-toc.js](scripts/github-toc_README.md) - Floating table of contents for long pages
* Performance: 1.7kb [grid.svg](grid.svg) + 963-byte [favicon](images/favicon-16x16.png) achieving [100/100/100/100 on PageSpeed](https://pagespeed.web.dev/analysis/https-austegard-com/6uxn95p7qw?form_factor=desktop)

### Related
* [AI-in-SDLC](https://github.com/oaustegard/AI-in-SDLC) - Exploring AI in software development 

### Sitemap Generation
This repository includes a dynamic 404 page that attempts to find and redirect to moved content. This functionality relies on a `sitemap.json` file which contains a list of all pages on the site.

If you add, remove, or rename files, you must regenerate the sitemap for the 404 page to work correctly. To do this, run the following command from the root of the repository:

```bash
python3 scripts/generate_sitemap.py
```
