# AGENTS.md: AI Agent Instructions

This document provides guidance for AI agents interacting with this repository. The information is based on an analysis of the existing codebase, structure, and workflows.

## Skills Management

To install or update Claude skills from the [claude-skills repository](https://github.com/oaustegard/claude-skills):

```bash
bash .claude/install-skills.sh
```

**To add/remove skills**: Edit the `SKILLS` array in `.claude/install-skills.sh`

## Navigating the Codebase

Static `_MAP.md` code maps are **retired** — do not generate or commit them
(the old `mapping-codebases` skill and "Update Code Maps" workflow are gone).
For structural exploration, use tree-sitter-based dynamic parsing instead
(e.g. the `tree-sitting` skill where available): parse on demand, query for
symbols/exports/references, and read only the line ranges you need.

## Environment Constraints

- **`gh` CLI is not available.** Do not attempt to use `gh` for creating PRs, viewing issues, or any other GitHub API operations. Use the UI's "Create PR" button instead.

## Dev Environment Tips

This is a plain static site published to GitHub Pages. `.github/workflows/deploy.yml` copies the repo without running Jekyll, strips the front matter from `404.html` and writes `sitemap.xml`. The `Gemfile` and `_config.yml` still describe a Jekyll setup that the deploy does not use.

- **Preview**: serve the repo root with any static file server, for example `python3 -m http.server 8000`, and open `http://127.0.0.1:8000/`.
- **Regenerate listings**: `python3 scripts/build_site.py` (standard library only).

## Commands

- **Build the generated files**: `python3 scripts/build_site.py`. `--check` writes nothing and exits 1 if a generated file is stale; `--dry-run` lists what would change.
- **Preview**: `python3 -m http.server 8000` from the repo root.
- **Lint**: there is no linting configuration in this repository.

## Testing Instructions

- **Playwright Tests**: The repository includes Playwright tests for testing web tools.
  - Run tests: `npm test`
  - Run headed: `npm run test:headed`
  - Run UI mode: `npm run test:ui`
- **Manual Verification**: serve the site locally and check that pages render and tools work.
- **CI/CD**: the Build site and Deploy workflows do not run automated tests.

## Branch Preview Builds

The repository includes a **Branch Preview** workflow (`.github/workflows/branch-preview.yml`) that automatically deploys preview sites for non-main branches to **Cloudflare Pages**.

### How It Works

1. **Automatic triggers**: Deploys on pushes to any branch except `main` (and on manual `workflow_dispatch`).
2. **Single preview slot**: All previews deploy to one fixed CF Pages branch (`preview` on project `austegard`). Concurrent runs cancel in-progress, so only the most recent non-main push is live — there is no per-branch URL.
3. **URL**: The deployed URL is emitted by `wrangler` and written to the workflow's job summary (format: `https://*.pages.dev`). No PR comment is posted.

### One-Time Setup

Branch previews require two repository secrets:

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Pages write permission
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID hosting the `austegard` Pages project

Add them under Settings → Secrets and variables → Actions.

### Manual Trigger

You can also manually trigger the workflow from the Actions tab → "Branch Preview" → Run workflow.

### Verifying Preview Deployments

The workflow typically takes 40–60 seconds. Open the workflow run's job summary (or the "Deploy to Cloudflare Pages" step log) to find the exact `*.pages.dev` URL — there is no predictable branch-to-URL mapping.

## Code Style

- **Naming Conventions**:
  - HTML files for tools are typically named using `hyphen-separated-names.html`.
  - JavaScript files also follow a `hyphen-separated` convention.
- **Tool Documentation Pattern**: A key convention in this repository is the pairing of a tool's HTML file with a corresponding README file.
  - For a tool named `my-new-tool.html`, its documentation should be in `my-new-tool_README.md`.
  - This pattern is observed across all tool directories. When adding a new tool, follow this convention.

## Project Structure

The repository is organized into thematic subdirectories containing standalone web tools and pages.

- `/`: The root contains top-level pages, configuration files, and miscellaneous assets.
- `/_site/`: a build output directory, if one exists. **Do not edit files in it**; they are overwritten.
- `/ai-tools/`: A collection of web-based tools related to AI, such as log viewers and data processors.
- `/bsky/`: Tools and utilities related to the BlueSky/AT Protocol social network.
  - **bsky-core.js**: Core utilities (16 exports) - dependency for other modules
  - **bsky-quote.js**: Quote post processing
  - **bsky-search.js**: Search functionality with auto-processing
  - **bsky-thread.js**: Thread processing and display
- `/deepzoom/`: Deep-zoom viewers built on OpenSeadragon 6.1 (code wall, Bach chorale wall, Kristiania 1917 map pair, Norway property map). The first three are single self-contained files generated by the private `oaustegard/deepzoom` library, so regenerate them there rather than hand-editing the embedded data. `eiendomskart.html` is hand-written and loads OpenSeadragon from jsDelivr and every map layer live from Kartverket, Geonorge, OpenStreetMap, Esri and EOX; edit it directly.
- `/fun-and-games/`: Interactive pages, curiosities, and small games.
- `/etc/` and `/found/`: The "Etc" district: charts and essays, and the found-item QR generator and recovery page.
- `/blog/`: Posts, `_template.html` and `_config.json`. `blog/index.html` and `feed.xml` are generated by `scripts/build_blog.py`; never edit them by hand.
- `/motion-player/`: An installable PWA that plays YouTube videos inline with motion-based (device-orientation) pan/zoom/roll-stabilization plus touch gestures. Self-contained directory (own `manifest.webmanifest`, `sw.js`, icons) so the service-worker scope stays isolated; see `motion-player/README.md` and `motion-player/SPEC.md`.
- `/web-utilities/`: General-purpose web tools like formatters, converters, and bookmarklets.
- **Creating New Sections**: A section is a "district". Create a new directory (e.g., `/new-tools/`) and add an `index.html` modeled after `/biking/index.html`: a `data-sheet="band"` page whose `gen:blurb`, `gen:tools` and `gen:readmes` regions `scripts/build_tools.py` fills from the pages on disk (the `github-toc.js` element on those pages only lists bookmarklets from another repo). Add the district under `districts` in `data/tool-notes.json`, then add its paths to the trigger list and its `index.html` to the `git add` line in `.github/workflows/build-blog.yml`. Choose the page's map with `<body data-sheet="full|band|off">`: `full` is the home page only (needs `home.css` and `sheet.js`), `band` puts a strip of the real map behind the top of the page (hubs, sections, the blog), `off` has no map. Copy markup from `/style-guide.html`. After creating a new section also make sure to update this file (AGENTS.md) accordingly!
- `/data/`: `tool-notes.json` is edited by hand (curated titles, blurbs, featured flags); `tools.json` is generated from it and the pages on disk, and feeds the search on `/tools.html`.
- `/fonts/`: Self-hosted woff2 subsets of Fraunces, DM Sans and JetBrains Mono. Declared in `styles/style.css`; no other fonts and no Google Fonts.
- `/images/`: Site-wide images and assets. `images/map/` holds the three generated map SVGs (see Do / Don't); `images/plates/` holds engravings used as CSS masks; `images/og-austegard.png` is the link-preview image.
- `/scripts/`: Shared JavaScript files or scripts used by multiple pages. `build_site.py` runs the two generators, `build_tools.py` and `build_blog.py` (flags `--check`, `--dry-run`); `map/build_flatoy.py` regenerates the map; `sheet.js` is the map layer of the home page.
- `/styles/`: CSS stylesheets. `style.css` is shared and site-wide (tokens, type, components), `home.css` is the home page only, `blog.css` is article reading styles. `/style-guide.html` documents them.

## Development Workflow

1. **Understand first**: Explore the relevant code structure before making changes (tree-sitter queries beat whole-file reads)
2. **Make changes**: Implement requested features or fixes
3. **Test**: Run tests if applicable (`npm test`)
4. **Commit**: Use clear, descriptive commit messages

## Do / Don't

- **Do**: Follow the `tool-name.html` + `tool-name_README.md` pattern when creating new tools.
- **Do**: Use hyphen-separated names for new files to maintain consistency.
- **Don't**: Generate or commit `_MAP.md` code maps — they are retired in favor of dynamic tree-sitter parsing.
- **Don't**: Edit any files in the `_site/` directory directly; it is a build output.
- **Don't**: Commit `sitemap.xml` to the repository. The deploy generates it.
- **Don't**: Edit a generated region by hand. Text between `<!--gen:NAME-->` and `<!--/gen:NAME-->`, `feed.xml`, `blog/index.html`, `tools.html` and `data/tools.json` are written by `python3 scripts/build_site.py`; change the source pages or `data/tool-notes.json` and run it (CI also runs it on `main` and commits the result).
- **Do**: Run `python3 scripts/build_site.py --check` after adding, renaming or removing a tool page or a post; it exits 1 and lists what is stale.
- **Do**: Keep `Kartdata © Kartverket (CC BY 4.0)` in the footer of every page with `data-sheet="band"` or `"full"`, and in any caption that shows map data. The map SVGs are Kartverket open data under CC BY 4.0, so this is a licence requirement. Regenerate them with `python3 scripts/map/build_flatoy.py`, never by hand.
- **Don't**: Rewrite tool pages to use the shared CSS. They stay self-contained with their own styles. Any change to `styles/style.css` must keep the pages that do link it looking right, and the legacy custom-property names (`--grouch`, `--bg`, `--link` and so on) must keep working.
- **Don't**: Add fonts, a font service or a third-party request to pages that use the shared CSS. Fonts are local, in `/fonts`.

## PR Instructions

- The repository does not have a `CONTRIBUTING.md` file with explicit instructions.
- The CI/CD workflow is configured to run on every push to the `main` branch. For significant changes, it is advisable to work on a separate branch and create a Pull Request.
- **Preview builds**: When you push to a non-main branch, a preview site is automatically deployed to Cloudflare Pages (see [Branch Preview Builds](#branch-preview-builds)). The workflow does not post a comment on the PR — the preview URL lives in the workflow run's job summary.
- **Include preview link in PR description**: When creating a PR, include a link to the [Branch Preview workflow runs](https://github.com/oaustegard/oaustegard.github.io/actions/workflows/branch-preview.yml) so the reviewer can find the `*.pages.dev` preview URL from the workflow summary.

## Additional Context

- **Deployment**: pushes to `main` that touch posts, tool pages, the notes file or a generator run the Build site workflow (`.github/workflows/build-blog.yml`), which commits regenerated listings. `.github/workflows/deploy.yml` then publishes to GitHub Pages.
- **Generated Sitemap**: `deploy.yml` writes `sitemap.xml` from the HTML files it finds. It is not stored in the repository but is on the live site at `https://austegard.com/sitemap.xml`. The 404 page uses it to find pages that moved.
- **No JS/CSS Bundling**: The project does not use a modern asset pipeline (like Webpack or Vite). Scripts and styles are included directly in the HTML files.
