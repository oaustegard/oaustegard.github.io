# Currents

A single-file, zero-dependency WebGL flow field.

**[Live Demo](https://austegard.com/fun-and-games/currents.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/currents.html)**

## Overview

Currents paints a full-screen field of domain-warped fractal noise, colored with a drifting cosine palette. The cursor bends the flow toward itself and blooms a soft light; the whole thing eases and breathes rather than snapping. It renders in a single fragment shader with no libraries, no build step, and no network calls.

## Features

- Full-screen WebGL fragment-shader rendering.
- Two layers of domain warping — flow inside flow.
- Inigo-Quilez cosine palettes with smooth transitions between five curated moods.
- Cursor interaction: the field warps and a bloom follows the pointer (mouse or touch).
- Graceful fallback message if no WebGL context is available.

## Usage

- **Move** the cursor (or drag on touch) to drift the field.
- **Click / tap** to shift to the next mood.
- **Space** to still the motion (pause), press again to resume.

## Technical Details

- Value-noise fbm feeding two domain-warp passes, then a cosine palette, vignette, and gamma.
- Everything eases in the animation loop — cursor position, warp strength, and palette all lerp toward their targets for softness.
- Pure ASCII source with block-style comments and a UTF-8 charset, so it drops onto legacy hosts (including SharePoint 2019 as an `.aspx`) with just a page directive prepended — no build, no server logic.

## Credits

- Made by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
