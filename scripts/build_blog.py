#!/usr/bin/env python3
"""
build_blog.py — Generate feed.xml, blog/index.html and the latest-posts region of
index.html from blog post meta tags.

Scans blog/*.html for <meta> tags defined in the template contract:
  - article:published_time (required for inclusion)
  - article:author
  - article:summary (falls back to description, then og:description)
  - og:title (falls back to <title>)
  - og:description
  - og:image

Skips: redirect stubs (http-equiv="refresh"), _template.html, index.html

Generated regions of index.html sit between <!--gen:latest-posts--> and
<!--/gen:latest-posts-->; everything outside the markers is left alone.

Usage:
  python3 scripts/build_blog.py              # uses blog/_config.json
  python3 scripts/build_blog.py --dry-run    # print what would change, don't write
  python3 scripts/build_blog.py --check      # write nothing; exit 1 and list stale files

Standard library only (the CI step that runs it installs nothing).
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path


# ── HTML meta tag parser ───────────────────────────────────────────

class MetaExtractor(HTMLParser):
    """Extract meta tags and <title> from an HTML <head>."""

    def __init__(self):
        super().__init__()
        self.meta = {}
        self.title = ""
        self._in_title = False
        self._in_head = True
        self.is_redirect = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "title":
            self._in_title = True
        if tag == "body":
            self._in_head = False
        if tag != "meta" or not self._in_head:
            return
        # Detect redirects
        if a.get("http-equiv", "").lower() == "refresh":
            self.is_redirect = True
        # name-based meta
        name = a.get("name", "")
        if name and "content" in a:
            self.meta[name] = a["content"]
        # property-based meta (og:*)
        prop = a.get("property", "")
        if prop and "content" in a:
            self.meta[prop] = a["content"]

    def handle_data(self, data):
        if self._in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False


def extract_meta(filepath):
    """Extract metadata dict from a blog post HTML file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    parser = MetaExtractor()
    parser.feed(content)
    if parser.is_redirect:
        return None

    m = parser.meta
    title = m.get("og:title", "").strip() or parser.title.strip()
    if not title:
        return None

    # published_time: from meta tag, or try to parse from post-meta text
    pub = m.get("article:published_time", "")
    if not pub:
        # Fallback: parse date from .post-meta or .post-date text
        date_match = re.search(
            r'class="(?:post-(?:meta|date)|byline)"[^>]*>.*?'
            r'(\w+ \d{1,2},\s*\d{4}|'          # "March 21, 2026"
            r'\d{4}-\d{2}-\d{2})',               # "2026-03-21"
            content, re.DOTALL | re.IGNORECASE
        )
        if date_match:
            raw = date_match.group(1).strip()
            for fmt in ("%B %d, %Y", "%b %d, %Y", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
                    pub = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                    break
                except ValueError:
                    continue

    if not pub:
        return None  # Can't include in feed without a date

    # Summary cascade: article:summary → description → og:description → first paragraph
    summary = (
        m.get("article:summary", "").strip()
        or m.get("description", "").strip()
        or m.get("og:description", "").strip()
    )
    # Clean any HTML tags that leaked into description
    if summary:
        summary = re.sub(r"<[^>]+>", "", summary).strip()
        # Truncate at 300 chars
        if len(summary) > 300:
            summary = summary[:297] + "..."

    author = m.get("article:author", "").strip()
    og_image = m.get("og:image", "").strip()

    return {
        "title": title,
        "published": pub,
        "summary": summary,
        "author": author,
        "og_image": og_image,
        "filename": os.path.basename(filepath),
    }


# ── Feed generation ────────────────────────────────────────────────

def generate_feed(posts, config, updated=None):
    """Generate Atom feed XML. `updated` defaults to the current time."""
    now = updated or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    base = config["base_url"].rstrip("/")
    feed_url = f"{base}/feed.xml"

    lines = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        f"  <title>{escape(config['title'])}</title>",
    ]
    if config.get("subtitle"):
        lines.append(f"  <subtitle>{escape(config['subtitle'])}</subtitle>")
    lines += [
        f'  <link href="{feed_url}" rel="self" type="application/atom+xml"/>',
        f'  <link href="{base}/" rel="alternate" type="text/html"/>',
        f"  <id>{base}/</id>",
        f"  <updated>{now}</updated>",
        f"  <author><name>{escape(config['default_author'])}</name></author>",
    ]
    if config.get("icon"):
        lines.append(f"  <icon>{base}{config['icon']}</icon>")

    for p in posts:
        url = f"{base}/blog/{p['filename']}"
        author_el = ""
        if p["author"] and p["author"] != config["default_author"]:
            author_el = f"\n    <author><name>{escape(p['author'])}</name></author>"
        summary_el = ""
        if p["summary"]:
            summary_el = f"\n    <summary>{escape(p['summary'])}</summary>"
        lines += [
            "",
            "  <entry>",
            f"    <title>{escape(p['title'])}</title>",
            f'    <link href="{url}" rel="alternate" type="text/html"/>',
            f"    <id>{url}</id>",
            f"    <published>{p['published']}</published>",
            f"    <updated>{p['published']}</updated>",
            f"{summary_el}{author_el}",
            "  </entry>",
        ]

    lines += ["", "</feed>", ""]
    return "\n".join(lines)


