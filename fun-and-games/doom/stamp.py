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
# static imports in the modules, ../ imports in the TRM bot's (bot/), and the page's dynamic import of the bot
for f in ["index.html", "check.html", "engine.js", "shaders.js", "wad.js", "specials.js", "info.js", "music.js",
          "bot/driver.js", "bot/bot.js", "bot/grid.js", "bot/trm.js"]:
    p = HERE / f
    s = p.read_text()
    t = re.sub(r'from "(\.\.?)/(\w+)\.js(?:\?v=\w+)?"', rf'from "\1/\2.js?v={version}"', s)
    t = re.sub(r'import\("\./bot/(\w+)\.js(?:\?v=\w+)?"\)', rf'import("./bot/\1.js?v={version}")', t)
    if t != s:
        p.write_text(t)
print("stamped", version)
