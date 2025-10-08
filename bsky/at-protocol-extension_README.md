# at-protocol Extension

A web page that displays the README for a Chrome Extension that provides a context menu for opening `at://` protocol URIs in bsky.app.

**[Live Demo](httpshttps://austegard.com/bsky/at-protocol-extension.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/at-protocol-extension.html)**

## Overview

This page displays the README file for a related Chrome browser extension. The extension simplifies the process of viewing Bluesky content by allowing users to right-click on an `at://` protocol URI and open it directly in the bsky.app web client.

## Features

- **Context Menu Integration**: Adds a "Open in bsky.app" option to the browser's right-click context menu for selected `at://` URIs.
- **Seamless Redirects**: Automatically constructs and opens the correct bsky.app URL for the given URI.

## Usage

1. **Install the Extension**: (Link to be provided, as it's a separate project)
2. **Select a URI**: Highlight an `at://` protocol URI on any webpage.
3. **Right-Click and Open**: Right-click the selected text and choose "Open in bsky.app" from the context menu.
4. **View in Bluesky**: The corresponding post, profile, or feed will open in a new browser tab.

## Technical Details

- The page uses `zero-md` to render the remote README file from the extension's GitHub repository.
- The extension itself is a separate project, and this page serves as a simple viewer for its documentation.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))