# claude-skills Code Wall

Every text source file of [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills) on one zoomable plane.

**[Live](https://austegard.com/deepzoom/code-wall.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/deepzoom/code-wall.html)**

Each top-level directory is a block, and its files run down 300-line columns in path order. Zoomed out, every line is a bar in its most common token colour, like an editor minimap. Closer in, each token gets its own bar. At about 6 pixels per line the real text appears, readable at 1:1 with line numbers.

- **Syntax** colours tokens by class (keyword, definition, string, comment and so on), using pygments.
- **Recency** colours each line by its `git blame` date. The band at the top of each column shows the file's last commit.
- Hovering shows the path, line, when that line last changed, and the file's last commit.
- Clicking a line at reading zoom opens it on GitHub. Clicking at lower zoom zooms to that column.

The snapshot covers 650 files and 110,489 lines at commit 9892f18 (2026-09-25). It skips `plugins/` and `marketplace.json`, which are regenerated from the skill directories, and symlinks. The text, token classes and blame dates are all embedded, so the page makes no requests after it loads.
