# My Agent

Tracks the phrase “my agent” on Bluesky from January 2025 to today. The page
shows the latest posts live, charts the number of posts per day, week or month,
and sorts every post into **AI agent**, **human agent** or **unknown** with a
small classifier that runs in the browser.

Live: <https://austegard.com/bsky/my-agent.html>

## What's on the page

- **Tiles**: posts counted since January 2025, the AI share over the last four
  full weeks against January 2025, the busiest week, and the latest post.
- **Posts per window**: stacked bars by class (stacked areas at day
  resolution). Day, Week and Month buttons switch the window, and hovering
  shows the counts.
- **Share per window**: the same data as percentages, so the change in mix
  shows apart from changes in volume.
- **Latest posts**: Bluesky search sorted by latest, checked every 30
  seconds (and whenever the tab comes back into view). The status line shows
  when it last checked, a countdown to the next check, and how often a post
  usually arrives: the phrase averages a few dozen posts a day, so an hour
  without one is normal. Each post shows its class, the three probabilities
  as a bar, and a link to the post. Filter buttons narrow the list to one
  class.
- **What the classifier keys on**: the words and word pairs that push hardest
  toward each class.
- **Try it**: type any text and it is classified as you type.
- **Background**: a WebGPU particle swarm. Blue AI particles move in
  right-angle steps, like traces on a circuit board, orange human particles
  drift slowly, and grey unknown particles wander. The mix matches the latest
  posts, a burst of the new post's class blooms when one arrives, and the
  pointer pushes particles away. Without WebGPU the page shows a static
  gradient instead. The link at the bottom right pauses the swarm.

## Data

Bluesky's search for `"my agent"` also returns posts where the two words are
apart, or where the phrase is only in a quoted post or a link card: about one
result in eight. Only posts whose own text contains "my agent" are shown or
counted, in the page and in the scripts alike (`has_phrase()` in
`scripts/my-agent/features.py`).

`bsky/my-agent-data.json` holds daily counts per class for every post the
backfill found (`days`, `ai`, `human`, `unknown`) plus Bluesky's `hitsTotal`
per week. Days after the snapshot date (up to 60) are fetched and classified
live when the page loads, so the charts reach today without a rebuild.

Unauthenticated `app.bsky.feed.searchPosts` on `api.bsky.app` returns at most
100 posts per request and refuses `cursor` with a 403. The backfill and the
live fill both split any window that reports more than 90 hits in half until
each part fits in one page.

## Classifier

Multinomial logistic regression over two kinds of evidence: binary single-word
and word-pair features, and a 384-dimensional sentence embedding from
[all-MiniLM-L6-v2](https://huggingface.co/Xenova/all-MiniLM-L6-v2) (quantized
ONNX, mean pooled, normalized). The embedding catches meaning that no single
word gives away, such as "built by my agent". A post whose top probability is
under 40% counts as unknown.

Claude labeled 4,375 posts in two rounds. The first 2,375 were sampled evenly
across the weeks. Of the next 2,000, half were the posts the first,
words-only model was least sure of and half came from 2026.

Oskar then labeled 100 random first-round posts by hand
(`scripts/my-agent/labels/oskar.jsonl`; 99 kept: four Splatoon answers were
corrected to unknown, and one post described a human agent but was marked
AI, so it was dropped). Claude agreed with him on 85%, and most of its misses
were posts he read as human that it called unknown, among them every post
about the series *Call My Agent!*. The labeling prompt now says that a plain
"my agent" with nothing pointing to software is a person, and `relabel.py`
labeled the 863 posts Claude had called unknown again: 435 became human, 29
AI, and 399 stayed unknown. Claude's labels now agree with Oskar's on 86%.
Oskar's labels override Claude's and carry three times the weight in
training.

Scored out of fold against Oskar's 99, the model scores 80–82% depending on
the fold split, up from 76% before the relabeling. Against Claude's labels,
five-fold cross-validation gives 85%. The final labels are in
`scripts/my-agent/labels/claude.jsonl` (post IDs and labels, no text).

The page loads transformers.js 3.7.6 and runs the same quantized MiniLM file
on WebAssembly. Until the model (23 MB) has loaded, a words-only model, which
ships in the same JSON, classifies the feed, and the feed is re-scored once
MiniLM arrives. On 300 sampled posts, browser and Python embeddings had a
cosine similarity of 0.991 on average and gave the same class for 299.

The tokenizer in the page (`tokens()`) mirrors `scripts/my-agent/features.py`
exactly. Change both or neither.

## Rebuilding

```bash
RAW=/some/scratch/raw
python3 scripts/my-agent/backfill.py $RAW                  # resumable, one file per week
python3 scripts/my-agent/label.py $RAW labels.jsonl 2400   # claude -p children
python3 scripts/my-agent/label_more.py $RAW labels.jsonl bsky/my-agent-model.json 2000
python3 scripts/my-agent/embed.py $RAW minilm emb.npz      # minilm/: model_quantized.onnx + tokenizer.json
python3 scripts/my-agent/relabel.py $RAW labels.jsonl relabel.jsonl unknown   # after a prompt change
python3 scripts/my-agent/train.py $RAW scripts/my-agent/labels/claude.jsonl bsky emb.npz scripts/my-agent/labels/oskar.jsonl
```

`.github/workflows/refresh-my-agent.yml` runs `scripts/my-agent/refresh.py`
every Monday: it fetches the days since the snapshot plus a week of overlap,
classifies them with the committed model and MiniLM, commits the new counts, then
dispatches the deploy. Only retraining needs the steps above.

```bash
python3 scripts/my-agent/refresh.py bsky minilm              # what the Action runs
```

The repository never stores post text, only the counts and the model.
