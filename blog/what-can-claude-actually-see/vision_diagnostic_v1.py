"""
Vision Diagnostic Test Image Generator
Creates a test image with known ground truth to map Claude's visual capabilities.
"""

from PIL import Image, ImageDraw, ImageFont
import json
import math
import random

random.seed(42)  # reproducible

WIDTH, HEIGHT = 1200, 1600
BG = (40, 40, 45)  # dark gray similar to the Kandinsky background

img = Image.new('RGB', (WIDTH, HEIGHT), BG)
draw = ImageDraw.Draw(img)

# Try to get a decent font
try:
    font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    font_tiny = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
except:
    font_label = ImageFont.load_default()
    font_small = font_label
    font_tiny = font_label

ground_truth = {}

# ============================================================
# PANEL 1: LOW-CONTRAST COLOR DISCRIMINATION (the core problem)
# ============================================================
px, py = 30, 30
draw.text((px, py), "TEST 1: Low-Contrast Discrimination", fill=(200, 200, 200), font=font_label)
py += 25

# Series of circle pairs where inner circle differs from outer by decreasing amounts
contrasts = [
    ("1a", (40, 40, 45), (90, 90, 95), "50-step lighter"),      # 50 units lighter - easy
    ("1b", (40, 40, 45), (70, 70, 75), "30-step lighter"),      # 30 units lighter - medium
    ("1c", (40, 40, 45), (55, 55, 60), "15-step lighter"),      # 15 units lighter - hard
    ("1d", (40, 40, 45), (47, 47, 52), "7-step lighter"),       # 7 units lighter - very hard
    ("1e", (40, 40, 45), (40, 40, 45), "identical"),            # identical - control
    ("1f", (40, 40, 45), (40, 55, 45), "green-shifted"),        # same luminance, hue shift
]

for i, (tid, outer_col, inner_col, desc) in enumerate(contrasts):
    cx = px + 50 + i * 100
    cy = py + 55
    # Outer circle
    draw.ellipse([cx-40, cy-40, cx+40, cy+40], fill=outer_col)
    # Inner circle (semicircle on top half)
    draw.pieslice([cx-25, cy-25, cx+25, cy+25], 180, 360, fill=inner_col)
    # Label
    draw.text((cx-15, cy+48), tid, fill=(150, 150, 150), font=font_small)
    ground_truth[tid] = {
        "test": "low_contrast_discrimination",
        "outer_rgb": list(outer_col),
        "inner_rgb": list(inner_col),
        "delta": sum(abs(a-b) for a,b in zip(outer_col, inner_col)),
        "description": desc,
        "question": f"Is there a visible semicircle in the upper half of circle {tid}?"
    }

py += 130

# ============================================================
# PANEL 2: COLOR IDENTIFICATION
# ============================================================
draw.text((px, py), "TEST 2: Color Identification", fill=(200, 200, 200), font=font_label)
py += 25

colors = [
    ("2a", (180, 40, 40)),    # dark red
    ("2b", (180, 40, 80)),    # dark magenta/rose
    ("2c", (80, 40, 180)),    # purple
    ("2d", (40, 80, 180)),    # medium blue
    ("2e", (40, 140, 80)),    # forest green
    ("2f", (180, 160, 40)),   # olive/dark yellow
    ("2g", (140, 80, 40)),    # brown
    ("2h", (80, 80, 80)),     # neutral gray
    ("2i", (100, 80, 90)),    # mauve gray
    ("2j", (80, 100, 80)),    # green-gray
]

for i, (tid, color) in enumerate(colors):
    row = i // 5
    col = i % 5
    sx = px + col * 110 + 10
    sy = py + row * 70
    draw.rounded_rectangle([sx, sy, sx+80, sy+50], radius=8, fill=color)
    draw.text((sx+25, sy+52), tid, fill=(150, 150, 150), font=font_small)
    ground_truth[tid] = {
        "test": "color_identification",
        "rgb": list(color),
        "question": f"What color is rectangle {tid}?"
    }

py += 170

