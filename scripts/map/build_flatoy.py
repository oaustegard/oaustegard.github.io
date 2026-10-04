#!/usr/bin/env python3
"""Build the Flatøy / Austegarden map sheets as themed SVG from Kartverket open data.

Writes images/map/flatoy.svg (sheet), austegarden-band.svg (header strip) and
austegarden-inset.svg (about 1.2 km square on the farm).

Sources (all Kartverket / Geonorge, CC BY 4.0, "Kartdata (c) Kartverket"):
  - N50 Kartdata, GML, EUREF89 UTM 32, via the Geonorge download API
    (nedlasting.geonorge.no): coast, sea, lakes, forest, roads.
  - Nasjonal hoydemodell DTM (1 m LiDAR grid) via WCS
    (wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25832): contours.
  - wms.geonorge.no/skwms1/wms.fkb layers `bygning` (building footprints) and
    `veg` (road areas), rendered by the WMS and vectorised here. FKB-Bygning as
    a download is restricted, and N50 leaves out most houses on Flatoy.
  - api.kartverket.no/stedsnavn (place names, for labels in meta.json).

Run:   python3 scripts/map/build_flatoy.py [--cache DIR] [--out DIR] [--meta FILE]
       [--only sheet,band,inset]
Needs: numpy scipy shapely pyproj scikit-image tifffile lxml pillow
Raw downloads are cached in --cache (default $FLATOY_CACHE or /tmp/flatoy-cache),
never in the repo. Delete the cache to refetch.

Geometry: UTM zone 32 (EPSG:25832), north up. SVG user units are metres divided by
a per-sheet factor (sheet and band 2 m, inset 0.5 m), integer coordinates, relative
path commands. Every stroke is non-scaling (vector-effect), so line weights are in
screen pixels whatever size the image is shown at. Light and dark colours are in
the SVG's own <style> (prefers-color-scheme). The SVG has no marker or text.

Performance: stroke layers (contours, roads, shore, building dots) are split into one path per 512-unit cell
(Enc.chunks, CHUNK). The same geometry in many small paths lets the rasteriser skip the paths that miss a tile;
one path of 35 KB of data is stroked in full for every tile. Raster CPU for the sheet drops by about 60%.
"""
import argparse
import glob
import gzip
import hashlib
import io
import json
import math
import os
import pickle
import sys
import time
import urllib.parse
import urllib.request
import zipfile

import numpy as np
import tifffile
from lxml import etree
from PIL import Image
from pyproj import Transformer
from scipy import ndimage as ndi
from shapely import affinity
from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon, box
from shapely.ops import unary_union
from skimage import measure
from skimage.morphology import skeletonize

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))

# ---------------------------------------------------------------- configuration
FARM_LL = (60.53728, 5.26902)  # Kartverket place-name register: Austegarden (Bruk), stedsnummer 842304
N50_KOMMUNER = (('4631', 'Alver'), ('4601', 'Bergen'), ('4630', 'Osterøy'))
N50_UUID = 'ea192681-d039-42ec-b1bc-f3ce04c189ac'
DATA_BOX = box(288000, 6711000, 302000, 6723000)  # parse N50 only inside this box

T = Transformer.from_crs(4326, 25832, always_xy=True)
Ti = Transformer.from_crs(25832, 4326, always_xy=True)
FARM = T.transform(FARM_LL[1], FARM_LL[0])  # (E, N)

SHEETS = {
    # name: file, bbox as (centre E, centre N, width m, height m), unit (m per svg unit),
    # contour interval / index interval (m), simplify tolerances (m)
    'sheet': dict(file='flatoy.svg', c=(295000, 6717100), w=7000, h=5000, unit=2.5,
                  cint=10, cidx=50, dtm_px=5, smooth=1.6, ctol=7.0, ltol=4.0, ftol=7.0, fpx=3,
                  min_lake=2500, min_forest=14000, min_hole=9000, min_ct=130, min_road=90, min_bld_px=6,
                  road='n50', bld='dots', stroke=dict(ct=.45, ci=.8, shore=1.1, rd=1.1, rd2=.6, bd=1.8, bd2=2.6)),
    'band': dict(file='austegarden-band.svg', c=FARM, w=6000, h=1500, unit=2.5,
                 cint=10, cidx=50, dtm_px=5, smooth=1.6, ctol=6.0, ltol=3.5, ftol=6.0, fpx=3,
                 min_lake=2500, min_forest=12000, min_hole=8000, min_ct=110, min_road=70, min_bld_px=6,
                 road='n50', bld='dots', stroke=dict(ct=.45, ci=.8, shore=1.1, rd=1.1, rd2=.6, bd=1.8, bd2=2.6)),
    'inset': dict(file='austegarden-inset.svg', c=FARM, w=1200, h=1200, unit=0.5,
                  cint=5, cidx=25, dtm_px=1, smooth=2.5, ctol=1.8, ltol=1.5, ftol=2.5, fpx=1,
                  min_lake=150, min_forest=600, min_hole=300, min_ct=24, min_road=8, min_bld_px=0,
                  road='fkb', bld='plan', stroke=dict(ct=.6, ci=1.0, shore=1.3, rd=1.4, rd2=.9, bd=0, bd2=0, trk=.7)),
}


