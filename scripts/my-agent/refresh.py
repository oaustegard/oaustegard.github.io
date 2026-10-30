"""Weekly refresh of bsky/my-agent-data.json without retraining.

Fetches every day from a week before the snapshot date through yesterday
(UTC), classifies the posts with the shipped weights in my-agent-model.json
and the MiniLM embedding (the same rule as the page), and replaces those
days' counts. The week of overlap picks up posts Bluesky indexed late.
Needs numpy, onnxruntime and tokenizers for embed.py.

usage: refresh.py [SITE_BSKY_DIR=bsky] [MINILM_DIR=minilm]
"""
import json, math, sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from backfill import Q, fetch, get
from embed import embedder
from features import dedupe_key, has_phrase, tokens

OVERLAP = 7


def classifier(model):
    """Words + MiniLM embedding, the same scoring as classify() in the page."""
    W, bias, emb, unsure = model["weights"], model["bias"], model["emb"], model["unsure"]

    def classify(text, e):
        s = [b + sum(w * x for w, x in zip(row, e)) for b, row in zip(bias, emb)]
        for f in set(tokens(text)):
            w = W.get(f)
            if w:
                s = [a + b for a, b in zip(s, w[:3])]
        m = max(s)
        x = [math.exp(v - m) for v in s]
        p = [v / sum(x) for v in x]
        k = p.index(max(p))
        return 2 if p[k] < unsure else k
    return classify


def main(site="bsky", minilm="minilm"):
    site = Path(site)
    embed = embedder(minilm)
    model = json.loads((site / "my-agent-model.json").read_text())
    data = json.loads((site / "my-agent-data.json").read_text())
    classify = classifier(model)
    days = {d: [data["ai"][i], data["human"][i], data["unknown"][i]] for i, d in enumerate(data["days"])}

    utc = timezone.utc
    today = datetime.now(utc).replace(hour=0, minute=0, second=0, microsecond=0)
    day = datetime.strptime(data["generated"], "%Y-%m-%d").replace(tzinfo=utc) - timedelta(days=OVERLAP - 1)
    last_ok = None
    while day < today:
        posts, _ = fetch(day, day + timedelta(days=1))
        if posts is None:
            # stop at the first failure so the snapshot date never skips a gap
            print("fetch failed for", day.date(), file=sys.stderr)
            break
        key = day.strftime("%Y-%m-%d")
        keep, seen = [], set()
        for p in posts:
            k = dedupe_key(key, p["text"])
            if p["uri"] in seen or k in seen or not has_phrase(p["text"]):
                continue
            seen.update((p["uri"], k))
            keep.append(p["text"])
        c = [0, 0, 0]
        for t, e in zip(keep, embed(keep) if keep else []):
            c[classify(t, e.tolist())] += 1
        days[key] = c
        last_ok = key
        print(key, c, flush=True)
        day += timedelta(days=1)
    if last_ok is None:
        print("nothing fetched", file=sys.stderr)
        return 1

    # Bluesky's own hit count for each Monday-based week the refresh touched
    hits = data.get("weekHits", {})
    wk = datetime.strptime(data["generated"], "%Y-%m-%d").replace(tzinfo=utc) - timedelta(days=OVERLAP - 1)
    wk -= timedelta(days=wk.weekday())
    while wk < today:
        r = get({"q": Q, "limit": 1, "since": wk.strftime("%Y-%m-%dT%H:%M:%SZ"),
                 "until": min(wk + timedelta(days=7), today).strftime("%Y-%m-%dT%H:%M:%SZ")})
        if r is not None and r.get("hitsTotal") is not None:
            hits[wk.strftime("%Y-%m-%d")] = r["hitsTotal"]
        wk += timedelta(days=7)

    ds = sorted(d for d in days if d <= last_ok)
    out = {"query": data["query"], "generated": last_ok, "days": ds,
           "ai": [days[d][0] for d in ds], "human": [days[d][1] for d in ds],
           "unknown": [days[d][2] for d in ds], "weekHits": hits}
    (site / "my-agent-data.json").write_text(json.dumps(out, separators=(",", ":")))
    print("snapshot now through", last_ok)
    return 0


if __name__ == "__main__":
    sys.exit(main(*sys.argv[1:]))
