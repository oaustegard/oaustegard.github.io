# web2md: HTML to Markdown Converter

A web-based utility for converting HTML content, either from a live URL or raw source code, into clean Markdown.

**[Live Demo](https://austegard.com/web-utilities/web2md.htm)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/web2md.htm)**

## Overview

`web2md` is a handy tool for developers, writers, and content managers who need to quickly transform a webpage or a snippet of HTML into Markdown. It provides a live-editing environment and supports multiple extraction engines to give you the best possible result.

## Features

-   **Load from URL**: Enter any public URL to fetch its HTML content for conversion.
-   **Live HTML Editor**: Paste your own HTML into a full-featured CodeMirror editor. The Markdown output updates automatically as you type.
-   **Multiple Extractor Engines**: Choose between two different conversion libraries to see which one gives you the best result for your specific content:
    -   **html2text**: A general-purpose converter.
    -   **trafilatura**: An engine specialized in extracting the main text content from a page, filtering out boilerplate like headers, footers, and ads.
-   **GitHub Gist Integration**: Optionally, provide a GitHub Personal Access Token to post the generated Markdown directly to a new Gist.
-   **Syntax Highlighting**: The generated Markdown is displayed with syntax highlighting for readability.

## Usage

1.  Open the [web2md](https://austegard.com/web-utilities/web2md.htm) tool.
2.  **To convert a URL**:
    -   Enter the URL in the input field and click **Load**.
    -   The HTML content will appear in the editor, and the Markdown output will be generated below.
3.  **To convert raw HTML**:
    -   Paste your HTML code directly into the editor.
    -   The Markdown output will update in real-time.
4.  Use the dropdown menu to switch between the `html2text` and `trafilatura` extractors to compare results.

## Technical Details

-   **Framework**: The user interface is powered by [htmx](https://htmx.org/) for modern, server-driven interactivity (though in this case, the "server" is a client-side service worker).
-   **Editor**: Uses [CodeMirror](https://codemirror.net/) for the HTML input field.
-   **Styling**: Styled with [Pico.css](https://picocss.com/).
-   **Syntax Highlighting**: Uses [highlight.js](https://highlightjs.org/) for the Markdown output.

## Credits

-   This tool is a direct adaptation of the open-source [web2md by Answer.AI](https://github.com/AnswerDotAI/web2md).
-   Hosted by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.