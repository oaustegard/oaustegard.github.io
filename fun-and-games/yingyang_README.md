# Yin-Yang Impacts

An interactive, physics-based art piece displaying a dynamic and fluid yin-yang symbol.

**[Live Demo](https://austegard.com/fun-and-games/yingyang.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/yingyang.html)**

## Overview

This is a mesmerizing simulation of a yin-yang symbol where the two small dots are represented by balls that move and collide within the shape. As the balls strike the boundary between the black and white areas, they create a fluid "denting" effect, making the symbol appear to be made of liquid.

This piece was generated with AI assistance as a recreation of the original "Eternal" by Yoav Givati.

## Features

-   **Dynamic Physics Simulation**: The two balls move realistically, bouncing off the outer circular wall and the internal S-shaped boundary.
-   **Fluid "Denting" Effect**: The yin-yang boundary is dynamically redrawn based on the balls' positions, creating a beautiful, lava-lamp-like visual.
-   **Interactive Speed Control**: Press and hold your mouse button (or touch the screen) to dramatically speed up the simulation.
-   **Customizable Background**: Click the link in the top-right corner to cycle through several different background colors.
-   **Self-Contained**: The entire simulation runs from a single, self-contained HTML file.

## Usage

1.  Open the [Yin-Yang Impacts](https://austegard.com/fun-and-games/yingyang.html) page.
2.  Watch the simulation unfold.
3.  To speed things up, press and hold your mouse button or touch and hold the screen.
4.  To change the aesthetic, click the "change background" link in the top-right corner.

## Technical Details

-   **Rendering**: The simulation is rendered on an HTML5 Canvas.
-   **Collision Detection**: A secondary, off-screen canvas is used as a mask to define the yin-yang shape. Collisions with the internal boundary are detected by checking the alpha channel of this mask, and reflection angles are calculated using the gradient of the alpha channel at the point of impact.
-   **Technology**: Built with vanilla JavaScript with no external dependencies.

## Credits

-   **Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
-   **Inspiration**: Based on the work "Eternal" by [Yoav Givati](https://yoavg.github.io/eternal/#).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.