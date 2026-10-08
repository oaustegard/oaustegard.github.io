# WordCraft

A Word-style word processor running in the browser: ribbon, styles, tables, track changes, .docx in and out. Nothing is uploaded.

**[Live Demo](https://austegard.com/web-utilities/wordcraft/?sample)** | **[Upstream source](https://github.com/storytold/wordcraft)**

## Usage

Open the page and wait for the download (10.5 MB). `?sample` opens the built-in handbook document; without it you get a blank page.

## Technical details

- **Project**: [WordCraft](https://github.com/storytold/wordcraft) by the ArtCraft team, a clean-room Rust reimplementation of Word. MIT OR Apache-2.0; the license and NOTICE files sit beside the page.
- **Build**: `trunk build --release` of `apps/wordcraft-web` at upstream commit `05d0b41`, unmodified. The only change is the loader in `index.html`.
- **Binary**: the 26.7 MB wasm is stored gzipped (10.5 MB) on the `wordcraft-web-build` branch of [oaustegard/experiments](https://github.com/oaustegard/experiments/tree/wordcraft-web-build/wordcraft-web), served by jsDelivr pinned to a commit. jsDelivr caps GitHub files at 20 MB, so the page inflates the file with `DecompressionStream`. This keeps the binary out of this repo's history.
- **Rendering**: egui on wgpu, WebGPU where available with a WebGL2 fallback.
- **Checked**: in headless Chromium on the WebGL2 path (software rasterizer) the sample document and full ribbon render with no console errors. The WebGPU path initialized but its screenshot came out blank under the software adapter, so it is untested on a real GPU.

## Limits

- Early-stage upstream software; Word parity is partial.
- Pinned build: updating means rebuilding and pushing a new branch commit.
