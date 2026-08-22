#!/usr/bin/env python3
"""corpus.ndjson -> docs/<slug>.md tree + meta.json sidecar.

remax_kb packs a directory and records source_path per chunk. The SPA joins
chunks back to display fields (url, kind, date, handle) through meta.json,
keyed on the file stem.
"""
import json, pathlib, re, sys

src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "corpus.ndjson")
outdir = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "docs")
outdir.mkdir(exist_ok=True)
for old in outdir.glob("*.md"):
    old.unlink()

meta = {}
for line in src.open():
    a = json.loads(line)
    did, coll, rkey = a["id"].split("/", 2)
    who = "oskar" if a["handle"] == "austegard.com" else "muninn"
    slug = re.sub(r"[^A-Za-z0-9._-]", "-", f"{who}__{coll}__{rkey}")[:120]
    head = f"# {a['title']}\n\n" if a.get("title") else ""
    (outdir / f"{slug}.md").write_text(head + a["text"], encoding="utf-8")
    meta[slug] = {
        "handle": a["handle"],
        "kind": a["kind"],
        "title": a.get("title"),
        "url": a.get("url"),
        "details": a["details"],
        "date": a.get("date"),
        "body": a.get("body", "")[:400],
    }

pathlib.Path("meta.json").write_text(json.dumps(meta, separators=(",", ":")))
print(f"{len(meta)} docs -> {outdir}/  + meta.json")
