# Webcam Emoji Mirror

A real-time web application that transforms your webcam feed into a live emoji art display.

**[Live Demo](https://austegard.com/fun-and-games/emojime.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/emojime.html)**

## Overview

This tool captures video from your webcam and converts it, frame by frame, into a grid of emojis. It analyzes blocks of pixels and replaces them with the emoji that best matches the color and tone, creating a unique and dynamic "emoji mirror" effect.

## Features

-   **Real-Time Video Conversion**: Instantly turns your webcam feed into emoji art.
-   **Mirrored Display**: The video is horizontally flipped to provide a more intuitive mirror-like experience.
-   **Advanced Color Matching**: Uses the CIELAB color space for perceptually accurate color-to-emoji mapping.
-   **Curated Emoji Palette**: Utilizes a carefully selected set of emojis, focusing on human faces with various skin tones and primary colors, to generate the image.
-   **Client-Side Privacy**: All video processing and analysis happens directly in your browser. No data is sent to any server.
-   **Single-File Application**: The entire tool is self-contained in a single HTML file.

## Usage

1.  Open the [Webcam Emoji Mirror](https://austegard.com/fun-and-games/emojime.html).
2.  The tool will take a moment to build its color index on first load.
3.  Click **Start Camera**.
4.  Your browser will ask for permission to access your webcam. You must grant access to use the tool.
5.  Your live emoji mirror will appear on the screen.
6.  Click **Stop Camera** to turn off the webcam feed.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) and vanilla JavaScript.
-   **Web APIs**: Leverages `navigator.mediaDevices.getUserMedia` to access the webcam and the HTML5 Canvas API for frame processing.
-   **Color Science**: Implements a custom color index and matching algorithm based on the CIELAB color model to ensure accurate emoji selection.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.