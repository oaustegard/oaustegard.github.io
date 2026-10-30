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
- **Latest posts**: Bluesky search sorted by latest, polled every 45
  seconds. Each post shows its class, the three probabilities as a bar, and a
  link to the post. Filter buttons narrow the list to one class.
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

`bsky/my-agent-data.json` holds daily counts per class for every post the
backfill found (`days`, `ai`, `human`, `unknown`) plus Bluesky's `hitsTotal`
per week. Days after the snapshot date (up to 60) are fetched and classified
live when the page loads, so the charts reach today without a rebuild.

Unauthenticated `app.bsky.feed.searchPosts` on `api.bsky.app` returns at most
100 posts per request and refuses `cursor` with a 403. The backfill and the
live fill both split any window that reports more than 90 hits in half until
each part fits in one page.

## Classifier

Multinomial logistic regression over binary single-word and word-pair
features, trained on posts sampled evenly across the weeks and labeled by
Claude. A post whose top probability is under 40% counts as unknown. The
weights are in `bsky/my-agent-model.json` with the cross-validated scores,
which the page shows under "How it works".

The tokenizer in the page (`tokens()`) mirrors the one in
`scripts/my-agent/train.py` exactly. Change both or neither.

## Rebuilding

```bash
RAW=/some/scratch/raw
python3 scripts/my-agent/backfill.py $RAW                  # resumable, one file per week
python3 scripts/my-agent/label.py $RAW labels.jsonl 2400   # claude -p children
python3 scripts/my-agent/train.py $RAW labels.jsonl bsky   # writes both JSON files
```

The repository never stores post text, only the counts and the model.
