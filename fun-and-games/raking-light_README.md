# Raking Light

Turn flat, evenly lit SVG into a lit relief: shapes rise according to how they are stacked, edges get
bevels, corners darken, and lights you drag across the stage cast soft shadows. Runs on WebGPU.

![Raking Light](https://raw.githubusercontent.com/oaustegard/experiments/main/raking-light/test/poster-raking.png)

**[Live](https://austegard.com/fun-and-games/raking-light.html)** | **[Source and write-up](https://github.com/oaustegard/experiments/tree/main/raking-light)**

Prompted by [Lumen](https://lumen.renderg.host), which turns Kelvin-temperature lights into CSS
`box-shadow` layers around a card. This page lights the content inside the card, per pixel.

## What it does

1. **Reads height from paint order.** Every painted shape is redrawn as white at 20% opacity over black,
   so the grey level at each pixel says how many shapes are stacked there. A shape drawn on top of
   another ends up higher.
2. **Builds the relief on the GPU**: bevels the edges (round, chamfer, pillow or cove), adds optional
   grain, and works out surface normals and how much each spot is tucked into a corner.
3. **Lights it**: up to four point lights coloured by Kelvin temperature, glossy or matte highlights, an
   optional metal finish, and soft shadows traced across the height map.

## Controls

- **Source**: four samples (Card, Poster, Icons, Type), upload an SVG or image, or paste SVG markup.
  Photos use brightness for height.
- **Lighting setup**: Gallery, Raking, Golden hour, Overcast, Letterpress (shapes pressed in), Studio.
- **Lights**: drag a light's handle, or drag anywhere to move the selected light. Warmth, power, height
  and size per light; add up to four; orbit the key light.
- **Relief**: elevation, layer step, bevel width and profile, grain, deboss.
- **Surface**: Paper, Satin, Enamel, Metal, Clay, or set roughness, metal and specular directly.
- **Room**: wall colour, ambient light, sky warmth, exposure, and a divider to compare with the original.

Without WebGPU the page falls back to SVG filter lighting with the first light only: no cast shadows,
and the compare divider and several controls do nothing. Not handled in SVG input: `<image>` elements
become plain rectangles, shapes inside clip paths, masks or patterns are skipped, and opacity, filters and
blend modes are ignored.
