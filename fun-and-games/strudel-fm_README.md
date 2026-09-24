# Strudel FM

A generative radio station. A small program writes the music four bars at a time as [Strudel](https://strudel.cc) code, and Strudel plays it with real drum-machine and piano samples.

**[Live](https://austegard.com/fun-and-games/strudel-fm.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/strudel-fm.html)**

## Controls

- **Station presets 1–6** (or keys 1–6): House 122, Techno 128, Lo-fi 84, Ambient 74, Synthwave 104, Dub 76 BPM.
- **Tempo** ±4 BPM, from 56 to 180.
- **Energy**: Chill, Flow, Hype. Shifts every section's energy by −1, 0 or +1 and tilts the arc toward calmer or bigger sections.
- **Mood**: Dark (aeolian, phrygian), Deep (dorian), Bright (ionian, mixolydian, lydian). A new mood picks a new key.
- **Cue**: Build & drop, Breakdown, New key, Surprise (another station).

Every control rewrites the music from the next bar, and keeps the current section running.

## Preset links

The address bar tracks the controls, and **Copy station link** copies it. Parameters left at the station's default are omitted:

```
strudel-fm.html?station=techno&bpm=130&mood=bright&energy=hype&key=fs-dorian
```

`station`: house, techno, lofi, ambient, synthwave, dub. `bpm`: 56–180. `mood`: dark, deep, bright. `energy`: chill, flow, hype. `key`: tonic (`s` for sharp, `b` for flat) and mode (ionian, dorian, phrygian, lydian, mixolydian, aeolian, or major/minor). Invalid values fall back to the defaults. Browsers need a click before playing sound, so a link loads the preset and waits for POWER.

## How the music is written

- **Arc.** Sections follow a weighted chain (intro, groove, lift, build, drop, breakdown). Each section runs a drawn number of four-bar phrases, 8 to 32 bars in all; a build always resolves into a drop; energy tilts the weights. A breakdown keeps a pad, a held bass, a sparse melody, offbeat hats and one clap per bar.
- **Harmony.** Chords are the mode's own diatonic triads or sevenths, chained by functional-harmony weights; diminished chords are rarely chosen. A phrase that leads into a drop leans toward ending on the dominant. Progressions repeat for a few phrases before changing.
- **Voicing.** Each chord takes the inversion with the least total movement from the previous one.
- **Bass.** Style and energy pick a 16-step rhythm. Its notes are the chord's root, third, fifth, seventh or octave, plus a chromatic approach to the next chord's root.
- **Melody.** One motif per phrase, answered by its inversion on alternate bars; on-beat notes snap to the nearest chord tone. The fourth bar ends on a held chord tone.
- **Drums.** Layers enter with energy. The bar before a bigger section gets a snare roll or a tom fill.

The page shows the code for the bar that is playing, with a link that opens it in strudel.cc.

## Credits

Strudel 1.2.6 (AGPL-3.0), loaded from jsDelivr. Drum samples from [tidal-drum-machines](https://github.com/ritchse/tidal-drum-machines), piano samples from [dough-samples](https://github.com/felixroos/dough-samples). Both load from GitHub when you press POWER.