# ============================================================
# PANEL 3: ELEMENT COUNTING
# ============================================================
draw.text((px, py), "TEST 3: Element Counting", fill=(200, 200, 200), font=font_label)
py += 25

# Three boxes with different numbers of dots
counting_sets = [
    ("3a", 4, (220, 60, 60)),
    ("3b", 7, (60, 60, 220)),
    ("3c", 13, (60, 220, 60)),
    ("3d", 23, (220, 220, 60)),
]

for i, (tid, count, color) in enumerate(counting_sets):
    bx = px + i * 145
    by = py
    bw, bh = 130, 130
    draw.rectangle([bx, by, bx+bw, by+bh], outline=(100, 100, 100), width=1)
    draw.text((bx+50, by+bh+5), tid, fill=(150, 150, 150), font=font_small)
    
    # Place dots randomly within box
    placed = []
    for _ in range(count):
        for attempt in range(100):
            dx = random.randint(bx+8, bx+bw-8)
            dy = random.randint(by+8, by+bh-8)
            # Check no overlap
            if all(math.hypot(dx-px2, dy-py2) > 12 for px2, py2 in placed):
                placed.append((dx, dy))
                draw.ellipse([dx-4, dy-4, dx+4, dy+4], fill=color)
                break
    
    ground_truth[tid] = {
        "test": "element_counting",
        "actual_count": len(placed),
        "target_count": count,
        "dot_color_rgb": list(color),
        "question": f"How many dots are in box {tid}?"
    }

py += 165

# ============================================================
# PANEL 4: GRADIENT DETECTION
# ============================================================
draw.text((px, py), "TEST 4: Gradient vs Flat Fill", fill=(200, 200, 200), font=font_label)
py += 25

gradient_tests = [
    ("4a", True, "horizontal", (60, 60, 180), (180, 60, 60)),   # gradient blue->red
    ("4b", False, "flat", (120, 60, 120), (120, 60, 120)),       # flat purple
    ("4c", True, "vertical", (40, 40, 40), (100, 100, 100)),     # subtle dark gradient
    ("4d", True, "horizontal", (80, 80, 80), (95, 95, 95)),      # very subtle gradient
    ("4e", False, "flat", (85, 85, 85), (85, 85, 85)),           # flat gray (close to 4d)
]

for i, (tid, is_gradient, direction, start_col, end_col) in enumerate(gradient_tests):
    gx = px + i * 120
    gy = py
    gw, gh = 100, 60
    
    for x in range(gw):
        for y in range(gh):
            if is_gradient:
                if direction == "horizontal":
                    t = x / gw
                elif direction == "vertical":
                    t = y / gh
                else:
                    t = 0
            else:
                t = 0
            r = int(start_col[0] + (end_col[0] - start_col[0]) * t)
            g = int(start_col[1] + (end_col[1] - start_col[1]) * t)
            b = int(start_col[2] + (end_col[2] - start_col[2]) * t)
            img.putpixel((gx + x, gy + y), (r, g, b))
    
    draw.rectangle([gx, gy, gx+gw, gy+gh], outline=(100, 100, 100), width=1)
    draw.text((gx+35, gy+gh+5), tid, fill=(150, 150, 150), font=font_small)
    
    ground_truth[tid] = {
        "test": "gradient_detection",
        "is_gradient": is_gradient,
        "direction": direction,
        "start_rgb": list(start_col),
        "end_rgb": list(end_col),
        "question": f"Is {tid} a gradient or a flat fill?"
    }

py += 100

# ============================================================
# PANEL 5: SHAPE IDENTIFICATION IN CLUTTER
# ============================================================
draw.text((px, py), "TEST 5: Shape ID in Clutter", fill=(200, 200, 200), font=font_label)
py += 25

# Box with overlapping geometric shapes - identify what's present
shape_box_x, shape_box_y = px, py
shape_box_w, shape_box_h = 350, 200
draw.rectangle([shape_box_x, shape_box_y, shape_box_x+shape_box_w, shape_box_y+shape_box_h], 
               outline=(100, 100, 100), width=1)

shapes_present = []

