#!/usr/bin/env python3
"""Real surroundings for a Tilt Rally circuit: the ground around it, the sea, and the buildings.

    python3 games/tilt-rally/tracks/build_scenery.py --track games/tilt-rally/tracks/monaco.json \
        --out games/tilt-rally/tracks/monaco-scenery.json [--margin 450] [--cell 25]

Reads the track file (its origin and baseHeight, written by build_track.py) and fetches:
- a ground-height grid around the circuit from OpenTopoData's EU-DEM 25 m dataset, 100 points per call, one call a
  second. EU-DEM has no value over the sea, so those cells mark the sea and the harbour basins (written as null);
- building footprints from the OpenStreetMap API (ways tagged building; height from `height`, else `building:levels`
  at 3.2 m a floor, else 12 m). A building over the road is dropped unless that stretch of road is a tunnel.

Writes {grid: {ox, oz, cell, nx, nz, h}, seaY, buildings: [{p: [[x, z], ...], h}], attribution} in the track's frame
(metres east and south of its origin, heights relative to its baseHeight), and adds "scenery" to the track file.
Map data © OpenStreetMap contributors (ODbL); elevation EU-DEM v1.1 (Copernicus). Standard library only.
"""
import argparse, json, math, sys, time, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path

UA = {"User-Agent": "austegard-tilt-rally/1.0 (oskar@austegard.com)"}

def get(url):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: return r.read()
        except Exception:
            if k == 4: raise
            time.sleep(2 * 2 ** k)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--track", required=True); ap.add_argument("--out", required=True)
    ap.add_argument("--margin", type=float, default=450); ap.add_argument("--cell", type=float, default=25)
    ap.add_argument("--dem", default="eudem25m")
    a = ap.parse_args()
    track = json.loads(Path(a.track).read_text())
    lat0, lon0 = track["origin"]; base = track["baseHeight"]
    kx, kz = 111320 * math.cos(math.radians(lat0)), 110574
    to_xz = lambda la, lo: ((lo - lon0) * kx, -(la - lat0) * kz)
    to_ll = lambda x, z: (lat0 - z / kz, lon0 + x / kx)
    P = track["points"]; hw = track.get("halfWidth", 7)
    x0, x1 = min(p[0] for p in P) - a.margin, max(p[0] for p in P) + a.margin
    z0, z1 = min(p[1] for p in P) - a.margin, max(p[1] for p in P) + a.margin
    nx, nz = int((x1 - x0) / a.cell) + 1, int((z1 - z0) / a.cell) + 1

    # ---- ground heights, row by row (z), each row west to east (x)
    cells = [(x0 + i * a.cell, z0 + j * a.cell) for j in range(nz) for i in range(nx)]
    h = []
    for k in range(0, len(cells), 100):
        locs = "|".join("%.6f,%.6f" % to_ll(x, z) for x, z in cells[k:k + 100])
        res = json.loads(get(f"https://api.opentopodata.org/v1/{a.dem}?locations={locs}"))
        h += [None if r["elevation"] is None else round(r["elevation"] - base, 1) for r in res["results"]]
        if k // 100 % 10 == 0: print(f"heights {k + 100}/{len(cells)}", file=sys.stderr)
        time.sleep(1.1)
    sea = sum(v is None for v in h)
    seaY = round(min(p[2] for p in P) - 1.8, 1) if sea else None     # quays stand a little above the water

    # ---- buildings
    s_, w_ = to_ll(x0, z1); n_, e_ = to_ll(x1, z0)
    osm = ET.fromstring(get(f"https://api.openstreetmap.org/api/0.6/map?bbox={w_:.5f},{s_:.5f},{e_:.5f},{n_:.5f}"))
    nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in osm.iter("node")}
    # the road, as segments with a tunnel flag, for clearing buildings off it
    road = [(P[i], P[(i + 1) % len(P)], len(P[i]) > 3 and P[i][3] == 1) for i in range(len(P))]
    def over_road(pts):
        """'road' if any corner or the centre is on open road, 'tunnel' if only over the tunnel, else None."""
        cx, cz = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
        r = max(math.dist((cx, cz), p) for p in pts); hit = None
        for A, B, tun in road:
            if abs(A[0] - cx) > r + 40 or abs(A[1] - cz) > r + 40: continue
            for p in pts + [(cx, cz)]:
                dx, dz = B[0] - A[0], B[1] - A[1]; L2 = dx * dx + dz * dz or 1
                t = max(0, min(1, ((p[0] - A[0]) * dx + (p[1] - A[1]) * dz) / L2))
                if math.dist(p, (A[0] + dx * t, A[1] + dz * t)) < hw + 2.5:
                    if not tun: return "road"
                    hit = "tunnel"
        return hit
    bld, dropped = [], 0
    for w in osm.iter("way"):
        tags = {x.get("k"): x.get("v") for x in w.findall("tag")}
        if "building" not in tags or tags.get("building") in ("roof", "no"): continue
        refs = [n.get("ref") for n in w.findall("nd")]
        if len(refs) < 4 or refs[0] != refs[-1] or not all(r in nodes for r in refs): continue
        pts = [tuple(round(v, 1) for v in to_xz(*nodes[r])) for r in refs[:-1]]
        try: height = float(tags.get("height", "").split()[0])
        except (ValueError, IndexError): height = None
        if height is None and tags.get("building:levels", "").replace(".", "", 1).isdigit(): height = float(tags["building:levels"]) * 3.2 + 1
        where = over_road(pts)
        if where == "road": dropped += 1; continue
        b = {"p": [list(p) for p in pts], "h": round(height or 12, 1)}
        if where == "tunnel": b["t"] = 1          # stands over the tunnel: the game lifts its base above the road
        bld.append(b)
    doc = {"track": track["id"], "grid": {"ox": round(x0, 1), "oz": round(z0, 1), "cell": a.cell, "nx": nx, "nz": nz, "h": h},
           "seaY": seaY, "buildings": bld,
           "attribution": "Buildings and map data © OpenStreetMap contributors (ODbL) · Elevation: EU-DEM v1.1, Copernicus"}
    Path(a.out).write_text(json.dumps(doc, separators=(",", ":")))
    track["scenery"] = Path(a.out).name
    Path(a.track).write_text(json.dumps(track, separators=(",", ":")))
    print(f"{nx}x{nz} ground cells ({sea} sea), {len(bld)} buildings ({dropped} over the road dropped) -> {a.out}", file=sys.stderr)

if __name__ == "__main__":
    main()
