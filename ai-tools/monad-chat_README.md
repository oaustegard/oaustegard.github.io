# Monad Bullshitter

A chat page for Pleias' [Monad](https://huggingface.co/PleIAs/Monad), a 56-million-parameter
reasoning model trained on the SYNTH dataset, running entirely in the browser tab. Monad thinks
before it answers: each reply streams a thinking trace, then the answer. The trace has the shape of
careful reasoning (query parsing, confidence marks, a verification checklist) with contents that are
mostly wrong. Greedy, the model got 7 of 30 one-line fact questions right, and the original Monad
got the same 7 of 30.

Two sets of weights, both 8-bit, both 65 MB:

- **Loop-fixed Monad** (default): a training-free edit that removes one direction from the
  attention outputs of layers 27–34. On a 500-prompt test set it cut greedy repetition loops from
  34% to 6% and raised instruction-following accuracy.
- **Original Monad**: the weights as Pleias released them, for comparison.

Everything runs client-side in onnxruntime-web 1.30: WebGPU where the browser has it (about 150
tokens a second on an M-series Mac), single-threaded WASM otherwise. Weights download once from
a public R2 bucket and stay in the browser's Cache API; a SHA-256 check guards the rebuilt file.

## Settings

- **System prompt.** Empty by default. Monad was trained on single questions with no system turn; in dry runs a system prompt describing Monad made it talk about itself in 40 to 90% of answers to unrelated questions, and style instructions changed little. Instructions appended to the question (a separate field) are the form it was trained on: " Answer in at most three sentences." cut the median answer from 148 words to 62.
- **Sampling.** Temperature 0.7, top-p 0.9 and a repetition penalty of 1.15 on the last 64
  generated tokens (never the prompt). On 40 everyday questions, neither model looped at these settings; greedy, the original looped on 20% and the loop-fixed model on 5%.
- **Stop on repetition.** On by default: generation stops when the last 32 or more tokens are one
  block repeated, and the reply says so. Turn it off to watch a loop run to the token limit.
- **Earlier turns.** Off by default. Monad was trained on single questions, and given an earlier exchange it tends to answer the earlier question again.

The context window is 2,048 tokens; when earlier turns are included, the oldest are dropped first.

## Where it comes from

- [oaustegard/experiments/monad-weight-edit](https://github.com/oaustegard/experiments/tree/main/monad-weight-edit):
  the loop edit and its test.
- [oaustegard/experiments/monad-layer-parallel](https://github.com/oaustegard/experiments/tree/main/monad-layer-parallel):
  why 8-bit (1.8× faster than fp32 with no measurable loss; 4-bit brought the loops back).
- [oaustegard/experiments/monad-chat](https://github.com/oaustegard/experiments/tree/main/monad-chat):
  the system-prompt and sampling dry runs behind the defaults.

Files: `monad-chat/index.html` (page), `monad-chat/monad.js` (loading, decode loop, sampler,
loop check), `monad-chat/bpe.js` (Monad's byte-level BPE tokenizer, checked token for token
against the Python tokenizer on 712 strings). URL parameters for local testing: `?weights=`,
`?ort=`, `?backend=wasm|webgpu`.

Model: PleIAs/Monad, Apache-2.0.
