# Lantern Eel

Snake in the deep sea, steered by tilting your phone.

**[Play](https://austegard.com/fun-and-games/lantern-eel/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/lantern-eel/index.html)**

## Playing

You are an eel with an anglerfish lure. Every bite takes you 25 m deeper, through the Sunlight, Twilight, Midnight, Abyssal and Hadal zones. The game speeds up with depth, and below about 150 m the water darkens until only the area around your lure is lit; prey and jellyfish still show as glows.

- **Plankton**: +10, grow by 1.
- **Lanternfish**: +40, grow by 3. They swim away from you and leave after 11 s.
- **Jellyfish**: appear from 200 m and multiply as you go deeper. Touching one ends the dive.
- **Pearls**: appear every 20 to 30 s and let you pass through your own tail and jellyfish for 6 s.
- **Chain bites**: eat again within about 3 s to raise a multiplier, up to ×8.
- **Boost**: doubles speed and points while it burns the glow meter, which refills slowly and with each bite.
- The edges wrap.

## Controls

On a phone, Lantern Eel starts in **tilt** mode and the water fills the screen. The angle you hold the phone at when you dive, resume or rotate the screen counts as level; tap the vial at the top to reset it. A tip of 6° along one axis turns the eel, and the axis already steering keeps priority until the other leads it by 3°, so holding a diagonal does not flicker. iOS asks for motion permission when you press Dive. If no motion data arrives, the game switches to arrows for that visit.

**Arrows** mode floats a D-pad and a Boost button over the water and fits the grid above them (beside them in landscape). Choose the mode, and whether the arrows sit on the left or the right, on the title screen or in the pause menu; the choice is remembered.

Both modes run edge to edge, with the glow and phase meters drawn on the water. In both you can swipe on the water to steer, and press and hold the water to boost. While a swipe is steering, tilt is ignored, and after you lift your finger the tilt you were holding stays ignored until you change it, so it cannot undo the swipe. On a keyboard: arrows or WASD steer, Space or Shift boosts, P or Esc pauses.

Add to Home Screen to install it full-screen and offline. The best score stays in the browser.

## Sound

All synthesized with Web Audio: an ambient bed of filtered surf and a low two-note drone that both darken as you go deeper, plus sounds for bites (rising in pitch with the chain), lanternfish, pearls and the end of a phase, turns, boost, zone changes, sonar pings from the Midnight Zone down, a low double thud when a jellyfish is within two cells, and the end of a dive. The page asks iOS for playback audio, so it plays with the ring/silent switch on silent; the speaker button mutes it.

## How it is built

One HTML file with Canvas 2D and Web Audio, no libraries. The grid steps on a fixed tick while drawing interpolates between ticks, so the eel moves smoothly. The darkness is a radial gradient centred on the lure, drawn over the scene, with the glows of living things drawn again on top so they show through. Tests and the writeup live in [`oaustegard/experiments/lantern-eel`](https://github.com/oaustegard/experiments/tree/main/lantern-eel).
