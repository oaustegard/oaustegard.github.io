#!/usr/bin/env python3
"""
build_tools.py: generate the tool lists from the pages on disk and data/tool-notes.json.

Site rule: drop a file in and it appears. Every tool page found in a district
directory is listed; data/tool-notes.json only adds the curated title, blurb,
featured flag and kind. A page without a note falls back to its <title>, its
meta description, then the first plain paragraph of its README, and the script
warns "no curated note for <path>".

Discovery, per district directory (see "dirs" in the notes file):
  *.html except index.html, plus subdirectories that contain an index.html.
  /found/generator.html belongs to the etc district (dirs: etc, found).

Writes:
  data/tools.json       compact list for search: districts and tools
  index.html            <!--gen:districts--> (district cards), <!--gen:total-->
  tools.html            <!--gen:hub--> (jump list and districts), <!--gen:total-->
  <district>/index.html <!--gen:blurb-->, <!--gen:tools--> (place-list rows),
                        <!--gen:readmes--> (links to the READMEs on GitHub)
Only the text between a marker pair changes.

Usage (from the repo root):
  python3 scripts/build_tools.py            write everything
  python3 scripts/build_tools.py --check    exit 1 and list stale files, write nothing
  python3 scripts/build_tools.py --dry-run  list what would change, write nothing

Standard library only. Deterministic and idempotent.
"""

import json
import re
import sys
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
NOTES = ROOT / "data" / "tool-notes.json"
OUT_JSON = ROOT / "data" / "tools.json"
REPO_BLOB = "https://github.com/oaustegard/oaustegard.github.io/blob/main/"
SITE_SUFFIX = " | Oskar Austegard"
DEFAULT_PLACES = 3


# ── helpers ────────────────────────────────────────────────────────

def esc(s):
    """Escape text content."""
    return escape(s, quote=False)


def esc_attr(s):
    return escape(s, quote=True)


def href(path):
    return quote(path, safe="/-_.~%")


def sort_key(title):
    """Alphabetical, case-insensitive, ignoring leading punctuation."""
    t = re.sub(r"^[^0-9A-Za-z]+", "", title)
    return (t.casefold(), title.casefold())


def humanize(stem):
    words = re.sub(r"[-_]+", " ", stem).strip()
    return words[:1].upper() + words[1:]


def trim_blurb(text, limit=110):
    """One short plain line: the first sentence if it fits, else cut at a word."""
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    m = re.match(r"(.{20,%d}?[.!?])(\s|$)" % limit, text)
    if m:
        return m.group(1)
    cut = text[:limit].rsplit(" ", 1)[0].rstrip(",;:- ")
    return cut + "…"


