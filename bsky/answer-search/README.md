# Bluesky Answer Search

https://austegard.com/bsky/answer-search/

Answers questions with sentences quoted word for word from the last 100,000 posts of the
"Artificial (and real) Intelligence" Bluesky list. Ettin-17m embeds the question, a WebGPU scan over
1-bit codes finds the 40 closest posts, and Ettin then scores every sentence of those posts against the
question; the 10 best-matching sentences, at most one per post, are shown with author and link. Needs WebGPU.

## How the index stays current

- `scripts/answer-search/refresh.py` keeps a rolling snapshot: it reads the previous one, fetches the
  list's new posts (the list feed, which Bluesky serves about a week back; members' own feeds for anything
  older), embeds them with the same Ettin model as the page (`../embedders/models/ettin/`), quantizes them
  with remex 2.1.0 using the mean vector of `../embedders/index/ettin/index.json`, appends them and drops
  the oldest beyond 100,000.
- `.github/workflows/refresh-answer-search.yml` runs it daily at 05:41 UTC and force-pushes the result as a
  single commit to the orphan branch `bsky-answer-search-data`, so history does not grow. The snapshot is
  one file, `snapshot.bin` (header, 1-bit codes, scale/bias, gzipped post texts; layout in `refresh.py`),
  because raw.githubusercontent.com caches each file for up to five minutes and ignores query strings, so
  separate files could come from two different builds. `index.json` repeats the header for people. Run the
  workflow by hand from the Actions tab; with no snapshot on the branch it bootstraps from scratch in about
  ten minutes.
- The codes are 1 bit per dimension (`refresh.py --bits`, default 1; changing it re-embeds every stored post).
  On 60 keyword queries the 10 quoted sentences match exact search 9.33 times in 10 at 1 bit and 9.82 at
  2 bits (experiments `answer-search-1bit/`). The page runs 1-bit codes on the shared 2-bit scan in
  `../embedders/tail.js` by widening each code to the 2-bit index 0 or 3 and passing a centroid table
  that maps both halves to the 1-bit centroids; the constants come from the snapshot header.
- The page reads the snapshot from raw.githubusercontent.com, then asks Bluesky's public API for the posts
  written since, embeds them on the reader's GPU and quantizes them into the same index (`RemexTail.encode`),
  and polls once a minute while the tab is visible. A cached snapshot is reused for two days.

`?snap=<url>` points the page at another snapshot directory (local testing).

Model, engines and scan are shared with [Three query embedders](../embedders/). An earlier version also
had Monad (56M parameters) write an answer from the top posts; 1 of its 18 quotes was word for word, so it
was dropped.