# ── HTML fragments ─────────────────────────────────────────────────

HOME_REGION = "latest-posts"
HOME_COUNT = 3

SHEET_BAR = """<header class="sheet-bar">
  <div class="in">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/"><b lang="nb">Kartblad</b> Flat&oslash;y</a><span class="sep" aria-hidden="true">/</span><span aria-current="page">Blog</span></nav>
    <p class="coords">60.537&deg; N 5.269&deg; E</p>
  </div>
</header>"""

FOOTER = """<footer class="site-foot">
  <div class="in">
    <div class="foot-row">
      <p><a href="/">austegard.com</a> &middot; <a href="/tools.html">Tools</a> &middot; <a href="/blog/">Blog</a> &middot; <a href="/feed.xml">Feed</a></p>
      <p class="attrib">Kartdata &copy; Kartverket (CC BY 4.0)</p>
    </div>
  </div>
</footer>"""


def text(s):
    """Escape for HTML text (quotes stay readable)."""
    return escape(s, quote=False)


def long_date(published):
    """'2026-07-17T00:00:00Z' -> '17 July 2026' (no locale, no %-d)."""
    d = datetime.fromisoformat(published.replace("Z", "+00:00"))
    return f"{d.day} {d.strftime('%B')} {d.year}"


def usable_summary(summary):
    """Several posts have a description that is the start of the body with its tags
    stripped and '...' appended (about 200 characters). That is not a summary; show
    nothing instead. A real summary cut by this script is exactly 300 characters."""
    if not summary:
        return ""
    if summary.endswith("...") and len(summary) < 300:
        return ""
    return summary


def entry_html(p, indent):
    """One trail-log entry (SNIPPETS section 7), indented by `indent` spaces."""
    pad = " " * indent
    lines = [
        f'{pad}<li class="entry">',
        f'{pad}  <time datetime="{p["published"][:10]}">{long_date(p["published"])}</time>',
        f'{pad}  <h3><a href="/blog/{p["filename"]}">{text(p["title"])}</a></h3>',
    ]
    summary = usable_summary(p["summary"])
    if summary:
        lines.append(f"{pad}  <p>{text(summary)}</p>")
    lines.append(f"{pad}</li>")
    return "\n".join(lines)


# ── Index generation ───────────────────────────────────────────────

def generate_index(posts, config):
    """Generate blog/index.html: band page, trail log of every post, newest first."""
    entries = "\n".join(entry_html(p, 6) for p in posts)

    tail = []
    if config.get("sister_blog"):
        tail.append(f'      <p class="sister-blog">{config["sister_blog"]["text"]}</p>')
    if config.get("provenance"):
        tail.append(f'      <p class="provenance">{config["provenance"]}</p>')
    tail_html = ""
    if tail:
        tail_html = '\n    <div class="tail">\n' + "\n".join(tail) + "\n    </div>"

    subtitle = text(config.get("subtitle", ""))
    title = text(config["index_title"])
    feed_title = escape(config["title"])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="ai-disclosure" content="ai-assisted">
<title>{title}</title>
<meta name="description" content="{escape(config.get('subtitle', ''))}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f0f1eb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#12140f" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/fraunces-roman.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/dm-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles/style.css">
<link rel="stylesheet" href="/styles/blog.css">
<link rel="alternate" type="application/atom+xml" title="{feed_title}" href="/feed.xml">
</head>
<body class="blog-index" data-sheet="band" style="--band-h:200px">
<a class="skip" href="#main">Skip to the content</a>
{SHEET_BAR}
<main id="main">
  <div class="in">
    <header class="page-head">
      <span class="plate-img" aria-hidden="true"></span>
      <p class="kicker"><b lang="nb">Turlogg</b> &middot; Trail log</p>
      <h1>{text(config['index_heading'])}</h1>
      <p class="lede">{subtitle}</p>
      <p class="feed-link"><a class="arr" href="/feed.xml">Atom feed</a></p>
    </header>

    <ol class="trail">
{entries}
    </ol>{tail_html}
  </div>
