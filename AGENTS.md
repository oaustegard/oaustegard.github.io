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

This is a Jekyll-based static site published to GitHub Pages.

- **Ruby Version**: The project uses **Ruby 3.3**, as specified in the `.github/workflows/main.yml` file.
- **Setup**: To set up the development environment, run the following commands:
  ```bash
  # Install the correct Ruby version (if not already installed)
  # rbenv install 3.1.2 (or similar)
  # rbenv local 3.1.2

  # Install dependencies using Bundler
  bundle install
  ```
- **Verification**: To verify the setup, start the local development server:
  ```bash
  bundle exec jekyll serve
  ```
  The site should be available at `http://127.0.0.1:4000/`.

## Commands

- **Build**: `bundle exec jekyll build`
  - This command generates the static site in the `_site/` directory. It is the same command used in the GitHub Actions workflow.
- **Dev Server**: `bundle exec jekyll serve`
  - This command starts a local web server to preview changes.
- **Lint**: There is no linting configuration in this repository.

## Testing Instructions

- **Playwright Tests**: The repository includes Playwright tests for testing web tools.
  - Run tests: `npm test`
  - Run headed: `npm run test:headed`
  - Run UI mode: `npm run test:ui`
- **Manual Verification**: Testing is also performed by running the site locally with `bundle exec jekyll serve` and manually verifying that pages render correctly and tools are functional.
- **CI/CD**: The `.github/workflows/main.yml` workflow builds the site but does not run automated tests.

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
- `/_site/`: This directory contains the generated static site after running `bundle exec jekyll build`. **Do not edit files in this directory manually**, as they will be overwritten.
- `/ai-tools/`: A collection of web-based tools related to AI, such as log viewers and data processors.
- `/bsky/`: Tools and utilities related to the BlueSky/AT Protocol social network.
  - **bsky-core.js**: Core utilities (16 exports) - dependency for other modules
  - **bsky-quote.js**: Quote post processing
  - **bsky-search.js**: Search functionality with auto-processing
  - **bsky-thread.js**: Thread processing and display
- `/fun-and-games/`: Interactive pages, curiosities, and small games.
- `/motion-player/`: An installable PWA that plays YouTube videos inline with motion-based (device-orientation) pan/zoom/roll-stabilization plus touch gestures. Self-contained directory (own `manifest.webmanifest`, `sw.js`, icons) so the service-worker scope stays isolated; see `motion-player/README.md` and `motion-player/SPEC.md`.
- `/web-utilities/`: General-purpose web tools like formatters, converters, and bookmarklets.
- **Creating New Sections**: To create a new tool category, create a new directory (e.g., `/new-tools/`). Add an `index.html` file inside it, modeled after `/ai-tools/index.html`, which uses the `github-toc.js` component to list the tools in that directory. After creating a new section also make sure to update this file (AGENTS.md) accordingly!
- `/images/`: Site-wide images and assets.
- `/scripts/`: Shared JavaScript files or scripts used by multiple pages.
- `/styles/`: CSS stylesheets.

## Development Workflow

1. **Understand first**: Explore the relevant code structure before making changes (tree-sitter queries beat whole-file reads)
2. **Make changes**: Implement requested features or fixes
3. **Test**: Run tests if applicable (`npm test`)
4. **Commit**: Use clear, descriptive commit messages

## Do / Don't

- **Do**: Follow the `tool-name.html` + `tool-name_README.md` pattern when creating new tools.
- **Do**: Use hyphen-separated names for new files to maintain consistency.
- **Don't**: Generate or commit `_MAP.md` code maps — they are retired in favor of dynamic tree-sitter parsing.
- **Don't**: Edit any files in the `_site/` directory directly, as it is a build artifact.
- **Don't**: Commit generated files like `sitemap.xml` to the repository. It is generated during the build process.

## PR Instructions

- The repository does not have a `CONTRIBUTING.md` file with explicit instructions.
- The CI/CD workflow is configured to run on every push to the `main` branch. For significant changes, it is advisable to work on a separate branch and create a Pull Request.
- **Preview builds**: When you push to a non-main branch, a preview site is automatically deployed to Cloudflare Pages (see [Branch Preview Builds](#branch-preview-builds)). The workflow does not post a comment on the PR — the preview URL lives in the workflow run's job summary.
- **Include preview link in PR description**: When creating a PR, include a link to the [Branch Preview workflow runs](https://github.com/oaustegard/oaustegard.github.io/actions/workflows/branch-preview.yml) so the reviewer can find the `*.pages.dev` preview URL from the workflow summary.

## Additional Context

- **Deployment**: The site is automatically built and deployed to GitHub Pages on every push to the `main` branch, as defined in `.github/workflows/main.yml`.
- **Generated Sitemap**: The `sitemap.xml` file is generated automatically by the `jekyll-sitemap` plugin during the Jekyll build process. It is not stored in the repository but is available on the live site at `https://austegard.com/sitemap.xml`.
- **No JS/CSS Bundling**: The project does not use a modern asset pipeline (like Webpack or Vite). Scripts and styles are included directly in the HTML files.
