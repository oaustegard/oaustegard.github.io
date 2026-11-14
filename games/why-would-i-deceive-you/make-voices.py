#!/usr/bin/env python3
"""Regenerate voices.mp3 and the VOX table in index.html from the lines in index.html.

Needs: pip install kokoro-onnx soundfile numpy; node and ffmpeg on PATH; and the two Kokoro files
from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
(kokoro-v1.0.onnx, voices-v1.0.bin) in the directory given as the first argument.

    python3 make-voices.py /path/to/kokoro-files
"""
import json, pathlib, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

HERE = pathlib.Path(__file__).parent
PAGE = HERE / "index.html"
SR = 24000

# The page's own arrays say who speaks what: Nathan's questions, probes and verdicts, Elizabeth's claims.
EXTRACT = r"""
const s = require('fs').readFileSync(process.argv[1], 'utf8');
const block = s.slice(s.indexOf('/* ===== SCRIPT ===== */'), s.indexOf('/* ===== SMALL TOOLS ===== */'));
const c = new Function(block + '; return {NATHAN_ASKS, NATHAN_PROBES, NATHAN_CAUGHT, SHE_SAYS};')();
const L = [];
for (const [q] of c.NATHAN_ASKS) L.push(['nathan', q]);
for (const p of c.NATHAN_PROBES) L.push(['nathan', p]);
for (const x of Object.values(c.NATHAN_CAUGHT)) L.push(['nathan', x]);
L.push(['nathan', "I think you're deceiving me."], ['nathan', 'Okay. All right. Okay, good chat.']);
for (const x of c.SHE_SAYS) L.push(['elizabeth', x]);
L.push(['elizabeth', 'Why would I deceive you?']);
console.log(JSON.stringify(L));
"""


def trim(x):
    """Cut the silence Kokoro leaves at both ends, keep a short tail, fade the edges."""
    loud = np.where(np.abs(x) > 0.012)[0]
    x = x[max(0, loud[0] - int(0.03 * SR)):min(len(x), loud[-1] + int(0.08 * SR))].copy()
    f = int(0.008 * SR)
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return x


def main(models):
    lines = json.loads(subprocess.run(["node", "-e", EXTRACT, str(PAGE)], check=True, capture_output=True, text=True).stdout)
    k = Kokoro(str(models / "kokoro-v1.0.onnx"), str(models / "voices-v1.0.bin"))
    style = k.get_voice_style
    voices = {
        "nathan": (style("am_michael").astype(np.float32), 0.95),
        # her low register: three parts af_kore to one part am_onyx, median pitch about 125 Hz
        "elizabeth": ((0.75 * style("af_kore") + 0.25 * style("am_onyx")).astype(np.float32), 0.92),
    }
    parts, table = [np.zeros(int(0.2 * SR), np.float32)], {}
    gap = np.zeros(int(0.3 * SR), np.float32)          # room between clips, so a decoder's offset cannot bleed
    for who, text in lines:
        voice, speed = voices[who]
        x, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
        assert sr == SR
        x = trim(x.astype(np.float32))
        x *= 0.13 / np.sqrt((x ** 2).mean())           # one loudness for every clip
        x = np.tanh(x / 0.9) * 0.9                     # soft limit instead of clipping
        table[text] = [round(sum(len(p) for p in parts) / SR, 3), round(len(x) / SR, 3)]
        parts += [x, gap]
    with tempfile.TemporaryDirectory() as tmp:
        wav = pathlib.Path(tmp) / "voices.wav"
        sf.write(wav, np.concatenate(parts), SR)
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-ac", "1", "-ar", str(SR),
                        "-c:a", "libmp3lame", "-q:a", "6", str(HERE / "voices.mp3")], check=True)
    page = PAGE.read_text()
    new = "const VOX = " + json.dumps(table, ensure_ascii=False, separators=(",", ":")) + ";"
    page, n = re.subn(r"const VOX = \{.*?\};", lambda m: new, page, count=1)
    assert n == 1, "VOX table not found in index.html"
    PAGE.write_text(page)
    print(f"{len(table)} clips, {sum(len(p) for p in parts) / SR:.1f} s")


if __name__ == "__main__":
    main(pathlib.Path(sys.argv[1]))
