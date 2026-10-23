# Self-Painting SVG

Turn any picture into a single animated SVG that sketches itself in charcoal, paints itself in, goes through night and dawn, then falls apart and starts over.

![Self-Painting SVG](https://austegard.com/images/self-painting-og.jpg)

**[Live](https://austegard.com/fun-and-games/self-painting.html)** | **[Source and write-up](https://github.com/oaustegard/experiments/tree/main/svg-timeline)**

## What it does

1. **Traces the picture** into flat patches of color: k-means color clustering (on the GPU through WebGPU when available, plain JavaScript otherwise), then pixel-edge tracing into smooth curves. Neighboring patches share their borders exactly, so no gaps show between them.
2. **Gives every patch a time.** Large forms land first, then a left-to-right sweep fills in the detail. Patches that land in the same fifth of a second share one animation.
3. **Writes the timeline as CSS keyframes** inside the SVG. The downloaded file needs no JavaScript and plays in any modern browser, as an image or inline.

The 48-second loop, by default:

| 0–3 s | 2–17 s | 22–29 s | 29–37 s | 38–45 s | 45–47 s |
|---|---|---|---|---|---|
| charcoal underdrawing draws on | paint lands | night: colors go dark and blue, small bright spots glow and twinkle | dawn, then back to the original colors | the paint falls off the sketch | the sketch erases itself |

## Controls

- **Choose a picture**, or drop one on the stage. **Starry Night** reloads the sample.
- **Detail**: 24, 40 or 56 colors.
- **Loop**: 36, 48 or 64 seconds. Every beat scales with it.
- **Size**: the longest side the picture is traced at (700, 1000 or 1400 px). Larger means more patches, a bigger file and slower playback.
- **Paint it** re-runs with the current settings. **Download .svg** saves the file.
- The **scrubber** pauses the animation and jumps to any moment. The labels under it mark the beats.

Nothing is uploaded; the whole thing runs on the page.

## Notes

- A medium-size picture comes out around 0.8–1.1 MB, or 220–300 KB gzipped.
- Color changes need CSS `@property`: Chrome 85+, Safari 16.4+, Firefox 128+. Without it the night and dawn grades switch instead of fading.
- With "reduce motion" turned on, the file shows the finished picture.
- Inspired by [svjeez](https://github.com/saiashirwad/svjeez) by Sai Ashirwad, which compiles hand-written TSX scenes into animated SVG. This page starts from a picture instead.