# Red triangle
pts = [(80, py+150), (130, py+50), (180, py+150)]
draw.polygon(pts, fill=(200, 50, 50))
shapes_present.append("red triangle")

# Blue rectangle (partially behind triangle)
draw.rectangle([60, py+80, 140, py+130], fill=(50, 50, 200))
shapes_present.append("blue rectangle (partially behind red triangle)")

# Green circle
draw.ellipse([200, py+60, 280, py+140], fill=(50, 180, 50))
shapes_present.append("green circle")

# Small yellow diamond (rotated square)
diamond_cx, diamond_cy = 310, py + 100
diamond_r = 25
diamond_pts = [(diamond_cx, diamond_cy-diamond_r), (diamond_cx+diamond_r, diamond_cy),
               (diamond_cx, diamond_cy+diamond_r), (diamond_cx-diamond_r, diamond_cy)]
draw.polygon(diamond_pts, fill=(220, 200, 50))
shapes_present.append("yellow diamond")

# Gray semicircle on edge of green circle (the Kandinsky problem!)
draw.pieslice([230, py+50, 290, py+110], 180, 360, fill=(90, 90, 95))
shapes_present.append("gray semicircle overlapping top of green circle")

draw.text((shape_box_x + 5, shape_box_y + shape_box_h + 5), "5a", fill=(150, 150, 150), font=font_small)
ground_truth["5a"] = {
    "test": "shape_identification",
    "shapes_present": shapes_present,
    "total_shapes": len(shapes_present),
    "question": "List all shapes visible in panel 5a, including their colors and spatial relationships."
}

py += 240

# ============================================================
# PANEL 6: TEXTURE DISCRIMINATION
# ============================================================
draw.text((px, py), "TEST 6: Texture vs Solid", fill=(200, 200, 200), font=font_label)
py += 25

texture_tests = []

# 6a: solid fill
draw.rectangle([px, py, px+100, py+80], fill=(100, 60, 60))
draw.text((px+35, py+85), "6a", fill=(150, 150, 150), font=font_small)
ground_truth["6a"] = {"test": "texture_discrimination", "has_texture": False, "description": "solid dark red", "question": "Is 6a textured or solid?"}

