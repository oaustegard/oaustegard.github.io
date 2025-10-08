# Claude Pruner

A web-based tool for selectively pruning and exporting conversations from Claude.ai, including messages, artifacts, tool usage, and thinking steps.

**[Live Demo](https://austegard.com/ai-tools/claude-pruner.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/claude-pruner.html)** | **[Companion Bookmarklet](https://github.com/oaustegard/bookmarklets/blob/main/claude-pruner.js)**

## Overview

Claude Pruner provides a detailed, interactive view of a Claude.ai conversation, allowing you to deconstruct it into its core components. The tool receives conversation data from a companion bookmarklet and organizes it into two columns: one for human/assistant messages and "thinking" blocks, and another for generated artifacts and tool usage. You can then select precisely which parts of the conversation you want to keep and export them as a clean, structured text file.

## Features

-   **Detailed Conversation View**: Separates a conversation into messages, artifacts (e.g., code blocks), tool use/results, and "thinking" steps.
-   **Granular Selection**: Individually select or deselect any component of the conversation.
-   **Bulk Toggling**: Quickly toggle the selection state for all human messages, assistant messages, artifacts, tools, or thinking blocks.
-   **Usage Statistics**: Provides a running total of selected items, word count, and estimated token count for the pruned conversation.
-   **Flexible Export**: Copy the formatted selection to your clipboard or download it as a `.txt` file.
-   **Privacy-Focused**: All processing happens entirely in your browser. No conversation data is ever sent to a server.

## Usage

This tool is designed to be used with its companion bookmarklet.

1.  Install the [Claude Pruner bookmarklet](https://github.com/oaustegard/bookmarklets/blob/main/claude-pruner.js) in your browser.
2.  While on an active conversation page on `claude.ai`, click the bookmarklet.
3.  A new tab will open with this tool, displaying the full conversation broken down into its components.
4.  By default, all items are selected. Click any item to deselect it. Use the toggle buttons at the top to manage selections in bulk.
5.  Once you have pruned the conversation to your liking, click **Copy** to copy the formatted output or **Download** to save it as a text file.

## Technical Details

-   Built with vanilla JavaScript, HTML, and CSS.
-   Receives conversation data from the `claude.ai` domain via the `window.postMessage` API.
-   Dynamically parses the JSON data structure and renders the interactive UI.
-   Sorts all selected components chronologically in the final exported output.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.