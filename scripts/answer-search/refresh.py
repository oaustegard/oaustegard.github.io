"""Rolling index of the last N posts of the "Artificial (and real) Intelligence" list, for bsky/answer-search.

Reads the previous snapshot from OUT (if any), fetches the list feed from the newest post back to the
newest post it already has, embeds the new posts with Ettin-17m (the same ONNX model and doc prompt the
page and bsky/embedders use), quantizes them exactly as the embedders index was built (remex 2.1.0,
Quantizer(768, bits=2, seed=42, mean=mu), mu fixed from that index so codes stay comparable), appends
them, drops the oldest beyond N and writes OUT again:

  index.json      n, mu, the newest post (uri, indexedAt), build time and counts
  codes.u8.bin    n x 192 bytes: packed 2-bit codes
  aux.f32.bin     n x 2 float32: (scale, bias) per post
  posts.json.gz   {"authors": [[handle, did]], "posts": [[author, rkey, indexedAt]], "texts": [...]}

Rows are oldest first. New posts come from the list feed, which Bluesky serves only about a week back;
for anything older (the bootstrap, or a gap of more than a week between runs) it reads every member's own
feed (posts and replies, no reposts) back to the time needed.

usage: refresh.py OUT [--n 100000] [--model bsky/embedders/models/ettin] [--mu bsky/embedders/index/ettin/index.json]
needs numpy, onnxruntime, tokenizers, remex==2.1.0
"""
import argparse, gzip, json, sys, time, urllib.error, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import onnxruntime as ort
import remex
from remex.packing import pack
from tokenizers import Tokenizer

LIST = "at://did:plc:r2whjvupgfw55mllpksnombn/app.bsky.graph.list/3lankcdrlip2f"
XRPC = "https://public.api.bsky.app/xrpc"
OVERLAP_S = 3600        # keep paging an hour past the newest known post, for posts indexed late
MAX_SEQ = 128


def get(endpoint, params, tries=6):
    url = f"{XRPC}/{endpoint}?" + urllib.parse.urlencode(params)
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "austegard.com answer-search refresh"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 400 or k == tries - 1:     # 400: a deleted or deactivated account
                raise
            wait = 2 ** k
            print(f"  {endpoint}: HTTP {e.code}; retrying in {wait} s", file=sys.stderr)
            time.sleep(wait)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ConnectionError) as e:
            if k == tries - 1:
                raise
            wait = 2 ** k
            print(f"  {endpoint}: {e}; retrying in {wait} s", file=sys.stderr)
            time.sleep(wait)


def ts(iso):
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp()


def keep(text):
    return sum(1 for w in text.split() if any(c.isalpha() for c in w)) >= 3


def row(p):
    """A post view -> a row, or None for posts without enough words to embed."""
    text = (p.get("record") or {}).get("text") or ""
    if not keep(text):
        return None
    return {"uri": p["uri"], "did": p["author"]["did"], "handle": p["author"]["handle"],
            "rkey": p["uri"].rsplit("/", 1)[1], "t": round(ts(p["indexedAt"])), "text": text}


def fetch_list(known, stop_ts, need):
    """New posts from the list feed, newest first. Stops once a page is entirely older than stop_ts, or
    once `need` new posts are collected. Returns (rows, reached): reached is False when the feed ran out
    first (Bluesky serves a list feed only about a week back)."""
    out, cursor, pages = [], None, 0
    while True:
        q = {"list": LIST, "limit": 100}
        if cursor:
            q["cursor"] = cursor
        d = get("app.bsky.feed.getListFeed", q)
        pages += 1
        oldest = None
        for it in d.get("feed", []):
            if "reason" in it:            # reposts
                continue
            p = it["post"]
            t = ts(p["indexedAt"])
            oldest = t if oldest is None else min(oldest, t)
            r = row(p)
            if r is None or r["uri"] in known:
                continue
            known.add(r["uri"])
            out.append(r)
        cursor = d.get("cursor")
        if pages % 50 == 0:
            print(f"  list feed: {pages} pages, {len(out)} new posts, back to "
                  f"{datetime.fromtimestamp(oldest or 0, timezone.utc):%Y-%m-%d %H:%M}", flush=True)
        if stop_ts is not None and oldest is not None and oldest < stop_ts:
            reached = True
            break
        if need is not None and len(out) >= need:
            reached = True
            break
        if not cursor:
            reached = False
            break
    print(f"list feed: {pages} pages, {len(out)} new posts, reached the target: {reached}", flush=True)
    return out, reached


