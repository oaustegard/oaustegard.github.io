# Taxonomy snap

Type anything; get the nearest of 860 retail category labels. `Xenova/gte-small`
(33 MB int8 ONNX) embeds the whole taxonomy in the page and snaps your text onto the
closest label by cosine. No server, no API key, nothing typed leaves the browser. The
model is cached by the browser after the first load.

Self-contained: the 860 labels, the 468 benchmark queries, their gold labels and the
pre-written labels are all inlined (42 KB of JSON). The only network fetches are
transformers.js from jsDelivr and the model weights from Hugging Face.

## Why it exists

It is the honest end of an experiment in Doug Turnbull's
[hallucinate-and-snap](https://softwaredoug.com/blog/2026/08/10/hypothetical-classifications)
pattern — have a cheap model invent a label, then resolve the invention against the real
vocabulary with an embedder. The measurement said the embedder is carrying the pattern:

| arm | acc@1 | acc@3 | tokens sent |
|---|---|---|---|
| snap the query directly, int8 (this page) | 0.434 | 0.588 | 0 |
| the same encoder at fp32, off the page | 0.455 | 0.594 | 0 |
| a cheap model writes the label first, then snap | 0.571 | — | 6 |
| send all 860 labels, ask for a constrained choice | 0.701 | 0.744 | 5,265 |

Sending the vocabulary wins whenever you can afford it. The pattern is for the case
where you cannot — a provider enum cap, a five-thousand-label vocabulary, or per-call
cost at volume. And a *small local* model in place of the writing half makes it worse,
not cheaper: Pleias Monad (57M) and Baguettotron (321M) score 0.425 and 0.400, below the
encoder's own baseline.

The page can re-score the first two rows live, so a drift between what it computes and
what is printed is visible rather than taken on trust.

## Data and licences

Queries, labels and judgements from [WANDS](https://github.com/wayfair/WANDS), © Wayfair,
MIT. Encoder [Xenova/gte-small](https://huggingface.co/Xenova/gte-small), MIT. Runtime
[transformers.js](https://github.com/huggingface/transformers.js).

Arms, artifacts and the reproduction script:
[oaustegard/experiments/hypothetical-classification](https://github.com/oaustegard/experiments/tree/main/hypothetical-classification).

## The WebGPU trap

The page pins the encoder to the WASM backend. Running the same int8 weights through
transformers.js on `device: "webgpu"` returns a collapsed embedding space — every pair of
labels roughly 0.995 apart, so the ranking is noise — silently, with no error and a
plausible-looking result. The first version shipped that way and answered `Pillow` with
*Wedding, Drains, Fabric, Flags, Candles*.

The weights are not at fault. The same `model_quantized.onnx` matches fp32 PyTorch to
three decimals under onnxruntime, and the page's own JavaScript reproduces 0.434/0.588
over all 468 queries when run on Node's CPU backend.

Hence the smoke test on load: the page carries its own gold labels, so it checks that the
index it just built can rank 24 held-out queries before it will show anything. It clears
that gate at 15/24 against a 6/24 floor. A page that ships its own benchmark and only
wires it to a button cannot notice it is broken.
