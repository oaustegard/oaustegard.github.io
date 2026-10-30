"""Train the ai/human/unknown classifier and write the page's two data files.

usage: train.py RAW_DIR LABELS_JSONL[,RELABELS...] SITE_BSKY_DIR EMB_NPZ [GROUND_TRUTH_JSONL]

EMB_NPZ comes from embed.py. GROUND_TRUTH_JSONL holds hand labels (Oskar's,
scripts/my-agent/ground-truth.jsonl); they override Claude's and are
weighted GT_WEIGHT.

Model: multinomial logistic regression over binary unigram+bigram features
plus a MiniLM sentence embedding of the post. A second, words-only model
ships alongside it for the page to use until the embedding model loads.
The tokenizer lives in features.py and is mirrored by `tokens()` in
bsky/my-agent.html. Writes my-agent-model.json (weights) and
my-agent-data.json (daily counts per class for every post with the phrase).
"""
import json, sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import scipy.sparse as sp
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import classification_report, confusion_matrix

from features import dedupe_key, has_phrase, tokens

CLASSES = ["ai", "human", "unknown"]
UNSURE = 0.40  # below this top probability the page says "unknown"
EMB_MODEL = "Xenova/all-MiniLM-L6-v2"  # quantized ONNX; embed.py and the page run the same file
GT_WEIGHT = 3.0  # a hand label counts as three Claude labels
EMB_SCALE = 2.0  # embedding columns scaled against the binary word features (CV-picked)


def load(raw):
    posts = {}
    for f in sorted(Path(raw).glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            posts[p["uri"].rsplit("/", 1)[-1]] = p
    return posts


def report_of(y, proba):
    pred = np.where(proba.max(1) < UNSURE, 2, proba.argmax(1))
    r = classification_report(y, pred, target_names=CLASSES, output_dict=True)
    print(classification_report(y, pred, target_names=CLASSES))
    print(confusion_matrix(y, pred))
    return {"accuracy": round(r["accuracy"], 3),
            **{c: {k: round(r[c][k], 3) for k in ("precision", "recall", "f1-score", "support")}
               for c in CLASSES}}


def main(raw, labels, site, emb_npz, gt_path=None):
    posts = load(raw)
    lab = {}
    for path in labels.split(","):  # later files (relabel rounds) override earlier ones
        for line in open(path):
            r = json.loads(line)
            lab[r["id"]] = r["label"]
    claude = dict(lab)
    gt = {}
    if gt_path:
        for line in open(gt_path):
            r = json.loads(line)
            gt[r["id"]] = r["label"]
    lab.update(gt)
    z = np.load(emb_npz)
    eidx = {i: k for k, i in enumerate(z["ids"])}
    # embed.py only keeps posts that contain the phrase, which is what gets counted
    ids = [i for i in lab if i in posts and i in eidx]
    y = np.array([CLASSES.index(lab[i]) for i in ids])
    w = np.array([GT_WEIGHT if i in gt else 1.0 for i in ids])
    fw = {"sample_weight": w}
    print("labels", Counter(lab[i] for i in ids), "ground truth", len(gt))

    vec = CountVectorizer(analyzer=tokens, binary=True, min_df=3)
    Xw = vec.fit_transform([posts[i]["text"] for i in ids])
    E = z["E"][[eidx[i] for i in ids]]
    Xf = sp.hstack([Xw, sp.csr_matrix(E * EMB_SCALE)]).tocsr()
    cv = StratifiedKFold(5, shuffle=True, random_state=0)
    lr = lambda: LogisticRegression(C=0.5, max_iter=5000, class_weight="balanced")
    print("== words + embedding")
    Pf = cross_val_predict(lr(), Xf, y, cv=cv, method="predict_proba", params=fw)
    ev_full = report_of(y, Pf)
    print("== words only (the page's fallback until MiniLM loads)")
    Pw = cross_val_predict(lr(), Xw, y, cv=cv, method="predict_proba", params=fw)
    ev_words = report_of(y, Pw)
    # Oskar's hand labels: out-of-fold predictions, so no post is scored by a
    # model that trained on it
    ev_gt = None
    if gt:
        g = np.array([i in gt for i in ids])
        pred = lambda P: np.where(P.max(1) < UNSURE, 2, P.argmax(1))
        ev_gt = {"n": int(g.sum()),
                 "model": round(float((pred(Pf)[g] == y[g]).mean()), 3),
                 "words": round(float((pred(Pw)[g] == y[g]).mean()), 3),
                 "claude": round(float(np.mean([claude.get(i) == gt[i] for i in ids if i in gt])), 3)}
        print("ground truth", ev_gt)

    full, words = lr().fit(Xf, y, sample_weight=w), lr().fit(Xw, y, sample_weight=w)
    names = vec.get_feature_names_out()
    nw = len(names)
    Wf, Ww = full.coef_[:, :nw].T, words.coef_.T  # features x classes
    We = full.coef_[:, nw:] * EMB_SCALE              # classes x 384, applied to the raw embedding
    score = np.maximum(np.abs(Wf).max(1), np.abs(Ww).max(1))
    keep = [k for k in np.argsort(-score)[:7000] if score[k] >= 0.02]
    weights = {names[k]: [round(float(v), 3) for v in np.concatenate([Wf[k], Ww[k]])] for k in keep}
    top = {c: [names[k] for k in np.argsort(-(Wf[:, j] - Wf.mean(1)))[:25]]
           for j, c in enumerate(CLASSES)}
    model = {"classes": CLASSES, "unsure": UNSURE, "embedModel": EMB_MODEL,
             "bias": [round(float(b), 3) for b in full.intercept_],
             "wordsBias": [round(float(b), 3) for b in words.intercept_],
             "emb": [[round(float(v), 4) for v in row] for row in We],
             "weights": weights, "top": top,
             "eval": {"n": len(ids), "folds": 5, **ev_full, "words": ev_words, "groundTruth": ev_gt},
             "labelCounts": dict(Counter(lab[i] for i in ids))}
    Path(site, "my-agent-model.json").write_text(json.dumps(model, separators=(",", ":")))

    # classify every post that contains the phrase; hand labels win where they exist
    all_ids = [i for i in posts if i in eidx]
    Xa = sp.hstack([vec.transform([posts[i]["text"] for i in all_ids]),
                    sp.csr_matrix(z["E"][[eidx[i] for i in all_ids]] * EMB_SCALE)]).tocsr()
    P = full.predict_proba(Xa)
    cls = np.where(P.max(1) < UNSURE, 2, P.argmax(1))
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    days = defaultdict(lambda: [0, 0, 0])
    seen = set()  # bots repeat one text hundreds of times; count it once a day
    for i, c in zip(all_ids, cls):
        if i in lab:
            c = CLASSES.index(lab[i])
        d = (posts[i].get("createdAt") or "")[:10]
        if not has_phrase(posts[i]["text"]):
            continue
        key = dedupe_key(d, posts[i]["text"])
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
    main(*sys.argv[1:6])