def members():
    out, cursor = [], None
    while True:
        q = {"list": LIST, "limit": 100}
        if cursor:
            q["cursor"] = cursor
        d = get("app.bsky.graph.getList", q)
        out += [it["subject"]["did"] for it in d.get("items", [])]
        cursor = d.get("cursor")
        if not cursor:
            return out


def fetch_authors(known, since_ts):
    """Every member's own posts and replies (no reposts) indexed since since_ts, from their author feeds:
    the fallback for history the list feed no longer serves."""
    def one(did):
        rows, cursor = [], None
        while True:
            q = {"actor": did, "limit": 100, "filter": "posts_with_replies"}
            if cursor:
                q["cursor"] = cursor
            try:
                d = get("app.bsky.feed.getAuthorFeed", q)
            except urllib.error.HTTPError:
                return rows                         # deleted, deactivated or blocked
            oldest = None
            for it in d.get("feed", []):
                if "reason" in it or it["post"]["author"]["did"] != did:   # reposts and pins
                    continue
                t = ts(it["post"]["indexedAt"])
                oldest = t if oldest is None else min(oldest, t)
                if t >= since_ts:
                    r = row(it["post"])
                    if r:
                        rows.append(r)
            cursor = d.get("cursor")
            if not cursor or (oldest is not None and oldest < since_ts):
                return rows
    dids = members()
    out = []
    with ThreadPoolExecutor(6) as ex:
        for k, rows in enumerate(ex.map(one, dids), 1):
            for r in rows:
                if r["uri"] not in known:
                    known.add(r["uri"])
                    out.append(r)
            if k % 100 == 0:
                print(f"  author feeds: {k}/{len(dids)} members, {len(out)} new posts", flush=True)
    print(f"author feeds: {len(dids)} members, {len(out)} new posts since "
          f"{datetime.fromtimestamp(since_ts, timezone.utc):%Y-%m-%d %H:%M}", flush=True)
    return out


class Ettin:
    def __init__(self, d):
        so = ort.SessionOptions()
        so.intra_op_num_threads = 4
        self.sess = ort.InferenceSession(str(d / "model.onnx"), so, providers=["CPUExecutionProvider"])
        self.tok = Tokenizer.from_file(str(d / "tokenizer.json"))
        self.out = self.sess.get_outputs()[0].name
        self.dp = (json.loads((d / "meta.json").read_text()).get("prompts") or {}).get("document", "")

    def embed(self, texts, batch=64):
        enc = []
        for t in texts:
            ids = self.tok.encode(self.dp + t).ids
            enc.append(ids if len(ids) <= MAX_SEQ else ids[:MAX_SEQ - 1] + ids[-1:])
        order = np.argsort([len(e) for e in enc])
        X = np.empty((len(texts), 768), np.float32)
        for s in range(0, len(order), batch):
            rows = order[s:s + batch]
            S = max(len(enc[r]) for r in rows)
            ids = np.zeros((len(rows), S), np.int64)
            att = np.zeros((len(rows), S), np.int64)
            for b, r in enumerate(rows):
                ids[b, :len(enc[r])] = enc[r]
                att[b, :len(enc[r])] = 1
            v = self.sess.run([self.out], {"input_ids": ids, "attention_mask": att})[0]
            X[rows] = v / np.linalg.norm(v, axis=1, keepdims=True)
        return X