class HeadMeta(HTMLParser):
    """<title> and meta description of a page."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.description = ""
        self._in_title = False
        self._done = False

    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self._done = True
        if self._done:
            return
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = (a.get("name") or a.get("property") or "").lower()
            if name in ("description", "og:description") and a.get("content") and not self.description:
                self.description = a["content"]

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title and not self._done:
            self.title += data


def read_page_meta(file):
    p = HeadMeta()
    try:
        p.feed(file.read_text(encoding="utf-8", errors="replace"))
    except Exception:
        pass
    title = re.sub(r"\s+", " ", p.title).strip()
    if title.endswith(SITE_SUFFIX):
        title = title[: -len(SITE_SUFFIX)].strip()
    return title, re.sub(r"\s+", " ", p.description).strip()


def readme_for(root_dir, entry):
    """Path of the README that belongs to a tool, or None."""
    if entry["is_dir"]:
        cand = root_dir / entry["name"] / "README.md"
    else:
        cand = root_dir / (entry["stem"] + "_README.md")
    return cand if cand.is_file() else None


def readme_paragraph(readme):
    """First plain paragraph of a README (no headings, badges, lists, links-only lines)."""
    if readme is None:
        return ""
    para = []
    in_code = False
    for raw in readme.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        if not line:
            if para:
                break
            continue
        if re.match(r"^(#|>|[-*+] |\d+[.)] |\||!\[|<|\*\*\[|\[)", line) or set(line) <= set("-=_* "):
            if para:
                break
            continue
        para.append(line)
    text = " ".join(para)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[*_`]+", "", text)
    return text.strip()


# ── data ───────────────────────────────────────────────────────────

def load_notes():
    try:
        data = json.loads(NOTES.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        sys.exit("build_tools: cannot read %s: %s" % (NOTES, e))
    if not data.get("districts"):
        sys.exit("build_tools: %s has no districts" % NOTES)
    return data


def discover(district):
    """Tool pages of one district, unsorted: dicts with path, file, name, stem, is_dir, root_dir."""
    found = []
    for d in district["dirs"]:
        base = ROOT / d
        if not base.is_dir():
            continue
        for f in sorted(base.glob("*.html")):
            if f.name == "index.html":
                continue
            found.append({"path": "/%s/%s" % (d, f.name), "file": f, "name": f.name,
                          "stem": f.stem, "is_dir": False, "root_dir": base, "dir": d})
        for sub in sorted(p for p in base.iterdir() if p.is_dir()):
            if (sub / "index.html").is_file():
                found.append({"path": "/%s/%s/" % (d, sub.name), "file": sub / "index.html", "name": sub.name,
                              "stem": sub.name, "is_dir": True, "root_dir": base, "dir": d})
    return found


def build_model(notes, warn):
    districts = sorted(notes["districts"], key=lambda d: (d.get("order", 999), d["key"]))
    known = notes.get("tools", {})
    seen = set()
    model = []
    for d in districts:
        tools = []
        for e in discover(d):
            seen.add(e["path"])
            note = known.get(e["path"])
            page_title, page_desc = read_page_meta(e["file"])
            readme = readme_for(e["root_dir"], e)
            if note is None:
                warn("no curated note for %s" % e["path"])
                title = page_title or humanize(e["stem"])
                blurb = trim_blurb(page_desc) if page_desc else trim_blurb(readme_paragraph(readme))
                featured, kind = False, "tool"
            else:
                title = note.get("title") or page_title or humanize(e["stem"])
                blurb = note.get("blurb")
                if blurb is None:
                    blurb = trim_blurb(page_desc) if page_desc else trim_blurb(readme_paragraph(readme))
                featured = bool(note.get("featured"))
                kind = note.get("kind") or "tool"
            tools.append({
                "slug": e["stem"], "title": title, "blurb": blurb, "path": e["path"],
                "kind": kind, "featured": featured, "district": d["key"],
                "readme": ("/%s/%s" % (e["dir"], readme.relative_to(e["root_dir"]).as_posix())) if readme else None,
            })
        tools.sort(key=lambda t: (0 if t["featured"] else 1, sort_key(t["title"]), t["path"]))
        model.append({
            "slug": d["key"], "title": d["title"], "blurb": d["blurb"], "path": d["index"],
            "places": int(d.get("cardPlaces", DEFAULT_PLACES)), "tools": tools,
        })
    for p in sorted(known):
        if p not in seen:
            warn("note for %s has no file; skipped" % p)
    return model


# ── markup ─────────────────────────────────────────────────────────

def place_li(t, indent="", extra=""):
    sub = '<span class="sub">%s</span>' % esc(t["blurb"]) if t["blurb"] else ""
    return '%s<li%s><a href="%s"><span class="nm">%s</span>%s</a></li>' % (
        indent, extra, esc_attr(href(t["path"])), esc(t["title"]), sub)


def home_cards(model):
    out = []
    for d in model:
        n = len(d["tools"])
        places = ("\n" + " " * 10).join(
            '<li><a href="%s">%s</a></li>' % (esc_attr(href(t["path"])), esc(t["title"]))
            for t in d["tools"][: d["places"]])
        more = "Open %s" % esc(d["path"]) if d["slug"] == "etc" else "All %d tools" % n
        out.append(
            '      <li class="district" data-slug="{slug}">\n'
            '        <div class="district__head"><h3>{title}</h3><p class="spot"><b>{n}</b> tools</p></div>\n'
            '        <p class="blurb">{blurb}</p>\n'
            '        <ul class="places">\n'
            '          {places}\n'
            '        </ul>\n'
            '        <a class="more arr" href="{href}">{more}</a>\n'
            '      </li>'.format(slug=esc_attr(d["slug"]), title=esc(d["title"]), n=n, blurb=esc(d["blurb"]),
                                 places=places, href=esc_attr(href(d["path"])), more=more))
    return "\n" + "\n".join(out) + "\n"


def hub_region(model):
    ind = "    "
    lines = ['<nav class="jump" aria-label="Districts"><span class="kicker"><b lang="nb">Distrikter</b> &middot; Districts</span><ul>']
    for d in model:
        lines.append('  <li><a href="#%s">%s <i>%d</i></a></li>' % (esc_attr(d["slug"]), esc(d["title"]), len(d["tools"])))
    lines.append("</ul></nav>")
    lines.append('<div id="hub">')
    inner = []
    for d in model:
        n = len(d["tools"])
        inner.append('<section class="hub-d" id="%s" data-slug="%s" aria-labelledby="h-%s">' % (
            esc_attr(d["slug"]), esc_attr(d["slug"]), esc_attr(d["slug"])))
        inner.append('  <div class="hub-d__head"><h2 id="h-%s"><a href="%s">%s</a></h2><p class="spot"><b>%d</b> <span>tools</span></p></div>' % (
            esc_attr(d["slug"]), esc_attr(href(d["path"])), esc(d["title"]), n))
        inner.append('  <p class="blurb">%s</p>' % esc(d["blurb"]))
        inner.append('  <ul class="place-list">')
        for t in d["tools"]:
            inner.append(place_li(t, "    ", ' data-kind="%s"' % esc_attr(t["kind"])))
        inner.append("  </ul>")
        inner.append("</section>")
    lines += ["  " + l for l in inner]
    lines.append("</div>")
    return "\n" + "\n".join(ind + l for l in lines) + "\n"


def district_tools_region(d):
    ind = "    "
    lines = ['<ul class="place-list">']
    lines += [place_li(t, "  ") for t in d["tools"]]
    lines.append("</ul>")
    return "\n" + "\n".join(ind + l for l in lines) + "\n" + ind


def district_readmes_region(d):
    ind = "    "
    items = [t for t in d["tools"] if t["readme"]]
    if not items:
        return "\n" + ind
    lines = ['<h2 id="h-readmes">Readmes</h2>',
             '<p class="measure">Write-ups on GitHub, for the tools that have one.</p>',
             '<ul class="t-list t-cols">']
    for t in items:
        lines.append('  <li><a class="ext" rel="noopener" href="%s">%s</a></li>' % (
            esc_attr(REPO_BLOB + href(t["readme"].lstrip("/"))), esc(t["title"])))
    lines.append("</ul>")
    return "\n" + "\n".join(ind + l for l in lines) + "\n" + ind


def tools_json(model):
    total = sum(len(d["tools"]) for d in model)
    dumps = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    ds = [{"slug": d["slug"], "title": d["title"], "blurb": d["blurb"], "path": d["path"], "count": len(d["tools"])}
          for d in model]
    ts = [{"slug": t["slug"], "title": t["title"], "blurb": t["blurb"], "path": t["path"],
           "kind": t["kind"], "district": t["district"]}
          for d in model for t in d["tools"]]
    out = ['{"total":%d,' % total, '"districts":[']
    out.append(",\n".join(dumps(x) for x in ds))
    out.append('],\n"tools":[')
    out.append(",\n".join(dumps(x) for x in ts))
    out.append("]}\n")
    return "\n".join(out)


# ── regions ────────────────────────────────────────────────────────

def replace_region(text, name, content, required, label):
    """Replace the text between <!--gen:NAME--> and <!--/gen:NAME--> (every pair).

    `content` is used as given for inline regions; a block region is one whose
    content starts with a newline, and its closing marker keeps the indent it
    already has.
    """
    pat = re.compile(r"(<!--gen:%s-->)(.*?)(<!--/gen:%s-->)" % (re.escape(name), re.escape(name)), re.S)
    if not pat.search(text):
        if required:
            sys.exit("build_tools: marker <!--gen:%s--> ... <!--/gen:%s--> missing in %s" % (name, name, label))
        return text

    def sub(m):
        body = content
        if content.startswith("\n"):
            # keep the closing marker's own indent
            before = text[: m.start(3)]
            line_start = before.rfind("\n") + 1
            lead = before[line_start:]
            close_indent = lead if lead.strip() == "" else ""
            body = content.rstrip(" ")
            body = body.rstrip("\n") + "\n" + close_indent
        return m.group(1) + body + m.group(3)

    return pat.sub(sub, text)


def main(argv):
    check = "--check" in argv
    dry = "--dry-run" in argv
    unknown = [a for a in argv if a not in ("--check", "--dry-run")]
    if unknown:
        sys.exit("usage: build_tools.py [--check | --dry-run]  (unknown: %s)" % " ".join(unknown))

    warnings = []

    def warn(msg):
        warnings.append(msg)
        print("warning: " + msg, file=sys.stderr)

    notes = load_notes()
    model = build_model(notes, warn)
    total = sum(len(d["tools"]) for d in model)
    outputs = {}  # Path -> new text

    outputs[OUT_JSON] = tools_json(model)

    def edit(path, fn):
        if not path.is_file():
            sys.exit("build_tools: missing %s" % path)
        text = path.read_text(encoding="utf-8")
        outputs[path] = fn(text, path.relative_to(ROOT).as_posix())

    def home(text, label):
        text = replace_region(text, "districts", home_cards(model), True, label)
        return replace_region(text, "total", str(total), True, label)

    edit(ROOT / "index.html", home)

    def hub(text, label):
        text = replace_region(text, "hub", hub_region(model), True, label)
        return replace_region(text, "total", str(total), True, label)

    edit(ROOT / "tools.html", hub)

    for d in model:
        def page(text, label, d=d):
            text = replace_region(text, "blurb", esc(d["blurb"]), True, label)
            text = replace_region(text, "tools", district_tools_region(d), True, label)
            return replace_region(text, "readmes", district_readmes_region(d), False, label)
        edit(ROOT / d["path"].strip("/") / "index.html", page)

    stale = []
    for path, new in outputs.items():
        old = path.read_text(encoding="utf-8") if path.is_file() else None
        if old != new:
            stale.append(path)

    rels = [p.relative_to(ROOT).as_posix() for p in stale]
    if check:
        if stale:
            print("stale (run python3 scripts/build_tools.py):", file=sys.stderr)
            for r in rels:
                print("  " + r, file=sys.stderr)
            return 1
        print("up to date: %d tools in %d districts" % (total, len(model)))
        return 0
    if dry:
        for r in rels:
            print("would change " + r)
        print("%d tools in %d districts, %d file(s) would change, %d warning(s)" % (total, len(model), len(rels), len(warnings)))
        return 0
    for path in stale:
        path.write_text(outputs[path], encoding="utf-8")
        print("wrote " + path.relative_to(ROOT).as_posix())
    print("%d tools in %d districts, %d file(s) written, %d warning(s)" % (total, len(model), len(stale), len(warnings)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
