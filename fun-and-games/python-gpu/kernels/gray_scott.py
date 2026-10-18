"""Gray-Scott reaction-diffusion: one GPU invocation per grid cell.

Two chemicals, u (food) and v (catalyst), on a torus. step() advances every cell
by one explicit-Euler time step; paint() writes a seed disc into the state.
Plain Python throughout (no math imports needed), so CPython runs both kernels too.
"""
from pykernel import kernel


@kernel(workgroup_size=64)
def step(gid: int, u: list[float], v: list[float], u2: list[float], v2: list[float],
         w: int, h: int, feed: float, kill: float, du: float, dv: float, dt: float):
    x = gid % w
    y = gid // w
    # 5-point Laplacian with wraparound: the neighbours of each edge cell are on the far side
    l = y * w + (x + w - 1) % w
    r = y * w + (x + 1) % w
    up = ((y + h - 1) % h) * w + x
    dn = ((y + 1) % h) * w + x
    a = u[gid]
    b = v[gid]
    lap_u = u[l] + u[r] + u[up] + u[dn] - 4.0 * a
    lap_v = v[l] + v[r] + v[up] + v[dn] - 4.0 * b
    uvv = a * b * b
    u2[gid] = a + dt * (du * lap_u - uvv + feed * (1.0 - a))
    v2[gid] = b + dt * (dv * lap_v + uvv - (feed + kill) * b)


@kernel(workgroup_size=64)
def paint(gid: int, u: list[float], v: list[float], w: int, h: int,
          px: float, py: float, radius: float, strength: float):
    # Distance on the torus, so a disc straddling an edge wraps like the simulation does.
    ddx = abs(float(gid % w) - px)
    ddx = min(ddx, float(w) - ddx)
    ddy = abs(float(gid // w) - py)
    ddy = min(ddy, float(h) - ddy)
    if ddx * ddx + ddy * ddy <= radius * radius:
        u[gid] = 0.5
        v[gid] = strength


# Check inputs: a 32 x 24 torus with a deterministic, non-trivial state built from
# integer formulas of the index (no random). u stays in [0.5, 1], v in [0, 0.3].
# Both kernels run in f32 on the GPU and are compared with f64 CPython at the default
# tol (1e-4, relative to max(1, |value|)) and min_frac 1.0, so nothing is loosened.
W, H = 32, 24
N = W * H
U0 = [1.0 - 0.5 * (((i * 37) % 11) / 10.0) for i in range(N)]
V0 = [0.3 * (((i * 53 + 7) % 13) / 12.0) for i in range(N)]
ZEROS = [0.0] * N
CHECKS = {
    "step": {
        "count": N,
        "uniforms": {"w": W, "h": H, "feed": 0.0545, "kill": 0.062,
                     "du": 0.2097, "dv": 0.105, "dt": 1.0},
        "buffers": {"u": U0, "v": V0, "u2": ZEROS, "v2": ZEROS},
        "expect": ["u2", "v2"],
    },
    "paint": {
        # The disc at (2, 20) with radius 5 wraps over both the x and the y edge.
        "count": N,
        "uniforms": {"w": W, "h": H, "px": 2.0, "py": 20.0, "radius": 5.0, "strength": 0.25},
        "buffers": {"u": U0, "v": V0},
        "expect": ["u", "v"],
    },
}
