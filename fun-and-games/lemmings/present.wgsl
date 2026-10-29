// gPu(lemmings) — scales the composited frame onto the canvas.

struct Dims { w: u32, h: u32, col: u32, pad: u32 }
@group(0) @binding(0) var<storage, read> fb: array<u32>;
@group(0) @binding(1) var<uniform> dims: Dims;
@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(p * 2.0 - 1.0, 0.0, 1.0);
}
@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let x = min(u32(pos.x), dims.w - 1u); let y = min(u32(pos.y), dims.h - 1u);
  let c = fb[dims.col + y * dims.w + x];
  return vec4f(f32(c & 255u), f32((c >> 8u) & 255u), f32((c >> 16u) & 255u), 255.0) / 255.0;
}
