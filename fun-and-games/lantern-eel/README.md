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

Press **Tilt**, hold the phone at whatever angle is comfortable, and tip it toward where you want to swim. The angle you hold when you switch tilt on, start a dive, resume or rotate the screen counts as level; a tip of 9° along one axis turns the eel. iOS asks for motion permission when you press Tilt. The small vial in the Tilt button shows your current tilt.

Without a motion sensor, use the on-screen arrows, swipe on the water, or the keyboard: arrows or WASD to steer, Space or Shift to boost, P or Esc to pause. Hold the Boost button on a phone.

Add to Home Screen to install it full-screen and offline. The best score stays in the browser.

## How it is built

One HTML file with Canvas 2D and Web Audio, no libraries. The grid steps on a fixed tick while drawing interpolates between ticks, so the eel moves smoothly. The darkness is a radial gradient centred on the lure, drawn over the scene, with the glows of living things drawn again on top so they show through. Tests and the writeup live in [`oaustegard/experiments/lantern-eel`](https://github.com/oaustegard/experiments/tree/main/lantern-eel).
