# Page Scrawl

A bookmarklet for drawing on any web page, noting what is wrong at each mark and handing the marks to Claude, or pasting them into any chat.

## How it works

`page-scrawl.html` fetches `overlay.js` from the `marking-up-pages-v0.2.0` tag of [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills/tree/marking-up-pages-v0.2.0/marking-up-pages) when it loads and builds the draggable `javascript:` link from it. Nothing is stored on this site. To move to a newer release, change `REF` in the page's script.

## Using the bookmarklet

1. Drag the link to your bookmarks bar and click it on the page you want to mark up.
2. Draw circles, underlines, lines, arrows or points. After each mark, type or dictate a note and press Enter.
3. `⌥⇧S` turns drawing off so you can click around, and on again.
4. Press **Done**. **Copy** puts the marks on the clipboard as text and **Save** downloads a `.scrawl.json` file. With Claude in Chrome on the tab, tell Claude to look at your marks instead.

Marks stay in the tab until reload. Sites with a strict Content-Security-Policy may block bookmarklets.

## The Claude skill

The `marking-up-pages` skill lets Claude in Chrome open the overlay, read each mark with its DOM element and, on dev builds, its component and source file, then fix the code or write up the edits. Download `marking-up-pages.zip` from the [v0.2.0 release](https://github.com/oaustegard/claude-skills/releases/tag/marking-up-pages-v0.2.0) and upload it under Customize, Skills in Claude.ai.

## Credits

Tool and skill by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).
