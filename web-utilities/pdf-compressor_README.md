# PDF Compressor & Text Extractor

A powerful, in-browser tool for compressing PDF files and extracting their text content using Ghostscript compiled to WebAssembly.

**[Live Demo](https://austegard.com/web-utilities/pdf-compressor.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/pdf-compressor.html)**

## Overview

This utility provides two key functions for handling PDF files directly in your browser, ensuring your data remains completely private. You can significantly reduce the file size of a PDF by choosing from several quality presets, or you can extract all selectable text from a PDF, which is then formatted for readability and made available for download.

## Features

-   **PDF Compression**:
    -   Reduces PDF file size using the power of Ghostscript.
    -   Offers multiple quality presets (Low, Medium, High, Maximum) to balance size and quality.
    -   Compares the original and compressed file sizes and reports the percentage saved.
    -   Warns you if compression fails to reduce the file size.
-   **Text Extraction**:
    -   Extracts all text content from a PDF, page by page.
    -   Formats the output with clear page breaks (`--- Page X ---`).
    -   Provides options to copy the extracted text to the clipboard or download it as a `.txt` file.
-   **Client-Side Privacy**: All processing is done locally in your browser. Your files are never uploaded to a server.
-   **User-Friendly Interface**: Supports drag-and-drop or standard file selection.

## Usage

1.  Open the [PDF Compressor](https://austegard.com/web-utilities/pdf-compressor.html).
2.  Wait for the Ghostscript library to load.
3.  Drag and drop your PDF file onto the designated area, or click it to select a file.
4.  **To Compress**:
    -   Select your desired **Quality** from the dropdown menu.
    -   Click **Compress PDF**. The process may take a moment.
    -   A download link for the compressed file will appear.
5.  **To Extract Text**:
    -   Click **Extract Text**.
    -   The extracted text will appear in a text area below, ready to be copied or downloaded.

## Technical Details

-   **Core Engine**: Uses [@jspawn/ghostscript-wasm](https://github.com/jspawn/ghostscript-wasm), a WebAssembly port of the powerful Ghostscript PDF interpreter.
-   **Technology**: Built with vanilla JavaScript, HTML, and CSS.
-   **File Handling**: Uses the File API to read the user's PDF and creates downloadable blobs for the output.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.