"""Ask claude -p children for candidate songs per tag. Output: candidates/<batch>.json (round 1) or
candidates/r<N>_<batch>.json (later rounds, which exclude every song already proposed for that tag).
usage: python3 gen_tracks.py                         round 1: 18 songs per tag, 12 tags per call
       python3 gen_tracks.py --round 2 --n 40 --batch 6"""
import argparse, glob, json, subprocess, os, concurrent.futures as cf
ap = argparse.ArgumentParser()
ap.add_argument('--round', type=int, default=1)
ap.add_argument('--n', type=int, default=18, help='songs per tag')
ap.add_argument('--batch', type=int, default=12, help='tags per claude call')
ap.add_argument('--workers', type=int, default=7)
ap.add_argument('--only', type=int, help='run one batch, to check a prompt')
a = ap.parse_args()
tags = json.load(open('tags.json'))
os.makedirs('candidates', exist_ok=True)
batches = [tags[i:i + a.batch] for i in range(0, len(tags), a.batch)]
have = {}
if a.round > 1:
    for f in sorted(glob.glob('candidates/*.json')):
        for k, v in json.load(open(f)).items(): have.setdefault(k, []).extend(f'{x} - {y}' for x, y in v)
PROMPT = """For each music tag below, list {n} real, released songs that fit it well. Mix eras and, for mood/theme/setting/texture tags, mix genres. Favor songs that are well known or at least easy to find on Spotify, Apple Music and YouTube; include a few deeper cuts. For theme tags prefer songs whose LYRICS or title are actually about the theme. Exact artist and title as credited on streaming services. No live versions, no covers unless the cover is the famous version.
{more}
Output ONLY a JSON object mapping tag id to an array of [artist, title] pairs. No prose, no code fence.

Tags:
"""
MORE = """
Each tag already has the songs listed under it; give {n} DIFFERENT songs. Reach wider than the obvious picks: other decades, other countries and languages, women and men, album tracks as well as singles, while still fitting the tag clearly. At most two songs per artist per tag.
"""
def run(i):
    out = f'candidates/{i:02d}.json' if a.round == 1 else f'candidates/r{a.round}_{i:02d}.json'
    if os.path.exists(out): return i, 'cached'
    lines = []
    for t in batches[i]:
        lines.append(f'- {t["id"]} ({t["kind"]}): {t["label"]} — {t["desc"]}')
        if have.get(t['id']): lines.append('  already have: ' + '; '.join(have[t['id']]))
    prompt = PROMPT.format(n=a.n, more=MORE.format(n=a.n) if a.round > 1 else '') + '\n'.join(lines)
    r = subprocess.run(['claude', '-p', '--model', 'sonnet', prompt], capture_output=True, text=True, timeout=1500)
    t = r.stdout
    try:
        d = json.loads(t[t.index('{'):t.rindex('}') + 1])
    except Exception as e:
        return i, f'parse fail {e} {t[:200]!r} {r.stderr[:200]!r}'
    json.dump(d, open(out, 'w'))
    return i, f'{len(d)} tags, {sum(len(v) for v in d.values())} songs'
with cf.ThreadPoolExecutor(a.workers) as ex:
    for i, msg in ex.map(run, [a.only] if a.only is not None else range(len(batches))):
        print(i, msg, flush=True)
