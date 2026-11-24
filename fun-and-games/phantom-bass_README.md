# Phantom Bass

Three Web Audio experiments with residue pitch: the low note your ear hears when the sound has no energy at that frequency.

Live: <https://austegard.com/fun-and-games/phantom-bass.html>

## What it does

1. **The missing fundamental.** Pick a fundamental (80 to 200 Hz) and toggle partials 1 to 10. Partials 2, 3 and 4 of 100 Hz (200, 300, 400 Hz) are heard at 100 Hz. The plot shows the line spectrum and the waveform, which repeats at the fundamental's period with or without the fundamental. A checkbox switches the fundamental on and off every 2 seconds for an A/B.
2. **Shift every partial.** Three partials 100 Hz apart, slid together by -50 to +50 Hz. The spacing (the arithmetic difference tone) stays 100 Hz; the predicted pitch moves. The prediction is the least-squares best-fitting harmonic series, 100 + Δ·Σn/Σn², which for partials 2, 3, 4 is about 100 + 0.31Δ (220, 320, 420 Hz gives 106 Hz). The compare buttons alternate the shifted sound with an ordinary tone at 100 Hz or at the predicted pitch. Past about ±35 Hz the page also shows the neighbouring series the pitch may jump to.
3. **Bass on a small speaker.** A 104 BPM bassline between 49 and 82 Hz, played as the real bass, as harmonics 2 to 7 only, through a waveshaper virtual bass (low band → `tanh` plus full-wave curve → high-passed harmonics, plus the real bass above 150 Hz), or as the real bass plus the harmonics (the bass-boost approach most enhancers use). The **Small speaker** setting is a 4th-order high-pass at 180 Hz. The harmonics are loudness-matched to the real bass, not power-matched: an ISO 226 equal-loudness and critical-band estimate at a moderate level puts equal-RMS harmonics about 7 dB louder than the real bass and the waveshaper output about 10 dB louder, so they are trimmed by those amounts, and a slider adjusts the added harmonics ±12 dB for matching by ear. The live spectrum marks the current note's fundamental.

## Levels

The master volume starts at 25% (gain is the square of the slider, times 0.9), every tone has a fade in and out of 40 to 80 ms, and a compressor at -6 dBFS with a 20:1 ratio sits before the output. Audio stops when the tab is hidden. On iPhone the page asks for the `playback` audio session so the silent switch doesn't mute it, where Safari supports that.

## Sources

- Schouten's residue pitch and the pitch-shift experiments: Cartwright, González and Piro, [arXiv chao-dyn/9505001](https://arxiv.org/abs/chao-dyn/9505001)
- [Residue, Handbook for Acoustic Ecology](https://www.sfu.ca/sonic-studio/WSPDatabase/AnalysisDVD/Handbook5/handbook/Residue.html)
- Mu and Gan, [virtual bass systems](https://www3.ntu.edu.sg/home/ewsgan/img/projects/VBS.pdf)
- Ladd et al. (2013), [f0 listeners and spectral listeners](https://pure.mpg.de/pubman/item/item_1569821_7/component/file_1850729/Ladd_etal_2013.pdf)

Single self-contained HTML file, no libraries.
