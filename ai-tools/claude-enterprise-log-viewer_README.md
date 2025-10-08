# Claude Enterprise Audit Log Viewer

An advanced, client-side web application for parsing, analyzing, and visualizing audit logs from Claude Enterprise.

**[Live Demo](https://austegard.com/ai-tools/claude-enterprise-log-viewer.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/claude-enterprise-log-viewer.html)**

## Overview

This tool provides a comprehensive interface for security analysts, administrators, and team leads to make sense of their Claude Enterprise audit logs. By simply uploading the `.zip` archive provided by Anthropic, users can unlock a powerful dashboard with rich visualizations, advanced filtering, and detailed log inspection capabilities, all within their browser.

## Features

-   **Interactive Analytics Dashboard**: Automatically generates key metrics and charts, including:
    -   Total events and active user counts.
    -   Breakdowns of administrative actions, content creation, and security events.
    -   Leaderboards for top active users and content activity.
    -   Security alerts for users accessing the service from multiple IP addresses.
    -   Daily activity charts for conversations and projects over time.
-   **Powerful Filtering and Search**:
    -   Filter logs by event type.
    -   Select custom date ranges or use quick presets (e.g., Last 7/30/90 days).
    -   Perform full-text search across events, actors, IPs, and other metadata.
-   **Detailed Log Inspection**: Click any log in the table to open a detailed view showing all associated data, including parsed JSON objects for actor, event, and entity information.
-   **Client-Side Privacy**: All data is processed locally in your browser. No audit log data is ever uploaded to a server.
-   **Data Export**: Export the full, original log set or your filtered results to a CSV file for further analysis.
-   **Direct ZIP Support**: Handles the `.zip` archive directly from the Claude Enterprise console, automatically extracting and parsing the `audit_logs.csv` file.

## Usage

1.  From your Claude Enterprise console, navigate to **Settings & Members -> Reporting** and export your audit logs. This will download a `.zip` file.
2.  Open the [Claude Audit Log Viewer](https://austegard.com/ai-tools/claude-enterprise-log-viewer.html).
3.  Drag and drop the `.zip` file onto the upload area, or click to browse and select the file from your computer.
4.  The tool will process the file and display the dashboard and log table.
5.  Use the search, filter, and sort controls to investigate the data. Click on any row to view its complete details.

## Technical Details

-   **Frontend**: Built with [Preact](https://preactjs.com/), [htm](https://github.com/developit/htm), and styled with [TailwindCSS](https://tailwindcss.com/).
-   **File Handling**: Uses [JSZip](https://stuk.github.io/jszip/) to read the `.zip` archive and [Papaparse](https://www.papaparse.com/) to process the enclosed CSV data.
-   **State Management**: Powered by `@preact/signals` for efficient and reactive UI updates.
-   **Operation**: Runs entirely in the browser. No server-side components or data storage.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.