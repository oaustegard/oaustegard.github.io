"""Plasma: every pixel is a sum of sine waves drifting with time t.

Each frame runs every kernel once per cell. The buffer called out is what you see.
w, h, t, frame, mx, my and mdown are filled in for you; other numbers become sliders.
"""
from math import sin, sqrt
from pykernel import kernel

# slider speed 0 4 1
# slider scale 1 20 6
# display 0 1


@kernel
def plasma(gid: int, out: list[float], w: int, h: int, t: float, speed: float, scale: float):
    x = float(gid % w) / float(h) * scale
    y = float(gid // w) / float(h) * scale
    s = t * speed
    v = sin(x + s) + sin(y * 0.8 - s * 1.3) + sin((x + y) * 0.6 + s * 0.7)
    cx = x - scale * 0.5 + sin(s * 0.4) * 2.0
    cy = y - scale * 0.5 + sin(s * 0.3) * 2.0
    v += sin(sqrt(cx * cx + cy * cy + 1.0) * 1.7 - s)
    out[gid] = 0.5 + 0.125 * v
