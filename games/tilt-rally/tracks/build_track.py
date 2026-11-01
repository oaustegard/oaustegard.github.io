#!/usr/bin/env python3
"""Build a Tilt Rally track file from an OpenStreetMap circuit relation and open elevation data.

    python3 games/tilt-rally/tracks/build_track.py --relation 38567 --start 50.33489,6.94496 \
        --id nurburgring-gp --name "Nürburgring GP" --out games/tilt-rally/tracks/nurburgring-gp.json

1. Fetches the relation with its ways and nodes from the OSM API (api.openstreetmap.org; Overpass is not needed).
2. Finds the closed loop through the relation's ways that uses the most of them, driving one-way ways in their
   mapped direction (the race direction).
3. Starts the loop at the point nearest --start (the start-finish line), converts to metres east (x) and south (z)
   around the loop's centre, and smooths the corners lightly.
4. Samples the ground height every 15 m from OpenTopoData's EU-DEM 25 m dataset (or --dem), 100 points per call,
   and interpolates it along the loop.

Writes {id, name, lengthM, points: [[x, z, y], ...] every ~5 m, attribution}. Map data © OpenStreetMap contributors
(ODbL); elevation EU-DEM v1.1 (Copernicus) via OpenTopoData. Standard library only.
"""
import argparse, json, math, sys, time, urllib.request, xml.etree.ElementTree as ET

UA = {"User-Agent": "austegard-tilt-rally/1.0 (oskar@austegard.com)"}

def get(url):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r: return r.read()
        except Exception as e:
            if k == 3: raise
            time.sleep(2 * 2 ** k)

def loop_from_relation(rid):
    t = ET.fromstring(get(f"https://api.openstreetmap.org/api/0.6/relation/{rid}/full"))
    nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in t.iter("node")}
    rel = next(r for r in t.iter("relation") if r.get("id") == str(rid))
    members = [m.get("ref") for m in rel.findall("member") if m.get("type") == "way"]
    ways = {w.get("id"): w for w in t.iter("way")}
    edges = []
    for wid in members:
        w = ways[wid]; nds = [n.get("ref") for n in w.findall("nd")]
        tags = {x.get("k"): x.get("v") for x in w.findall("tag")}
        edges.append((wid, nds))
        if tags.get("oneway") != "yes": edges.append((wid, nds[::-1]))
    out = {}
    for e in edges: out.setdefault(e[1][0], []).append(e)
    best = None
    sys.setrecursionlimit(5000)
    def dfs(path, used):
        nonlocal best
        for e in out.get(path[-1][1][-1], []):
            if e[1][-1] == path[0][1][0] and e[0] not in used:
                cyc = path + [e]
                if best is None or len(cyc) > len(best): best = cyc
            elif e[0] not in used: dfs(path + [e], used | {e[0]})
    for e in edges:
        dfs([e], {e[0]})
        if best and len(best) == len(members): break
    if not best: sys.exit("no closed loop through the relation's ways")
    chain = [n for k, (_, nds) in enumerate(best) for n in (nds if k == 0 else nds[1:])]
    print(f"loop through {len(best)} of {len(members)} ways, {len(chain)} nodes", file=sys.stderr)
    return [nodes[n] for n in chain[:-1]]            # closed: drop the repeated first node

def resample(pts, step):
    cum = [0.0]
    for i in range(1, len(pts) + 1): cum.append(cum[-1] + math.dist(pts[i % len(pts)], pts[i - 1]))
    L, out, j = cum[-1], [], 0
    n = max(8, round(L / step))
    for k in range(n):
        s = k * L / n
        while cum[j + 1] < s: j += 1
        a, b = pts[j], pts[(j + 1) % len(pts)],
        t = (s - cum[j]) / max(1e-9, cum[j + 1] - cum[j])
        out.append(tuple(a[d] + (b[d] - a[d]) * t for d in range(len(a))))
    return out, L

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--relation", type=int, required=True); ap.add_argument("--start", required=True)
    ap.add_argument("--id", required=True); ap.add_argument("--name", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--dem", default="eudem25m"); ap.add_argument("--smooth", type=int, default=3)
    a = ap.parse_args()
    ll = loop_from_relation(a.relation)
    s_lat, s_lon = map(float, a.start.split(","))
    lat0, lon0 = sum(p[0] for p in ll) / len(ll), sum(p[1] for p in ll) / len(ll)
    kx, kz = 111320 * math.cos(math.radians(lat0)), 110574
    xz = [((lo - lon0) * kx, -(la - lat0) * kz) for la, lo in ll]
    dense, _ = resample(xz, 2.0)
    for _ in range(a.smooth):                         # light: rounds node-to-node kinks, keeps the corners' shape
        dense = [((dense[i - 1][0] + 2 * p[0] + dense[(i + 1) % len(dense)][0]) / 4, (dense[i - 1][1] + 2 * p[1] + dense[(i + 1) % len(dense)][1]) / 4) for i, p in enumerate(dense)]
    sx, sz = (s_lon - lon0) * kx, -(s_lat - lat0) * kz
    k0 = min(range(len(dense)), key=lambda i: (dense[i][0] - sx) ** 2 + (dense[i][1] - sz) ** 2)
    dense = dense[k0:] + dense[:k0]                    # the start-finish line is point 0
    pts, L = resample(dense, 5.0)
    probe, _ = resample(dense, 15.0)
    heights = []
    for i in range(0, len(probe), 100):
        locs = "|".join(f"{lat0 - z / kz:.6f},{lon0 + x / kx:.6f}" for x, z in probe[i:i + 100])
        res = json.loads(get(f"https://api.opentopodata.org/v1/{a.dem}?locations={locs}"))
        heights += [r["elevation"] for r in res["results"]]
        time.sleep(1.1)                                # the public API allows one call a second
    base = min(heights)
    y = [heights[min(len(heights) - 1, round(i * len(probe) / len(pts)))] - base for i in range(len(pts))]
    for _ in range(4): y = [(y[i - 1] + 2 * v + y[(i + 1) % len(y)]) / 4 for i, v in enumerate(y)]   # DEM cells are 25 m
    doc = {"id": a.id, "name": a.name, "lengthM": round(L), "climbM": round(max(heights) - base, 1),
           "source": f"OpenStreetMap relation {a.relation}; elevation {a.dem} via OpenTopoData",
           "attribution": "Map data © OpenStreetMap contributors (ODbL) · Elevation: EU-DEM v1.1, Copernicus",
           "points": [[round(x, 1), round(z, 1), round(h, 1)] for (x, z), h in zip(pts, y)]}
    with open(a.out, "w") as f: json.dump(doc, f, separators=(",", ":"))
    print(f"{a.name}: {doc['lengthM']} m, {len(pts)} points, {doc['climbM']} m of climb -> {a.out}", file=sys.stderr)

if __name__ == "__main__":
    main()
