---
name: verify
description: Differential check of the site's shared WebGPU kernels in headless Chromium. RemexTail (bsky/embedders/tail.js and its copy in bsky/image-search/) is compared against float64 CPU references, and the Ettin-17m WGSL engine (bsky/embedders/engine.js) against onnxruntime-web's CPU path. Run before every commit that touches those files, the remex params, the models or the indexes under bsky/embedders/ and bsky/image-search/, and whenever kernel work is called done.
---

# Verify: WebGPU kernels

Run from the repo root:

```bash
node .claude/skills/verify/kernels.mjs
```

It exits 0 and prints `OK: 24/24 checks` when the kernels agree with their
references. It takes about 22 s on the container's 4 CPUs, because SwiftShader
runs the GPU work on the CPU.

| option | effect |
|---|---|
| `--no-engine` | skip the Ettin engine check (RemexTail only, ~16 s) |
| `--both-tails` | also run every RemexTail check on `bsky/image-search/tail.js` when its code is the same |
| `--real-docs N` | how many docs of the real Ettin index to score (default 8192) |

The page-side checks are in `kernels-page.js`. The references there are written
from the remex math, not copied from the kernels' code.

## RemexTail checks

They use the real remex parameters (`bsky/image-search/params.json`). Each check
runs twice: once with the `rht` rotation from the plan, and once with the same
rotation materialised as a dense 768×768 matrix (`rotation: 'dense'`).

| check | reference | tolerance (measured) |
|---|---|---|
| the reference rotation is orthonormal | RRᵀ = I | 1e-12 (0) |
| encode codes, 1501 docs | strict > against the boundaries on t/\|t\|; a mismatch passes only within 2e-6 of a boundary | exact (0 flips) |
| packed bytes | remex byte order: byte k holds codes 4k..4k+3, high bits first | exact |
| scale, bias, \|t\|, mu·t | float64 from the GPU's own codes | 1e-4 rel (2.6e-5) |
| prep + scan scores, 5 queries | scale·Σ(Rq̂)ⱼc[codeⱼ] + bias + q̂·mu | 2e-6 abs (1.6e-7) |
| GPU top-10 and top-256 (two passes) | a sort of the GPU's scores, higher score first, lower index on ties | exact |
| three identical docs | rank 7, 1499, 1500 | exact |
| real Ettin index (`loadCodes`, first 8192 docs) | byte round trip, scan, top-40 | exact / 2e-6 |
| pool (one row with an empty mask) | masked mean | 2e-6 (1.5e-7) |
| colsum into a non-zero accumulator | column sums | 5e-5 (5e-6) |

`bsky/image-search/tail.js` is a vendored copy with a two-line header. When its
code matches `bsky/embedders/tail.js`, the run says so and tests it once. When
the two differ, it tests both.

## Ettin engine checks

`SmallEngine` (WGSL) and onnxruntime-web 1.30.0 (wasm, CPU) embed the same five
token sequences, 7 to 128 tokens long. The longest reaches past the 64-token
local-attention half-window. The max abs difference must be under 1e-5
(measured: 1.0e-7). A batch of all five must equal the five run one at a time.
The token ids come from the Ettin tokenizer's vocabulary in Node, so no
tokenizer library is loaded.

onnxruntime-web is fetched from jsDelivr on the first run and cached in
`~/.cache/verify-kernels/`. If it is not cached and jsDelivr cannot be reached,
the engine check prints `SKIP` with that reason and the run still exits 0.
Report a skipped engine check in the commit's `Verified:` line.

## Stress test (2026-11-18)

- 10 sequential runs: 10/10 passed, 21.6–23.1 s each.
- 2 runners at once, 3 runs each: 6/6 passed.
- Offline, with no cache and the proxy pointed nowhere: RemexTail passes 22/22,
  and the engine check prints SKIP.
- Planted defects, each one fails at least one check: packing codes low bits
  first, scan without the bias, ties broken toward the higher index, the RHT
  scale 1/16.01 instead of 1/16, the pool dividing by count+1, prep dropping
  q̂·mu, a 1% RoPE theta error, LayerNorm eps ×1000, and a 0.1% scale on one
  GLU product. The last two engine defects passed under the first tolerance
  (2e-3), which is why it is now 1e-5.

## Limits

- SwiftShader shows the kernels are correct. It says nothing about speed or about
  a real GPU's rounding. For real hardware, run the same comparison as a GPU
  Bridge job on Oskar's device (claude-workspace `docs/gpu-bridge.md`).
- A strict `>` changed to `>=` at a boundary would pass, because random data
  never lands exactly on a boundary.
- Not covered here: the EG2 engine (`Eg2Engine` in `bsky/image-search/engine.js`), the 256-dim fold that List
  Scout uses (`tests/embedders-fold.mjs`, ~2.5 min), and Answer Search's
  `Scan256` (`tests/answer-search-index.mjs`, needs a snapshot). Run those when
  their files change.
