"""Ask claude -p children for candidate songs per tag. Output: candidates/<batch>.json"""
import json, subprocess, sys, os, concurrent.futures as cf
tags = json.load(open('tags.json'))
os.makedirs('candidates', exist_ok=True)
B = 12
batches = [tags[i:i+B] for i in range(0, len(tags), B)]
PROMPT = """For each music tag below, list 18 real, released songs that fit it well. Mix eras and, for mood/theme/setting/texture tags, mix genres. Favor songs that are well known or at least easy to find on Spotify, Apple Music and YouTube; include a few deeper cuts. For theme tags prefer songs whose LYRICS or title are actually about the theme. Exact artist and title as credited on streaming services. No live versions, no covers unless the cover is the famous version.

Output ONLY a JSON object mapping tag id to an array of [artist, title] pairs. No prose, no code fence.

Tags:
"""
def run(i):
    out = f'candidates/{i:02d}.json'
    if os.path.exists(out): return i, 'cached'
    lines = '\n'.join(f'- {t["id"]} ({t["kind"]}): {t["label"]} — {t["desc"]}' for t in batches[i])
    r = subprocess.run(['claude', '-p', '--model', 'sonnet', PROMPT + lines], capture_output=True, text=True, timeout=900)
    t = r.stdout
    try:
        d = json.loads(t[t.index('{'):t.rindex('}')+1])
    except Exception as e:
        return i, f'parse fail {e} {t[:200]!r} {r.stderr[:200]!r}'
    json.dump(d, open(out, 'w'))
    return i, f'{len(d)} tags'
with cf.ThreadPoolExecutor(7) as ex:
    for i, msg in ex.map(run, range(len(batches))):
        print(i, msg, flush=True)
