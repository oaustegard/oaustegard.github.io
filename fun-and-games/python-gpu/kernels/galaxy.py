"""Colliding galaxies: softened n-body gravity, one GPU invocation per body.

accel() sums the pull of every body on body gid and updates that body's velocity.
It reads all positions and masses but writes only vx[gid] and vy[gid], so no two
invocations touch the same element and the step needs no synchronisation. drift()
then moves each body by its velocity. The page runs accel and drift in turn,
several substeps per frame.

Plain Python: sqrt comes from math, and @kernel does nothing at run time, so
CPython can run both functions body by body. pykernel compiles them to WGSL.
"""
from math import sqrt

from pykernel import kernel


@kernel(workgroup_size=64)
def accel(gid: int, x: list[float], y: list[float], vx: list[float], vy: list[float],
          mass: list[float], n: int, dt: float, soft: float, g: float):
    xi = x[gid]
    yi = y[gid]
    e2 = soft * soft
    ax = 0.0
    ay = 0.0
    for j in range(0, n):
        dx = x[j] - xi
        dy = y[j] - yi
        s = dx * dx + dy * dy + e2
        f = g * mass[j] / (s * sqrt(s))
        ax += f * dx
        ay += f * dy
    vx[gid] += ax * dt
    vy[gid] += ay * dt


@kernel(workgroup_size=64)
def drift(gid: int, x: list[float], y: list[float], vx: list[float], vy: list[float], dt: float):
    x[gid] += vx[gid] * dt
    y[gid] += vy[gid] * dt


# Check input: 64 bodies whose positions, velocities and masses are a formula of the
# index. No random, so CPython and the GPU see the same numbers.
N = 64


def _unit(i, salt):
    """Deterministic value in [0, 1) from an index and a salt."""
    return (i * 0.6180339887 + salt * 0.7548776662) % 1.0


X0 = [4.0 * _unit(i, 1) - 2.0 for i in range(N)]
Y0 = [4.0 * _unit(i, 2) - 2.0 for i in range(N)]
VX0 = [0.8 * (_unit(i, 3) - 0.5) for i in range(N)]
VY0 = [0.8 * (_unit(i, 4) - 0.5) for i in range(N)]
M0 = [0.5 + _unit(i, 5) for i in range(N)]

CHECKS = {
    "accel": {
        "count": N,
        # dt is large enough that a dropped or wrong dt would move vx well beyond tol
        "uniforms": {"n": N, "dt": 0.25, "soft": 0.2, "g": 1.0},
        "buffers": {"x": X0, "y": Y0, "vx": VX0, "vy": VY0, "mass": M0},
        "expect": ["vx", "vy"],
        # f32 sums of 64 softened terms against f64; the worst term is bounded by 1/soft^2
        "tol": 1e-3,
        "min_frac": 1.0,
    },
    "drift": {
        "count": N,
        "uniforms": {"dt": 0.25},
        "buffers": {"x": X0, "y": Y0, "vx": VX0, "vy": VY0},
        "expect": ["x", "y"],
        "tol": 1e-3,
        "min_frac": 1.0,
    },
}
