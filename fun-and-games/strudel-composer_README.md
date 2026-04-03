# Strudel Composer

**English → Live-Coded Music**

An AI-powered music composition tool that translates plain English descriptions into [Strudel](https://strudel.cc) live-coding patterns, playable directly in the browser.

## What It Does

1. **Describe** the music you want — genre, tempo, mood, instruments, effects
2. **Generate** — Claude translates your description into Strudel code
3. **Play** — hear it immediately via the embedded Web Audio engine
4. **Edit** — tweak the generated code and replay, or open in the full Strudel REPL

## Architecture

This is a fully self-contained ~880KB HTML file with zero external dependencies at runtime:

- **Strudel Runtime**: The complete [`@strudel/web@1.2.6`](https://www.npmjs.com/package/@strudel/web) engine (~520KB) is inlined, with the SharedWorker patched out (uses setInterval cyclist instead)
- **Sample Library**: 42 OGG samples across 39 banks are base64-encoded inline, served via a `fetch()` override that intercepts sample requests
- **AI Generation**: Uses the Anthropic Claude API (Sonnet) with a Strudel-specific system prompt that knows exactly which banks and synths are available
- **No External Requests**: The only network call is to the Claude API for code generation. All audio runs locally via Web Audio API

## Available Sounds

**Drums**: bd, sd, hh, cp, cr, clubkick, 909, cb, lt, mt, ht, 808oh, 808hc

**Percussion**: tabla, click, drum, tok, stab

**Electronic**: electro1, gabba, house, tech, industrial, future

**Melodic Samples**: casio, jazz, bass, bass3, pluck, sid

**Textures**: metal, east, space, wind, crow, insect, noise

**Other**: feel, flick, mouth

**Synths** (pure Web Audio, unlimited): sine, sawtooth, square, triangle, supersaw

**Noise**: white, pink, brown

## How It Was Built

Built collaboratively between Oskar Austegard and [Muninn](https://muninn.austegard.com) (Claude/Anthropic) across a single conversation that involved:

- Researching the Strudel API surface via its [Codeberg repo](https://codeberg.org/uzu/strudel) and documentation
- Discovering that Claude's artifact sandbox blocks all external script loads, iframes, and fetch calls
- Deploying a Cloudflare Worker CDN (strudel-cdn.austegard.workers.dev) — which also couldn't be reached from the sandbox
- Finally inlining everything: the full Strudel runtime (patched), 42 drum/sample OGGs as base64, and a fetch override to serve them from memory
- Compressing samples from WAV to OGG (Vorbis q0) to fit the artifact size limit
- Writing a Strudel-specific system prompt that teaches the AI the available mini-notation, effects, transforms, and exactly which sample banks exist

The companion **strudeling** skill packages this knowledge for reuse across Claude conversations.

## Credits

- [Strudel](https://strudel.cc) by Alex McLean et al. — AGPL-3.0
- [dirt-samples](https://github.com/tidalcycles/dirt-samples) — the sample library
- Inspired by [Switch Angel](https://www.youtube.com/@switchangelmusic)'s live-coded trance videos