def sheet_box(s):
    cx, cy = s['c']
    return (cx - s['w'] / 2, cy - s['h'] / 2, cx + s['w'] / 2, cy + s['h'] / 2)


# ---------------------------------------------------------------- download helpers
class Cache:
    def __init__(self, root):
        self.root = root
        os.makedirs(root, exist_ok=True)

    def path(self, *p):
        return os.path.join(self.root, *p)


def http(url, data=None, headers=None, tries=4, timeout=300):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers or {'User-Agent': 'austegard.com map build'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001 - retry any transport error
            last = e
            time.sleep(2 + 3 * i)
    raise RuntimeError(f'GET failed {url[:120]}: {last}')


def cached(cache, name, url, data=None, headers=None):
    p = cache.path(name)
    if not os.path.exists(p):
        b = http(url, data, headers)
        with open(p + '.part', 'wb') as f:
            f.write(b)
        os.replace(p + '.part', p)
    return p


def fetch_n50(cache):
    out = {}
    for code, name in N50_KOMMUNER:
        d = cache.path(f'n50_{code}')
        if not glob.glob(d + '/*Arealdekke*.gml'):
            order = {'orderLines': [{'metadataUuid': N50_UUID, 'areas': [{'code': code, 'name': name, 'type': 'kommune'}],
                                     'projections': [{'code': '25832'}], 'formats': [{'name': 'GML'}]}]}
            resp = json.loads(http('https://nedlasting.geonorge.no/api/order', json.dumps(order).encode(),
                                   {'Content-Type': 'application/json'}))
            url = resp['files'][0]['downloadUrl']
            z = cached(cache, f'n50_{code}.zip', url)
            os.makedirs(d, exist_ok=True)
            with zipfile.ZipFile(z) as zf:
                zf.extractall(d)
        out[code] = d
    return out


def fetch_dtm(cache, bbox, px):
    x0, y0, x1, y1 = bbox
    w, h = int(round((x1 - x0) / px)), int(round((y1 - y0) / px))
    q = dict(service='WCS', version='1.0.0', request='GetCoverage', coverage='nhm_dtm_topo_25832', CRS='EPSG:25832',
             BBOX=f'{x0},{y0},{x1},{y1}', WIDTH=w, HEIGHT=h, FORMAT='GeoTIFF', interpolation='bilinear')
    url = 'https://wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25832?' + urllib.parse.urlencode(q)
    key = hashlib.md5(url.encode()).hexdigest()[:10]
    p = cached(cache, f'dtm_{key}.tif', url)
    a = tifffile.imread(p).astype(np.float32)
    assert a.shape == (h, w), (a.shape, (h, w))
    a[~np.isfinite(a)] = 0
    a[a < -100] = 0
    return a  # row 0 = north edge


def wms_raster(cache, wms, layer, bbox, px, extra=''):
    x0, y0, x1, y1 = bbox
    w, h = int(round((x1 - x0) / px)), int(round((y1 - y0) / px))
    url = (f'https://wms.geonorge.no/skwms1/{wms}?service=WMS&version=1.3.0&request=GetMap&layers={layer}&styles='
           f'&crs=EPSG:25832&bbox={x0},{y0},{x1},{y1}&width={w}&height={h}&format=image/png&transparent=true{extra}')
    key = hashlib.md5(url.encode()).hexdigest()[:10]
    p = cached(cache, f'wms_{layer}_{key}.png', url)
    return np.array(Image.open(p).convert('RGBA'))


def wms_mosaic(cache, wms, layer, bbox, px, tile=3500):
    """Alpha mask of a WMS layer over bbox, fetched in tiles of at most `tile` metres."""
    x0, y0, x1, y1 = bbox
    W, H = int(round((x1 - x0) / px)), int(round((y1 - y0) / px))
    out = np.zeros((H, W), np.uint8)
    nx, ny = math.ceil((x1 - x0) / tile), math.ceil((y1 - y0) / tile)
    tw, th = (x1 - x0) / nx, (y1 - y0) / ny
    for i in range(nx):
        for j in range(ny):
            b = (x0 + i * tw, y1 - (j + 1) * th, x0 + (i + 1) * tw, y1 - j * th)
            a = wms_raster(cache, wms, layer, b, px)[..., 3]
            r0, c0 = int(round(j * th / px)), int(round(i * tw / px))
            out[r0:r0 + a.shape[0], c0:c0 + a.shape[1]] = a[:H - r0, :W - c0]
    return out


# ---------------------------------------------------------------- N50 GML
GML = '{http://www.opengis.net/gml/3.2}'


def _pl(el):
    return np.array(el.text.split(), dtype=float).reshape(-1, 2)


def _geoms(el):
    polys, lines = [], []
    for patch in el.iter(GML + 'PolygonPatch'):
        ext = patch.find(GML + 'exterior')
        if ext is None:
            continue
        shell = _pl(ext.find('.//' + GML + 'posList'))
        holes = [_pl(i.find('.//' + GML + 'posList')) for i in patch.findall(GML + 'interior')]
        try:
            polys.append(Polygon(shell, holes))
        except Exception:  # noqa: BLE001
            pass
    if not polys:
        for tag in ('LineString', 'LineStringSegment'):
            for ls in el.iter(GML + tag):
                p = ls.find(GML + 'posList')
                if p is not None:
                    lines.append(LineString(_pl(p)))
    return polys, lines


def read_gml(fn, want, attrs=()):
    out = {k: [] for k in want}
    for _, el in etree.iterparse(fn, tag=GML + 'featureMember'):
        f = el[0]
        name = etree.QName(f).localname
        if name in want:
            polys, lines = _geoms(f)
            a = {}
            for k in attrs:
                x = f.find('.//{*}' + k)
                if x is not None and x.text:
                    a[k] = x.text.strip()
            for g in polys + lines:
                if not g.is_empty and g.intersects(DATA_BOX):
                    out[name].append((g, a))
        el.clear()
        while el.getprevious() is not None:
            del el.getparent()[0]
    return out


def load_n50(cache):
    pk = cache.path('n50_features.pkl')
    if os.path.exists(pk):
        return pickle.load(open(pk, 'rb'))
    dirs = fetch_n50(cache)
    spec = (('Arealdekke', ('Havflate', 'Kystkontur', 'Innsjø', 'InnsjøRegulert', 'Skog'), ()),
            ('Samferdsel', ('Veglenke',), ('typeVeg', 'vegkategori', 'medium')))
    data = {}
    for code, d in dirs.items():
        for kind, want, attrs in spec:
            fn = glob.glob(f'{d}/*{kind}_GML.gml')[0]
            for k, v in read_gml(fn, want, attrs).items():
                data.setdefault(k, []).extend((g, a) for g, a in v)
    pickle.dump(data, open(pk, 'wb'))
    return data


def polys_of(g):
    if g.is_empty:
        return []
    if g.geom_type == 'Polygon':
        return [g]
    return [p for x in getattr(g, 'geoms', []) for p in polys_of(x)]


def lines_of(g):
    if g.is_empty:
        return []
    if g.geom_type == 'LineString':
        return [g]
    return [p for x in getattr(g, 'geoms', []) for p in lines_of(x)]


# ---------------------------------------------------------------- SVG path encoding
CHUNK = 512  # svg units: side of the cells that stroke layers are split into (see Enc.chunks)

def _n(v):
    s = str(int(v))
    return s


class Enc:
    """Encode geometry as compact relative integer path data in svg units."""

    def __init__(self, bbox, unit):
        self.x0, self.y0, self.x1, self.y1 = bbox
        self.u = unit
        self.W = int(round((self.x1 - self.x0) / unit))
        self.H = int(round((self.y1 - self.y0) / unit))

    def pt(self, x, y):
        return (int(round((x - self.x0) / self.u)), int(round((self.y1 - y) / self.u)))

    def ring_or_line(self, coords, close):
        pts = []
        for x, y in coords:
            p = self.pt(x, y)
            if not pts or p != pts[-1]:
                pts.append(p)
        if close and len(pts) > 1 and pts[0] == pts[-1]:
            pts.pop()
        if len(pts) < (3 if close else 2):
            return None
        return pts

    def d(self, items, close=False):
        """items: iterable of coordinate sequences. Returns path data string."""
        pl = (self.ring_or_line(c, close) for c in items)
        return self._d([p for p in pl if p is not None], close)

    @staticmethod
    def _d(rings, close):
        out = []
        cx = cy = 0
        for pts in rings:
            (x, y) = pts[0]
            out.append(f'm{x - cx} {y - cy}')
            cx, cy = x, y
            seg = []
            for (px_, py_) in pts[1:]:
                seg.append((px_ - x, py_ - y))
                x, y = px_, py_
            out.append('l' + _pairs(seg) + ('z' if close else ''))
            # after z, current point returns to subpath start
            if close:
                x, y = pts[0]
            cx, cy = x, y
        return ''.join(out)

    def chunks(self, items, close=False, cell=CHUNK):
        """Like d(), but returns one path-data string per square cell of `cell` svg units, an item going to the
        cell that holds the centre of its bounding box. Many small paths instead of one huge one let the
        rasteriser skip the paths that miss a tile (one big path is stroked in full for every tile)."""
        groups = {}
        for c in items:
            pts = self.ring_or_line(c, close)
            if pts is None:
                continue
            xs = [p[0] for p in pts]
            ys = [p[1] for p in pts]
            k = ((min(ys) + max(ys)) // 2 // cell, (min(xs) + max(xs)) // 2 // cell)
            groups.setdefault(k, []).append(pts)
        return [self._d(g, close) for k, g in sorted(groups.items())]

    def dot_chunks(self, pts, cell=CHUNK):
        groups = {}
        for (x, y) in pts:
            p = self.pt(x, y)
            groups.setdefault((p[1] // cell, p[0] // cell), []).append(p)
        out = []
        for k, g in sorted(groups.items()):
            cx = cy = 0
            s = []
            for (px_, py_) in g:
                s.append(f'm{px_ - cx} {py_ - cy}h0')
                cx, cy = px_, py_
            out.append(''.join(s))
        return out

    def dots(self, pts):
        out = []
        cx = cy = 0
        for (x, y) in pts:
            px_, py_ = self.pt(x, y)
            out.append(f'm{px_ - cx} {py_ - cy}h0')
            cx, cy = px_, py_
        return ''.join(out)


def _pairs(seg):
    s = []
    prev_neg = True
    for dx, dy in seg:
        a, b = str(dx), str(dy)
        s.append(a if (not s or a[0] == '-') else ' ' + a)
        s.append(b if b[0] == '-' else ' ' + b)
    return ''.join(s)


# ---------------------------------------------------------------- geometry builders
def contour_lines(dtm, bbox_dtm, px, interval, smooth, tol, minlen, land, lakes, bbox):
    """Contours from a DTM grid (row 0 = north). Returns {level: [LineString]}."""
    x0, y0, x1, y1 = bbox_dtm
    z = dtm.copy()
    z = ndi.gaussian_filter(z, smooth)
    # keep sea at zero so contours stop at the shore
    out = {}
    clip = land.buffer(0)
    if lakes is not None and not lakes.is_empty:
        clip = clip.difference(lakes.buffer(1.5))
    clip = clip.intersection(box(*bbox).buffer(1))
    zmax = float(z.max())
    for lev in np.arange(interval, zmax, interval):
        segs = []
        for c in measure.find_contours(z, float(lev)):
            if len(c) < 4:
                continue
            xy = np.column_stack([x0 + (c[:, 1] + 0.5) * px, y1 - (c[:, 0] + 0.5) * px])
            ls = LineString(xy)
            if ls.length < minlen:
                continue
            ls = ls.simplify(tol)
            segs.append(ls)
        if not segs:
            continue
        g = unary_union(segs).intersection(clip)
        parts = [l for l in lines_of(g) if l.length >= minlen * 0.6]
        if parts:
            out[int(lev)] = parts
    return out


def snap_dtm_box(bbox, px, pad):
    x0, y0, x1, y1 = bbox
    return (math.floor((x0 - pad) / px) * px, math.floor((y0 - pad) / px) * px,
            math.ceil((x1 + pad) / px) * px, math.ceil((y1 + pad) / px) * px)


def skeleton_lines(mask, origin, px, min_spur=6.0):
    """Trace the skeleton of a boolean mask into LineStrings (UTM). origin = (x0, y1) of pixel (0,0) corner."""
    sk = skeletonize(mask)
    k = np.ones((3, 3), int)
    k[1, 1] = 0
    nb = ndi.convolve(sk.astype(int), k, mode='constant') * sk
    pts = set(map(tuple, np.argwhere(sk)))
    nodes = {p for p in pts if nb[p] != 2}
    offs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]

    def neigh(p):
        return [(p[0] + a, p[1] + b) for a, b in offs if (p[0] + a, p[1] + b) in pts]

    seen = set()
    paths = []

    def walk(start, n):
        path = [start, n]
        seen.add((start, n))
        seen.add((n, start))
        prev, cur = start, n
        while cur not in nodes:
            nxt = [q for q in neigh(cur) if q != prev and (cur, q) not in seen]
            if not nxt:
                break
            q = nxt[0]
            seen.add((cur, q))
            seen.add((q, cur))
            path.append(q)
            prev, cur = cur, q
        return path

    for s in nodes:
        for n in neigh(s):
            if (s, n) not in seen:
                paths.append(walk(s, n))
    # loops without nodes
    covered = {p for pa in paths for p in pa}
    for s in sorted(pts - covered):
        if s in covered:
            continue
        ns = neigh(s)
        if ns:
            pa = walk(s, ns[0])
            covered.update(pa)
            paths.append(pa)
    x0, y1 = origin
    lines = []
    for pa in paths:
        xy = [(x0 + (c + 0.5) * px, y1 - (r + 0.5) * px) for r, c in pa]
        if len(xy) >= 2:
            lines.append(LineString(xy))
    return lines


FOREST_RGB = (210, 230, 124)


def wms_mosaic_rgba(cache, wms, layer, bbox, px, tile=3500):
    x0, y0, x1, y1 = bbox
    W, H = int(round((x1 - x0) / px)), int(round((y1 - y0) / px))
    out = np.zeros((H, W, 4), np.uint8)
    nx, ny = math.ceil((x1 - x0) / tile), math.ceil((y1 - y0) / tile)
    tw, th = (x1 - x0) / nx, (y1 - y0) / ny
    for i in range(nx):
        for j in range(ny):
            b = (x0 + i * tw, y1 - (j + 1) * th, x0 + (i + 1) * tw, y1 - j * th)
            a = wms_raster(cache, wms, layer, b, px)
            r0, c0 = int(round(j * th / px)), int(round(i * tw / px))
            out[r0:r0 + a.shape[0], c0:c0 + a.shape[1]] = a[:H - r0, :W - c0]
    return out


def mask_rings(mask, origin, px, tol, min_outer, min_hole, blur=1.0):
    """Boolean mask -> closed rings (UTM coordinate lists) for an even-odd fill."""
    f = ndi.gaussian_filter(np.pad(mask, 2).astype(float), blur)
    cs = measure.find_contours(f, 0.5)
    x0, y1 = origin
    rings = []
    meta = []
    for c in cs:
        if len(c) < 6:
            continue
        xy = np.column_stack([x0 + (c[:, 1] - 2 + 0.5) * px, y1 - (c[:, 0] - 2 + 0.5) * px])
        area = 0.5 * float(np.sum(xy[:-1, 0] * xy[1:, 1] - xy[1:, 0] * xy[:-1, 1]))
        meta.append((abs(area), area))
        rings.append(xy)
    if not rings:
        return []
    ref = max(meta)[1]
    out = []
    for xy, (aa, sg) in zip(rings, meta):
        outer = (sg > 0) == (ref > 0)
        if aa < (min_outer if outer else min_hole):
            continue
        ls = LineString(xy).simplify(tol)
        if len(ls.coords) >= 4:
            out.append(list(ls.coords))
    return out


def forest_rings(cache, bbox, s):
    px = s['fpx']
    a = wms_mosaic_rgba(cache, 'wms.topo', 'ar5', bbox, px)
    d = np.abs(a[..., :3].astype(int) - np.array(FOREST_RGB)).sum(-1)
    m = (a[..., 3] > 128) & (d < 36)
    m = ndi.binary_opening(m, iterations=1) if px >= 2 else m
    return mask_rings(m, (bbox[0], bbox[3]), px, s['ftol'], s['min_forest'], s['min_hole'], blur=1.0 if px >= 2 else 1.5)


def building_footprints(a, origin, px, min_area, thresh=128):
    """Alpha raster -> list of shapely polygons (UTM). Rectangles where the footprint is rectangular."""
    mask = a >= thresh
    lab, n = ndi.label(mask)
    out = []
    x0, y1 = origin
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        sub = (lab[sl] == i)
        if sub.sum() * px * px < min_area:
            continue
        sub = np.pad(sub, 1)
        cs = measure.find_contours(sub.astype(float), 0.5)
        if not cs:
            continue
        c = max(cs, key=len)
        r0, c0 = sl[0].start - 1, sl[1].start - 1
        xy = [(x0 + (cc + c0 + 0.5) * px, y1 - (rr + r0 + 0.5) * px) for rr, cc in c]
        p = Polygon(xy)
        if not p.is_valid:
            p = p.buffer(0)
        if p.is_empty or p.area < min_area:
            continue
        rect = p.minimum_rotated_rectangle
        if rect.area > 0 and p.area / rect.area > 0.8:
            p = rect
        else:
            p = p.simplify(px * 0.7)
        if p.geom_type == 'Polygon' and not p.is_empty:
            out.append(p)
    return out


def serpentine(pts, strip):
    """Order points in horizontal strips, alternating direction, so relative path deltas stay small."""
    def key(p):
        row = int(p[1] // strip)
        return (row, p[0] if row % 2 == 0 else -p[0])
    return sorted(pts, key=key)


def building_dots(a, origin, px, min_px):
    mask = a >= 96
    lab, n = ndi.label(mask)
    idx = np.arange(1, n + 1)
    sizes = ndi.sum(mask, lab, idx)
    com = ndi.center_of_mass(mask, lab, idx)
    x0, y1 = origin
    small, big = [], []
    for s, (r, c) in zip(sizes, com):
        if s < min_px:
            continue
        pt = (x0 + (c + 0.5) * px, y1 - (r + 0.5) * px)
        (big if s * px * px >= 200 else small).append(pt)
    return serpentine(small, 40), serpentine(big, 60)


# ---------------------------------------------------------------- SVG assembly
CSS = ('svg{--w:#2d6477;--wl:#2d6477;--o:#5d6d3b;--ol:#5d6d3b;--c:#666963;--i:#242621;--bo:.85}'
       '@media(prefers-color-scheme:dark){svg{--w:#86b8c8;--wl:#86b8c8;--o:#94a86d;--ol:#b6c993;--c:#8e918b;--i:#e4e5df;--bo:.62}}'
       'path{fill:none;stroke:none;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round}'
       '.sea{fill:var(--w);fill-opacity:.11;fill-rule:evenodd}'
       '.fo{fill:var(--o);fill-opacity:.13}'
       '.lk{fill:var(--w);fill-opacity:.3;stroke:var(--wl);stroke-opacity:.6;stroke-width:.7px}'
       '.ct{stroke:var(--ol);stroke-opacity:.5;stroke-width:%(ct)spx}'
       '.ci{stroke:var(--ol);stroke-opacity:.78;stroke-width:%(ci)spx}'
       '.sh{stroke:var(--wl);stroke-opacity:.95;stroke-width:%(shore)spx}'
       '.rd{stroke:var(--c);stroke-opacity:.9;stroke-width:%(rd)spx}'
       '.r2{stroke:var(--c);stroke-opacity:.75;stroke-width:%(rd2)spx}'
       '.tk{stroke:var(--c);stroke-opacity:.8;stroke-width:%(trk)spx;stroke-dasharray:3 2.5}'
       '.bd,.b2{stroke:var(--i);stroke-opacity:var(--bo);stroke-linecap:square}'
       '.bd{stroke-width:%(bd)spx}.b2{stroke-width:%(bd2)spx}'
       '.bp{fill:var(--i);fill-opacity:var(--bo)}')


def svg_doc(enc, layers, stroke):
    st = dict(stroke)
    st.setdefault('trk', .6)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {enc.W} {enc.H}" preserveAspectRatio="xMidYMid slice" '
             f'aria-hidden="true" focusable="false"><style>{CSS % st}</style>']
    for cls, d, extra in layers:
        if d:
            parts.append(f'<path class="{cls}" d="{d}"{extra}/>')
    parts.append('</svg>')
    return ''.join(parts)


def build_sheet(name, s, data, cache, log):
    bbox = sheet_box(s)
    enc = Enc(bbox, s['unit'])
    bb = box(*bbox)
    # --- sea / land from N50 Havflate
    sea = unary_union([p for g, a in data['Havflate'] for p in polys_of(g)]).buffer(0.5).buffer(-0.5)
    sea_c = sea.intersection(bb)
    land = bb.difference(sea_c)
    land = unary_union([p for p in polys_of(land) if p.area > 80])
    # --- lakes
    lakes = unary_union([p for k in ('Innsjø', 'InnsjøRegulert') for g, a in data[k] for p in polys_of(g)
                         if p.intersects(bb)]).intersection(bb)
    lake_polys = [p for p in polys_of(lakes) if p.area >= s['min_lake']]
    lake_u = unary_union(lake_polys) if lake_polys else None
    # --- forest: AR5 land cover (WMS layer `ar5`, class Skog) vectorised from the render
    fo_rings = forest_rings(cache, bbox, s)
    # --- shore (N50 Kystkontur clipped to bbox, merged)
    kk = [l for g, a in data['Kystkontur'] for l in lines_of(g) if l.intersects(bb)]
    from shapely.ops import linemerge
    shore = linemerge(unary_union(kk).intersection(bb.buffer(-0.01)))
    shore_l = [l.simplify(s['ltol']) for l in lines_of(shore) if l.length > 12 * s['unit']]
    # --- contours
    dbox = snap_dtm_box(bbox, s['dtm_px'], 60)
    dtm = fetch_dtm(cache, dbox, s['dtm_px'])
    cl = contour_lines(dtm, dbox, s['dtm_px'], s['cint'], s['smooth'], s['ctol'], s['min_ct'], land, lake_u, bbox)
    ct, ci = [], []
    for lev, ls in sorted(cl.items()):
        (ci if lev % s['cidx'] == 0 else ct).extend(ls)
    # --- roads
    roads_major, roads_minor, tracks = [], [], []
    bbuf = bb.buffer(-0.01)
    for g, a in data['Veglenke']:
        if not g.intersects(bb):
            continue
        t, med = a.get('typeVeg'), a.get('medium')
        if t == 'passasjerferje' or med == 'U':
            continue
        for l in lines_of(g.intersection(bbuf)):
            if t == 'enkelBilveg':
                (roads_major if a.get('vegkategori') in ('E', 'R', 'F') else roads_minor).append(l)
            elif t in ('sti', 'traktorveg') and s['road'] == 'fkb':
                tracks.append(l)
    local = []
    if s['road'] == 'fkb':
        pxr = 1.0
        a = wms_raster(cache, 'wms.fkb', 'veg', bbox, pxr)[..., 3]
        m = a >= 100
        m = ndi.binary_closing(m, iterations=2)
        m = ndi.binary_fill_holes(m) | m
        # remove blobs that are tiny
        lab, n = ndi.label(m)
        sizes = ndi.sum(m, lab, np.arange(1, n + 1))
        m = np.isin(lab, np.arange(1, n + 1)[sizes > 40])
        sk = skeleton_lines(m, (bbox[0], bbox[3]), pxr)
        major_buf = unary_union(roads_major).buffer(14) if roads_major else None
        for l in sk:
            l = l.simplify(1.8)
            if l.length < 6:
                continue
            if major_buf is not None:
                l = l.difference(major_buf)
            local += [x for x in lines_of(l) if x.length >= 6]
        roads_minor = []  # the local network comes from the FKB road areas
    roads_major = [l.simplify(s['ltol']) for l in roads_major if l.length >= s['min_road']]
    roads_minor = [l.simplify(s['ltol']) for l in roads_minor if l.length >= s['min_road']] + local
    tracks = [l.simplify(s['ltol']) for l in tracks]
    # --- buildings
    cell = s.get('chunk', CHUNK)
    layers = []
    if s['bld'] == 'dots':
        small, big = building_dots(wms_mosaic(cache, 'wms.fkb', 'bygning', bbox, 3.0), (bbox[0], bbox[3]), 3.0, s['min_bld_px'])
        bld_layers = [('bd', d, '') for d in enc.dot_chunks(small, cell)] + [('b2', d, '') for d in enc.dot_chunks(big, cell)]
        nb = len(small) + len(big)
    else:
        a = wms_raster(cache, 'wms.fkb', 'bygning', bbox, 0.5)[..., 3]
        fps = building_footprints(a, (bbox[0], bbox[3]), 0.5, 8.0)
        bld_layers = [('bp', d, '') for d in enc.chunks((p.exterior.coords for p in fps), close=True, cell=cell)]
        nb = len(fps)
    # --- sea path: full box minus land (even-odd), land simplified a little more coarsely
    box_ring = [(bbox[0], bbox[3]), (bbox[2], bbox[3]), (bbox[2], bbox[1]), (bbox[0], bbox[1])]
    land_rings = []
    for p in polys_of(land.simplify(s['ltol'] * 1.5)):
        land_rings.append(p.exterior.coords)
        for h in p.interiors:
            land_rings.append(h.coords)
    sea_d = enc.d([box_ring] + land_rings, close=True)
    lk_rings = []
    for p in lake_polys:
        p = p.simplify(s['ltol'])
        lk_rings.append(p.exterior.coords)
        lk_rings.extend(h.coords for h in p.interiors)
    def strokes(cls, items):
        return [(cls, d, '') for d in enc.chunks(items, cell=cell)]

    layers = ([('sea', sea_d, ''),
               ('fo', enc.d(fo_rings, close=True), ' fill-rule="evenodd"'),
               ('lk', enc.d(lk_rings, close=True), ' fill-rule="evenodd"')]
              + strokes('ct', (l.coords for l in ct))
              + strokes('ci', (l.coords for l in ci))
              + strokes('rd', (l.coords for l in roads_major))
              + strokes('r2', (l.coords for l in roads_minor))
              + strokes('tk', (l.coords for l in tracks))
              + strokes('sh', (l.coords for l in shore_l))
              + bld_layers)
    svg = svg_doc(enc, layers, s['stroke'])
    log(f'{name}: {len(svg)/1024:.1f} KB raw, {len(gzip.compress(svg.encode(), 9))/1024:.1f} KB gzip; '
        f'contours {len(ct)}+{len(ci)} lines, roads {len(roads_major)}+{len(roads_minor)}, buildings {nb}, '
        f'forest rings {len(fo_rings)}, lakes {len(lake_polys)}, shore {len(shore_l)}')
    return svg, enc


# ---------------------------------------------------------------- place names and meta
def place_names(cache):
    p = cache.path('names.json')
    if not os.path.exists(p):
        out, page = [], 1
        while True:
            u = ('https://api.kartverket.no/stedsnavn/v1/punkt?nord=%s&ost=%s&koordsys=4258&radius=5000&treffPerSide=500'
                 '&side=%d&utkoordsys=4258' % (FARM_LL[0], FARM_LL[1], page))
            d = json.loads(http(u))
            out += d['navn']
            if len(out) >= d['metadata']['totaltAntallTreff']:
                break
            page += 1
        json.dump(out, open(p, 'w'))
    return json.load(open(p))


def frac(enc, x, y):
    return ((x - enc.x0) / (enc.x1 - enc.x0), (enc.y1 - y) / (enc.y1 - enc.y0))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--cache', default=os.environ.get('FLATOY_CACHE', '/tmp/flatoy-cache'))
    ap.add_argument('--out', default=os.path.join(REPO, 'images', 'map'))
    ap.add_argument('--only', default='sheet,band,inset')
    ap.add_argument('--meta', default=None, help='write a meta.json describing the products here')
    args = ap.parse_args()
    cache = Cache(args.cache)
    os.makedirs(args.out, exist_ok=True)
    log = lambda m: print(m, flush=True)  # noqa: E731
    data = load_n50(cache)
    built = {}
    for name in args.only.split(','):
        s = SHEETS[name]
        svg, enc = build_sheet(name, s, data, cache, log)
        with open(os.path.join(args.out, s['file']), 'w', encoding='utf8') as f:
            f.write(svg)
        built[name] = (svg, enc)
    if args.meta:
        write_meta(args.meta, built, cache)


LABELS = [  # (register name, kind, place number): priority order; greedy pick, skipping labels that would crowd
    ('Austegarden', 'farm', 842304), ('Flatøy', 'island', 795446), ('Hagelsundet', 'water', 249436),
    ('Krossnessundet', 'water', 917368), ('Skjenhøyen', 'hill', 228299), ('Klubbestøa', 'quay', 773148),
    ('Krossneset', 'headland', 371030), ('Holsnøy', 'island', 673909), ('Nordhordlandsbrua', 'road', 86684),
    ('Kvernafjorden', 'water', 431107), ('Viphøyen', 'hill', 288249), ('Fureberget', 'hill', 491440),
    ('Trollhøyen', 'hill', 652249), ('Osterfjorden', 'water', 795102)]


def label_list(names, enc):
    by = {n['stedsnummer']: n for n in names}
    out = []
    for name, kind, num in LABELS:
        n = by[num]
        sp = n['stedsnavn'][0]['skrivemåte']
        assert sp == name, (sp, name)
        lat, lon = n['representasjonspunkt']['nord'], n['representasjonspunkt']['øst']
        x, y = T.transform(lon, lat)
        fx, fy = frac(enc, x, y)
        if not (0.03 < fx < 0.97 and 0.03 < fy < 0.97):
            continue
        # a label is about 90 px wide and 14 px tall on a 1280 px wide sheet
        h_px = 1280 * (enc.y1 - enc.y0) / (enc.x1 - enc.x0)
        if any(abs(fx - o['x']) < 90 / 1280 and abs(fy - o['y']) * h_px < 16 for o in out):
            continue
        out.append(dict(name=name, kind=kind, stedsnummer=num, lat=lat, lon=lon, utm=[round(x, 1), round(y, 1)],
                        x=round(fx, 4), y=round(fy, 4), type_in_register=n['navneobjekttype']))
    return out


def product_meta(s, svg, enc, names, outdir):
    bbox = sheet_box(s)
    ll = [Ti.transform(bbox[0], bbox[1]), Ti.transform(bbox[2], bbox[3])]
    fx, fy = frac(enc, *FARM)
    raw = svg.encode('utf8')
    return dict(
        file='images/map/' + s['file'], bytes=len(raw), gzip_bytes=len(gzip.compress(raw, 9)),
        bbox_utm32=dict(minE=bbox[0], minN=bbox[1], maxE=bbox[2], maxN=bbox[3], width_m=s['w'], height_m=s['h']),
        bbox_lonlat=dict(west=round(ll[0][0], 5), south=round(ll[0][1], 5), east=round(ll[1][0], 5), north=round(ll[1][1], 5)),
        viewBox=f'0 0 {enc.W} {enc.H}', metres_per_unit=s['unit'], aspect_w_over_h=round(enc.W / enc.H, 4),
        contour_interval_m=s['cint'], index_contour_interval_m=s['cidx'],
        centre_fraction=[round(frac(enc, s['c'][0], s['c'][1])[0], 4), round(frac(enc, s['c'][0], s['c'][1])[1], 4)],
        austegarden_fraction=dict(x=round(fx, 4), y=round(fy, 4)),
        labels=label_list(names, enc))


def write_meta(path, built, cache):
    names = place_names(cache)
    fp = cache.path('farm.json')
    if not os.path.exists(fp):
        open(fp, 'wb').write(http('https://api.kartverket.no/stedsnavn/v1/sted?sok=Austegarden&fuzzy=false'))
    farm = [n for n in json.load(open(fp))['navn'] if n['stedsnummer'] == 842304][0]
    meta = dict(
        sheet_name='Flatøy',
        built=time.strftime('%Y-%m-%d'),
        municipality=farm['kommuner'][0]['kommunenavn'], municipality_number=farm['kommuner'][0]['kommunenummer'],
        county=farm['fylker'][0]['fylkesnavn'], county_number=farm['fylker'][0]['fylkesnummer'],
        austegarden=dict(register_entry='Austegarden (Bruk), stedsnummer 842304, status vedtatt', lat=FARM_LL[0], lon=FARM_LL[1],
                         utm32=[round(FARM[0], 1), round(FARM[1], 1)]),
        crs='EPSG:25832 (ETRS89 / UTM zone 32N), north up',
        sources=['Kartverket N50 Kartdata (coast, sea, lakes, roads), GML via Geonorge download API',
                 'Kartverket Nasjonal høydemodell DTM, 1 m grid via WCS (contours)',
                 'Kartverket FKB via WMS wms.fkb: layer bygning (footprints / building positions) and veg (inset roads), vectorised from the render',
                 'Kartverket FKB-AR5 land cover via WMS layer ar5 (forest)',
                 'Kartverket Stedsnavn API (labels)'],
        licence='Kartdata © Kartverket, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        products={k: product_meta(SHEETS[k], v[0], v[1], names, None) for k, v in built.items()},
        notes=NOTES)
    json.dump(meta, open(path, 'w'), ensure_ascii=False, indent=1)


NOTES = [
    'The SVGs hold no marker and no text. x,y values are fractions of the sheet from its top-left corner.',
    'Sheet and band draw buildings as small squares of constant screen size at each building position taken from the FKB footprints; the inset draws the footprints themselves (rectangles where the footprint is rectangular).',
    'Roads on the sheet and band are N50 (generalised: some residential lanes are missing). The inset road network is traced from the FKB road areas (centre lines), and N50 is used for E, R and F roads. Tunnels, ferry routes and footpaths are not drawn on the sheet and band; the inset draws N50 paths and tractor roads dashed.',
    'Contours are computed from the 1 m DTM (smoothed, simplified), not taken from N50. Lake surfaces carry no contours.',
    'Label points are the register representative points. Flatøy (island) lies about 0.3 km from Austegarden, so anchor its text to the left and Austegarden to the right. Labels are limited to those that do not crowd on a 1280 px wide sheet.',
    'The Nordhordland Bridge and Hagelsund Bridge are N50 road centre lines (straight or gently curved lines), not bridge decks.',
    'Marshes (Myr), farmland, built-up land, depth contours, sea marks and rivers are not drawn.',
    'Building footprints are read from a WMS render (FKB-Bygning as a download is restricted), so their edges are accurate to about 0.5 m on the inset and are rectangles fitted to the raster.',
]


if __name__ == '__main__':
    main()
