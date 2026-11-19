"""Prototype: shortest follow-path A -> ... -> B on Bluesky, with a request budget.

Bidirectional BFS. Forward side expands getFollows, backward side expands getFollowers.
Each step expands the cheaper side (sum of pages its frontier would cost, known from
getProfiles counts). Nodes above PAGE_CAP pages are not expanded (hubs) but still meet.
Last-hop shortcut: newly discovered forward nodes are checked against B with
getRelationships (30 per call), which costs nothing extra when B is a celebrity.
"""
import json, sys, time, threading, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor

API = "https://public.api.bsky.app/xrpc/"
calls = {"n": 0, "by": {}}
lock = threading.Lock()


def get(method, **params):
    q = urllib.parse.urlencode(params, doseq=True)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(API + method + "?" + q, timeout=30) as r:
                with lock:
                    calls["n"] += 1
                    calls["by"][method] = calls["by"].get(method, 0) + 1
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print("429!", e.headers.get("ratelimit-reset"), file=sys.stderr)
                time.sleep(2 ** attempt)
                continue
            if e.code == 400:
                return None
            raise
    raise RuntimeError("retries exhausted")


def profiles(dids):
    out = {}
    chunks = [dids[i:i + 25] for i in range(0, len(dids), 25)]
    with ThreadPoolExecutor(6) as ex:
        for res in ex.map(lambda c: get("app.bsky.actor.getProfiles", actors=c), chunks):
            for p in (res or {}).get("profiles", []):
                out[p["did"]] = p
    return out


def list_all(method, key, actor, max_pages):
    dids, cursor, pages = [], None, 0
    while pages < max_pages:
        params = {"actor": actor, "limit": 100}
        if cursor:
            params["cursor"] = cursor
        res = get(method, **params)
        pages += 1
        if not res:
            break
        dids += [x["did"] for x in res[key]]
        cursor = res.get("cursor")
        if not cursor:
            break
    return dids, bool(cursor)


def follows_b(target, dids):
    """Which of dids follow target (getRelationships, 30 per call)."""
    hit = []
    chunks = [dids[i:i + 30] for i in range(0, len(dids), 30)]
    with ThreadPoolExecutor(6) as ex:
        for res in ex.map(lambda c: get("app.bsky.graph.getRelationships", actor=target, others=c), chunks):
            for r in (res or {}).get("relationships", []):
                if r.get("followedBy"):
                    hit.append(r["did"])
    return hit


def search(a, b, budget=600, page_cap=10):
    pa = get("app.bsky.actor.getProfile", actor=a)
    pb = get("app.bsky.actor.getProfile", actor=b)
    A, B = pa["did"], pb["did"]
    print(f"A {pa['handle']} follows={pa['followsCount']}  B {pb['handle']} followers={pb['followersCount']}")
    fwd = {A: None}; bwd = {B: None}          # node -> parent (toward A / toward B)
    ffront = [A]; bfront = [B]
    counts = {A: pa["followsCount"], B: pb["followersCount"]}
    fdepth = bdepth = 0
    skipped = 0

    def path(meet):
        p, n = [], meet
        while n: p.append(n); n = fwd[n]
        p.reverse(); n = bwd[meet]
        while n: p.append(n); n = bwd[n]
        return p

    # depth-1 check
    if follows_b(B, [A]):
        return [A, B], fdepth + bdepth + 1

    while calls["n"] < budget and ffront and bfront:
        fcost = sum(min(counts.get(n, 0) // 100 + 1, page_cap) for n in ffront)
        bcost = sum(min(counts.get(n, 0) // 100 + 1, page_cap) for n in bfront)
        forward = fcost <= bcost
        front, seen, other = (ffront, fwd, bwd) if forward else (bfront, bwd, fwd)
        method, key = ("app.bsky.graph.getFollows", "follows") if forward else ("app.bsky.graph.getFollowers", "followers")
        print(f"expand {'fwd' if forward else 'bwd'} depth={fdepth if forward else bdepth} nodes={len(front)} est_pages={fcost if forward else bcost} calls_so_far={calls['n']}")
        expandable = [n for n in front if counts.get(n, 0) // 100 + 1 <= page_cap]
        skipped += len(front) - len(expandable)
        # cheapest nodes first so a budget cut leaves the most coverage
        expandable.sort(key=lambda n: counts.get(n, 0))
        new = []
        with ThreadPoolExecutor(6) as ex:
            futs = {}
            for n in expandable:
                futs[n] = ex.submit(list_all, method, key, n, page_cap)
            for n, f in futs.items():
                kids, _trunc = f.result()
                for k in kids:
                    if k in seen: continue
                    seen[k] = n
                    if k in other:
                        if forward: fdepth += 1
                        else: bdepth += 1
                        return path(k), fdepth + bdepth
                    new.append(k)
                if calls["n"] >= budget: break
        if forward: fdepth += 1
        else: bdepth += 1
        # last hop shortcut: does any new forward node follow B directly?
        if forward and new:
            hits = follows_b(B, new)
            if hits:
                bwd[hits[0]] = B
                return path(hits[0]), fdepth + 1
        # counts for next round
        need = [n for n in new if n not in counts]
        if len(need) / 25 + calls["n"] < budget:
            for d, p in profiles(need).items():
                counts[d] = p.get("followsCount" if forward else "followersCount", 0)
        if forward: ffront = new
        else: bfront = new
    print("budget exhausted / no path; skipped hubs:", skipped)
    return None, None


if __name__ == "__main__":
    a, b = sys.argv[1], sys.argv[2]
    budget = int(sys.argv[3]) if len(sys.argv) > 3 else 600
    t = time.time()
    p, d = search(a, b, budget)
    dt = time.time() - t
    if p:
        names = profiles(p)
        print("PATH", d, "hops:", " -> ".join(names.get(x, {}).get("handle", x) for x in p))
    print(f"calls={calls['n']} {calls['by']} secs={dt:.1f}")
