# HTML Trimmer for LLM Communication

An interactive web tool designed to intelligently reduce the size of large HTML documents, making them more efficient and cost-effective for use with Large Language Models (LLMs).

**[Live Demo](https://austegard.com/web-utilities/trimmer.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/trimmer.html)**

## Overview

When working with LLMs, providing large HTML documents as context can be slow and expensive. This tool provides a powerful interface to parse, analyze, and interactively trim HTML content. It goes beyond simple tag stripping by identifying structural patterns and redundancies, allowing you to preserve the essential structure of a page while drastically reducing its size.

## Features

-   **Interactive Tree View**: Visualizes the entire DOM structure and allows you to enable or disable any element or entire branches with a single click.
-   **Automatic Pattern Detection**: Intelligently identifies repeating elements (like product cards, list items, or comments) and provides quick actions to keep only the first few instances.
-   **Table Analysis**: Automatically detects tables and offers options to trim them down to a specified number of rows, preserving the headers.
-   **Live Preview & Output**: Instantly see a rendered preview of your trimmed HTML and get the final, clean code in an output box ready to be copied.
-   **Real-time Stats**: Tracks the original size, trimmed size, and the percentage of data saved as you make changes.
-   **Client-Side Processing**: All parsing and processing happens in your browser, ensuring your data remains private.

## Usage

1.  Open the [HTML Trimmer](https://austegard.com/web-utilities/trimmer.html).
2.  Paste your full HTML content into the **Input HTML** text area.
3.  Click **Parse HTML**.
4.  Navigate to the **Structure Analysis** tab.
    -   Use the **Table Analysis** and **Detected Patterns** panels to perform high-level trimming (e.g., "Keep 3 Rows" in a large table).
    -   Use the interactive tree view at the bottom to manually uncheck any specific elements you wish to remove.
5.  Switch to the **Preview** tab to see how the trimmed HTML renders.
6.  Go to the **Output** tab to copy the final, minified HTML for use in your LLM prompt.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/), [htm](https://github.com/developit/htm), and `@preact/signals` for a reactive UI.
-   **HTML Parsing**: Uses the browser's native `DOMParser` to build the initial document tree.
-   **Styling**: Styled with [TailwindCSS](https://tailwindcss.com/).
-   **Architecture**: Runs entirely client-side; no data is sent to a server.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.