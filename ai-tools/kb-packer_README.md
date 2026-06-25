# KB Packer

Build a portable, embedding-free knowledgebase from your files and download it as
an installable `.skill` — entirely in the browser.

**[Live Demo](https://austegard.com/ai-tools/kb-packer.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/ai-tools/kb-packer.html)**

## Overview

KB Packer turns a set of documents into a self-contained knowledgebase skill that
any skill-capable agent can install and query — with **no embedding model**.
Retrieval is lexical (BM25 over a precomputed index); the semantic layer is
supplied by the agent, which expands each question into search terms at query
time. That design is what lets the whole thing run client-side: chunking,
indexing, and packaging all happen in your browser, with no upload, no model
download, and no network call.

The output is a `<name>.skill` (an ordinary zip) containing the index, the chunk
text, a query protocol, and two thin searchers (`search.js` / `search.py`) so it
runs wherever the consuming agent has Node **or** Python.

## Features

- **Fully client-side** — files never leave your machine; works offline.
- **Drag & drop** files or a whole folder; `.txt .md .html` by default.
- **Whole-document chunking by default** — lexical BM25 tolerates large chunks;
  the searcher returns a query-focused passage per hit, so reasoning context
  stays tight.
- **Dual-runtime bundle** — the same `.skill` queries under Node or Python.
- **Embedding-free** — no model, no API key, no 100s of MB of weights.

## Usage

1. Open the [KB Packer](https://austegard.com/ai-tools/kb-packer.html).
2. Drop your files (or a folder) onto the drop zone.
3. Set the **KB name** (this becomes the skill's name), optionally adjust
   extensions / chunk size / source description.
4. Click **Build .skill** and download `<name>.skill`.
5. Install the skill in your agent and ask questions about your corpus. The agent
   expands each query into search terms and runs the bundled searcher; cite the
   returned chunk ids.

## How it works

Files → structural chunks → BM25 inverted index → zip with a query protocol +
searchers. The build core is a browser port of the `creating-kb` builder from
[oaustegard/claude-skills](https://github.com/oaustegard/claude-skills); a
browser-built `.skill` is byte-identical to one built by that tool's Node CLI.
There is no semantic search in the bundle — the consuming agent is the semantic
layer.
