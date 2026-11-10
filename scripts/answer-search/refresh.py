"""Rolling index of the last N posts of the "Artificial (and real) Intelligence" list, for bsky/answer-search.

Reads the previous snapshot from OUT (if any), fetches the list feed from the newest post back to the
newest post it already has, embeds the new posts with Ettin-17m (the same ONNX model and doc prompt the
page and bsky/embedders use), folds each vector from 768 to 256 numbers the way the page's engine does
(fold256.f32 beside the model: the model's last matrix replaced by a 256 x 256 one that also applies
remex's rotation), quantizes them with remex 2.1.0, Quantizer(256, bits=4, seed=42, rotation="none",
mean=mu), mu fixed so codes stay comparable, appends them, drops the oldest beyond N and writes OUT again:

  snapshot-256x4.bin   the whole snapshot in one file, so a CDN can never pair parts of two builds:
                  b"ASNP", uint32 LE header length, the header (UTF-8 JSON, the same as index.json), then
                  the sections the header's "sections" names as [offset, length] after the header:
                  codes (n x 128 bytes: 256 4-bit codes, remex pack, high nibble first), aux (n x 2
                  float32 LE: scale, bias),
                  posts (gzip JSON {"authors": [[handle, did]], "posts": [[author, rkey, t]], "texts": [...]})
  index.json      the header alone, for people and tools: n, mu, newest post, build time, counts

Until 2026-11-10 the snapshot was snapshot.bin, 1-bit codes of the 768-dim vectors. A run that finds only
that file re-embeds every stored post (the snapshot keeps no vectors) and leaves snapshot.bin in place, so
pages still reading it keep working until they update; the next run, which finds the new file, deletes it.

Rows are oldest first. Posts by accounts no longer on the list are dropped on every run. New posts come
from the list feed, which Bluesky serves only about a week back;
for anything older (the bootstrap, or a gap of more than a week between runs) it reads every member's own
feed (posts and replies, no reposts) back to the time needed.

usage: refresh.py OUT [--n 100000] [--model bsky/embedders/models/ettin] [--mu bsky/embedders/index/ettin/index.json]
needs numpy, onnxruntime, tokenizers, remex==2.1.0
"""
import argparse, gzip, hashlib, json, sys, time, urllib.error, urllib.parse, urllib.request
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
D, BITS = 256, 4        # the index: 256 numbers per post (fold256.f32), 4 bits each
SNAPSHOT, LEGACY = "snapshot-256x4.bin", "snapshot.bin"


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


def fold_basis(d):
    """C [768, 256] with y = x C: the model's 768-dim output in the 256 coordinates fold256.f32 gives.

    The model ends in e = p W (p the pooled 256 numbers, W [256, 768] int8 codes times a scale per column);
    fold256.f32 holds G [256, 256] with p G = e C. W has full row rank and every e lies in its row space, so
    C = pinv(W) G. Checked: W C = G, and C has orthonormal columns, so inner products are unchanged."""
    m = json.loads((d / "manifest.json").read_text())
    dn = m["dense"]
    raw = (d / "model.onnx").read_bytes()
    meta = json.loads((d / "fold256.json").read_text())
    assert meta["model_sha256"] == hashlib.sha256(raw).hexdigest(), "fold256.f32 was built for another model.onnx"
    head = (d / "fold256.f32").read_bytes()
    assert meta["sha256"] == hashlib.sha256(head).hexdigest(), "fold256.f32 does not match fold256.json"
    q = np.frombuffer(raw, np.int8, dn["K"] * dn["N"], dn["q"]["offset"]).reshape(dn["K"], dn["N"])
    W = q.astype(np.float64) * np.frombuffer(raw, "<f4", dn["N"], dn["s"]["offset"]).astype(np.float64)
    G = np.frombuffer(head, "<f4").reshape(D, D).T.astype(np.float64)     # the file is [out][in]
    C = np.linalg.pinv(W) @ G
    assert np.abs(W @ C - G).max() < 1e-6 and np.abs(C.T @ C - np.eye(D)).max() < 1e-6
    return C, meta


class Ettin:
    def __init__(self, d):
        so = ort.SessionOptions()
        so.intra_op_num_threads = 4
        # the graph's own arithmetic (int8 code times column scale), as the page's WGSL engine computes it;
        # ORT_ENABLE_ALL rewrites the dequantize-matmul pairs and moves the output (cosine ~0.9997)
        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
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


MAGIC = b"ASNP"


