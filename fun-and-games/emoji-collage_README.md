# Emoji Collage Maker

A web-based tool that transforms any image into a collage composed entirely of emojis.

**[Live Demo](https://austegard.com/fun-and-games/emoji-collage.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/emoji-collage.html)**

## Overview

This tool analyzes an uploaded image pixel by pixel and replaces each pixel with the emoji that best matches its color. It uses a large, pre-processed palette of emojis and a sophisticated color-matching algorithm to create surprisingly detailed and colorful results.

## Features

-   **Image-to-Emoji Conversion**: Upload any image to see it recreated with emojis.
-   **Customizable Output**: Adjust the resolution (number of emojis) and the background color of the final collage.
-   **Smart Background Suggestion**: Automatically suggests a background color by analyzing the borders of your uploaded image.
-   **Advanced Color Matching**: Converts colors to the CIELAB space to find emojis that are perceptually closest to the original pixel colors.
-   **Large Emoji Palette**: On first use, the tool generates and caches a comprehensive palette of thousands of emojis and their corresponding colors for accurate matching.
-   **Multiple Export Options**: Download your finished collage as a high-resolution PNG, a scalable SVG, or open it in a new full-page tab.
-   **Interactive Preview**: Zoom in and out of the generated collage to inspect the details.
-   **Client-Side Privacy**: All image processing and collage generation happens locally in your browser. No data is sent to a server.

## Usage

1.  Open the [Emoji Collage Maker](https://austegard.com/fun-and-games/emoji-collage.html).
2.  On your first visit, the tool will take a moment to build and cache its emoji color palette. A progress bar will be displayed.
3.  **Upload an Image** using the file input.
4.  Optionally, adjust the **Resolution** and **Background Color**.
5.  Click **Generate Collage**.
6.  Use the preview controls to zoom, or use the download buttons to save your creation.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) and styled with [TailwindCSS](https://tailwindcss.com/), loaded via CDN.
-   **Image Processing**: Uses the HTML5 Canvas API to read pixel data from the uploaded image.
-   **Color Science**: Implements RGB to CIELAB color space conversion for more accurate, human-perception-based color matching.
-   **Performance**: Caches the extensive emoji color palette in `localStorage` to significantly speed up subsequent visits.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.