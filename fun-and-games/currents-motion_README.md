# Currents in Motion

A motion-steered sequel to [Currents](currents.html). The same single-file,
zero-dependency WebGL flow field — domain-warped fractal noise — but instead
of the cursor bending the field, **your phone is the brush**: the device's
three rotational axes are mapped onto the three axes of a perceptual 3D color
space, and time supplies a fourth dimension that undulates chaotically.

**Live:** <https://austegard.com/fun-and-games/currents-motion.html>

## The mapping

Device orientation → [OKLCH](https://bottosson.github.io/posts/oklab/)
(a perceptually uniform color space, so each physical axis moves one
perceptual color axis):

| Physical axis | Sensor | Color axis |
|---|---|---|
| Spin (compass) | `alpha` 0–360° | **Hue** angle — both are circular, so spinning in place walks the full color wheel |
| Tilt fore/aft (pitch) | `beta` | **Lightness** — flat on a table is mid-light, upright is bright, face-down goes dark |
| Roll side-to-side | `gamma` | **Chroma** — level is a muted wash, rolled on its side is fully saturated |
| Shake | `devicemotion` acceleration | **Energy** — speeds the flow and briefly saturates it, then ebbs away |

## The fourth dimension

Time doesn't just scroll the noise field. A **Lorenz attractor** is
integrated on the CPU each frame and its normalized state perturbs hue,
lightness, and chroma. The Lorenz system is the canonical "smooth but
chaotic" signal: continuous and differentiable everywhere, yet never
periodic — the colors orbit wherever your hands are holding them, without
ever repeating.

The OKLab → sRGB conversion happens in the fragment shader; the flow field's
value locally offsets hue and lightness so the currents stay visible inside
whatever color neighborhood the device selects.

## Controls

**Phone** (the intended instrument):

- **Tap once** to begin — iOS requires a user gesture before it hands over
  the gyroscope (`DeviceOrientationEvent.requestPermission()`).
- **Spin / tilt / roll / shake** as per the table above.
- **Double-tap** toggles a small sensor readout HUD.

**Desktop** (fallback, active until a real orientation event arrives):

- **Cursor** — x steers hue, y steers lightness.
- **Scroll wheel** — chroma.
- **Space** — stills the motion. **H** — readout HUD.

## Install as an app

Like Currents, the page carries the meta tags and a runtime-generated
manifest to be installed full-screen from Share → *Add to Home Screen* (iOS)
or the install prompt (Android). Everything — icon included — is inlined in
the one HTML file.

## Implementation notes

- Single file, no build step, no external fetches; pure-ASCII source.
- The fbm/domain-warp field is shared with `currents.html`; the palette
  system is entirely different (OKLCH uniforms instead of cosine-palette
  moods).
- Compass `alpha` wraps 0↔360; the hue target is angle-unwrapped before
  easing so the color never spins the long way around the wheel.
- On iOS the permission request is called synchronously inside the
  `pointerdown` task — any `await` beforehand makes Safari silently deny
  (same lesson as `/motion-player/`).
- No WebGL → a graceful text fallback, same as Currents.
