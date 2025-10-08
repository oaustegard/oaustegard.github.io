# Claude API Response Viewer

A web-based tool to parse and display structured JSON responses from the Anthropic (Claude) API.

**[Live Demo](https://austegard.com/ai-tools/anthropic-json.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/anthropic-json.html)**

## Overview

This tool renders the JSON output from a Claude API call into a human-readable format. It is particularly useful for analyzing responses that involve complex interactions, such as tool use for web searches and "thinking" steps. The viewer accepts a URL to a GitHub Gist containing the raw JSON, making it easy to share and inspect detailed API outputs.

## Features

-   **Load from Gist**: Securely load API response data from a public GitHub Gist URL.
-   **Thinking Process Visualization**: Displays the agent's "thinking" steps in a collapsible section.
-   **Web Search Display**: Neatly organizes and shows web search queries and their results.
-   **Markdown and Citation Rendering**: Correctly formats markdown content (headers, lists, bold text) and displays citations with links.
-   **Client-Side Operation**: All parsing and rendering is done in the browser, ensuring user data remains private.

## Usage

1.  Obtain the full JSON response from a Claude API call.
2.  Create a new public GitHub Gist and paste the JSON content into it. The Gist should contain only the raw JSON.
3.  Copy the URL of the Gist.
4.  Open the [Claude API Response Viewer](https://austegard.com/ai-tools/anthropic-json.html).
5.  Paste the Gist URL into the input field and click **Load Response**.
6.  The tool will fetch, parse, and display the structured response.

## Technical Details

-   Built with [Preact](https://preactjs.com/) and [htm](https://github.com/developit/htm).
-   Uses URL parameters (`?gist=...`) to make specific responses shareable.
-   Includes a simple markdown-to-HTML converter to render text content.
-   All data is processed client-side.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.