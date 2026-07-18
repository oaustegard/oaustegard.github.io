#!/usr/bin/env python3
"""
Generates PNG icons for the Motion Player PWA.
Pure Python 3 stdlib: uses struct, zlib, math for PNG encoding and shape rendering.
No Pillow, no numpy. Distance-field based anti-aliasing.
"""

import struct
import zlib
import math
import os

def crc32(data):
    """Compute CRC32 of data for PNG chunks."""
    return zlib.crc32(data) & 0xffffffff

def write_png(filename, width, height, pixels):
    """
    Write an RGBA PNG file.
    pixels: list of (r, g, b, a) tuples, row-major, len = width*height.
    """
    os.makedirs(os.path.dirname(filename) or '.', exist_ok=True)

    # Convert pixels to scanlines: each scanline is [filter_byte] + RGBA data
    scanlines = b''
    for y in range(height):
        scanline = b'\x00'  # filter byte 0 = no filtering
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            scanline += bytes([r, g, b, a])
        scanlines += scanline

    # Compress scanlines
    compressed = zlib.compress(scanlines, 9)

    with open(filename, 'wb') as f:
        # PNG signature
        f.write(b'\x89PNG\r\n\x1a\n')

        # IHDR chunk: width, height, bit depth 8, color type 6 (RGBA)
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
        ihdr = b'IHDR' + ihdr_data
        f.write(struct.pack('>I', len(ihdr_data)))
        f.write(ihdr)
        f.write(struct.pack('>I', crc32(ihdr)))

        # IDAT chunk(s): image data
        idat = b'IDAT' + compressed
        f.write(struct.pack('>I', len(compressed)))
        f.write(idat)
        f.write(struct.pack('>I', crc32(idat)))

        # IEND chunk: end marker
        iend = b'IEND'
        f.write(struct.pack('>I', 0))
        f.write(iend)
        f.write(struct.pack('>I', crc32(iend)))

def smoothstep(edge0, edge1, x):
    """Smoothstep: 0 at edge0, 1 at edge1, smooth in between."""
    if x <= edge0:
        return 0.0
    if x >= edge1:
        return 1.0
    t = (x - edge0) / (edge1 - edge0)
    return t * t * (3.0 - 2.0 * t)

def mix(a, b, t):
    """Linear interpolation."""
    return a * (1 - t) + b * t

def signed_distance_to_segment(px, py, x1, y1, x2, y2):
    """
    Signed distance from point to line segment.
    Uses perpendicular distance to the line, clamped to segment bounds.
    """
    dx = x2 - x1
    dy = y2 - y1
    len_sq = dx * dx + dy * dy

    if len_sq < 1e-6:
        return math.sqrt((px - x1) ** 2 + (py - y1) ** 2)

    t = ((px - x1) * dx + (py - y1) * dy) / len_sq
    t = max(0, min(1, t))

    cx = x1 + t * dx
    cy = y1 + t * dy

    cross = (px - x1) * dy - (py - y1) * dx
    dist_unsigned = math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
    sign = 1 if cross > 0 else -1

    return sign * dist_unsigned

def signed_distance_to_triangle(px, py, ax, ay, bx, by, cx, cy):
    """
    Signed distance to triangle (counterclockwise winding).
    Negative inside, positive outside.
    """
    d1 = signed_distance_to_segment(px, py, ax, ay, bx, by)
    d2 = signed_distance_to_segment(px, py, bx, by, cx, cy)
    d3 = signed_distance_to_segment(px, py, cx, cy, ax, ay)

    if d1 < 0 and d2 < 0 and d3 < 0:
        return -max(d1, d2, d3)
    else:
        return max(d1, d2, d3)

