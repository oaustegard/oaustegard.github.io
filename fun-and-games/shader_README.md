# WebGL Shader Toy

An interactive, full-screen WebGL shader animation.

**[Live Demo](https://austegard.com/fun-and-games/shader.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/shader.html)**

## Overview

This is a simple, visually-engaging web toy that renders a complex, ever-changing pattern using a WebGL fragment shader. The animation is interactive, allowing the user to zoom in and out to explore the intricate details of the shader's output.

## Features

- Full-screen WebGL rendering for an immersive experience.
- Interactive zoom controlled by the mouse scroll wheel.
- An ever-changing, looping animation.
- No external dependencies beyond Preact and HTM, loaded via ES modules.

## Usage

- **Scroll** your mouse wheel up and down to zoom in and out of the animation.

## Technical Details

- The core visual logic is contained within a GLSL fragment shader.
- The page is built with vanilla JavaScript, using Preact and HTM for rendering the canvas element.
- The animation loop is driven by `requestAnimationFrame` for smooth performance.
- The shader code is embedded directly within the HTML file.

## Credits

- The shader equation was created by [xordev.com](https://www.xordev.com/) ([bsky.app/profile/xordev.com](https://bsky.app/profile/xordev.com)). The original post can be found [here](https://bsky.app/profile/xordev.com/post/3m2paymomn22d).
- The HTML and JavaScript wrapper was created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.