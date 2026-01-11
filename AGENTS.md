# AGENTS.md: AI Agent Instructions

This document provides guidance for AI agents interacting with this repository. The information is based on an analysis of the existing codebase, structure, and workflows.

## Skills Management

To install or update Claude skills from the [claude-skills repository](https://github.com/oaustegard/claude-skills):

**Option 1: Run locally**
```bash
bash .claude/install-skills.sh
```

**Option 2: Trigger GitHub Actions**
- Go to Actions tab → "Install Claude Skills" → Run workflow
- Changes are automatically committed and pushed

**To add/remove skills**: Edit the `SKILLS` array in `.claude/install-skills.sh`

## Code Maps - Navigation & Maintenance

This repository uses **code maps** (`_MAP.md` files) to provide navigable overviews of the codebase structure without requiring you to read every file.

### Using Code Maps

1. **Start with the root map**: Read `_MAP.md` first to understand the overall structure
2. **Navigate hierarchically**: Click through subdirectory links (e.g., `[bsky/](./bsky/_MAP.md)`) to explore specific areas
3. **Understand dependencies**: Maps show exports/imports to reveal module relationships
4. **Only read source files when needed**: Use maps to identify relevant files before reading them

**Example workflow:**
```
1. Read _MAP.md (see 10 subdirectories)
2. Read bsky/_MAP.md (see bsky-core.js exports 16 functions)
3. Read bsky-quote.js (see it imports from bsky-core.js)
4. Now read the actual source files only if needed
```

### Maintaining Code Maps

**IMPORTANT**: When you modify code that affects exports or imports, you MUST regenerate the maps.

#### When to regenerate:
- ✅ After adding/removing exported functions, classes, or variables
- ✅ After adding/removing import statements
- ✅ After creating new files in the codebase
- ✅ After renaming or moving files
- ❌ Not needed for internal implementation changes that don't affect the module interface

#### How to regenerate:

```bash
# Regenerate all maps (dependencies auto-install on first run)
python .claude/skills/mapping-codebases/scripts/codemap.py .

# Include updated maps in your commit
git add '*/_MAP.md'
```

#### Update Code Maps workflow (GitHub Actions)

You can run the **Update Code Maps** workflow from GitHub Actions. It lives in `.github/workflows/update-code-maps.yml` and currently runs via `workflow_dispatch` (manual).

**Best practice**: Regenerate maps just before committing code changes that affect module interfaces. You can also use the Update Code Maps workflow after changes that alter imports/exports, in addition to the local `codemap.py` command.

## Dev Environment Tips

This is a Jekyll-based static site published to GitHub Pages.

- **Ruby Version**: The project uses **Ruby 3.1**, as specified in the `.github/workflows/main.yml` file.
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
  - See `bsky/_MAP.md` for the current module structure and dependencies.
- `/fun-and-games/`: Interactive pages, curiosities, and small games.
- `/web-utilities/`: General-purpose web tools like formatters, converters, and bookmarklets.
- **Creating New Sections**: To create a new tool category, create a new directory (e.g., `/new-tools/`). Add an `index.html` file inside it, modeled after `/ai-tools/index.html`, which uses the `github-toc.js` component to list the tools in that directory. After creating a new section also make sure to update this file (AGENTS.md) accordingly!
- `/images/`: Site-wide images and assets.
- `/scripts/`: Shared JavaScript files or scripts used by multiple pages.
- `/styles/`: CSS stylesheets.

## Development Workflow

1. **Understand first**: Read relevant `_MAP.md` files before making changes to understand code structure
2. **Make changes**: Implement requested features or fixes
3. **Update maps**: Regenerate if you changed exports/imports in JavaScript files
4. **Test**: Run tests if applicable (`npm test`)
5. **Commit**: Include updated `_MAP.md` files in commits when relevant

## Do / Don't

- **Do**: Follow the `tool-name.html` + `tool-name_README.md` pattern when creating new tools.
- **Do**: Use hyphen-separated names for new files to maintain consistency.
- **Do**: Regenerate code maps after changing JavaScript module exports/imports.
- **Don't**: Edit any files in the `_site/` directory directly, as it is a build artifact.
- **Don't**: Commit generated files like `sitemap.xml` to the repository. It is generated during the build process.

## PR Instructions

- The repository does not have a `CONTRIBUTING.md` file with explicit instructions.
- The CI/CD workflow is configured to run on every push to the `main` branch. For significant changes, it is advisable to work on a separate branch and create a Pull Request.

## Additional Context

- **Deployment**: The site is automatically built and deployed to GitHub Pages on every push to the `main` branch, as defined in `.github/workflows/main.yml`.
- **Generated Sitemap**: The `sitemap.xml` file is generated automatically by the `jekyll-sitemap` plugin during the Jekyll build process. It is not stored in the repository but is available on the live site at `https://austegard.com/sitemap.xml`.
- **No JS/CSS Bundling**: The project does not use a modern asset pipeline (like Webpack or Vite). Scripts and styles are included directly in the HTML files.
