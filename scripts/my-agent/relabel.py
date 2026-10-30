"""Relabel posts after a prompt revision: every id whose current label is in
LABELS gets a fresh label from label.py's prompt. Writes OUT_JSONL with one
line per relabeled id (the old file is left alone).

usage: relabel.py RAW_DIR LABELS_JSONL OUT_JSONL unknown[,human,...]
"""
import json, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from features import has_phrase
from label import batches, label


def main(raw, labels, out, which):
    which = set(which.split(","))
    cur = {}
    for l in open(labels):
        r = json.loads(l); cur[r["id"]] = r["label"]
    done = set()
    if Path(out).exists():
        done = {json.loads(l)["id"] for l in open(out)}
    posts = []
    for f in sorted(Path(raw).glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            p["id"] = p["uri"].rsplit("/", 1)[-1]
            if cur.get(p["id"]) in which and p["id"] not in done and has_phrase(p["text"]):
                posts.append(p)
    print("relabeling", len(posts), flush=True)
    with ThreadPoolExecutor(6) as ex, open(out, "a") as f:
        for res in ex.map(label, batches(posts, 60)):
            for r in res:
                f.write(json.dumps(r) + "\n")
            f.flush()
            print("labeled", len(res), flush=True)


if __name__ == "__main__":
    main(*sys.argv[1:5])
