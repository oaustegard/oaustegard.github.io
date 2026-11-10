# Soap Film

A soap film in a wire frame, simulated and drawn on the GPU. Each pixel's colour is computed from the
film's thickness at that point, the way interference colours a real film.

Live: <https://austegard.com/fun-and-games/soap-film.html>

## Controls

| input | effect |
|---|---|
| drag | blows on the film along the stroke, and shows the thickness under the pointer in nanometres |
| tap or click | pops the film at that point; on an empty frame it dips a new one |
| tilt, shake | gravity in the film follows the phone, so the film pours and sloshes. iOS asks for motion access when you press **Tilt** |
| the round dial beside the buttons | sets gravity by hand: drag it, or focus it and use the arrow keys. Double-click resets it |
| **Dip** | draws a new film |
| **Loop** / **Frame** | switches to the round wand, or back to the rectangular frame; the button names the shape you would get |
| **Tilt** | turns the motion sensors on or off. It appears on phones; Android needs no permission |
| **Full** | hides the title and controls and lets the frame fill the window (and the screen, where the browser allows it). `F` toggles it and ✕ leaves |
| **About** | drainage speed, whether the film pops by itself, sound |

`D` dips, and the space bar pops (or dips, on an empty frame). The bar under the film shows the reflected colour for each thickness
from 0 to 1,500 nm.

## Simulation and colour

- **Flow.** The film is a two-dimensional fluid in which thickness plays the part of density: thick film
  sinks along gravity and thin film rises. WebGPU compute shaders move vorticity and thickness along the
  flow, add buoyancy, drag and the push of a dragged pointer, and solve for the stream function, 31
  dispatches per step on a grid of 320 cells on its short side.
- **Drainage.** The wire pulls liquid out of the film beside it, which sends thin plumes up from the edge.
  The film also evaporates. Film thinner than about 30 nm reflects almost nothing and looks black. In the simulation, film that thins to about 40 nm collapses to black film a few nanometres thick. When
  enough of the film is black it pops.
- **Colour.** A table holds the colour a water film reflects, summed over the visible spectrum, for
  thicknesses up to 3,072 nm and 16 angles. It is built at load from the CIE 1931 observer and D65 and
  matches a reference computed by another method to a mean ΔE76 of 0.07, far below what the eye can see.
- **Tilt.** Gravity in the film is what the phone's motion sensor reports, which is gravity combined with
  the phone's own acceleration. Tilting therefore pours the film and shaking sloshes it. The film mirrors a
  simple drawn room with two windows; with motion access that room stays fixed while the phone turns.

It needs WebGPU. It has been checked in headless Chromium on a software GPU only; frame rate and the tilt
sensors on a real phone are untested.

The write-up, the 17 checks and the colour reference are in
[`oaustegard/experiments/soap-film`](https://github.com/oaustegard/experiments/tree/main/soap-film).
`?n=256` sets the number of cells on the grid's short side, `?shape=loop` starts with the round wand.
