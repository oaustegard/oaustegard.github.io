# Asteroids Game

A modern, single-file implementation of the classic arcade game Asteroids, built with Preact.

**[Live Demo](https://austegard.com/fun-and-games/asteroids.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/asteroids.html)**

## Overview

This is a complete, playable version of the classic Asteroids game, recreated as a self-contained single-page application. It features responsive controls, a scoring system, and progressively difficult levels. The entire game—logic, rendering, and UI—is encapsulated within a single HTML file.

## Features

-   **Classic Gameplay**: Navigate your ship, shoot asteroids, and avoid collisions.
-   **Multiple Control Schemes**: Play using keyboard, touch, or device tilt controls.
-   **Progressive Difficulty**: Levels increase in difficulty with more asteroids.
-   **Scoring and Lives**: Track your score and remaining lives.
-   **Responsive Design**: The game canvas adapts to any screen size, making it playable on desktop and mobile.
-   **Self-Contained**: The entire application is a single HTML file with no build step required.

## Controls

The game supports several control methods:

### Keyboard
-   **Thrust**: `W` or `Up Arrow`
-   **Rotate Left**: `A` or `Left Arrow`
-   **Rotate Right**: `D` or `Right Arrow`
-   **Fire**: `Space`

### Touch (Mobile)
-   **Thrust**: Tap the top third of the screen.
-   **Rotate**: Tap the left or right side of the screen.
-   **Fire**: Double-tap anywhere.

### Tilt (Mobile)
1.  Check the "Tilt controls" box.
2.  Grant motion sensor permissions if prompted.
3.  **Thrust**: Tilt your device forward.
4.  **Rotate**: Tilt your device left or right.

## Technical Details

-   **Framework**: Built with [Preact](https://preactjs.com/) using `importmap` to load modules directly in the browser without a build step.
-   **Rendering**: Uses the HTML5 Canvas API for all game rendering.
-   **State Management**: Game state is managed within the Preact component using hooks (`useState`, `useRef`, `useEffect`).
-   **Single-File Architecture**: All HTML, CSS, and JavaScript are contained within a single `.html` file.

## Credits

-   **Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
-   **Inspiration**: The project incorporates ideas and patterns from various sources, as noted in the source code comments.

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.