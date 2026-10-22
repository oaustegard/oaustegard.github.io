# Bluesky Image Search

[image-search/](https://austegard.com/bsky/image-search/): search 16,878 popular Bluesky
images by what is in them. Type "foggy mountains at dawn" and get foggy mountains at dawn,
whether or not anyone wrote alt text.

## How it works

Every image was run once through the vision encoder of
[EmbeddingGemma 2](https://huggingface.co/google/embeddinggemma-2), Google's multimodal
embedding model. Its text, images, audio and video share one 768-dimensional space, so a
sentence and a picture of the same thing land close together.

Each 768-number vector was then compressed to 2 bits per number with
[remex](https://github.com/oaustegard/remex): 192 bytes per image. The whole index is
3.2 MB of codes plus a list of who posted what, about 4 MB over the wire, so it loads into the
page. Your GPU scans all 16,878 images in a few milliseconds (WebGPU).

Your query is embedded in the page too, so nothing goes to a server:

- **By default, a 25 MB query model**: the first 4 of EmbeddingGemma 2's 24 text layers, trained to
  put a query where the full model would, with a 32K-token vocabulary and a 3-bit token table
  ([eg2-layer-student](https://github.com/oaustegard/experiments/tree/main/eg2-layer-student)).
  Its last round of training was on about 215,000 Bluesky alt texts. On alt-text searches for images
  it never trained on, it finds the image in the top 10 71% of the time, against 81% for the full
  model. It
  downloads once, then stays cached. It runs on your GPU in a small engine written for this model
  (`engine.js`, hand-written WebGPU kernels), on the same GPU device as the index scan, so the
  query vector never leaves the GPU. On a Mac's GPU a query takes under a millisecond, against
  about 5 ms in [onnxruntime-web](https://onnxruntime.ai/docs/tutorials/web/) on WebGPU and 39 ms
  on its CPU (wasm) backend, with identical vectors
  ([eg2-wgsl-engine](https://github.com/oaustegard/experiments/tree/main/eg2-wgsl-engine)). If the
  engine can't start, the page falls back to onnxruntime-web on the same model file; `?engine=ort`
  forces that path.
- **For better results, the full text model** (about 175 MB the first time), from the link under
  the results or with `?model=full`.

Add `?q=` to share a search: `?q=foggy+mountains+at+dawn` runs it on load, and the address bar
follows whatever you search. Results update as you type: at each finished word, or after a short pause.

The images themselves load from Bluesky's own CDN, and each tile links to its post.

## What is in the index

Posts with images from 12 popular public feeds, as of October 20, 2026:

- What's Hot
- Art: What's Hot, Artists: Trending
- photography, landscape, street, film and nature photography
- cats, science, moss

Posts labelled adult or graphic were dropped. The index stores only each image's author, post
id, image id and like count. It keeps no post text and no alt text.

## How good it is

The test: use each image's own alt text as the query, and check whether that image comes back.
Over 5,248 such queries against all 16,878 images:

- it ranks first 56% of the time;
- it lands in the top 10 80% of the time.

Those numbers are for the full text model. The 25 MB query model was trained on text-to-text
search, not on image descriptions, and on the same test it lands in the top 10 56% of the time
(first 31%). It is the fast default; the full model is one click away.

Alt text reads like a caption, so this is a best case for what people type.

To make the 3-hour embedding run fit on an 8 GB MacBook Air, images were encoded with 70
vision tokens instead of the default 280. In a 200-image test that cost one point of
top-1 accuracy and nothing at top 10.

## Needs

A browser with WebGPU: current Chrome or Edge, or Safari 26+.

## Source

Built in [oaustegard/experiments](https://github.com/oaustegard/experiments) under
`bsky-image-search/`:

- the harvest script and the indexing page that embedded the images;
- the index builder;
- the evaluation, with full numbers in its `RESULTS.md`.

`model/` holds the 25 MB query model (`model_t3w.onnx` + its data and the 32K tokenizer), the
alt-text retrain of 2026-10-22 (eg2-layer-student run C, which replaced release
`eg2-layer-onnx-20261021`); `meta.json` there has its contract and scores.
`engine.js` and `model/manifest.json` (the byte offset of each weight in `model_t3w.onnx_data`)
are copies from `eg2-wgsl-engine/web/` in the same repo.
`tail.js` here is a copy of `embeddinggemma2-webgpu-tail/web/tail.js` from the same repo.
