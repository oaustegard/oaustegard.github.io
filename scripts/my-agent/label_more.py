"""Second labeling round: posts the current model is least sure of, plus
extra 2026 posts (where AI agents live). Same prompt and output as label.py.

usage: label_more.py RAW_DIR LABELS_JSONL MODEL_JSON [N=2000]
"""
import json, math, random, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from features import has_phrase, tokens
from label import batches, label


def main(raw, out, model_path, n=2000):
    model = json.loads(Path(model_path).read_text())
    W, bias = model["weights"], model["bias"]
    done = {json.loads(l)["id"] for l in open(out)}
    posts = []
    for f in sorted(Path(raw).glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            p["id"] = p["uri"].rsplit("/", 1)[-1]
            if p["id"] not in done and has_phrase(p["text"]):
                posts.append(p)
    def margin(text):
        s = list(bias)
        for t in set(tokens(text)):
            w = W.get(t)
            if w:
                s = [a + b for a, b in zip(s, w)]
        m = max(s); e = sorted((math.exp(v - m) for v in s), reverse=True)
        return (e[0] - e[1]) / sum(e)
    posts.sort(key=lambda p: margin(p["text"]))
    unsure = posts[: n // 2]
    taken = {p["id"] for p in unsure}
    rng = random.Random(11)
    recent = [p for p in posts if p["createdAt"] >= "2026-01-01" and p["id"] not in taken]
    sample = unsure + rng.sample(recent, min(len(recent), n - len(unsure)))
    rng.shuffle(sample)
    print("labeling", len(sample), flush=True)
    with ThreadPoolExecutor(6) as ex, open(out, "a") as f:
        for res in ex.map(label, batches(sample, 60)):
            for r in res:
                f.write(json.dumps(r) + "\n")
            f.flush()
            print("labeled", len(res), flush=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3], *(int(a) for a in sys.argv[4:]))