def load(out):
    if not (out / "index.json").exists():
        return None
    idx = json.loads((out / "index.json").read_text())
    c = json.loads(gzip.decompress((out / "posts.json.gz").read_bytes()))
    codes = np.frombuffer((out / "codes.u8.bin").read_bytes(), np.uint8).reshape(idx["n"], 192)
    aux = np.frombuffer((out / "aux.f32.bin").read_bytes(), "<f4").reshape(idx["n"], 2)
    assert len(c["posts"]) == len(c["texts"]) == idx["n"]
    rows = [{"did": c["authors"][a][1], "handle": c["authors"][a][0], "rkey": rk, "t": t, "text": tx}
            for (a, rk, t), tx in zip(c["posts"], c["texts"])]
    for r in rows:
        r["uri"] = f"at://{r['did']}/app.bsky.feed.post/{r['rkey']}"
    return idx, rows, codes, aux


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", type=Path)
    ap.add_argument("--n", type=int, default=100_000)
    ap.add_argument("--model", type=Path, default=Path("bsky/embedders/models/ettin"))
    ap.add_argument("--mu", type=Path, default=Path("bsky/embedders/index/ettin/index.json"))
    a = ap.parse_args()
    assert remex.__version__ == "2.1.0", f"remex {remex.__version__}: the index was built with 2.1.0"
    t0 = time.time()

    prev = load(a.out)
    if prev:
        idx, rows, codes, aux = prev
        mu = np.array(idx["mu"], np.float32)
        newest = max(r["t"] for r in rows)
        print(f"snapshot: {len(rows)} posts, newest {datetime.fromtimestamp(newest, timezone.utc):%Y-%m-%d %H:%M} UTC")
    else:
        mu = np.array(json.loads(a.mu.read_text())["mu"], np.float32)
        rows, codes, aux, newest = [], np.zeros((0, 192), np.uint8), np.zeros((0, 2), "<f4"), None
        print(f"bootstrap: paging back for {a.n} posts")

    known = {r["uri"] for r in rows}
    if newest is not None:
        new, reached = fetch_list(known, newest - OVERLAP_S, None)
        if not reached:                                  # the job missed more than the list feed keeps
            new += fetch_authors(known, newest - OVERLAP_S)
    else:
        new, reached = fetch_list(known, None, a.n)
        if not reached:
            # the list feed covers too little: estimate how far back n posts go from its rate, add 15%
            span = max(r["t"] for r in new) - min(r["t"] for r in new)
            since = time.time() - a.n / (len(new) / span) * 1.15
            new += fetch_authors(known, since)
            new = sorted(new, key=lambda r: r["t"])[-a.n:]
    new.sort(key=lambda r: r["t"])                       # oldest first, like the snapshot
    t1 = time.time()
    if new:
        X = Ettin(a.model).embed([r["text"] for r in new])
        qz = remex.Quantizer(768, bits=2, seed=42, mean=mu)
        cv = qz.encode(X)
        nc = pack(cv.indices.astype(np.uint8), 2).reshape(len(X), 192)
        na = np.stack([qz._score_norms(cv), qz._row_bias(cv)], 1).astype("<f4")
        rows, codes, aux = rows + new, np.concatenate([codes, nc]), np.concatenate([aux, na])
    embed_s = time.time() - t1
    if len(rows) > a.n:
        cut = len(rows) - a.n
        rows, codes, aux = rows[cut:], codes[cut:], aux[cut:]

    authors, aidx = [], {}
    for r in rows:                                       # the newest handle seen for each did wins
        if r["did"] not in aidx:
            aidx[r["did"]] = len(authors)
            authors.append([r["handle"], r["did"]])
        else:
            authors[aidx[r["did"]]][0] = r["handle"]
    a.out.mkdir(parents=True, exist_ok=True)
    corpus = {"authors": authors, "posts": [[aidx[r["did"]], r["rkey"], r["t"]] for r in rows], "texts": [r["text"] for r in rows]}
    (a.out / "posts.json.gz").write_bytes(gzip.compress(json.dumps(corpus, ensure_ascii=False, separators=(",", ":")).encode(), 9, mtime=0))
    (a.out / "codes.u8.bin").write_bytes(np.ascontiguousarray(codes).tobytes())
    (a.out / "aux.f32.bin").write_bytes(np.ascontiguousarray(aux, "<f4").tobytes())
    last = max(rows, key=lambda r: r["t"])
    (a.out / "index.json").write_text(json.dumps({
        "n": len(rows), "d": 768, "bits": 2, "seed": 42, "rotation": "rht", "remex_version": remex.__version__,
        "model": "bsky/embedders/models/ettin/model.onnx", "doc_prompt": "", "max_tokens": MAX_SEQ, "list": LIST,
        "built": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "newest": {"uri": last["uri"], "t": last["t"]}, "oldest_t": min(r["t"] for r in rows),
        "added": len(new), "embed_s": round(embed_s, 1),
        "files": {f"{k}_bytes": (a.out / f).stat().st_size for k, f in
                  (("codes", "codes.u8.bin"), ("aux", "aux.f32.bin"), ("posts", "posts.json.gz"))},
        "mu": [float(v) for v in mu],
    }, separators=(",", ":")))
    print(f"wrote {len(rows)} posts (+{len(new)}), embed {embed_s:.0f} s, total {time.time() - t0:.0f} s")


if __name__ == "__main__":
    main()
