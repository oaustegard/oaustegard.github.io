"""Resolve candidate songs against Deezer search; keep only real matches.
Output: resolved.json  {"artist|title": {...deezer fields...} | null}"""
import json, glob, re, time, threading, urllib.request, urllib.parse, unicodedata, os, concurrent.futures as cf
m = {}
for f in sorted(glob.glob('candidates/*.json')):
    for k, v in json.load(open(f)).items(): m.setdefault(k, []).extend(v)
pairs = sorted({(a.strip(), t.strip()) for v in m.values() for a, t in v})
cache = json.load(open('resolved.json')) if os.path.exists('resolved.json') else {}
def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)|\[.*?\]| - .*$|feat\..*$|ft\..*$', '', s)
    s = re.sub(r'^the |&| and ', ' ', s)
    return re.sub(r'[^a-z0-9]+', '', s)
lock = threading.Lock(); last = [0.0]
def get(q):
    with lock:
        wait = last[0] + 0.12 - time.time()
        if wait > 0: time.sleep(wait)
        last[0] = time.time()
    url = 'https://api.deezer.com/search?limit=10&q=' + urllib.parse.quote(q)
    for attempt in range(4):
        try:
            d = json.load(urllib.request.urlopen(url, timeout=20))
            if 'error' in d: time.sleep(2 ** attempt); continue
            return d.get('data', [])
        except Exception:
            time.sleep(2 ** attempt)
    return None
def pick(rows, a, t):
    na, nt = norm(a), norm(t)
    best = None
    for r in rows or []:
        ra, rt = norm(r['artist']['name']), norm(r['title'])
        if not ra or not rt: continue
        if (na in ra or ra in na) and (nt == rt or (len(nt) > 3 and (rt.startswith(nt) or nt.startswith(rt)))):
            if best is None or r.get('rank', 0) > best.get('rank', 0): best = r
    return best
def resolve(p):
    key = f'{p[0]}|{p[1]}'
    if key in cache: return key, cache[key]
    a, t = p
    rows = get(f'artist:"{a}" track:"{t}"')
    r = pick(rows, a, t)
    if r is None and rows is not None:
        r = pick(get(f'{a} {t}'), a, t)
    if rows is None: return key, 'ERR'
    if r is None: return key, None
    return key, {'dz': r['id'], 'artist': r['artist']['name'], 'title': r['title_short'] or r['title'],
                 'album': r['album']['title'], 'isrc': r.get('isrc'), 'dur': r.get('duration'),
                 'rank': r.get('rank', 0), 'cover': r['album'].get('cover_medium'), 'explicit': r.get('explicit_lyrics')}
todo = [p for p in pairs if f'{p[0]}|{p[1]}' not in cache]
print('pairs', len(pairs), 'todo', len(todo), flush=True)
n = 0
with cf.ThreadPoolExecutor(6) as ex:
    for key, val in ex.map(resolve, todo):
        if val != 'ERR': cache[key] = val
        n += 1
        if n % 250 == 0:
            json.dump(cache, open('resolved.json', 'w')); print(n, flush=True)
json.dump(cache, open('resolved.json', 'w'))
ok = sum(1 for v in cache.values() if v)
print('done; resolved', ok, 'of', len(cache))
