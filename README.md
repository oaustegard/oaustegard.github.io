# oaustegard.github.io
### The source code for austegard.com

A personal site laid out like a survey sheet. The home page is a map of Flatøy, the island in Vestland, Norway where the family place Austegarden is, drawn from Kartverket open data. On it: about 80 small tools that run in the browser, a blog, and links to elsewhere. Plain HTML, CSS and a little JavaScript on GitHub Pages. No framework, no bundler, no server-side code, and no third-party requests on the home page.

The design system is documented, with live examples, at [/style-guide.html](style-guide.html).

## Structure

```
index.html            home page (data-sheet="full"); district cards, tool total and latest posts are generated
tools.html            tools hub with place-name search (?q=); generated
404.html              not-found page; Jekyll front matter that deploy.yml strips; /bsky/<id> redirect and sitemap lookup
style-guide.html      tokens, type, components and map rules, rendered from styles/style.css
feed.xml              Atom feed; generated

biking/ ai-tools/ web-utilities/ deepzoom/ fun-and-games/ bsky/ etc/ found/
                      the tools, one page each (<name>.html + <name>_README.md);
                      each district's index.html lists them; generated regions
blog/                 posts, _template.html, _config.json; index.html is generated
data/                 tool-notes.json (edited by hand), tools.json (generated, feeds the search)

styles/               style.css (tokens and components, site-wide), home.css (home only), blog.css (articles)
fonts/                Fraunces, DM Sans, JetBrains Mono as local woff2 subsets
images/map/           flatoy.svg, austegarden-band.svg, austegarden-inset.svg; generated from Kartverket data
images/plates/        engravings drawn as CSS masks (lost.webp on the 404 page)
images/og-austegard.png   link-preview image (1200 x 630)
scripts/              sheet.js (the map layer), build_site.py, build_tools.py, build_blog.py,
                      map/build_flatoy.py, github-toc.js, htmlpreview.js, fd/, vendor/
.github/workflows/    build-blog.yml ("Build site"), deploy.yml, branch-preview.yml
```

Most tool pages are self-contained and carry their own CSS. Pages that link `styles/style.css` pick up the shared tokens; the old token names (`--grouch`, `--bg`, `--link` and so on) still work.

## Generated files

`python3 scripts/build_site.py` runs `build_tools.py` and then `build_blog.py` and lists the files that changed. `--check` writes nothing and exits 1 if something is stale; `--dry-run` lists what would change. Standard library only.

| Script | Writes |
|---|---|
| `scripts/build_tools.py` | `data/tools.json`, `tools.html`, each district's `index.html`, and the district cards and tool total in `index.html` |
| `scripts/build_blog.py` | `feed.xml`, `blog/index.html`, and the latest posts in `index.html` |

Generators only replace the text between `<!--gen:NAME-->` and `<!--/gen:NAME-->` markers (and the whole of the files that are fully generated). Do not edit those regions by hand.

On a push to `main` that touches posts, tool pages, the notes file or a generator, the **Build site** workflow runs `build_site.py` and commits the changed files as `github-actions[bot]`. **Deploy to GitHub Pages** then runs on its completion, so the deployed site has the new listings.

## Add a tool

1. Drop `<name>.html` into the district directory (for example `ai-tools/`). Keep it self-contained, with its own CSS and no third-party fonts.
2. Add `<name>_README.md` next to it.
3. Push to `main`. CI regenerates the listings. To see them first, run `python3 scripts/build_site.py`.
4. Optional: add a curated entry in `data/tool-notes.json` (title, blurb, `featured`, `kind`). A page with no entry still appears, using its `<title>` and description, and the generator warns `no curated note for <path>`.

A new district is a new directory whose `index.html` has the `gen:blurb` and `gen:tools` markers (copy `biking/index.html`), plus an entry under `districts` in `data/tool-notes.json`. In `.github/workflows/build-blog.yml`, add its paths to the trigger list and its `index.html` to the `git add` line.

## Add a blog post

Copy `blog/_template.html`, fill in the meta tags it marks as required, and push. `build_blog.py` adds the post to the blog index, the feed and the home page.

## The map

`images/map/*.svg` is Kartverket data (N50, the 1 m terrain model, FKB, AR5, place names) drawn in the site's colours, UTM zone 32 (EPSG:25832), north up. It is built by one script:

```bash
python3 scripts/map/build_flatoy.py                 # sheet, band and inset
python3 scripts/map/build_flatoy.py --only band     # one of them
```

It needs numpy, scipy, shapely, pyproj, scikit-image, tifffile, lxml and pillow, and reaches Kartverket and Geonorge only. Raw downloads are cached outside the repo (`--cache`, default `/tmp/flatoy-cache`). Layers, scale and file budgets are in [style-guide.html](style-guide.html#map).

Every page that shows the map carries `Kartdata © Kartverket (CC BY 4.0)` in its footer. That is the licence's requirement.

## Performance

Budget for the home page, cold: HTML, CSS and JS at most 95 KB (about 54 KB now, uncompressed), fonts at most 150 KB (130 KB for all four files), no third-party requests, no layout shift. The map is decorative and loads without blocking text.

## Other pieces

* [pv.html](pv.html) with [sub-gist support](https://austegard.com/pv?a1902d995b5c6157a9eaf69afa355723): cleaner gist preview URLs
* [github-toc.js](scripts/github-toc_README.md): floating table of contents for long pages
* [AI-in-SDLC](https://github.com/oaustegard/AI-in-SDLC): exploring AI in software development

## Deployment

`deploy.yml` copies the repo to a staging directory (without Jekyll), strips the front matter from `404.html`, writes `sitemap.xml` from the HTML files it finds, and publishes that. The 404 page uses the sitemap to find pages that moved. `sitemap.xml` is not in the repo.
