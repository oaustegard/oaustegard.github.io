# oaustegard.github.io
### The source code for austegard.com

Nothing much interesting except for perhaps, in no particular order:
* my fork of htmlpreview in [pv.html](https://github.com/oaustegard/oaustegard.github.io/blob/main/pv.html) and [scripts/htmlpreview.js](https://github.com/oaustegard/oaustegard.github.io/blob/main/scripts/htmlpreview.js) which allows me to display html gists (like e.g. https://austegard.com/pv?a1902d995b5c6157a9eaf69afa355723 rather than the much less elegant https://htmlpreview.github.io/?gist.githubusercontent.com/oaustegard/a1902d995b5c6157a9eaf69afa355723/raw/helloworld.html)
* the tediously hand-written, 1.7kb [grid.svg](https://github.com/oaustegard/oaustegard.github.io/blob/main/grid.svg) which together with the 963 byte 256-pixel [favicon-16x16.png](https://github.com/oaustegard/oaustegard.github.io/blob/main/images/favicon-16x16.png) is what generates the deliberatedly pixelated large Oscar the Grouch image and helps achieve [a clean sweep of four 100 scores on PageSpeed Insights](https://pagespeed.web.dev/analysis/https-austegard-com/6uxn95p7qw?form_factor=desktop)
* the link-hack of [webex.html](https://austegard.com/webex.html) ([source](https://github.com/oaustegard/oaustegard.github.io/blob/main/webex.html)) which allows you to use an https-protocol link where a webexteams-protocol link is not accepted: this simply does a client-side redirect. So instead of a url like webexteams://im?space=01dd4a70-64b5-11eb-b159-913d570d2d78 you'd use the url https://austegard.com/webex?webexteams://im?space=01dd4a70-64b5-11eb-b159-913d570d2d78 or simply https://austegard.com/webex?space=01dd4a70-64b5-11eb-b159-913d570d2d78
* the [bookmarklet installer](https://austegard.com/bookmarklet-installer.html) ([source](https://github.com/oaustegard/oaustegard.github.io/blob/main/bookmarklet-installer.html))
* Not part of this site, but if interested in AI-generation of content (a passing 2023 fad, surely) have a look at https://github.com/oaustegard/AI-in-SDLC 

### Sitemap Generation
This repository includes a dynamic 404 page that attempts to find and redirect to moved content. This functionality relies on a `sitemap.json` file which contains a list of all pages on the site.

If you add, remove, or rename files, you must regenerate the sitemap for the 404 page to work correctly. To do this, run the following command from the root of the repository:

```bash
python3 scripts/generate_sitemap.py
```
