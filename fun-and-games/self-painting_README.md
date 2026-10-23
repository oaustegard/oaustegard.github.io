# Self-Painting SVG

Turn any picture into a single animated SVG that sketches itself in charcoal, paints itself in, then falls apart and starts over.

![Self-Painting SVG](https://austegard.com/images/self-painting-og.jpg)

**[Live](https://austegard.com/fun-and-games/self-painting.html)** | **[Source and write-up](https://github.com/oaustegard/experiments/tree/main/svg-timeline)**

## What it does

1. **Traces the picture** into flat patches of color: k-means color clustering (on the GPU through WebGPU when available, plain JavaScript otherwise), then pixel-edge tracing into smooth curves. Neighboring patches share their borders exactly, so no gaps show between them.
2. **Gives every patch a time.** Large forms land first, then a left-to-right sweep fills in the detail. Patches that land in the same fifth of a second share one animation.
3. **Writes the timeline as CSS keyframes** inside the SVG. The downloaded file needs no JavaScript and plays in any modern browser, as an image or inline.

The 34-second loop, by default:

| 0–3 s | 2–17 s | 17–24 s | 24–30 s | 31–33 s |
|---|---|---|---|---|
| charcoal underdrawing draws on | paint lands | the finished picture holds | the paint falls off the sketch | the sketch erases itself |

## Controls

- **Choose a picture**, or drop one on the stage. **Starry Night** reloads the sample.
- **Detail**: 24, 40 or 56 colors.
- **Loop**: 26, 34 or 44 seconds. Every beat scales with it.
- **Size**: the longest side the picture is traced at (700, 1000 or 1400 px). Larger means more patches, a bigger file and slower playback.
- **Paint it** re-runs with the current settings.
- **Download**: the animated file or just the finished picture, each as `.svg` or `.svgz` (the same file gzipped, about a quarter of the size). The finished picture has no animation and no sketch.
- The **scrubber** pauses the animation and jumps to any moment. The labels under it mark the beats.

Nothing is uploaded; the whole thing runs on the page.

## Notes

- A medium-size picture comes out around 0.8–1.1 MB, or 220–300 KB gzipped.
- With "reduce motion" turned on, the file shows the finished picture.
- Inspired by [svjeez](https://github.com/saiashirwad/svjeez) by Sai Ashirwad, which compiles hand-written TSX scenes into animated SVG. This page starts from a picture instead.
