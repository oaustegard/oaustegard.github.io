"""Conway's Game of Life. init seeds the grid once; step and copy run every frame.

Hold the pointer down to draw live cells.
"""
from math import floor, sin
from pykernel import kernel

# steps 1
# display 0 1


@kernel
def init(gid: int, cells: list[float], w: int):
    # a cheap hash of the cell index: the fractional part of a large sine
    r = sin(float(gid % w) * 12.9898 + float(gid // w) * 78.233) * 43758.5453
    if r - float(floor(r)) > 0.7:
        cells[gid] = 1.0


@kernel
def step(gid: int, cells: list[float], nxt: list[float], w: int, h: int):
    x = gid % w
    y = gid // w
    n = 0
    for dy in range(-1, 2):
        for dx in range(-1, 2):
            if dx != 0 or dy != 0:
                n += int(cells[((y + dy + h) % h) * w + (x + dx + w) % w])
    alive = cells[gid] > 0.5
    if n == 3 or (alive and n == 2):
        nxt[gid] = 1.0
    else:
        nxt[gid] = 0.0


@kernel
def copy(gid: int, cells: list[float], nxt: list[float], w: int, mx: float, my: float, mdown: int):
    dx = float(gid % w) - mx
    dy = float(gid // w) - my
    if mdown == 1 and dx * dx + dy * dy < 9.0:
        cells[gid] = 1.0
    else:
        cells[gid] = nxt[gid]
