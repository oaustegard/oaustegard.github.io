#!/usr/bin/env python3
"""corpus.ndjson -> docs/<slug>.md tree + meta.json sidecar.

remax_kb packs a directory and records source_path per chunk. The SPA joins
chunks back to display fields (url, kind, date, handle) through meta.json,
keyed on the file stem.
"""
import json, pathlib, re, sys


def digest(text, limit=400):
    """Plain-text digest for the result card.

    Bodies come from whatever field the record called its main text, so a
    WhiteWind entry arrives as raw markdown and renders in the card as literal
    '#' and '*'. Strip the syntax rather than the content: headings lose their
    hashes, emphasis and inline code lose their markers, links keep their label.
    """
    t = re.sub(r"^\s{0,3}#{1,6}\s*", "", text, flags=re.M)
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", t)          # images: drop, alt text is not prose
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"^\s*([-*_]\s*){3,}$", "", t, flags=re.M)  # horizontal rules
    t = re.sub(r"(\*\*|__|\*|_|`)", "", t)
    t = re.sub(r"^\s*[-*+]\s+", "\u2022 ", t, flags=re.M)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    return t[:limit]

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
        "body": digest(a.get("body", "")),
    }

pathlib.Path("meta.json").write_text(json.dumps(meta, separators=(",", ":")))
print(f"{len(meta)} docs -> {outdir}/  + meta.json")
