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

Your query goes through EmbeddingGemma 2's text side, with its search prompt:

- **Usually the hosted query embedder**, a small Cloudflare Worker running the same model, so
  the page downloads no model at all.
- **If the Worker is unavailable,** the page loads the text model itself (about 175 MB the
  first time, then cached by the browser).

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

`tail.js` here is a copy of `embeddinggemma2-webgpu-tail/web/tail.js` from the same repo.
