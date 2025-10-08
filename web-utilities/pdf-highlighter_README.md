# PDF Reader with Highlighting

An advanced, dual-panel PDF analysis tool that synchronizes a PDF view with its extracted text, allowing for intuitive highlighting and commenting.

**[Live Demo](https://austegard.com/web-utilities/pdf-highlighter.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/pdf-highlighter.html)**

## Overview

This tool is designed for in-depth document analysis. It presents a PDF in a two-pane interface: the original, rendered PDF on the left, and its full, extracted text content on the right. Users can select text in the right-hand panel to apply color-coded highlights (e.g., for positive or negative sentiment) and add comments. The two panels are scroll-synced, making it easy to cross-reference the text with its original location in the document.

## Features

-   **Dual-Panel View**: Simultaneously view the rendered PDF and its extracted, selectable text.
-   **Text Highlighting**: Select text in the text panel to apply "green" (positive) or "red" (negative) highlights.
-   **Commenting**: Add notes and comments to any highlight.
-   **Scroll Sync**: Automatically keeps the PDF and text panels synchronized. Scrolling through the rendered PDF on the left will scroll the text panel to the corresponding page, and vice-versa.
-   **Multiple Load Options**: Load a PDF from a local file or directly from a URL.
-   **Export Analysis**: Download all your highlights and comments as a structured JSON file for further use.
-   **Keyboard Shortcuts**: Use `G` and `R` keys to quickly switch between green and red highlighters.
-   **Client-Side Privacy**: All file processing, text extraction, and analysis happens locally in your browser. No data is ever sent to a server.

## Usage

1.  Open the [PDF Reader](https://austegard.com/web-utilities/pdf-highlighter.html).
2.  Use the **Upload PDF** button or the **URL input** to load your document.
3.  The tool will render the PDF on the left and extract its text to the right panel.
4.  Use the highlighter tool buttons (or `G`/`R` keys) to select a color.
5.  In the right-hand text panel, select any piece of text to apply the highlight.
6.  Click on a highlight to add or edit a comment.
7.  When finished, click the **Export** button to save a JSON file of your work.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm).
-   **PDF Engine**: Uses Mozilla's [PDF.js](https://mozilla.github.io/pdf.js/) library for both rendering the PDF canvas and extracting the text content.
-   **State Management**: Component state is managed with Preact hooks.
-   **Styling**: Uses [TailwindCSS](https://tailwindcss.com/) for the user interface.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.