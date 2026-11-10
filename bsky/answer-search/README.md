# Bluesky Answer Search

https://austegard.com/bsky/answer-search/

Answers questions with sentences quoted word for word from the last 100,000 posts of the
"Artificial (and real) Intelligence" Bluesky list. Ettin-17m embeds the question, a WebGPU scan over
3-bit codes finds the 40 closest posts, and Ettin then scores every sentence of those posts against the
question; the 10 best-matching sentences, at most one per post, are shown with author and link. Needs WebGPU.

## How the index stays current

- `scripts/answer-search/refresh.py` keeps a rolling snapshot: it reads the previous one, fetches the
  list's new posts (the list feed, which Bluesky serves about a week back; members' own feeds for anything
  older), embeds them with the same Ettin model as the page (`../embedders/models/ettin/`), folds each
  vector from 768 numbers to 256 the way the page's engine does (`fold256.f32`), quantizes them with
  remex 2.1.0 at 3 bits, centred on a fixed mean (first taken from `../embedders/index/ettin/index.json`,
  then carried in the snapshot), appends them and drops the oldest beyond 100,000.
- `.github/workflows/refresh-answer-search.yml` runs it daily at 05:41 UTC and force-pushes the result as a
  single commit to the orphan branch `bsky-answer-search-data`, so history does not grow. The snapshot is
  one file, `snapshot-256x3.bin` (header, 3-bit codes as bit-planes, scale/bias, gzipped post texts; layout in
  `refresh.py`),
  because raw.githubusercontent.com caches each file for up to five minutes and ignores query strings, so
  separate files could come from two different builds. `index.json` repeats the header for people. Run the
  workflow by hand from the Actions tab; with no snapshot on the branch it bootstraps from scratch in about
  ten minutes.
- The codes are 3 bits for each of 256 numbers, 104 bytes per post with the scale and bias. Until
  2026-11-10 they were 1 bit for each of 768, the same size. On 60 keyword queries the 10 quoted sentences
  match exact search 9.70 times in 10, against 9.28 for the 1-bit index; on 200 snippet queries 9.78
  against 9.23 (experiments `ettin-span256-remex/`, round 3, which also measured 2 and 4 bits). The page
  scans them with `scan256.js`, which reads 2, 3 or 4-bit bit-planes; the width and remex's constants
  come from the snapshot header (`refresh.py` `BITS`; changing it re-embeds every stored post).
- The page reads the snapshot from raw.githubusercontent.com, then asks Bluesky's public API for the posts
  written since, embeds them on the reader's GPU and encodes them into the same index as remex does
  (`Scan256.encode`),
  and polls once a minute while the tab is visible. A cached snapshot is reused for two days.

`?snap=<url>` points the page at another snapshot directory (local testing).

The model and its engine are shared with [Three query embedders](../embedders/); the scan is this page's own. An earlier version also
had Monad (56M parameters) write an answer from the top posts; 1 of its 18 quotes was word for word, so it
was dropped.

`tests/answer-search-index.mjs SNAPSHOT_DIR` runs the page against a locally built snapshot in headless
Chromium: GPU top 40 against a host computation of the same score, codes encoded in the page against the
builder's, and posts (from the snapshot and added live) found by their own text.
