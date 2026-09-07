# Latent calculator

A calculator wired into a frozen SmolLM2-135M between layer 16 and layer 17,
running in your browser. Type an arithmetic prompt and the page answers it three
ways over the same weights: the frozen model on its own, the usual tool route
with the result pasted into the prompt as text, and the latent port, where a
small trained head reads the operands out of the layer-16 activations, a
calculator computes the answer, and a trained encoder writes it back into the
residual stream at every answer step. No tokens cross the boundary in either
direction on that third route.

Everything runs client-side in onnxruntime-web: WebGPU where the browser has
it, WASM otherwise. First load fetches about 540 MB of fp32 weights (270 MB
for the fp16 variant), split into shards under 90 MB; the browser caches them.
Expect a few seconds to load and, on WASM, roughly half a second per answer.

## What the numbers behind it say

Over 2,000 held-out prompts on a CPU, the latent route with the learned query
head scores 0.905 exact match (addition 0.99, subtraction 0.98, comparison
1.00, twelve-digit multiplication 0.66); the frozen model alone scores 0.001;
the text route never lands the bare answer at this model size. The learned
head recovers the operands on 99.3% of prompts in the training distribution
and on 45% of prompts with an operand length it never saw, which is why the
page also offers the regex query source: it lifts the operands off the prompt
text exactly, and with it the port reaches the numbers it gets with true
operands, 0.91 in distribution and 0.85 on the unseen length.

Phrasings outside the twelve trained templates (listed on the page) can
mislead the learned head; the decoded query is shown so a wrong read is
visible. Products above about ten digits lose their low digits.

## Where it comes from

[oaustegard/experiments/latent-calculator](https://github.com/oaustegard/experiments/tree/main/latent-calculator):
`RESULTS.md` for the experiment (predictions registered before training,
three designs, graded), `web/` for the export and this page's source. Weights
on Hugging Face at `austegard/latent-calculator-web`, with a raw-file mirror
on the experiments repo as fallback. Model: HuggingFaceTB/SmolLM2-135M,
Apache-2.0.
