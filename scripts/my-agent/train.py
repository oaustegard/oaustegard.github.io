"""Train the ai/human/unknown classifier and write the page's two data files.

usage: train.py RAW_DIR LABELS_JSONL SITE_BSKY_DIR

Model: multinomial logistic regression over binary unigram+bigram features.
The tokenizer is mirrored line for line by `tokens()` in bsky/my-agent.html;
change both or neither. Writes my-agent-model.json (weights) and
my-agent-data.json (daily counts per class for every backfilled post).
"""
import json, re, sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import classification_report, confusion_matrix

CLASSES = ["ai", "human", "unknown"]
URL = re.compile(r"https?://\S+|\b[\w-]+(\.[\w-]+)*\.(com|org|net|io|ai|app|dev|social|co|uk)\b\S*", re.A)
TOK = re.compile(r"[a-z0-9_]+")
UNSURE = 0.40  # below this top probability the page says "unknown"


def tokens(text):
    t = URL.sub(" zzurl ", text.lower())
    w = TOK.findall(t)
    return w + [a + " " + b for a, b in zip(w, w[1:])]


def load(raw):
    posts = {}
    for f in sorted(Path(raw).glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            posts[p["uri"].rsplit("/", 1)[-1]] = p
    return posts


def main(raw, labels, site):
    posts = load(raw)
    lab = {}
    for line in open(labels):
        r = json.loads(line)
        lab[r["id"]] = r["label"]
    ids = [i for i in lab if i in posts]
    X_txt = [posts[i]["text"] for i in ids]
    y = np.array([CLASSES.index(lab[i]) for i in ids])
    print("labels", Counter(lab[i] for i in ids))

    vec = CountVectorizer(analyzer=tokens, binary=True, min_df=3)
    X = vec.fit_transform(X_txt)
    clf = LogisticRegression(C=0.5, max_iter=3000, class_weight="balanced")
    cv = StratifiedKFold(5, shuffle=True, random_state=0)
    proba = cross_val_predict(clf, X, y, cv=cv, method="predict_proba")
    pred = np.where(proba.max(1) < UNSURE, 2, proba.argmax(1))
    report = classification_report(y, pred, target_names=CLASSES, output_dict=True)
    print(classification_report(y, pred, target_names=CLASSES))
    print(confusion_matrix(y, pred))

    clf.fit(X, y)
    names = vec.get_feature_names_out()
    W = clf.coef_.T  # features x classes
    keep = np.argsort(-np.abs(W).max(1))[:6000]
    weights = {names[k]: [round(float(v), 3) for v in W[k]] for k in keep
               if np.abs(W[k]).max() >= 0.02}
    top = {c: [names[k] for k in np.argsort(-(W[:, j] - W.mean(1)))[:25]]
           for j, c in enumerate(CLASSES)}
    model = {"classes": CLASSES, "bias": [round(float(b), 3) for b in clf.intercept_],
             "unsure": UNSURE, "weights": weights, "top": top,
             "eval": {"n": len(ids), "folds": 5,
                      "accuracy": round(report["accuracy"], 3),
                      **{c: {k: round(report[c][k], 3) for k in ("precision", "recall", "f1-score", "support")}
                         for c in CLASSES}},
             "labelCounts": dict(Counter(lab[i] for i in ids))}
    Path(site, "my-agent-model.json").write_text(json.dumps(model, separators=(",", ":")))

    # classify every backfilled post; hand labels win where they exist
    all_ids = list(posts)
    P = clf.predict_proba(vec.transform([posts[i]["text"] for i in all_ids]))
    cls = np.where(P.max(1) < UNSURE, 2, P.argmax(1))
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    days = defaultdict(lambda: [0, 0, 0])
    seen = set()  # bots repeat one text hundreds of times; count it once a day
    for i, c in zip(all_ids, cls):
        if i in lab:
            c = CLASSES.index(lab[i])
        d = (posts[i].get("createdAt") or "")[:10]
        key = (d, " ".join(posts[i]["text"].lower().split())[:200])
        if key in seen:
            continue
        seen.add(key)
        if "2025-01-01" <= d < today:  # today is partial; the page fetches it live
            days[d][c] += 1
    hits = {}
    hf = Path(raw, "hits.jsonl")
    for line in hf.open():
        r = json.loads(line)
        hits[r["week"]] = r["hitsTotal"]
    ds = sorted(days)
    data = {"query": "\"my agent\"", "generated": max(ds), "days": ds,
            "ai": [days[d][0] for d in ds], "human": [days[d][1] for d in ds],
            "unknown": [days[d][2] for d in ds], "weekHits": hits}
    Path(site, "my-agent-data.json").write_text(json.dumps(data, separators=(",", ":")))
    print("model features", len(weights), "days", len(ds), "posts", len(all_ids))


if __name__ == "__main__":
    main(*sys.argv[1:4])
