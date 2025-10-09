# AWS Ping

An interactive map to visualize latency between AWS regions.

**[Live Demo](https://austegard.com/web-utilities/aws-ping.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/aws-ping.html)**

## Overview

This tool provides a world map displaying all AWS regions. Users can click on any region to see the P50 latency to all other regions over the last year. The data is visualized with a color-coded system, making it easy to identify low, medium, and high latency connections.

## Features

-   **Interactive World Map**: Displays all AWS regions on a clickable map.
-   **Latency Visualization**: Color-codes regions based on latency from the selected region (<100ms, 100-180ms, >180ms).
-   **Detailed Information**: Hovering over a region shows its name, location, and latency from the selected region.
-   **Region List**: A sortable list of all regions, which updates to show latency from the selected region.
-   **Statistics**: Displays average, minimum, and maximum latency from the selected region.

## Usage

1.  Open the [AWS Ping](https://austegard.com/web-utilities/aws-ping.html) tool.
2.  Click on any AWS region on the map or in the list.
3.  The map and list will update to show latency from the selected region.
4.  To clear the selection, click the "Clear Selection" button.

## Technical Details

-   **Framework**: Built with vanilla JavaScript and D3.js for data visualization.
-   **Data Source**: Uses a snapshot of P50 latency data from [cloudping.co](https://www.cloudping.co/api/latencies?percentile=p_50&timeframe=1Y).
-   **Mapping**: The world map is rendered using TopoJSON and d3-geo-projection.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.