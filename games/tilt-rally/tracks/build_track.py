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

def loop_from_relation(rid, ignore_oneway=False, target=None):
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
        if ignore_oneway or tags.get("oneway") != "yes": edges.append((wid, nds[::-1]))
    out = {}
    for e in edges: out.setdefault(e[1][0], []).append(e)
    def wlen(e): return sum(math.dist(nodes[e[1][i]], nodes[e[1][i + 1]]) for i in range(len(e[1]) - 1)) * 111000 * 0.85
    lens = {e[0]: wlen(e) for e in edges}
    best, bestkey = None, None
    sys.setrecursionlimit(5000)
    # The loop that uses the most ways; with --length, the one whose length is nearest the official figure.
    def key(cyc):
        L = sum(lens[e[0]] for e in cyc)
        return (-abs(L - target), len(cyc)) if target else (len(cyc), 0)
    def dfs(path, used):
        nonlocal best, bestkey
        for e in out.get(path[-1][1][-1], []):
            if e[0] in used: continue
            if e[1][-1] == path[0][1][0]:
                cyc = path + [e]; k = key(cyc)
                if bestkey is None or k > bestkey: best, bestkey = cyc, k
            else: dfs(path + [e], used | {e[0]})
    for e in edges:
        dfs([e], {e[0]})
        if best and len(best) == len(members) and not target: break
    if not best: sys.exit("no closed loop through the relation's ways")
    chain = [n for k, (_, nds) in enumerate(best) for n in (nds if k == 0 else nds[1:])]
    print(f"loop through {len(best)} of {len(members)} ways, {len(chain)} nodes", file=sys.stderr)
    return [nodes[n] for n in chain[:-1]]            # closed: drop the repeated first node

