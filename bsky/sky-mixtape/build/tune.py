"""Print the tag profile Ettin gives a handle's last posts (or keywords) under each tag_emb file.
usage: python3 tune.py TAG_EMB_JSON [...] (--actor HANDLE [--n 100] | --words "...")"""
import argparse, base64, json, re, urllib.parse, urllib.request
import numpy as np
from embed_tags import Ettin

def posts(actor, n):
    out, cursor = [], None
    while len(out) < n:
        q = {'actor': actor, 'limit': 100, 'filter': 'posts_with_replies', **({'cursor': cursor} if cursor else {})}
        d = json.load(urllib.request.urlopen('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?' + urllib.parse.urlencode(q)))
        for it in d['feed']:
            p = it['post']
            if it.get('reason') or p['author']['handle'] != actor: continue
            r = p['record']; e = r.get('embed') or {}
            parts = [r.get('text', '')] + [i.get('alt', '') for i in (e.get('images') or (e.get('media') or {}).get('images') or [])]
            ext = e.get('external') or (e.get('media') or {}).get('external')
            if ext: parts.append('. '.join(x for x in (ext.get('title'), ext.get('description')) if x))
            t = re.sub(r'\s+', ' ', re.sub(r'https?://\S+', ' ', '\n'.join(x for x in parts if x))).strip()
            if len(t) >= 12: out.append(t)
        cursor = d.get('cursor')
        if not cursor: break
    return out[:n]

def profile(P, T, stats, per_post=4, z_min=1.0, temp=0.6):
    m = np.array([s[0] for s in stats]); sd = np.array([s[1] for s in stats])
    Z = (P @ T.T - m) / sd
    w = np.zeros(T.shape[0]); best = {}
    for i, z in enumerate(Z):
        top = [j for j in np.argsort(-z)[:per_post] if z[j] >= z_min]
        if not top: continue
        ex = np.exp((z[top] - z[top[0]]) / temp); ex /= ex.sum()
        for j, e in zip(top, ex):
            w[j] += e
            if z[j] > best.get(j, (0, -9))[1]: best[j] = (i, z[j])
    return w / max(w.sum(), 1e-9), best

ap = argparse.ArgumentParser(); ap.add_argument('emb', nargs='+'); ap.add_argument('--actor'); ap.add_argument('--n', type=int, default=100); ap.add_argument('--words')
a = ap.parse_args()
tags = json.load(open('tags.json'))
texts = [s.strip() for s in a.words.split(',')] + [a.words] if a.words else posts(a.actor, a.n)
m = Ettin()
for f in a.emb:
    e = json.load(open(f))
    T = np.stack([np.frombuffer(base64.b64decode(v['b']), np.int8).astype(np.float32) * v['s'] for v in e['vec']])
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    P = m.embed(texts, e.get('postPrompt', ''))
    w, best = profile(P, T, e['stats'], **({'z_min': 0.5, 'per_post': 6} if a.words else {}))
    print(f'== {f} (post prompt {e.get("postPrompt", "")!r}), {len(texts)} texts')
    for j in np.argsort(-w)[:14]:
        if w[j] <= 0: break
        i = best.get(j, (None,))[0]
        print(f'{100*w[j]:5.1f} {tags[j]["id"]:22s} {texts[i][:80] if i is not None else ""}')
