"""Fetch every Bluesky post matching "my agent" per ISO week since 2025-01-06.

Writes one JSONL line per post (uri, createdAt, text) to OUT, resumable: weeks
already present in OUT/_done.txt are skipped. Raw text stays out of the repo;
only aggregates and the trained model are committed.
"""
import json, sys, time, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

API = "https://api.bsky.app/xrpc/app.bsky.feed.searchPosts"
Q = '"my agent"'
START = datetime(2025, 1, 6, tzinfo=timezone.utc)  # first Monday of 2025


def get(params, tries=5):
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            return json.load(urllib.request.urlopen(url, timeout=40))
        except Exception as e:
            print("retry", i, e, file=sys.stderr)
            time.sleep(2 ** i)
        finally:
            time.sleep(0.5)
    return None


def fetch(since, until):
    """All posts in [since, until). Unauthenticated search refuses cursors
    (403), so a window with more than one page of hits is split in half."""
    p = {"q": Q, "limit": 100, "sort": "latest",
         "since": since.strftime("%Y-%m-%dT%H:%M:%SZ"),
         "until": until.strftime("%Y-%m-%dT%H:%M:%SZ")}
    r = get(p)
    if r is None:
        return None, None
    hits = r.get("hitsTotal") or 0
    if hits > 90 and until - since > timedelta(minutes=30):
        mid = since + (until - since) / 2
        a, ha = fetch(since, mid)
        b, hb = fetch(mid, until)
        if a is None or b is None:
            return None, None
        return a + b, ha + hb
    posts = []
    for x in r.get("posts", []):
        rec = x.get("record", {})
        posts.append({"uri": x["uri"], "createdAt": rec.get("createdAt"),
                      "text": rec.get("text", ""), "langs": rec.get("langs")})
    return posts, hits


def week(since, until):
    posts, hits = fetch(since, until)
    if posts is None:
        return None, None
    seen, out = set(), []
    for p in posts:
        if p["uri"] not in seen:
            seen.add(p["uri"]); out.append(p)
    return out, hits


def main(out):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    done_f = out / "_done.txt"
    done = set(done_f.read_text().split()) if done_f.exists() else set()
    now = datetime.now(timezone.utc)
    w = START
    while w < now:
        key = w.strftime("%Y-%m-%d")
        if key not in done:
            posts, hits = week(w, w + timedelta(days=7))
            if posts is None:
                print("FAILED", key, file=sys.stderr); w += timedelta(days=7); continue
            with open(out / f"{key}.jsonl", "w") as f:
                for p in posts:
                    f.write(json.dumps(p) + "\n")
            with open(out / "hits.jsonl", "a") as f:
                f.write(json.dumps({"week": key, "hitsTotal": hits, "fetched": len(posts)}) + "\n")
            with open(done_f, "a") as f:
                f.write(key + "\n")
            print(key, hits, len(posts), flush=True)
        w += timedelta(days=7)


if __name__ == "__main__":
    main(sys.argv[1])
