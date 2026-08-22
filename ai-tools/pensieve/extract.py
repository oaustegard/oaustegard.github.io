#!/usr/bin/env python3
"""Walk the two allowed ATProto repos and emit artifact envelopes as NDJSON.

No CAR parsing: com.atproto.repo.describeRepo gives the collection list and
listRecords pages each one as JSON. Same coverage as a CAR walk for a live
repo, no DAG-CBOR/MST dependency.
"""
import json, re, sys, time, urllib.request, urllib.parse

ACCOUNTS = ["austegard.com", "muninn.austegard.com"]

# Pure graph/protocol records: no human text, nothing to retrieve.
SKIP = {
    "app.bsky.feed.like", "app.bsky.feed.repost", "app.bsky.graph.follow",
    "app.bsky.graph.block", "app.bsky.graph.listblock", "app.bsky.graph.listitem",
    "app.bsky.feed.threadgate", "app.bsky.feed.postgate", "sh.tangled.feed.star",
    "sh.tangled.repo.star", "site.standard.graph.subscription",
    "social.pinksky.app.preference", "app.bsky.notification.declaration",
}

TITLE_KEYS = ("title", "name", "displayName", "subject_title", "heading")
BODY_KEYS  = ("text", "content", "body", "description", "value", "note", "comment")
URL_KEYS   = ("url", "uri", "link", "href", "externalUrl")
DATE_KEYS  = ("createdAt", "publishedAt", "indexedAt", "date", "updatedAt", "time")
NOISE_KEYS = {"$type", "py_type", "cid", "rev", "sig", "did", "avatar", "banner",
              "blob", "ref", "mimeType", "size", "encoding", "aspectRatio"}


def get(url, tries=4):
    for a in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "muninn-raven"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except Exception:
            if a == tries - 1:
                raise
            time.sleep(0.6 * (a + 1))


def resolve(handle):
    did = get("https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle"
              f"?handle={handle}")["did"]
    doc = get(f"https://plc.directory/{did}")
    pds = next(s["serviceEndpoint"] for s in doc["service"]
               if s["id"] == "#atproto_pds")
    return did, pds


def walk(value, depth=0, out=None):
    """Flatten a record into (path, string) pairs, dropping protocol noise."""
    if out is None:
        out = []
    if depth > 6:
        return out
    if isinstance(value, dict):
        for k, v in value.items():
            if k in NOISE_KEYS:
                continue
            walk(v, depth + 1, out)
    elif isinstance(value, list):
        for v in value[:40]:
            walk(v, depth + 1, out)
    elif isinstance(value, str) and len(value.strip()) > 1:
        out.append(value.strip())
    return out


def pick(rec, keys):
    """First non-empty string under any of `keys`, searched breadth-first."""
    queue = [rec]
    while queue:
        node = queue.pop(0)
        if isinstance(node, dict):
            for k in keys:
                v = node.get(k)
                if isinstance(v, str) and v.strip():
                    return v.strip()
            queue.extend(v for v in node.values() if isinstance(v, (dict, list)))
        elif isinstance(node, list):
            queue.extend(v for v in node if isinstance(v, (dict, list)))
    return None


def native_url(collection, handle, rkey, rec):
    if collection == "app.bsky.feed.post":
        return f"https://bsky.app/profile/{handle}/post/{rkey}"
    if collection == "app.bsky.actor.profile":
        return f"https://bsky.app/profile/{handle}"
    if collection == "app.bsky.graph.list":
        return f"https://bsky.app/profile/{handle}/lists/{rkey}"
    if collection == "app.bsky.feed.generator":
        return f"https://bsky.app/profile/{handle}/feed/{rkey}"
    if collection == "com.whtwnd.blog.entry":
        return f"https://whtwnd.com/{handle}/{rkey}"
    if collection == "sh.tangled.repo":
        return f"https://tangled.org/{handle}/{rec.get('name', rkey)}"
    if collection.startswith("sh.tangled.repo.issue"):
        return f"https://tangled.org/{handle}"
    if collection == "place.wisp.fs":
        return f"https://wisp.place/{handle}"
    return None


def pdsls(did, collection, rkey):
    return f"https://pdsls.dev/at://{did}/{collection}/{rkey}"


def envelope(handle, did, collection, uri, rec):
    rkey = uri.rsplit("/", 1)[-1]
    strings = walk(rec)
    if not strings:
        return None
    title = pick(rec, TITLE_KEYS)
    body = pick(rec, BODY_KEYS)
    if not body:
        body = max(strings, key=len)
    url = pick(rec, URL_KEYS)
    if url and not url.startswith("http"):
        url = None
    date = pick(rec, DATE_KEYS)

    # Searchable text: title + body + any remaining distinct strings (embeds,
    # alt text, facet targets), deduped, capped.
    seen, parts = set(), []
    for s in ([title, body] + strings):
        if not s or s in seen:
            continue
        if s.startswith(("did:", "at://", "bafy", "3l")) and len(s) < 80:
            continue
        if re.match(r"^\d{4}-\d{2}-\d{2}[T ]", s):   # ISO timestamps
            continue
        if s.startswith("!") and " " not in s:        # !no-unauthenticated etc
            continue
        seen.add(s)
        parts.append(s)
    text = "\n".join(parts)[:4000]
    if len(text.strip()) < 8:
        return None

    conf = 1.0 if (title or (body and len(body) > 20)) else 0.5
    return {
        "id": f"{did}/{collection}/{rkey}",
        "handle": handle,
        "did": did,
        "kind": collection,
        "title": title,
        "body": (body or "")[:1200],
        "text": text,
        "url": url or native_url(collection, handle, rkey, rec),
        "details": pdsls(did, collection, rkey),
        "date": date,
        "confidence": conf,
    }


def main(outpath):
    n = 0
    with open(outpath, "w") as fh:
        for handle in ACCOUNTS:
            did, pds = resolve(handle)
            desc = get(f"{pds}/xrpc/com.atproto.repo.describeRepo?repo={did}")
            for collection in desc["collections"]:
                if collection in SKIP:
                    continue
                cursor, got = None, 0
                while True:
                    u = (f"{pds}/xrpc/com.atproto.repo.listRecords?repo={did}"
                         f"&collection={collection}&limit=100")
                    if cursor:
                        u += f"&cursor={urllib.parse.quote(cursor)}"
                    page = get(u)
                    recs = page.get("records", [])
                    for r in recs:
                        env = envelope(handle, did, collection, r["uri"], r["value"])
                        if env:
                            fh.write(json.dumps(env) + "\n")
                            n += 1
                            got += 1
                    cursor = page.get("cursor")
                    if not cursor or not recs:
                        break
                print(f"  {handle:22s} {collection:38s} {got:5d}", file=sys.stderr)
    print(f"wrote {n} artifacts -> {outpath}", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/home/claude/pensieve/corpus.ndjson")
