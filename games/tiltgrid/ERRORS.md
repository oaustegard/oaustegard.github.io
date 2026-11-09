# Errors

1. **Overlays never hid.** The page sets `el.hidden = true` on the title card and banner, but their own `display: grid` rule outranks the browser's default `[hidden]` style, so the title card stayed over the running game. Caught by the first gameplay screenshot from `tests/check.mjs`. Fixed with `[hidden] { display: none !important; }`.
2. **A crosswind pad could not be beaten.** Speed pads pushed at 15 units/s² against the player's 12.5, so the sideways pads on Neon Gauntlet's two-wide bridge carried the marble off the edge however hard you steered. Caught when the autopilot fell there. The push is now 10.
3. **Tilt up and down was inverted.** The rotated screen vector was negated a second time. Caught by reading the code against the derivation before the first run.
4. **A global regex renamed a JS variable.** Renaming the WGSL identifier `mat` to `mid` also hit one line of JavaScript physics. Caught by grepping the result before running.
5. **The death checks timed out.** On SwiftShader the page runs at about 8.5 fps and game time per frame is capped, so a 1.7 s respawn took longer than the test's 4 s wall-clock wait. The checks now wait on game state.
