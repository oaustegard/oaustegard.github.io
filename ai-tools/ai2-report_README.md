# Research Report Viewer

A web-based tool for viewing and exporting structured research reports from JSON files.

**[Live Demo](https://austegard.com/ai-tools/ai2-report.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/ai2-report.html)**

## Overview

This tool provides an interface to render structured research reports defined in a JSON format. It's designed to handle reports with sections, citations from Semantic Scholar, and a "TLDR" summary for each section. The viewer generates a clean, readable layout with a table of contents and allows for easy navigation and data export.

## Features

- **JSON Report Rendering**: Upload a JSON file to dynamically render a full research report.
- **Drag-and-Drop Interface**: Easily upload files by dragging them onto the page.
- **Structured Content**: Displays a table of contents, report sections, and handles citations.
- **Export Functionality**: Export the rendered report to either standalone HTML or Markdown formats.
- **Client-Side Processing**: All file processing and rendering happens in the browser for privacy and speed.

## Usage

1.  Open the [Research Report Viewer](https://austegard.com/ai-tools/ai2-report.html).
2.  Drag and drop a JSON report file onto the designated area, or click the area to open a file browser.
3.  The tool will automatically parse and display the report.
4.  Use the "Export as HTML" or "Export as Markdown" buttons to save the report locally.
5.  Click "Load Another Report" to start over.

## Technical Details

-   Built with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm) for a lightweight, modern UI.
-   Uses `@preact/signals` for state management.
-   All operations are performed client-side; no data is sent to a server.
-   The tool can parse and display complex JSON structures, including nested citation data.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.