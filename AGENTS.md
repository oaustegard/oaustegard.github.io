# AGENTS.md: AI Agent Instructions

This document provides guidance for AI agents interacting with this repository. The information is based on an analysis of the existing codebase, structure, and workflows.

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

- **No Automated Tests**: The repository does not contain an automated test suite.
- **Manual Verification**: Testing is performed by running the site locally with `bundle exec jekyll serve` and manually verifying that pages render correctly and tools are functional.
- **CI/CD**: The `.github/workflows/main.yml` workflow only builds the site; it does not run any tests.

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
- `/fun-and-games/`: Interactive pages, curiosities, and small games.
- `/web-utilities/`: General-purpose web tools like formatters, converters, and bookmarklets.
- **Creating New Sections**: To create a new tool category, create a new directory (e.g., `/new-tools/`). Add an `index.html` file inside it, modeled after `/ai-tools/index.html`, which uses the `github-toc.js` component to list the tools in that directory.
- `/images/`: Site-wide images and assets.
- `/scripts/`: Shared JavaScript files or scripts used by multiple pages.
- `/styles/`: CSS stylesheets.

## Do / Don't

- **Do**: Follow the `tool-name.html` + `tool-name_README.md` pattern when creating new tools.
- **Do**: Use hyphen-separated names for new files to maintain consistency.
- **Don't**: Edit any files in the `_site/` directory directly, as it is a build artifact.
- **Don't**: Commit generated files like `sitemap.xml` to the repository. It is generated during the build process.

## PR Instructions

- The repository does not have a `CONTRIBUTING.md` file with explicit instructions.
- The CI/CD workflow is configured to run on every push to the `main` branch. For significant changes, it is advisable to work on a separate branch and create a Pull Request.

## Additional Context

- **Deployment**: The site is automatically built and deployed to GitHub Pages on every push to the `main` branch, as defined in `.github/workflows/main.yml`.
- **Generated Sitemap**: The `sitemap.xml` file is generated automatically by the `jekyll-sitemap` plugin during the Jekyll build process. It is not stored in the repository but is available on the live site at `https://austegard.com/sitemap.xml`.
- **No JS/CSS Bundling**: The project does not use a modern asset pipeline (like Webpack or Vite). Scripts and styles are included directly in the HTML files.