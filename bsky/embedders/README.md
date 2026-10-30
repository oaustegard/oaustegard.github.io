# Three query embedders, side by side

https://austegard.com/bsky/embedders/

Searches 61,686 posts from the "Artificial (and real) Intelligence" Bluesky list with three
in-browser query embedders at once: Ettin-17m, leaf-ir and the EmbeddingGemma 2 4-layer cut.
Each embeds the query on a hand-written WebGPU engine, and a GPU scan (RemexTail) searches
2-bit codes of the posts. "Make available offline" caches everything, after which the page
works with the network off (service worker, cache first).

Ettin-17m and leaf-ir search indexes of the posts they embedded themselves. The cut queries the
full-EG2 index and shares its engine and remex parameters with ../image-search/, and its weights
with that page's onnxruntime fallback (../image-search/model/ort/). The cut's engine manifest is
models/eg2/manifest.json, because ../image-search/model/manifest.json now describes a different build.

Built by oaustegard/experiments `ettin-native/run/publish_site.py`; write-up in
`ettin-native/RESULTS.md`. Needs WebGPU (Chrome, Edge, Safari 26+).
