# Bookmarklet Installer

A web-based tool to easily create and install bookmarklets from a GitHub repository or from custom code.

**[Live Demo](https://austegard.com/web-utilities/bookmarklet-installer.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/bookmarklet-installer.html)**

## Overview

This utility simplifies the process of installing bookmarklets. It can fetch a list of pre-written bookmarklets from the [oaustegard/bookmarklets](https://github.com/oaustegard/bookmarklets) repository or accept custom JavaScript code. The tool then minifies the code and generates a standard bookmarklet link that you can drag directly to your browser's bookmarks bar.

## Features

-   **Pre-defined List**: Fetches and displays a list of available bookmarklets directly from a GitHub repository.
-   **Custom Code Support**: Allows you to paste your own JavaScript to create a custom bookmarklet.
-   **Code Minification**: Uses Terser.js to automatically minify the JavaScript, ensuring it's compact and efficient.
-   **Code Formatting**: Includes a "Format Code" button that uses `js-beautify` to clean up custom code.
-   **Direct Installation**: Generates a draggable link, which is the standard method for installing bookmarklets.
-   **Source & README Links**: For pre-defined bookmarklets, it provides direct links to the source code and any available README files on GitHub.
-   **Shareable Links**: The currently selected bookmarklet is stored in the URL, so you can share a direct link to a specific installer page.

## Usage

There are two ways to use the installer:

### Option 1: Select a Pre-defined Bookmarklet

1.  Open the [Bookmarklet Installer](https://austegard.com/web-utilities/bookmarklet-installer.html).
2.  Choose a bookmarklet from the dropdown menu. The code and a suggested name will be automatically loaded.
3.  (Optional) Modify the name if desired.
4.  Drag the generated link below the name field to your bookmarks bar.

### Option 2: Use Your Own Code

1.  Open the [Bookmarklet Installer](https://austegard.com/web-utilities/bookmarklet-installer.html).
2.  Paste your JavaScript code into the text area.
3.  Enter a name for your bookmarklet in the name field.
4.  Drag the generated link to your bookmarks bar.

## Technical Details

-   **Framework**: Built with vanilla JavaScript.
-   **API Integration**: Uses the GitHub API to fetch the list of bookmarklets.
-   **JavaScript Libraries**:
    -   [Terser.js](https://terser.org/) for code minification.
    -   [js-beautify](https://beautifier.io/) for code formatting.
-   **State Management**: Uses URL `searchParams` to maintain the state of the selected bookmarklet.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.