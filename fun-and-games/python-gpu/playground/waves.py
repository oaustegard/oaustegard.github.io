"""Waves: the wave equation on a grid. Press to drop a stone.

Two buffers hold the current and previous heights; wave() writes the next height
over the previous one, and flip() swaps their roles by copying."""
from math import exp
from pykernel import kernel

# slider damping 0.98 1 0.997
# steps 2
# display 0 1


@kernel
def wave(gid: int, cur: list[float], prev: list[float], w: int, h: int,
         mx: float, my: float, mdown: int, damping: float):
    x = gid % w
    y = gid // w
    if x == 0 or y == 0 or x == w - 1 or y == h - 1:
        prev[gid] = 0.0
    else:
        lap = cur[gid - 1] + cur[gid + 1] + cur[gid - w] + cur[gid + w] - 4.0 * cur[gid]
        nxt = (2.0 * cur[gid] - prev[gid] + 0.45 * lap) * damping
        dx = float(x) - mx
        dy = float(y) - my
        if mdown == 1:
            nxt += 0.4 * exp(-(dx * dx + dy * dy) / 12.0)
        prev[gid] = nxt


@kernel
def flip(gid: int, cur: list[float], prev: list[float], tmp: list[float], out: list[float], w: int):
    tmp[gid] = cur[gid]
    cur[gid] = prev[gid]
    prev[gid] = tmp[gid]
    # shade by slope: light from the upper left
    slope = 0.0
    if gid > w:
        slope = cur[gid] - cur[gid - w - 1]
    out[gid] = 0.5 + 4.0 * slope
