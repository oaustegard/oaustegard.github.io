# Page Scrawl

A bookmarklet for drawing on any web page, noting what is wrong at each mark and handing the marks to Claude, or pasting them into any chat.

## Inspiration

Page Scrawl is inspired by [Scrawl](https://github.com/kitlangton/scrawl), the macOS menu-bar app by Kit Langton (MIT licensed). Scrawl records your screen, voice and on-screen markings and packages them for an AI agent, on the idea that showing an agent a problem beats describing it. Many thanks to Kit for the idea. Page Scrawl is a much simpler implementation of it: no app and no recording, only marks drawn on one web page in the browser, tied to the DOM. It uses the same `⌥⇧S` shortcut. For the full version, use Kit's app.

## How it works

`page-scrawl.html` fetches `overlay.js` from the `marking-up-pages-v0.2.0` tag of [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills/tree/marking-up-pages-v0.2.0/marking-up-pages) when it loads and builds the draggable `javascript:` link from it. Nothing is stored on this site. To move to a newer release, change `REF` in the page's script.

## Using the bookmarklet

1. Drag the link to your bookmarks bar and click it on the page you want to mark up.
2. Draw circles, underlines, lines, arrows or points. After each mark, type or dictate a note and press Enter.
3. `⌥⇧S` turns drawing off so you can click around, and on again.
4. Press **Done**, then share the marks one of two ways.
   - **With Claude in Chrome** running on that tab: tell Claude to look at your marks. Claude reads them from the page directly.
   - **Without it**: **Copy** puts the marks on the clipboard as text and **Save** downloads a `.scrawl.json` file, to paste or attach in any chat. Claude then works from the selectors, text and styles in the file, and cannot see the page or take screenshots.

Marks stay in the tab until reload. Sites with a strict Content-Security-Policy may block bookmarklets.

## The Claude skill

The skill requires the Claude in Chrome extension, because Claude has to run the overlay inside your browser tab to open it, read the marks and take screenshots. Without that extension, use the bookmarklet's Copy and Save buttons instead. With it, the `marking-up-pages` skill lets Claude in Chrome open the overlay, read each mark with its DOM element and, on dev builds, its component and source file, then fix the code or write up the edits. Download `marking-up-pages.zip` from the [v0.2.0 release](https://github.com/oaustegard/claude-skills/releases/tag/marking-up-pages-v0.2.0) and upload it under Customize, Skills in Claude.ai.

## Credits

Tool and skill by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)). Idea and original app: [Kit Langton](https://github.com/kitlangton/scrawl).
