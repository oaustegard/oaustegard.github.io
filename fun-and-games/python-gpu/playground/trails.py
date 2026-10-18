"""Ink trails: the pointer deposits ink, every cell spreads a little to its
neighbours and fades. Move the pointer over the canvas; press for a bigger brush."""
from math import exp
from pykernel import kernel

# slider fade 0.9 1 0.985
# slider spread 0 1 0.6
# display 0 1


@kernel
def blur(gid: int, ink: list[float], tmp: list[float], w: int, h: int, spread: float):
    x = gid % w
    y = gid // w
    s = ink[y * w + (x + 1) % w] + ink[y * w + (x + w - 1) % w]
    s += ink[((y + 1) % h) * w + x] + ink[((y + h - 1) % h) * w + x]
    tmp[gid] = ink[gid] * (1.0 - spread) + s * 0.25 * spread


@kernel
def deposit(gid: int, ink: list[float], tmp: list[float], out: list[float], w: int,
            mx: float, my: float, mdown: int, fade: float, t: float):
    dx = float(gid % w) - mx
    dy = float(gid // w) - my
    r = 6.0
    if mdown == 1:
        r = 18.0
    v = tmp[gid] * fade
    if mx >= 0.0:
        v += 0.35 * exp(-(dx * dx + dy * dy) / (r * r))
    ink[gid] = min(v, 4.0)
    out[gid] = 1.0 - exp(-ink[gid])
