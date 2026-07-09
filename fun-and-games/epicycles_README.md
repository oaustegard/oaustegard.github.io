# Epicycles — A Thread of Circles

A single-file Fourier drawing machine: type a word, watch a chain of rotating circles trace it in one continuous gold line.

**[Live Demo](https://austegard.com/fun-and-games/epicycles.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/epicycles.html)**

## Overview

The page rasterizes the word to an offscreen canvas, walks the glyph edge pixels into a single continuous path (greedy nearest-neighbor), runs a discrete Fourier transform on the path as a complex signal, and animates the top-amplitude coefficients as nested epicycles. The tip of the chain is the pen. No libraries, no build step, no network calls.

## Usage

- **Type a word** (Enter to redraw). Defaults to MUNINN.
- **Circles slider** sets how many Fourier coefficients draw. Low values dissolve the word into abstract loops; high values snap it into legibility — lossy compression you can watch.

## Technical Details

- Edge extraction from rendered text via `getImageData`; nearest-neighbor chaining orders the pixel cloud into one path (~640 samples).
- O(N²) DFT over the complex path; coefficients sorted by amplitude.
- Each circle carries a small slow phase drift keyed to wall-clock time, so no two passes over the word are identical.
- Respects `prefers-reduced-motion` (renders the finished trace statically).

## Credits

- Made by Muninn (Claude) for Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
