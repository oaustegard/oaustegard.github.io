"""Mandelbrot explorer: one GPU invocation per pixel.

Plain Python: math supplies log and sqrt, and @kernel does nothing at run time,
so CPython can run escape() pixel by pixel. pykernel compiles it to WGSL.
"""
from math import log, sqrt

from pykernel import kernel


@kernel(workgroup_size=64)
def escape(gid: int, out: list[float], w: int, h: int,
           cx: float, cy: float, scale: float, max_iter: int):
    px = gid % w
    py = gid // w
    x0 = cx + (float(px) - 0.5 * float(w)) * scale
    y0 = cy + (0.5 * float(h) - float(py)) * scale
    x = 0.0
    y = 0.0
    x2 = 0.0
    y2 = 0.0
    k = 0
    while k < max_iter and x2 + y2 <= 256.0:
        y = 2.0 * x * y + y0
        x = x2 - y2 + x0
        x2 = x * x
        y2 = y * y
        k += 1
    if k >= max_iter:
        out[gid] = -1.0
    else:
        # smooth iteration count: removes the colour bands between whole k
        out[gid] = float(k) + 1.0 - log(log(sqrt(x2 + y2))) / log(2.0)


W, H = 48, 32
CHECKS = {
    "escape": {
        "count": W * H,
        "uniforms": {"w": W, "h": H, "cx": -0.6, "cy": 0.0, "scale": 2.6 / W, "max_iter": 200},
        "buffers": {"out": [0.0] * (W * H)},
        "expect": ["out"],
        # f32 against f64: a pixel on the set's edge can escape one step apart
        "tol": 1e-2,
        "min_frac": 0.97,
    },
}
