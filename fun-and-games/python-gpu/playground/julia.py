"""Julia sets: c follows the pointer. Each position of the pointer is a different set."""
from math import cos, log, sqrt
from pykernel import kernel

# slider iters 20 300 100
# display cyclic 0.04


@kernel
def julia(gid: int, out: list[float], w: int, h: int, mx: float, my: float, t: float, iters: int):
    cr = -0.8 + 0.156 * cos(t * 0.3)
    ci = 0.156
    if mx >= 0.0:
        cr = (mx / float(w)) * 3.0 - 1.5
        ci = (my / float(h)) * 2.0 - 1.0
    x = (float(gid % w) - 0.5 * float(w)) * 3.2 / float(h)
    y = (0.5 * float(h) - float(gid // w)) * 3.2 / float(h)
    k = 0
    while k < iters and x * x + y * y <= 64.0:
        xt = x * x - y * y + cr
        y = 2.0 * x * y + ci
        x = xt
        k += 1
    if k >= iters:
        out[gid] = 0.0
    else:
        out[gid] = float(k) + 1.0 - log(log(sqrt(x * x + y * y))) / log(2.0)
