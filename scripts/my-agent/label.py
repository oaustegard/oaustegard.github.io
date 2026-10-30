"""Label a stratified sample of backfilled posts as ai / human / unknown with
`claude -p` children (the host authenticates them; no API key here).

usage: label.py RAW_DIR OUT_JSONL [N=2400]
Resumable: ids already in OUT_JSONL are skipped.
"""
import json, random, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

PROMPT = """You label Bluesky posts that contain the phrase "my agent".
For each post decide what "agent" the author means:

ai      - software: an AI agent, LLM/coding agent (Claude Code, Codex, Cursor,
          OpenClaw, etc.), a bot, an automated assistant or agentic workflow
          the author runs or builds.
human   - a person acting for the author: literary, talent, acting, modeling,
          sports, booking, real-estate, estate, insurance, travel, tax or
          other professional agent; a human customer-service rep.
unknown - cannot tell from the text, or neither: video-game characters
          (Valorant, Hitman), fiction/roleplay, spy jokes, non-English text
          too unclear to judge, or a post too short to decide.

Judge from the post text alone. Respond with ONLY a JSON object mapping each
id to "ai", "human" or "unknown", nothing else.

Posts:
"""

def batches(items, n):
    for i in range(0, len(items), n):
        yield items[i:i + n]


def label(batch):
    body = "\n".join(json.dumps({"id": p["id"], "text": p["text"][:600]}, ensure_ascii=False)
                     for p in batch)
    for _ in range(3):
        r = subprocess.run(["claude", "-p", "--model", "sonnet", PROMPT + body],
                           capture_output=True, text=True, timeout=600)
        m = re.search(r"\{.*\}", r.stdout, re.S)
        if not m:
            continue
        try:
            d = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        return [{"id": p["id"], "label": d[p["id"]]} for p in batch
                if d.get(p["id"]) in ("ai", "human", "unknown")]
    return []


def main(raw, out, n=2400):
    raw, out = Path(raw), Path(out)
    posts = []
    for f in sorted(raw.glob("20*.jsonl")):
        for line in f.open():
            p = json.loads(line)
            p["id"] = p["uri"].rsplit("/", 1)[-1]
            p["week"] = f.stem
            posts.append(p)
    # stratify by week so 2026's AI-heavy posts and 2025's book-agent posts both show up
    by_week = {}
    for p in posts:
        by_week.setdefault(p["week"], []).append(p)
    rng = random.Random(7)
    per = max(1, n // len(by_week))
    sample = []
    for w, ps in sorted(by_week.items()):
        rng.shuffle(ps)
        sample += ps[:per]
    done = set()
    if out.exists():
        done = {json.loads(l)["id"] for l in out.open()}
    todo = [p for p in sample if p["id"] not in done]
    print(f"{len(posts)} posts, sample {len(sample)}, todo {len(todo)}", flush=True)
    with ThreadPoolExecutor(6) as ex, out.open("a") as f:
        for res in ex.map(label, batches(todo, 60)):
            for r in res:
                f.write(json.dumps(r) + "\n")
            f.flush()
            print("labeled", len(res), flush=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], *(int(a) for a in sys.argv[3:]))