def render_icon(width, height, fill_scale=1.0, full_bleed_bg=False):
    """
    Render motion player icon with proper signed distance fields.
    width, height: canvas size
    fill_scale: scale the art (0.7 for maskable variant)
    full_bleed_bg: if True, background fills entire square (no rounded corners)
    Returns: list of (r, g, b, a) tuples
    """
    bg_color = (0x0b, 0x0d, 0x12)
    play_color = (0x38, 0xbd, 0xf8)
    ring_color = (0x5e, 0xad, 0xc4)

    center_x = width / 2
    center_y = height / 2

    pixels = []

    for y in range(height):
        for x in range(width):
            fx = float(x)
            fy = float(y)

            # ===== BACKGROUND =====
            if full_bleed_bg:
                bg_alpha = 1.0
            else:
                corner_radius = width * 0.22
                half_size = width / 2

                dx = abs(fx - center_x) - (half_size - corner_radius)
                dy = abs(fy - center_y) - (half_size - corner_radius)

                if dx < 0 and dy < 0:
                    bg_sdf = -max(-dx, -dy)
                elif dx > 0 and dy > 0:
                    dist = math.sqrt(dx * dx + dy * dy)
                    bg_sdf = dist - corner_radius
                else:
                    bg_sdf = max(dx, dy)

                bg_alpha = smoothstep(1.5, -1.5, bg_sdf)

            # ===== TRIANGLE =====
            triangle_size = width * 0.34 * fill_scale
            nudge_x = width * 0.04 * fill_scale

            t_cx = center_x + nudge_x
            t_cy = center_y
            t_h = triangle_size / 2
            t_w = triangle_size * 0.866 / 2

            tri_v1 = (t_cx + t_w, t_cy)
            tri_v2 = (t_cx - t_w / 2, t_cy - t_h)
            tri_v3 = (t_cx - t_w / 2, t_cy + t_h)

            triangle_sdf = signed_distance_to_triangle(fx, fy, tri_v1[0], tri_v1[1], tri_v2[0], tri_v2[1], tri_v3[0], tri_v3[1])
            triangle_alpha = smoothstep(1.5, -1.5, triangle_sdf)

            # ===== ARC RING =====
            scaled_radius = (width * 0.36) * fill_scale
            scaled_stroke = (width * 0.05) * fill_scale

            dx_to_center = fx - center_x
            dy_to_center = fy - center_y
            dist_to_center = math.sqrt(dx_to_center ** 2 + dy_to_center ** 2)

            angle = math.atan2(dy_to_center, dx_to_center) * 180 / math.pi

            arc_start = -120
            arc_end = 180
            gap_start = 0
            gap_end = 60

            in_arc = angle >= arc_start and angle <= arc_end and not (gap_start <= angle <= gap_end)

            if in_arc:
                ring_sdf = abs(dist_to_center - scaled_radius) - scaled_stroke / 2
                ring_alpha = smoothstep(1.5, -1.5, ring_sdf)
            else:
                ring_alpha = 0.0

            # ===== COMPOSITING =====
            result_r = float(bg_color[0])
            result_g = float(bg_color[1])
            result_b = float(bg_color[2])
            result_a = bg_alpha

            ring_r = float(ring_color[0])
            ring_g = float(ring_color[1])
            ring_b = float(ring_color[2])

            result_r = mix(result_r, ring_r, ring_alpha)
            result_g = mix(result_g, ring_g, ring_alpha)
            result_b = mix(result_b, ring_b, ring_alpha)
            result_a = ring_alpha + result_a * (1.0 - ring_alpha)

            tri_r = float(play_color[0])
            tri_g = float(play_color[1])
            tri_b = float(play_color[2])

            result_r = mix(result_r, tri_r, triangle_alpha)
            result_g = mix(result_g, tri_g, triangle_alpha)
            result_b = mix(result_b, tri_b, triangle_alpha)
            result_a = triangle_alpha + result_a * (1.0 - triangle_alpha)

            r_int = int(round(result_r))
            g_int = int(round(result_g))
            b_int = int(round(result_b))
            a_int = int(round(result_a * 255))

            r_int = max(0, min(255, r_int))
            g_int = max(0, min(255, g_int))
            b_int = max(0, min(255, b_int))
            a_int = max(0, min(255, a_int))

            pixels.append((r_int, g_int, b_int, a_int))

    return pixels

def main():
    # Ensure icons directory exists
    os.makedirs('icons', exist_ok=True)

    # Generate icon-192.png
    print("Generating icon-192.png...")
    pixels_192 = render_icon(192, 192)
    write_png('icons/icon-192.png', 192, 192, pixels_192)
    size_192 = os.path.getsize('icons/icon-192.png')
    print(f"  -> {size_192} bytes")

    # Generate icon-512.png
    print("Generating icon-512.png...")
    pixels_512 = render_icon(512, 512)
    write_png('icons/icon-512.png', 512, 512, pixels_512)
    size_512 = os.path.getsize('icons/icon-512.png')
    print(f"  -> {size_512} bytes")

    # Generate maskable-512.png (70% scale, full-bleed background)
    print("Generating maskable-512.png...")
    pixels_maskable = render_icon(512, 512, fill_scale=0.7, full_bleed_bg=True)
    write_png('icons/maskable-512.png', 512, 512, pixels_maskable)
    size_maskable = os.path.getsize('icons/maskable-512.png')
    print(f"  -> {size_maskable} bytes")

    # Generate apple-touch-icon.png (180x180, opaque background)
    print("Generating apple-touch-icon.png...")
    # Apple touch icon: fill entire square with opaque background
    apple_pixels = []
    for y in range(180):
        for x in range(180):
            apple_pixels.append((0x0b, 0x0d, 0x12, 255))
    write_png('icons/apple-touch-icon.png', 180, 180, apple_pixels)
    size_apple = os.path.getsize('icons/apple-touch-icon.png')
    print(f"  -> {size_apple} bytes")

    print("\nIcon generation complete!")
    print(f"icon-192.png:       {size_192} bytes")
    print(f"icon-512.png:       {size_512} bytes")
    print(f"maskable-512.png:   {size_maskable} bytes")
    print(f"apple-touch-icon.png: {size_apple} bytes")

if __name__ == '__main__':
    main()
