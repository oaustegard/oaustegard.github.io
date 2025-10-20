# Generative Typography Playground

An interactive web application for experimenting with generative poetry and dynamic typography effects.

**[Live Demo](https://austegard.com/fun-and-games/poetry-playground.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/poetry-playground.html)**

## Overview

This playground is an experimental canvas where poetry meets reactive design. It randomly generates poems from a collection of fragments and allows you to manipulate their visual presentation in real-time using various typographic controls and layout algorithms. The result is a mesmerizing, ever-changing display of animated text set against an interactive particle background.

## Features

-   **Generative Poetry**: Randomly combines poetic fragments to create unique compositions with each generation.
-   **Dynamic Typography Controls**: Adjust font family, size, letter spacing, and line height in real-time.
-   **Multiple Layout Modes**: Choose from four distinct layout algorithms:
    -   **Flow**: Flexible, wrapping text layout
    -   **Cascade**: Staggered, waterfall-style arrangement
    -   **Scatter**: Randomly positioned words across the canvas
    -   **Spiral**: Words arranged in a spiral pattern
-   **Visual Effects**: Apply floating and glowing animations to text elements.
-   **Interactive Particle Background**: Canvas-based particle system with configurable intensity and dynamic connections.
-   **Randomization**: One-click randomization of all typographic settings for instant experimentation.
-   **Zero-Build Architecture**: Built with modern web standards using import maps—no build tools required.

## Usage

1.  Open the [Generative Typography Playground](https://austegard.com/fun-and-games/poetry-playground.html).
2.  Explore the default poem and typography settings.
3.  Use the **Typography Controls** panel to adjust:
    -   Font family, size, spacing, and line height
    -   Layout mode (flow, cascade, scatter, or spiral)
    -   Particle background intensity
    -   Visual effects (floating and glow animations)
4.  Click **✨ New Poem** to generate a fresh random poem.
5.  Click **🎲 Randomize All** to instantly try random typography settings.
6.  Hover over individual words to see interactive scaling effects.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) using HTM (Hyperscript Tagged Markup) for JSX-like syntax without a build step.
-   **State Management**: Uses [@preact/signals](https://preactjs.com/guide/v10/signals/) for fine-grained reactive state management.
-   **Styling**: Tailwind CSS loaded via CDN, combined with custom CSS animations and Google Fonts.
-   **Particle System**: Custom canvas-based particle animation with proximity-based connection rendering.
-   **Import Maps**: Leverages browser-native ES module imports to load dependencies without bundling.
-   **Single-File Application**: The entire application is self-contained in a single HTML file.

## Credits

-   **Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
-   **Inspiration**: Explores the intersection of generative art, experimental poetry, and reactive web technologies.

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
