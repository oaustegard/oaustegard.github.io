"""Assemble ../catalog.json from tags.json, candidates/*.json, resolved.json and tag_emb.json.
usage: python3 build_catalog.py TAG_EMB_JSON"""
import json, glob, re, sys, unicodedata, collections
tags = json.load(open('tags.json'))
emb = json.load(open(sys.argv[1]))
assert len(emb['vec']) == len(tags)
tix = {t['id']: i for i, t in enumerate(tags)}
cand = {}
for f in sorted(glob.glob('candidates/*.json')):
    for k, v in json.load(open(f)).items(): cand.setdefault(k, []).extend(v)
res = json.load(open('resolved.json'))
def nk(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'\(.*?\)|\[.*?\]', '', s)
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()
LIVE = re.compile(r'[(\[-]\s*live\b|\blive (at|from|in)\b', re.I)
by_dz = {}
for tag, pairs in cand.items():
    if tag not in tix: continue
    for a, t in pairs:
        r = res.get(f'{a.strip()}|{t.strip()}')
        if not r or LIVE.search(r['title']): continue
        e = by_dz.setdefault(r['dz'], dict(r, tags=set()))
        e['tags'].add(tix[tag])
# genre is mostly a property of the artist: spread genre tags across an artist's songs
artist_genres = collections.defaultdict(set)
for e in by_dz.values():
    for j in e['tags']:
        if tags[j]['kind'] == 'genre': artist_genres[nk(e['artist'])].add(j)
for e in by_dz.values(): e['tags'] |= artist_genres[nk(e['artist'])]
# one entry per song even when Deezer has several releases of it
by_key = {}
for e in by_dz.values():
    k = f"{nk(e['artist'])}|{nk(e['title'])}"
    if k in by_key:
        by_key[k]['tags'] |= e['tags']
        if e['rank'] > by_key[k]['rank']:
            e['tags'] = by_key[k]['tags']; by_key[k] = e
    else: by_key[k] = e
COVER = re.compile(r'/images/cover/([0-9a-f]+)/')
tracks = []
for k, e in sorted(by_key.items(), key=lambda kv: -kv[1]['rank']):
    m = COVER.search(e.get('cover') or '')
    tracks.append({'a': e['artist'], 'ti': e['title'], 'al': e['album'], 'isrc': e['isrc'], 'dz': e['dz'],
                   'r': e['rank'], 'd': e['dur'], 'c': m.group(1) if m else None, 'x': 1 if e['explicit'] else 0,
                   't': sorted(e['tags'])})
per_tag = collections.Counter(j for t in tracks for j in t['t'])
cat = {'version': 1, 'model': emb['model'], 'dtype': emb['dtype'], 'dim': emb['dim'],
       'tags': [{'id': t['id'], 'label': t['label'], 'kind': t['kind'], 'desc': t['desc']} for t in tags],
       'tagVec': emb['vec'], 'tagStats': [[round(m, 5), round(s, 5)] for m, s in emb['stats']],
       'maxRank': max(t['r'] for t in tracks), 'coverBase': 'https://cdn-images.dzcdn.net/images/cover/',
       'tracks': tracks}
json.dump(cat, open('../catalog.json', 'w'), separators=(',', ':'), ensure_ascii=False)
thin = [tags[j]['id'] for j in range(len(tags)) if per_tag[j] < 8]
print(f'{len(tracks)} tracks, {len(tags)} tags; tags with <8 tracks: {thin}')
