"""Mandelbrot, zooming into Seahorse Valley with the zoom slider."""
from math import log, sqrt
from pykernel import kernel

# slider zoom 0 12 0
# slider iters 20 400 120
# display cyclic 0.03


@kernel
def escape(gid: int, out: list[float], w: int, h: int, zoom: float, iters: int):
    scale = 3.0 / float(h) / pow(2.0, zoom)
    x0 = -0.7436 + (float(gid % w) - 0.5 * float(w)) * scale
    y0 = 0.1318 + (0.5 * float(h) - float(gid // w)) * scale
    x = 0.0
    y = 0.0
    k = 0
    while k < iters and x * x + y * y <= 256.0:
        xt = x * x - y * y + x0
        y = 2.0 * x * y + y0
        x = xt
        k += 1
    if k >= iters:
        out[gid] = 0.0
    else:
        out[gid] = float(k) + 1.0 - log(log(sqrt(x * x + y * y))) / log(2.0)