def load(out):
    """The previous snapshot: snapshot-256x4.bin, the 768-dim snapshot.bin, or the first layout's four
    files (the last two read once, to migrate)."""
    name = SNAPSHOT if (out / SNAPSHOT).exists() else LEGACY
    if (out / name).exists():
        buf = (out / name).read_bytes()
        assert buf[:4] == MAGIC, "not a snapshot.bin"
        hl = int.from_bytes(buf[4:8], "little")
        idx = json.loads(buf[8:8 + hl])
        sec = lambda k: buf[8 + hl + idx["sections"][k][0]: 8 + hl + idx["sections"][k][0] + idx["sections"][k][1]]
        codes_b, aux_b, posts_b = sec("codes"), sec("aux"), sec("posts")
    elif (out / "codes.u8.bin").exists():
        idx = json.loads((out / "index.json").read_text())
        codes_b, aux_b, posts_b = [(out / f).read_bytes() for f in ("codes.u8.bin", "aux.f32.bin", "posts.json.gz")]
    else:
        return None
    c = json.loads(gzip.decompress(posts_b))
    codes = np.frombuffer(codes_b, np.uint8).reshape(idx["n"], idx.get("d", 768) * idx.get("bits", 2) // 8)
    aux = np.frombuffer(aux_b, "<f4").reshape(idx["n"], 2)
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

    C, fold = fold_basis(a.model)
    prev = load(a.out)
    width = D * BITS // 8
    if prev:
        idx, rows, codes, aux = prev
        mu = np.array(idx["mu"], np.float32)
        if len(mu) == 768:                           # the 768-dim snapshot's mean, in the folded coordinates
            mu = (mu.astype(np.float64) @ C).astype(np.float32)
        newest = max(r["t"] for r in rows)
        print(f"snapshot: {len(rows)} posts, newest {datetime.fromtimestamp(newest, timezone.utc):%Y-%m-%d %H:%M} UTC")
    else:
        mu = (np.array(json.loads(a.mu.read_text())["mu"], np.float64) @ C).astype(np.float32)
        rows, codes, aux, newest = [], np.zeros((0, width), np.uint8), np.zeros((0, 2), "<f4"), None
        print(f"bootstrap: paging back for {a.n} posts")

    if rows:
        # members taken off the list leave the index on the next run, not 57 days later
        current = set(members())
        keep = np.array([r["did"] in current for r in rows])
        if not keep.all():
            print(f"dropping {int((~keep).sum())} posts by {len({r['did'] for r, k in zip(rows, keep) if not k})} former members")
            rows = [r for r, k in zip(rows, keep) if k]
            codes, aux = codes[keep], aux[keep]
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
    qz = remex.Quantizer(D, bits=BITS, seed=42, rotation="none", mean=mu)
    t1 = time.time()
    fetched = len(new)
    if prev and (prev[0].get("d", 768), prev[0].get("bits", 2)) != (D, BITS):
        # a new code layout: the snapshot keeps no fp32 vectors, so every stored post is embedded again
        print(f"re-encoding {len(rows)} stored posts as {BITS}-bit codes of {D} numbers", flush=True)
        new = rows + new
        rows, codes, aux = [], np.zeros((0, width), np.uint8), np.zeros((0, 2), "<f4")
    if new:
        X = Ettin(a.model).embed([r["text"] for r in new])
        Y = (X.astype(np.float64) @ C).astype(np.float32)      # unit rows: C keeps lengths
        cv = qz.encode(Y)
        nc = pack(cv.indices.astype(np.uint8), BITS).reshape(len(Y), width)
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
    parts = {"codes": np.ascontiguousarray(codes).tobytes(), "aux": np.ascontiguousarray(aux, "<f4").tobytes(),
             "posts": gzip.compress(json.dumps(corpus, ensure_ascii=False, separators=(",", ":")).encode(), 9, mtime=0)}
    sections, off = {}, 0
    for k, b in parts.items():
        sections[k] = [off, len(b)]
        off += len(b)
    last = max(rows, key=lambda r: r["t"])
    header = json.dumps({
        "n": len(rows), "d": D, "bits": BITS, "seed": 42, "remex_version": remex.__version__,
        # remex's rotation is in the model's last layer: queries and posts arrive rotated, and encoding skips it
        "rotation": "none", "fold": {"file": "bsky/embedders/models/ettin/fold256.f32", "sha256": fold["sha256"],
                                     "rotation": fold["rotation"]},
        # what a scorer needs besides the rotation: remex's boundaries, centroids and cosine factor at this width
        "boundaries": [float(v) for v in qz.boundaries], "centroids": [float(v) for v in qz.centroids],
        "kappa": float(qz._cosine_factor()),
        "model": "bsky/embedders/models/ettin/model.onnx", "doc_prompt": "", "max_tokens": MAX_SEQ, "list": LIST,
        "built": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "newest": {"uri": last["uri"], "t": last["t"]}, "oldest_t": min(r["t"] for r in rows),
        "added": fetched, "embed_s": round(embed_s, 1), "sections": sections,
        "mu": [float(v) for v in mu],
    }, separators=(",", ":")).encode()
    migrated = not (a.out / SNAPSHOT).exists()
    with open(a.out / SNAPSHOT, "wb") as f:
        f.write(MAGIC + len(header).to_bytes(4, "little") + header)
        for b in parts.values():
            f.write(b)
    (a.out / "index.json").write_bytes(header)
    for old in ("codes.u8.bin", "aux.f32.bin", "posts.json.gz"):    # the first layout, if migrating
        (a.out / old).unlink(missing_ok=True)
    if not migrated:                    # a day after the switch, pages read the new file: drop the old one
        (a.out / LEGACY).unlink(missing_ok=True)
    print(f"wrote {len(rows)} posts (+{len(new)}), embed {embed_s:.0f} s, total {time.time() - t0:.0f} s")


if __name__ == "__main__":
    main()