</main>
{FOOTER}
</body>
</html>
"""


# ── Generated regions ──────────────────────────────────────────────

def replace_region(src, name, inner):
    """Replace everything between <!--gen:NAME--> and <!--/gen:NAME--> with `inner`
    (on its own lines). Returns None when the marker pair is missing."""
    pat = re.compile(r"(<!--gen:%s-->)(.*?)(<!--/gen:%s-->)" % (re.escape(name), re.escape(name)), re.S)
    if not pat.search(src):
        return None
    return pat.sub(lambda m: m.group(1) + "\n" + inner + "\n" + m.group(3), src, count=1)


# ── Main ───────────────────────────────────────────────────────────

def main():
    args = set(sys.argv[1:])
    dry_run = "--dry-run" in args
    check = "--check" in args
    unknown = args - {"--dry-run", "--check"}
    if unknown:
        print(f"ERROR: unknown option(s): {' '.join(sorted(unknown))}", file=sys.stderr)
        sys.exit(2)

    root = Path(__file__).resolve().parent.parent
    config_path = root / "blog" / "_config.json"
    if not config_path.exists():
        print(f"ERROR: {config_path} not found", file=sys.stderr)
        sys.exit(2)

    with open(config_path, encoding="utf-8") as f:
        config = json.load(f)

    # Scan blog posts
    blog_dir = root / "blog"
    skip = {"index.html", "_template.html", "_config.json"}
    posts = []
    skipped = []

    for html_file in sorted(blog_dir.glob("*.html")):
        if html_file.name in skip or html_file.name.startswith("_"):
            continue
        meta = extract_meta(html_file)
        if meta is None:
            skipped.append(html_file.name)
            continue
        posts.append(meta)

    # Sort by published date, newest first
    posts.sort(key=lambda p: p["published"], reverse=True)

    print(f"Found {len(posts)} posts, skipped {len(skipped)} (redirects/undated)")
    if skipped:
        print(f"  Skipped: {', '.join(skipped[:10])}" + ("..." if len(skipped) > 10 else ""))

    outputs = {}  # path -> new content

    # feed.xml: <updated> is the build time, so keep the old one while nothing else changes
    feed_path = root / "feed.xml"
    old_feed = feed_path.read_text(encoding="utf-8") if feed_path.exists() else ""
    old_updated = re.search(r"<updated>([^<]*)</updated>", old_feed)
    feed_xml = generate_feed(posts, config, updated=old_updated.group(1) if old_updated else None)
    if feed_xml != old_feed:
        feed_xml = generate_feed(posts, config)
    outputs[feed_path] = feed_xml

    outputs[blog_dir / "index.html"] = generate_index(posts, config)

    # index.html: the latest-posts region only
    home_path = root / "index.html"
    home_src = home_path.read_text(encoding="utf-8")
    region = "\n".join(entry_html(p, 6) for p in posts[:HOME_COUNT])
    home_new = replace_region(home_src, HOME_REGION, region)
    if home_new is None:
        print(f"ERROR: <!--gen:{HOME_REGION}--> markers not found in {home_path}", file=sys.stderr)
        sys.exit(2)
    outputs[home_path] = home_new

    stale = []
    for path, content in outputs.items():
        old = path.read_text(encoding="utf-8") if path.exists() else ""
        if old != content:
            stale.append(path)

    rel = lambda p: str(p.relative_to(root))

    if check:
        if stale:
            print("Stale (run scripts/build_blog.py):")
            for p in stale:
                print(f"  {rel(p)}")
            sys.exit(1)
        print("All generated files are up to date.")
        return

    if dry_run:
        for path, content in outputs.items():
            state = "would change" if path in stale else "unchanged"
            print(f"  {state}: {rel(path)} ({len(content)} bytes)")
        for path in stale:
            if path.name == "index.html" and path.parent == root:
                print(f"\n--- {rel(path)}: {HOME_REGION} region ---\n{region}")
        return

    for path, content in outputs.items():
        if path in stale:
            path.write_text(content, encoding="utf-8")
            print(f"  Updated: {rel(path)}")
        else:
            print(f"  Unchanged: {rel(path)}")

    if stale:
        print(f"\nChanged files: {', '.join(rel(p) for p in stale)}")
    else:
        print("\nNo changes needed.")


if __name__ == "__main__":
    main()
