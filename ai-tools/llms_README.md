# LiteLLM Model Prices Viewer

A sortable and filterable web interface for viewing large language model (LLM) pricing, context window sizes, and features, based on data from the LiteLLM project.

**[Live Demo](https://austegard.com/ai-tools/llms.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/llms.html)**

## Overview

This tool provides a comprehensive and up-to-date view of the LLM landscape by fetching and displaying data directly from LiteLLM's widely-used `model_prices_and_context_window.json` file. It allows users to easily compare models from various providers based on cost, context size, and supported features like function calling, vision, and audio capabilities.

## Features

-   **Live Data**: Fetches the latest model data from the [BerriAI/litellm GitHub repository](https://github.com/BerriAI/litellm/blob/main/model_prices_and_context_window.json) on page load.
-   **Advanced Search**: Use a global search bar with `&` (AND) and `|` (OR) operators to quickly find models.
-   **Column-Level Filtering**: Filter models by provider, mode, context window size, cost, and specific features.
-   **Dynamic Sorting**: Sort the table by any column, including model name, provider, context sizes, and costs.
-   **Shareable URLs**: All filter and search states are stored in the URL, allowing you to share your exact view with others.
-   **Feature Badges**: Quickly identify model capabilities like Vision, Function Calling, and Audio support through clear visual badges.
-   **Cost Formatting**: Displays costs in a human-readable format (cost per 1 million tokens).

## Usage

1.  Open the [LiteLLM's Model Prices](https://austegard.com/ai-tools/llms.html) page.
2.  Use the main search bar to find models using keywords (e.g., `gpt & 4` or `claude | sonnet`).
3.  Use the filter inputs and dropdowns at the top of each column to narrow down the results.
4.  Click on any column header to sort the data. Click again to reverse the sort order.
5.  The table will update in real-time as you apply filters and sorting.
6.  Click "Clear Filters" to reset the view.

## Technical Details

-   Built with vanilla JavaScript and styled with [TailwindCSS](https://tailwindcss.com/).
-   Fetches data from the LiteLLM GitHub repository via the `fetch` API.
-   Performs all filtering, sorting, and rendering client-side.
-   Uses URL `searchParams` to maintain and share the state of the filters and search queries.

## Credits

-   **Data Source**: [BerriAI/litellm](https://github.com/BerriAI/litellm) (Licensed under the [MIT License](https://github.com/BerriAI/litellm/blob/main/LICENSE)).
-   **Tool Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.