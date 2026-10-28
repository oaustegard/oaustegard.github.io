#!/usr/bin/env python3
"""Stamp every module import with one version, so a release never mixes with cached files.

GitHub Pages lets browsers cache each file for ten minutes, separately. Without a stamp a
browser can run a new index.html against an old engine.js. Run this before committing:
  python3 fun-and-games/doom/stamp.py
"""
import re, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
version = time.strftime("%Y%m%d%H%M%S", time.gmtime())
for f in ["index.html", "check.html", "engine.js", "shaders.js", "wad.js", "specials.js", "info.js", "music.js"]:
    p = HERE / f
    s = p.read_text()
    t = re.sub(r'from "\./(\w+)\.js(?:\?v=\w+)?"', rf'from "./\1.js?v={version}"', s)
    if t != s:
        p.write_text(t)
print("stamped", version)
