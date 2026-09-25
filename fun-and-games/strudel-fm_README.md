# Strudel FM

A generative radio station. A small program writes the music four bars at a time as [Strudel](https://strudel.cc) code, and Strudel plays it with real drum-machine and piano samples.

![Strudel FM](https://austegard.com/images/strudel-fm-og.png)

**[Live](https://austegard.com/fun-and-games/strudel-fm.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/strudel-fm.html)**

## Controls

- **Station presets 1–7** (or keys 1–7): House 122, Techno 128, Lo-fi 84, Ambient 74, Synthwave 104, Dub 76 BPM, and Sleep 60 BPM.
- **Tempo** ±4 BPM, from 56 to 180.
- **Energy**: Chill, Flow, Hype. Shifts every section's energy by −1, 0 or +1 and tilts the arc toward calmer or bigger sections.
- **Mood**: Dark (aeolian, phrygian), Deep (dorian), Bright (ionian, mixolydian, lydian). A new mood picks a new key.
- **Cue**: Build & drop, Breakdown, New key, Surprise (another station), and More cowbell (each press adds a level; the fourth takes it away).
- **Volume**: a fader, remembered in this browser.
- **Sleep timer**: Off, 15, 30, 45, 60 or 90 minutes. In the last 30% (at most ten minutes) the energy drops to Chill, over the last 20% (at most four minutes) the volume fades, and then POWER switches off.
- **Sleep station**: no drums and no builds or drops. Slow pads, a sine drone, sparse piano and soft rain; it starts a 45-minute sleep timer.

Every control rewrites the music from the next bar, and keeps the current section running.

## Preset links

The address bar tracks the controls, and **Copy station link** copies it. Parameters left at the station's default are omitted:

```
strudel-fm.html?station=techno&bpm=130&mood=bright&energy=hype&key=fs-dorian
```

`station`: house, techno, lofi, ambient, synthwave, dub, sleep. `bpm`: 56–180. `mood`: dark, deep, bright. `energy`: chill, flow, hype. `key`: tonic (`s` for sharp, `b` for flat) and mode (ionian, dorian, phrygian, lydian, mixolydian, aeolian, or major/minor). `sleep`: timer minutes (0, 15, 30, 45, 60, 90). `cowbell`: 1–3. Invalid values fall back to the defaults. Browsers need a click before playing sound, so a link loads the preset and waits for POWER.

## How the music is written

- **Arc.** Sections follow a weighted chain (intro, groove, lift, build, drop, breakdown). Each section runs a drawn number of four-bar phrases, 8 to 32 bars in all; a build always resolves into a drop; energy tilts the weights. A breakdown keeps a pad, a held bass, a sparse melody, offbeat hats and one clap per bar.
- **Harmony.** Chords are the mode's own diatonic triads or sevenths, chained by functional-harmony weights; diminished chords are rarely chosen. A phrase that leads into a drop leans toward ending on the dominant. Progressions repeat for a few phrases before changing.
- **Voicing.** Each chord takes the voicing with the least total movement from the previous one, chosen from close inversions, drop-2 spreads and, for seventh chords, the rootless 3-5-7-9 shell. Voicings with a semitone or minor-ninth rub are ruled out, which matters most for major sevenths: in close position the seventh would sit a semitone under the root.
- **Bass.** Style and energy pick a 16-step rhythm. Its notes are the chord's root, third, fifth, seventh or octave, plus an approach from the scale step next to the next chord's root. Every bass note stays in the key.
- **Melody.** One motif per phrase, answered by its inversion on alternate bars. It sits above the chord voicings (dub keeps it low, under the skank). On-beat notes snap to the nearest chord tone, and neither they nor notes held an eighth or longer may land a semitone or minor ninth from a voicing note. The fourth bar ends on a held chord tone.
- **Chords.** Each style has a library of comping rhythms per energy level (sustained pads, stabs, offbeat pushes). A phrase picks one, and its fourth bar may switch to a sibling.
- **Drums.** Layers enter with energy. Hats sit on the offbeat until energy 3, straight eighths with accents at 3, sixteenths only at the peak; half the phrases swap in a sibling hat pattern, and the fourth bar leaves the last beat open. The bar before a bigger section gets a snare roll or a tom fill.

The page shows the code for the bar that is playing, with a link that opens it in strudel.cc.

## Credits

Strudel 1.2.6 (AGPL-3.0), loaded from jsDelivr. Drum samples from [tidal-drum-machines](https://github.com/ritchse/tidal-drum-machines), piano samples from [dough-samples](https://github.com/felixroos/dough-samples). Both load from GitHub when you press POWER.
