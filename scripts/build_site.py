#!/usr/bin/env python3
"""
build_site.py: run every generator for the site, in order.

  1. scripts/build_tools.py  tool lists: data/tools.json, tools.html, the district
                             pages and the district cards on the home page
  2. scripts/build_blog.py   feed.xml, blog/index.html and the latest posts on
                             the home page

A script that is not there is skipped with a note. Each step runs as its own
process, so one failing does not hide the other; the exit code is non-zero if
any step failed.

Usage (from the repo root; this is what CI runs):
  python3 scripts/build_site.py              write everything, list the files that changed
  python3 scripts/build_site.py --check      write nothing; exit 1 if any generated file is stale
  python3 scripts/build_site.py --dry-run    write nothing; list what would change

Standard library only.
"""

import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HERE = Path(__file__).resolve().parent
STEPS = ["build_tools.py", "build_blog.py"]
FLAGS = ("--check", "--dry-run")
# Files the generators write, besides every <dir>/index.html one level down
# (the district pages and blog/index.html).
ROOT_FILES = ["feed.xml", "data/tools.json", "tools.html", "index.html"]


def snapshot():
    """Hash of every generated file, keyed by repo-relative path. None means absent."""
    files = {ROOT / f for f in ROOT_FILES}
    for p in ROOT.glob("*/index.html"):
        top = p.parent.name
        if not top.startswith((".", "_")) and top != "node_modules":
            files.add(p)
    out = {}
    for p in sorted(files):
        rel = p.relative_to(ROOT).as_posix()
        out[rel] = hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
    return out


def main(argv):
    unknown = [a for a in argv if a not in FLAGS]
    if unknown:
        print("usage: build_site.py [--check] [--dry-run]  (unknown: %s)" % " ".join(unknown), file=sys.stderr)
        return 2

    before = snapshot()
    ran, skipped, failed = [], [], []
    for name in STEPS:
        script = HERE / name
        if not script.is_file():
            print("skip: scripts/%s not found" % name)
            skipped.append(name)
            continue
        print("== %s %s" % (name, " ".join(argv)))
        sys.stdout.flush()
        try:
            rc = subprocess.run([sys.executable, str(script), *argv], cwd=ROOT).returncode
        except OSError as e:
            print("build_site: could not run %s: %s" % (name, e), file=sys.stderr)
            rc = 1
        ran.append(name)
        if rc != 0:
            print("build_site: %s failed (exit %d)" % (name, rc), file=sys.stderr)
            failed.append(name)

    if "--check" in argv:
        print("check: %s" % ("FAILED in " + ", ".join(failed) if failed else "all generated files are up to date"))
    elif "--dry-run" in argv:
        print("dry run: nothing written")
    else:
        after = snapshot()
        changed = [rel for rel in after if before.get(rel) != after[rel]]
        print("changed: " + (", ".join(changed) if changed else "no generated file changed"))
    if not ran and not failed:
        print("nothing to run: no generator script found")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
