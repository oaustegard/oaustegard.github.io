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
| snap the query directly (this page) | 0.455 | 0.594 | 0 |
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
