# Emoji Collage Maker (Advanced)

An advanced version of the Emoji Collage Maker that allows for fine-tuned control over the emoji palette used for collage generation.

**[Live Demo](https://austegard.com/fun-and-games/emoji-collage2.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/emoji-collage2.html)**

## Overview

This tool enhances the original Emoji Collage Maker by introducing selectable emoji categories. You can now choose specific sets of emojis—such as "Faces & People," "Nature," or "Food & Drink"—to constrain the palette, allowing for more thematic and artistic results. The core functionality of converting an image into a pixel-perfect emoji collage remains, but with greater creative control.

## Features

-   **Customizable Emoji Palettes**: Select one or more emoji categories to build a custom palette for your collage. Want a portrait made of only faces? Or a landscape made of only nature emojis? Now you can.
-   **Image-to-Emoji Conversion**: Upload any image to see it recreated with your chosen set of emojis.
-   **Optimized Palette Caching**: The tool caches the entire master emoji palette on first use, then filters it instantly based on your category selections, providing a faster experience after the initial setup.
-   **Advanced Color Matching**: Uses the CIELAB color space to find the most perceptually accurate emoji for each pixel's color.
-   **Smart Background Suggestion**: Automatically suggests a background color based on the borders of your uploaded image.
-   **Multiple Export Options**: Download your finished collage as a high-resolution PNG, a scalable SVG, or open it in a new full-page tab.
-   **Interactive Preview**: Zoom in and out of the generated collage.

## Usage

1.  Open the [Emoji Collage Maker](https://austegard.com/fun-and-games/emoji-collage2.html).
2.  (First visit only) Allow the tool to build and cache its master emoji palette.
3.  Use the checkboxes to select the **Emoji Categories** you want to include. The palette will update automatically.
4.  **Upload an Image**.
5.  Optionally, adjust the **Resolution** and **Background Color**.
6.  Click **Generate Collage**.
7.  Use the download buttons to save your creation.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) and styled with [TailwindCSS](https://tailwindcss.com/).
-   **Image Processing**: Uses the HTML5 Canvas API for pixel data analysis.
-   **Color Science**: Implements RGB to CIELAB color space conversion for accurate color matching.
-   **Palette Management**: A singleton manager handles the master emoji palette, caching it in `localStorage` and creating filtered color indices on the fly based on user selections.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.