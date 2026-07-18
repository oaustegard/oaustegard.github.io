#!/usr/bin/env python3
"""Derive Motion Player app icons from Gemini-generated source art.

The canonical 1024x1024 art lives at icons/icon-source.png (committed).
This script downscales it into the four PWA icon files. If the source is
missing, it is regenerated with a Gemini image call routed through the
Cloudflare AI Gateway (requires CF_ACCOUNT_ID, CF_GATEWAY_ID, CF_API_TOKEN
in the environment; the Google API key is stored gateway-side).

Usage (from motion-player/):
    python3 scripts/make_icons.py

Requires Pillow for resizing: pip install pillow
"""
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "icons"
SOURCE = ICONS / "icon-source.png"

PROMPT = (
    "Design a minimal flat app icon, exactly square, for a mobile video "
    "player app called Motion Player. Composition: a near-black background "
    "(#0b0d12) filling the entire canvas edge to edge, a solid bright "
    "sky-blue (#38bdf8) play triangle (pointing right) centered optically, "
    "encircled by a broken teal (#5eead4) arc ring (about 300 degrees, with "
    "a clean gap) that suggests rotation and gyroscopic motion. Flat vector "
    "style, crisp edges, no gradients, no text, no bevels, no drop shadows, "
    "no border. The subject must sit comfortably within the central 70% of "
    "the canvas."
)


def generate_source():
    account = os.environ["CF_ACCOUNT_ID"]
    gateway = os.environ["CF_GATEWAY_ID"]
    token = os.environ["CF_API_TOKEN"]
    url = (
        f"https://gateway.ai.cloudflare.com/v1/{account}/{gateway}"
        "/google-ai-studio/v1beta/models/gemini-2.5-flash-image:generateContent"
    )
    body = json.dumps({
        "contents": [{"parts": [{"text": PROMPT}]}],
        "generationConfig": {"responseModalities": ["IMAGE"]},
    }).encode()
    req = urllib.request.Request(url, data=body, headers={
        "Content-Type": "application/json",
        "cf-aig-authorization": f"Bearer {token}",
    })
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.load(resp)
    b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
    SOURCE.write_bytes(base64.b64decode(b64))
    print(f"generated {SOURCE} via Gemini")


def derive():
    src = Image.open(SOURCE).convert("RGB")
    for name, size in [
        ("icon-512.png", 512),
        ("icon-192.png", 192),
        ("maskable-512.png", 512),  # art sits well inside the 80% safe zone
        ("apple-touch-icon.png", 180),  # opaque; iOS applies its own mask
    ]:
        out = ICONS / name
        src.resize((size, size), Image.LANCZOS).save(out, optimize=True)
        print(f"wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    if not SOURCE.exists():
        generate_source()
    derive()
    sys.exit(0)
