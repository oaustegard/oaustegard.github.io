#!/usr/bin/env python3
"""
build_blog.py — Generate feed.xml and blog/index.html from blog post meta tags.

Scans blog/*.html for <meta> tags defined in the template contract:
  - article:published_time (required for inclusion)
  - article:author
  - article:summary (falls back to description, then og:description)
  - og:title (falls back to <title>)
  - og:description
  - og:image

Skips: redirect stubs (http-equiv="refresh"), _template.html, index.html

Usage:
  python3 scripts/build_blog.py              # uses blog/_config.json
  python3 scripts/build_blog.py --dry-run    # print what would change, don't write
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
            r'class="post-(?:meta|date)"[^>]*>.*?'
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

def generate_feed(posts, config):
    """Generate Atom feed XML."""
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
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


# ── Index generation ───────────────────────────────────────────────

def generate_index(posts, config):
    """Generate blog/index.html."""
    base = config["base_url"].rstrip("/")

    # Build post list HTML
    post_items = []
    for p in posts:
        date_obj = datetime.fromisoformat(p["published"].replace("Z", "+00:00"))
        date_str = date_obj.strftime("%B %-d, %Y")
        summary_html = ""
        if p["summary"]:
            summary_html = f'\n            <p class="post-desc">{escape(p["summary"])}</p>'
        post_items.append(
            f'        <li>\n'
            f'            <a href="{p["filename"]}">{escape(p["title"])}</a>\n'
            f'            <span class="post-date">{date_str}</span>'
            f'{summary_html}\n'
            f'        </li>'
        )

    post_list = "\n".join(post_items)

    # Hero image block (muninn has one, austegard doesn't)
    hero_html = ""
    if config.get("hero_image"):
        hero_html = (
            f'    <img src="{config["hero_image"]}" '
            f'alt="{escape(config.get("hero_alt", ""))}" class="blog-hero">\n'
        )

    # Sister blog link (austegard → muninn, or vice versa)
    sister_html = ""
    if config.get("sister_blog"):
        s = config["sister_blog"]
        sister_html = f'\n    <p class="sister-blog">{s["text"]}</p>'

    # Provenance footer (austegard has one)
    provenance_html = ""
    if config.get("provenance"):
        provenance_html = f'\n    <p class="provenance">{config["provenance"]}</p>'

    # Site footer (muninn has one)
    footer_html = ""
    if config.get("footer"):
        footer_html = f"\n    {config['footer']}"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(config['index_title'])}</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="stylesheet" href="/styles/style.css">
    <link rel="stylesheet" href="/styles/blog.css">
    <link rel="alternate" type="application/atom+xml" title="{escape(config['title'])}" href="/feed.xml">
    <style>
        .blog-hero {{
            width: 100%;
            height: auto;
            margin-bottom: 1.5em;
            border: 3px solid var(--rule, #d5cfc3);
            box-shadow: 0 2px 12px rgba(43, 58, 103, 0.12);
        }}
        .blog-subtitle {{
            color: var(--muted, #8b8577);
            margin-bottom: 0.5em;
        }}
        .feed-link {{
            font-size: 0.85em;
            margin-bottom: 2em;
            display: block;
        }}
        .feed-link a {{
            color: var(--sage, #7a9e7e);
        }}
        .post-list {{ list-style: none; padding: 0; }}
        .post-list li {{ margin-bottom: 1.5em; }}
        .post-list a {{ font-size: 1.1em; font-weight: 600; }}
        .post-date {{ display: block; font-size: 0.85em; color: var(--muted, #666); margin-top: 0.15em; }}
        .post-desc {{ font-size: 0.95em; margin-top: 0.25em; }}
        .provenance {{ font-size: 0.9em; color: var(--muted, #666); margin-top: 2em; }}
        .sister-blog {{ font-size: 0.95em; margin-top: 2em; padding-top: 1em; border-top: 1px solid var(--rule, #ddd); }}
    </style>
</head>
<body>
    <a href="/" class="back-link">Home</a>
{hero_html}    <h1>{escape(config['index_heading'])}</h1>
    <p class="blog-subtitle">{escape(config.get('subtitle', ''))}</p>
    <span class="feed-link"><a href="/feed.xml">Atom feed</a></span>

    <ul class="post-list">
{post_list}
    </ul>{sister_html}{provenance_html}{footer_html}
</body>
</html>
"""


# ── Main ───────────────────────────────────────────────────────────

def main():
    dry_run = "--dry-run" in sys.argv

    # Find config
    root = Path(".")
    config_path = root / "blog" / "_config.json"
    if not config_path.exists():
        print(f"ERROR: {config_path} not found", file=sys.stderr)
        sys.exit(1)

    with open(config_path) as f:
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

    # Generate feed
    feed_xml = generate_feed(posts, config)
    feed_path = root / "feed.xml"

    # Generate index
    index_html = generate_index(posts, config)
    index_path = blog_dir / "index.html"

    if dry_run:
        print(f"\n--- feed.xml ({len(feed_xml)} bytes) ---")
        print(feed_xml[:800] + "\n...")
        print(f"\n--- blog/index.html ({len(index_html)} bytes) ---")
        print(index_html[:800] + "\n...")
        return

    # Write files
    changed = []

    for path, content in [(feed_path, feed_xml), (index_path, index_html)]:
        old = path.read_text(encoding="utf-8") if path.exists() else ""
        if old != content:
            path.write_text(content, encoding="utf-8")
            changed.append(str(path))
            print(f"  Updated: {path}")
        else:
            print(f"  Unchanged: {path}")

    if changed:
        print(f"\nChanged files: {', '.join(changed)}")
    else:
        print("\nNo changes needed.")

    return changed


if __name__ == "__main__":
    main()
