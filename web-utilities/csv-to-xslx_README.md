# CSV to Excel Converter

A simple, secure, and entirely client-side tool for converting CSV files or data into Excel (.xlsx) format.

**[Live Demo](https://austegard.com/web-utilities/csv-to-xslx.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/csv-to-xslx.html)**

## Overview

This utility provides a fast and private way to convert comma-separated values (CSV) into a standard Excel spreadsheet. Because all processing happens locally in your browser, your data is never uploaded to a server, guaranteeing its privacy and security.

## Features

-   **Multiple Input Methods**:
    -   Drag and drop a `.csv` file anywhere on the page.
    -   Click the "Load CSV File" button to select a file.
    -   Copy CSV data from another application and paste it directly onto the page.
-   **Instant Conversion**: The tool processes the data immediately and triggers a download of the finished `.xlsx` file.
-   **Privacy First**: 100% client-side operation. Your data never leaves your computer.
-   **No Server Uploads**: Eliminates the risk and delay associated with uploading files to a server.

## Usage

1.  Open the [CSV to Excel Converter](https://austegard.com/web-utilities/csv-to-xslx.html).
2.  Use one of the following methods to provide your data:
    -   **Drag & Drop**: Drag a `.csv` file from your computer and drop it onto the browser window.
    -   **File Picker**: Click the **Load CSV File** button and choose your file.
    -   **Paste**: Copy your CSV data (e.g., from a text editor or another spreadsheet) and paste it directly onto the page (`Ctrl+V` or `Cmd+V`).
3.  The conversion will happen automatically, and your browser will prompt you to save the resulting `.xlsx` file.

## Technical Details

-   **Core Logic**: Built with vanilla JavaScript.
-   **Library**: Uses the powerful [SheetJS (xlsx.js)](https://sheetjs.com/) library for handling the spreadsheet conversion.
-   **Environment**: Runs entirely in the browser with no server-side dependencies.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.