"""Ripple tank: the 2-D wave equation, one GPU invocation per cell.

Plain Python: math supplies exp, sin and sqrt, and @kernel does nothing at run
time, so CPython can run each kernel cell by cell. pykernel compiles them to WGSL.

State is two height fields, cur and prev. Each step, wave() writes the next
height into prev (each cell reads only its own prev, so the write is safe), and
the host swaps the two buffers. drop() and source() add to cur before a step.
"""
import math
from math import exp, sin, sqrt

from pykernel import kernel


@kernel(workgroup_size=64)
def wave(gid: int, cur: list[float], prev: list[float], wall: list[float],
         w: int, h: int, c2: float, damp: float):
    x = gid % w
    y = gid // w
    c = cur[gid]
    # Neighbours. On the grid edge a missing neighbour is replaced by the cell's
    # own height, so the Laplacian there is one-sided. The sponge takes the energy.
    l = c
    r = c
    u = c
    d = c
    if x > 0:
        l = cur[gid - 1]
    if x < w - 1:
        r = cur[gid + 1]
    if y > 0:
        u = cur[gid - w]
    if y < h - 1:
        d = cur[gid + w]
    lap = l + r + u + d - 4.0 * c
    # Edge sponge, on the time derivative: the outer 24 cells damp the change per
    # step, rising to a full stop at the edge. Damping the velocity, not the height,
    # leaves no checkerboard at the sides. The leapfrog below uses c2 = (c dt/dx)^2,
    # which must be at most 0.5 for 2-D stability; the sponge only adds damping.
    sig = 0.0
    e = min(min(x, w - 1 - x), min(y, h - 1 - y))
    if e < 24:
        k = float(24 - e) / 24.0
        sig = k * k
    # next = 2*cur - prev + c2 * laplacian, with the sponge and the slider's loss.
    nxt = (2.0 * c - (1.0 - sig) * prev[gid] + c2 * lap) / (1.0 + sig) * damp
    # Wall cells hold height 0: a fixed-value boundary, so waves reflect off it.
    if wall[gid] > 0.5:
        nxt = 0.0
    prev[gid] = nxt


@kernel(workgroup_size=64)
def drop(gid: int, cur: list[float], w: int, h: int,
         px: float, py: float, radius: float, amp: float):
    # A smooth Gaussian bump of height amp, centred on (px, py) in cell units.
    dx = float(gid % w) - px
    dy = float(gid // w) - py
    cur[gid] = cur[gid] + amp * exp(-(dx * dx + dy * dy) / (radius * radius))


@kernel(workgroup_size=64)
def source(gid: int, cur: list[float], w: int, h: int, row: int, phase: float, amp: float):
    # A soft source: it adds amp*sin(phase) to one row each step, so waves that
    # reach the row pass through it instead of reflecting. h is unused here; it
    # keeps the uniform layout the same as the other kernels.
    if gid // w == row:
        cur[gid] = cur[gid] + amp * sin(phase)


@kernel(workgroup_size=64)
def shade(gid: int, cur: list[float], wall: list[float], out: list[float], w: int, h: int):
    # Brightness in [0, 1] from the surface slope, lit from the upper left.
    # Walls get a fixed value, 0. A flat surface gives 0.5.
    x = gid % w
    y = gid // w
    if wall[gid] > 0.5:
        out[gid] = 0.0
    else:
        c = cur[gid]
        l = c
        r = c
        u = c
        d = c
        if x > 0:
            l = cur[gid - 1]
        if x < w - 1:
            r = cur[gid + 1]
        if y > 0:
            u = cur[gid - w]
        if y < h - 1:
            d = cur[gid + w]
        # Surface normal of the height field, with the slope scaled by 3 so a
        # gentle ripple still shows. Screen y grows downwards, hence u - d.
        nx = (l - r) * 3.0
        ny = (u - d) * 3.0
        inv = 1.0 / sqrt(nx * nx + ny * ny + 1.0)
        # Light direction towards the upper left, 45 degrees up:
        # (-0.5, -0.5, 0.707). A flat surface gives 0.707 here.
        lit = (nx * -0.5 + ny * -0.5 + 0.707) * inv
        out[gid] = min(1.0, max(0.0, 0.5 + 1.5 * (lit - 0.707)))


# CHECKS: each kernel on a small grid with fixed, non-trivial inputs. Each value is
# a formula of the index, and build.py runs every invocation in CPython to make the
# reference. The grid is 52 x 34: the 24-cell sponge leaves a narrow interior.
W, H = 52, 34
N = W * H
_X = [i % W for i in range(N)]
_Y = [i // W for i in range(N)]
# Wall with two gaps, to test the wall branch of wave() and shade().
_WALL = [1.0 if (y == 30 and not (24 <= x < 28 or 32 <= x < 36)) else 0.0
         for x, y in zip(_X, _Y)]
_CUR = [0.6 * math.sin(0.23 * x + 0.1 * y) * math.cos(0.17 * y) for x, y in zip(_X, _Y)]
_PREV = [0.5 * math.sin(0.31 * x - 0.2 * y) for x, y in zip(_X, _Y)]

# f32 against f64: a few steps of arithmetic on values of order 1 lose about 1e-6,
# well inside the 1e-4 tolerance, so every cell must agree.
CHECKS = {
    "wave": {
        "count": N,
        "uniforms": {"w": W, "h": H, "c2": 0.25, "damp": 0.998},
        "buffers": {"cur": _CUR, "prev": _PREV, "wall": _WALL},
        "expect": ["prev"],
        "tol": 1e-4,
        "min_frac": 1.0,
    },
    "drop": {
        "count": N,
        "uniforms": {"w": W, "h": H, "px": 17.5, "py": 9.25, "radius": 4.0, "amp": 0.75},
        "buffers": {"cur": _CUR},
        "expect": ["cur"],
        "tol": 1e-4,
        "min_frac": 1.0,
    },
    "source": {
        "count": N,
        "uniforms": {"w": W, "h": H, "row": 7, "phase": 0.7, "amp": 0.9},
        "buffers": {"cur": _CUR},
        "expect": ["cur"],
        "tol": 1e-4,
        "min_frac": 1.0,
    },
    "shade": {
        "count": N,
        "uniforms": {"w": W, "h": H},
        "buffers": {"cur": _CUR, "wall": _WALL, "out": [0.0] * N},
        "expect": ["out"],
        "tol": 1e-4,
        "min_frac": 1.0,
    },
}