def loop_by_chaining(rid, max_gap=40):
    """Street circuits: the mapped streets often meet mid-way or not at all (tunnels, bridges), so join the relation's
    race sections end to end, each time taking the nearest open end, starting from the start-finish member."""
    t = ET.fromstring(get(f"https://api.openstreetmap.org/api/0.6/relation/{rid}/full"))
    nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in t.iter("node")}
    rel = next(r for r in t.iter("relation") if r.get("id") == str(rid))
    ways = {w.get("id"): w for w in t.iter("way")}
    lat0 = sum(v[0] for v in nodes.values()) / len(nodes)
    m = lambda ll: (ll[1] * 111320 * math.cos(math.radians(lat0)), ll[0] * 110574)
    segs = {}
    for mem in rel.findall("member"):
        if mem.get("type") != "way" or mem.get("role") == "pit_lane": continue
        w = ways[mem.get("ref")]; tun = {x.get("k"): x.get("v") for x in w.findall("tag")}.get("tunnel") not in (None, "no")
        segs[mem.get("ref")] = [(nodes[n.get("ref")], tun) for n in w.findall("nd")]
    first = next((mem.get("ref") for mem in rel.findall("member") if mem.get("role") == "start-finish" and mem.get("ref") in segs), next(iter(segs)))
    chain = segs.pop(first)
    while segs:
        end = m(chain[-1][0]); best = None
        for wid, pts in segs.items():
            for p in (pts, pts[::-1]):
                d = math.dist(end, m(p[0][0]))
                if best is None or d < best[0]: best = (d, wid, p)
        if best[0] > max_gap: break
        chain += best[2][1:] if best[0] < 0.5 else best[2]; del segs[best[1]]
    print(f"chained sections; left over: {list(segs)}; closing gap {math.dist(m(chain[-1][0]), m(chain[0][0])):.1f} m", file=sys.stderr)
    if chain[0][0] == chain[-1][0]: chain = chain[:-1]
    return [p for p, _ in chain], [tun for _, tun in chain]

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
    ap.add_argument("--ignore-oneway", action="store_true", help="street circuits: one-way tags follow traffic, not the race")
    ap.add_argument("--length", type=float, help="official lap length in metres: prefer the loop nearest it")
    ap.add_argument("--clockwise", choices=["yes", "no"], help="race direction seen from above, north up, when the tags cannot say")
    ap.add_argument("--chain", action="store_true", help="street circuits: join sections end to end instead of searching the way graph")
    ap.add_argument("--half-width", type=float, default=7.0, help="half the drivable width in metres")
    ap.add_argument("--barriers", action="store_true", help="walls along both edges (street circuits)")
    a = ap.parse_args()
    if a.chain: ll, tunnel = loop_by_chaining(a.relation)
    else: ll, tunnel = loop_from_relation(a.relation, a.ignore_oneway, a.length), None
    s_lat, s_lon = map(float, a.start.split(","))
    lat0, lon0 = sum(p[0] for p in ll) / len(ll), sum(p[1] for p in ll) / len(ll)
    kx, kz = 111320 * math.cos(math.radians(lat0)), 110574
    # the tunnel flag rides along as a third coordinate so resampling keeps it
    xz = [((lo - lon0) * kx, -(la - lat0) * kz, 1.0 if tunnel and tunnel[i] else 0.0) for i, (la, lo) in enumerate(ll)]
    if a.clockwise:   # shoelace over (east, north): negative area is clockwise
        area = sum(xz[i][0] * -xz[(i + 1) % len(xz)][1] - xz[(i + 1) % len(xz)][0] * -xz[i][1] for i in range(len(xz))) / 2
        if (area < 0) != (a.clockwise == "yes"): xz = xz[::-1]
    dense, _ = resample(xz, 2.0)
    for _ in range(a.smooth):                         # light: rounds node-to-node kinks, keeps the corners' shape
        dense = [((dense[i - 1][0] + 2 * p[0] + dense[(i + 1) % len(dense)][0]) / 4, (dense[i - 1][1] + 2 * p[1] + dense[(i + 1) % len(dense)][1]) / 4, p[2]) for i, p in enumerate(dense)]
    sx, sz = (s_lon - lon0) * kx, -(s_lat - lat0) * kz
    k0 = min(range(len(dense)), key=lambda i: (dense[i][0] - sx) ** 2 + (dense[i][1] - sz) ** 2)
    dense = dense[k0:] + dense[:k0]                    # the start-finish line is point 0
    pts, L = resample(dense, 5.0)
    probe, _ = resample(dense, 15.0)
    heights = []
    for i in range(0, len(probe), 100):
        locs = "|".join(f"{lat0 - z / kz:.6f},{lon0 + x / kx:.6f}" for x, z, *_ in probe[i:i + 100])
        res = json.loads(get(f"https://api.opentopodata.org/v1/{a.dem}?locations={locs}"))
        heights += [r["elevation"] for r in res["results"]]
        time.sleep(1.1)                                # the public API allows one call a second
    # the DEM has no value over water (a harbour-front road can fall in a sea cell): fill from the nearest readings
    gaps = sum(h is None for h in heights)
    if gaps:
        n = len(heights); good = [i for i in range(n) if heights[i] is not None]
        for i in range(n):
            if heights[i] is None:
                a_ = max((g for g in good if g < i), default=good[-1] - n); b_ = min((g for g in good if g > i), default=good[0] + n)
                ha, hb = heights[a_ % n], heights[b_ % n]; heights[i] = ha + (hb - ha) * (i - a_) / (b_ - a_)
        print(f"filled {gaps} samples the DEM had no value for", file=sys.stderr)
    # in a tunnel the DEM gives the hill (or the hotel) above: bridge each tunnel with a straight line between its mouths
    tun = [p[2] > 0.5 for p in probe]
    if any(tun) and not all(tun):
        n = len(probe); k = next(i for i in range(n) if not tun[i])
        i = k
        while i < k + n:
            if tun[i % n]:
                j = i
                while tun[j % n]: j += 1
                h0, h1 = heights[(i - 1) % n], heights[j % n]
                for q in range(i, j): heights[q % n] = h0 + (h1 - h0) * (q - i + 1) / (j - i + 1)
                i = j
            i += 1
        print(f"bridged {sum(tun)} tunnel samples", file=sys.stderr)
    base = min(heights)
    y = [heights[min(len(heights) - 1, round(i * len(probe) / len(pts)))] - base for i in range(len(pts))]
    for _ in range(4): y = [(y[i - 1] + 2 * v + y[(i + 1) % len(y)]) / 4 for i, v in enumerate(y)]   # DEM cells are 25 m
    doc = {"id": a.id, "name": a.name, "lengthM": round(L), "climbM": round(max(heights) - base, 1), "halfWidth": a.half_width, "barriers": a.barriers,
           "source": f"OpenStreetMap relation {a.relation}; elevation {a.dem} via OpenTopoData",
           "attribution": "Map data © OpenStreetMap contributors (ODbL) · Elevation: EU-DEM v1.1, Copernicus",
           "points": [[round(p[0], 1), round(p[1], 1), round(h, 1)] for p, h in zip(pts, y)]}
    with open(a.out, "w") as f: json.dump(doc, f, separators=(",", ":"))
    print(f"{a.name}: {doc['lengthM']} m, {len(pts)} points, {doc['climbM']} m of climb -> {a.out}", file=sys.stderr)

if __name__ == "__main__":
    main()