# 6b: horizontal stripes (2px)
for y_off in range(80):
    color = (100, 60, 60) if (y_off // 2) % 2 == 0 else (120, 75, 75)
    draw.line([px+120, py+y_off, px+220, py+y_off], fill=color)
draw.rectangle([px+120, py, px+220, py+80], outline=(100, 100, 100), width=1)
draw.text((px+155, py+85), "6b", fill=(150, 150, 150), font=font_small)
ground_truth["6b"] = {"test": "texture_discrimination", "has_texture": True, "description": "horizontal stripes 2px, dark red alternating", "question": "Is 6b textured or solid?"}

# 6c: crosshatch pattern
for y_off in range(80):
    for x_off in range(100):
        if (x_off // 4 + y_off // 4) % 2 == 0:
            img.putpixel((px+240+x_off, py+y_off), (60, 60, 100))
        else:
            img.putpixel((px+240+x_off, py+y_off), (75, 75, 120))
draw.rectangle([px+240, py, px+340, py+80], outline=(100, 100, 100), width=1)
draw.text((px+275, py+85), "6c", fill=(150, 150, 150), font=font_small)
ground_truth["6c"] = {"test": "texture_discrimination", "has_texture": True, "description": "checkerboard 4px blocks, blue tones", "question": "Is 6c textured or solid?"}

# 6d: noise/stipple
for y_off in range(80):
    for x_off in range(100):
        base = 80
        noise = random.randint(-15, 15)
        v = max(0, min(255, base + noise))
        img.putpixel((px+360+x_off, py+y_off), (v, v, v))
draw.rectangle([px+360, py, px+460, py+80], outline=(100, 100, 100), width=1)
draw.text((px+395, py+85), "6d", fill=(150, 150, 150), font=font_small)
ground_truth["6d"] = {"test": "texture_discrimination", "has_texture": True, "description": "random noise/stipple around gray 80", "question": "Is 6d textured or solid?"}

py += 120

# ============================================================
# PANEL 7: SPATIAL PRECISION
# ============================================================
draw.text((px, py), "TEST 7: Spatial Precision", fill=(200, 200, 200), font=font_label)
py += 25

# Grid with labeled points - test position awareness
grid_x, grid_y = px, py
grid_size = 200
cell = grid_size // 4

# Draw grid
for i in range(5):
    draw.line([grid_x + i*cell, grid_y, grid_x + i*cell, grid_y + grid_size], fill=(80, 80, 80))
    draw.line([grid_x, grid_y + i*cell, grid_x + grid_size, grid_y + i*cell], fill=(80, 80, 80))

# Label axes
for i in range(4):
    draw.text((grid_x + i*cell + cell//2 - 3, grid_y - 15), str(i+1), fill=(150, 150, 150), font=font_small)
    draw.text((grid_x - 15, grid_y + i*cell + cell//2 - 6), chr(65+i), fill=(150, 150, 150), font=font_small)

# Place colored markers at specific positions
markers = {
    "7_red": ((0, 0), (220, 50, 50)),     # A1
    "7_blue": ((2, 1), (50, 50, 220)),     # B3
    "7_green": ((1, 3), (50, 200, 50)),    # D2
    "7_yellow": ((3, 2), (220, 220, 50)),  # C4
}

for tid, ((col, row), color) in markers.items():
    mx = grid_x + col * cell + cell // 2
    my = grid_y + row * cell + cell // 2
    draw.ellipse([mx-6, my-6, mx+6, my+6], fill=color)
    ground_truth[tid] = {
        "test": "spatial_precision",
        "grid_position": f"{chr(65+row)}{col+1}",
        "color_rgb": list(color),
        "question": f"What grid position is the {tid.split('_')[1]} dot in?"
    }

draw.text((grid_x + 80, grid_y + grid_size + 5), "7", fill=(150, 150, 150), font=font_small)

# ============================================================
# PANEL 8: OVERLAPPING TRANSPARENCY (simulated)
# ============================================================
tx = grid_x + 260
draw.text((tx, py - 25), "TEST 8: Overlay Detection", fill=(200, 200, 200), font=font_label)

# Create overlapping semi-transparent circles (simulated via color blending)
# Red circle
r_cx, r_cy, r_r = tx + 80, py + 70, 60
# Blue circle overlapping
b_cx, b_cy, b_r = tx + 130, py + 70, 60

for y_off in range(grid_size):
    for x_off in range(250):
        px2, py2 = tx + x_off, py + y_off
        if px2 >= WIDTH or py2 >= HEIGHT:
            continue
        
        r_dist = math.hypot(px2 - r_cx, py2 - r_cy)
        b_dist = math.hypot(px2 - b_cx, py2 - b_cy)
        
        in_r = r_dist <= r_r
        in_b = b_dist <= b_r
        
        if in_r and in_b:
            # Overlap zone - purple/magenta blend
            img.putpixel((px2, py2), (140, 30, 140))
        elif in_r:
            img.putpixel((px2, py2), (200, 40, 40))
        elif in_b:
            img.putpixel((px2, py2), (40, 40, 200))

draw.text((tx + 90, py + grid_size + 5), "8a", fill=(150, 150, 150), font=font_small)
ground_truth["8a"] = {
    "test": "overlay_detection",
    "description": "Red circle (left) and blue circle (right) overlapping, creating purple/magenta zone in center",
    "shapes": ["red circle left", "blue circle right", "purple overlap zone center"],
    "question": "Describe the shapes, colors, and overlap in 8a."
}

py += 240

# ============================================================
# PANEL 9: FINE DETAIL AT SCALE
# ============================================================
draw.text((px, py), "TEST 9: Fine Detail at Scale", fill=(200, 200, 200), font=font_label)
py += 25

# Concentric rings with alternating colors at decreasing widths
ring_cx, ring_cy = px + 100, py + 100
ring_colors = [(200, 50, 50), (50, 50, 200)]
ring_count = 0
for r in range(90, 0, -3):
    color = ring_colors[ring_count % 2]
    draw.ellipse([ring_cx-r, ring_cy-r, ring_cx+r, ring_cy+r], fill=color)
    ring_count += 1

draw.text((ring_cx - 10, ring_cy + 105), "9a", fill=(150, 150, 150), font=font_small)
ground_truth["9a"] = {
    "test": "fine_detail",
    "description": f"Concentric rings alternating red/blue, {ring_count} rings total, 3px width each",
    "ring_count": ring_count,
    "question": "Describe what you see in 9a. How many rings can you distinguish?"
}

# Small text at various sizes
text_x = px + 250
texts = [
    ("9b", 20, "HELLO"),
    ("9c", 14, "WORLD"),
    ("9d", 10, "TESTING"),
    ("9e", 7, "VISION"),
    ("9f", 5, "LIMITS"),
]

for i, (tid, size, text) in enumerate(texts):
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        f = font_tiny
    ty = py + i * 35
    draw.text((text_x, ty), text, fill=(200, 200, 200), font=f)
    draw.text((text_x + 120, ty), tid, fill=(150, 150, 150), font=font_small)
    ground_truth[tid] = {
        "test": "text_readability",
        "text": text,
        "font_size_px": size,
        "question": f"What text does {tid} show?"
    }

py += 220

# ============================================================
# PANEL 10: THE KANDINSKY CHALLENGE (direct recreation)
# ============================================================
draw.text((px, py), "TEST 10: Kandinsky-Style Composition", fill=(200, 200, 200), font=font_label)
py += 25

# Recreate a simplified version of the problematic area
k_cx, k_cy = px + 150, py + 120
# Red ring
for r in range(100, 70, -1):
    draw.ellipse([k_cx-r, k_cy-r, k_cx+r, k_cy+r], fill=(200, 50, 40))
# Gray semicircle (the problem element) - between red and black
draw.pieslice([k_cx-68, k_cy-68, k_cx+68, k_cy+68], 180, 360, fill=(95, 95, 100))
# Black center
draw.ellipse([k_cx-55, k_cy-55, k_cx+55, k_cy+55], fill=(15, 15, 18))
# Yellow dot
draw.ellipse([k_cx-5, k_cy-5, k_cx+5, k_cy+5], fill=(230, 210, 50))
# Small colored rectangles around the ring (Kandinsky-style)
rects = [
    (k_cx-15, k_cy-85, 20, 30, (180, 140, 40)),  # gold above
    (k_cx-25, k_cy-80, 12, 15, (120, 50, 150)),   # purple
    (k_cx+5, k_cy-78, 10, 12, (50, 120, 180)),    # blue
    (k_cx-80, k_cy+20, 15, 35, (50, 130, 180)),   # blue left
    (k_cx+60, k_cy+30, 12, 25, (50, 160, 80)),    # green right
]
for rx, ry, rw, rh, rc in rects:
    draw.rectangle([rx, ry, rx+rw, ry+rh], fill=rc)

draw.text((k_cx - 10, k_cy + 130), "10a", fill=(150, 150, 150), font=font_small)
ground_truth["10a"] = {
    "test": "kandinsky_challenge",
    "layers_from_outside_in": [
        "red ring (radius 100 to 70)",
        "gray semicircle (upper half, radius 68, RGB 95,95,100)",
        "black center disk (radius 55)",
        "yellow dot (center, radius 5)"
    ],
    "decorative_elements": "5 small colored rectangles around the ring (gold, purple, blue, blue, green)",
    "question": "Describe ALL layers visible from outside to inside in 10a, including any subtle elements between the red ring and the black center."
}

# Save image and ground truth
img.save('/home/claude/vision_diagnostic.png', quality=95)

with open('/home/claude/vision_diagnostic_truth.json', 'w') as f:
    json.dump(ground_truth, f, indent=2)

print(f"Image: {WIDTH}x{HEIGHT}")
print(f"Tests: {len(ground_truth)} items across 10 panels")
print("Ground truth saved.")
