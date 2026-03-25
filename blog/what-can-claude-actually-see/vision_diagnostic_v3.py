"""
Vision Diagnostic v3: Classic Illusions + Light Background Contrast
Tests whether Claude's vision has human-like contextual color constancy
biases, or different ones.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import random

random.seed(42)

WIDTH, HEIGHT = 1200, 2000
img = Image.new('RGB', (WIDTH, HEIGHT), (245, 245, 240))
draw = ImageDraw.Draw(img)

try:
    font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    font_tiny = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
except:
    font_label = font_small = font_tiny = ImageFont.load_default()

ground_truth = {}
px, py = 30, 20

# ============================================================
# PANEL 20: ADELSON CHECKER SHADOW (recreated)
# ============================================================
draw.text((px, py), "TEST 20: Checker Shadow Illusion (Adelson recreation)", fill=(30, 30, 30), font=font_label)
py += 25

# Build a checkerboard with a cast shadow
board_x, board_y = px + 20, py
cell = 40
board_size = 8
shadow_color_shift = -40  # how much the shadow darkens

# Draw angled checkerboard (simple top-down view)
for row in range(board_size):
    for col in range(board_size):
        is_light = (row + col) % 2 == 0
        base_val = 200 if is_light else 100
        
        # Shadow region: diagonal band from upper-left
        cx = col * cell + cell // 2
        cy = row * cell + cell // 2
        in_shadow = (col >= 2 and col <= 5 and row >= 2 and row <= 5)
        
        if in_shadow:
            val = max(0, base_val + shadow_color_shift)
        else:
            val = base_val
        
        x0 = board_x + col * cell
        y0 = board_y + row * cell
        draw.rectangle([x0, y0, x0 + cell, y0 + cell], fill=(val, val, val))

# Mark squares A and B
# A: dark square outside shadow (row=1, col=1)
a_row, a_col = 1, 1  # dark square, no shadow
a_val = 100  # dark square base
a_x = board_x + a_col * cell + cell // 2
a_y = board_y + a_row * cell + cell // 2

# B: light square inside shadow (row=3, col=3)
b_row, b_col = 3, 3  # light square, in shadow
b_val = 200 + shadow_color_shift  # 160, light square darkened by shadow

# Wait — to match the Adelson illusion, A and B should be SAME value
# A is a dark square outside shadow = 100
# B should also be 100: a light square (200) darkened by shadow (-100)
# Let me recalculate to make them match:
# If shadow shift = -100, light square in shadow = 200-100 = 100 = dark square outside
# That's too strong a shadow. Adelson used: A=B=120 approximately
# Let's use: light=190, dark=90, shadow_shift=-100 → light_in_shadow=90=dark_outside? Too neat.
# Better: target both at 120. dark_base=120, light_base=200, shadow=-80 → light_in_shadow=120

# Redraw with calibrated values
img_board = Image.new('RGB', (board_size * cell, board_size * cell), (60, 60, 60))
bd = ImageDraw.Draw(img_board)

DARK_BASE = 120
LIGHT_BASE = 200
SHADOW_SHIFT = -80  # light_in_shadow = 200-80 = 120 = DARK_BASE

for row in range(board_size):
    for col in range(board_size):
        is_light = (row + col) % 2 == 0
        base_val = LIGHT_BASE if is_light else DARK_BASE
        
        in_shadow = (col >= 3 and row >= 3)
        
        if in_shadow:
            val = max(0, base_val + SHADOW_SHIFT)
        else:
            val = base_val
        
        x0 = col * cell
        y0 = row * cell
        bd.rectangle([x0, y0, x0 + cell, y0 + cell], fill=(val, val, val))

# Draw a "cylinder" shadow edge (diagonal gradient)
for row in range(board_size):
    for col in range(board_size):
        # Soft shadow edge at boundary
        if col == 3 and row < 3:
            x0 = col * cell
            y0 = row * cell
            is_light = (row + col) % 2 == 0
            base_val = LIGHT_BASE if is_light else DARK_BASE
            # Partial shadow
            partial_shift = SHADOW_SHIFT // 3
            val = base_val + partial_shift
            bd.rectangle([x0, y0, x0 + cell, y0 + cell], fill=(val, val, val))
        if row == 3 and col < 3:
            x0 = col * cell
            y0 = row * cell
            is_light = (row + col) % 2 == 0
            base_val = LIGHT_BASE if is_light else DARK_BASE
            partial_shift = SHADOW_SHIFT // 3
            val = base_val + partial_shift
            bd.rectangle([x0, y0, x0 + cell, y0 + cell], fill=(val, val, val))

# Draw green cylinder casting shadow
cyl_x, cyl_y = 2 * cell + cell // 2, 2 * cell + cell // 2
bd.ellipse([cyl_x - 20, cyl_y - 30, cyl_x + 20, cyl_y + 10], fill=(60, 140, 60))
bd.rectangle([cyl_x - 20, cyl_y - 10, cyl_x + 20, cyl_y + 10], fill=(50, 120, 50))

# Mark A and B
# A: dark square outside shadow — value = DARK_BASE = 120
# (row+col) must be odd for dark square, and outside shadow zone (row<3 or col<3)
a_row, a_col = 0, 5  # (0+5)%2=1 → dark square, row<3 → outside shadow
a_x, a_y = a_col * cell + cell // 2, a_row * cell + cell // 2
bd.text((a_x - 4, a_y - 6), "A", fill=(255, 255, 255), font=font_small)

# B: light square in shadow (row=5, col=5) — value = LIGHT_BASE + SHADOW_SHIFT = 120
b_row, b_col = 5, 5
b_x, b_y = b_col * cell + cell // 2, b_row * cell + cell // 2
bd.text((b_x - 4, b_y - 6), "B", fill=(255, 255, 255), font=font_small)

# Verify pixel values
a_pixel = img_board.getpixel((a_col * cell + 10, a_row * cell + 10))
b_pixel = img_board.getpixel((b_col * cell + 10, b_row * cell + 10))

img.paste(img_board, (board_x, board_y))
draw.text((board_x + 100, board_y + board_size * cell + 5), "20a", fill=(120, 120, 120), font=font_small)

ground_truth["20a"] = {
    "test": "adelson_checker_shadow",
    "square_A_rgb": list(a_pixel),
    "square_B_rgb": list(b_pixel),
    "identical": a_pixel[0] == b_pixel[0],
    "actual_value": DARK_BASE,
    "question": "Which square appears darker, A or B? Are they the same shade of gray?"
}

# Also show the proof: isolated A and B
proof_x = board_x + board_size * cell + 40
draw.text((proof_x, board_y), "Proof:", fill=(80, 80, 80), font=font_small)
draw.rectangle([proof_x, board_y + 18, proof_x + 50, board_y + 68], fill=(DARK_BASE, DARK_BASE, DARK_BASE))
draw.text((proof_x + 18, board_y + 35), "A", fill=(255, 255, 255), font=font_small)
draw.rectangle([proof_x + 70, board_y + 18, proof_x + 120, board_y + 68], fill=(DARK_BASE, DARK_BASE, DARK_BASE))
draw.text((proof_x + 88, board_y + 35), "B", fill=(255, 255, 255), font=font_small)
# Connect with same-color bar
draw.rectangle([proof_x + 50, board_y + 38, proof_x + 70, board_y + 48], fill=(DARK_BASE, DARK_BASE, DARK_BASE))
draw.text((proof_x, board_y + 75), "Both are RGB(120,120,120)", fill=(80, 80, 80), font=font_tiny)

py += board_size * cell + 50

# ============================================================
# PANEL 21: CORNSWEET ILLUSION
# ============================================================
draw.text((px, py), "TEST 21: Cornsweet Illusion", fill=(30, 30, 30), font=font_label)
py += 25

corn_w, corn_h = 400, 120
corn_img = Image.new('RGB', (corn_w, corn_h), (140, 140, 140))
mid_x = corn_w // 2

for y in range(corn_h):
    for x in range(corn_w):
        # Both halves are the same base gray (140)
        base = 140
        
        # Gradient only near the center boundary
        dist_from_center = abs(x - mid_x)
        if dist_from_center < 30:
            t = dist_from_center / 30.0  # 0 at center, 1 at edge of gradient
            if x < mid_x:
                # Left side: lighter near center
                val = base + int(40 * (1 - t))
            else:
                # Right side: darker near center
                val = base - int(40 * (1 - t))
        else:
            val = base
        
        corn_img.putpixel((x, y), (val, val, val))

img.paste(corn_img, (px, py))
draw.text((px + 80, py + corn_h + 5), "21a", fill=(120, 120, 120), font=font_small)

ground_truth["21a"] = {
    "test": "cornsweet_illusion",
    "description": "Two halves separated by opposing gradients at center boundary. Both halves are identical gray (140,140,140) except for 30px gradient zone at center.",
    "left_appears": "lighter",
    "right_appears": "darker",
    "actual": "identical (both RGB 140,140,140) except at center boundary",
    "question": "Do the left and right halves of 21a appear to be the same shade, or does one look lighter?"
}
py += corn_h + 30

# ============================================================
# PANEL 22: SIMULTANEOUS CONTRAST
# ============================================================
draw.text((px, py), "TEST 22: Simultaneous Contrast", fill=(30, 30, 30), font=font_label)
py += 25

# Same gray square on different backgrounds
target_gray = 128
backgrounds = [
    ("22a", 40, "dark"),      # dark background
    ("22b", 128, "medium"),   # medium (matching) background
    ("22c", 220, "light"),    # light background
    ("22d", 40, "dark"),      # dark, warm-tinted
    ("22e", 220, "light"),    # light, cool-tinted
]

for i, (tid, bg_val, desc) in enumerate(backgrounds):
    bx = px + i * 130
    
    if "warm" in desc:
        bg_color = (bg_val + 15, bg_val, bg_val - 10)
    elif "cool" in desc:
        bg_color = (bg_val - 10, bg_val, bg_val + 15)
    else:
        bg_color = (bg_val, bg_val, bg_val)
    
    # Background
    draw.rectangle([bx, py, bx + 110, py + 110], fill=bg_color)
    # Target square (identical in all)
    draw.rectangle([bx + 30, py + 30, bx + 80, py + 80], fill=(target_gray, target_gray, target_gray))
    draw.text((bx + 40, py + 115), tid, fill=(120, 120, 120), font=font_small)
    
    ground_truth[tid] = {
        "test": "simultaneous_contrast",
        "target_rgb": [target_gray, target_gray, target_gray],
        "background_rgb": list(bg_color),
        "all_targets_identical": True,
        "question": f"What shade is the center square in {tid}? Compare across all five."
    }

py += 140

# ============================================================
# PANEL 23: DRESS-LIKE AMBIGUOUS ILLUMINATION
# ============================================================
draw.text((px, py), "TEST 23: Ambiguous Illumination (Dress-inspired)", fill=(30, 30, 30), font=font_label)
py += 25

# Create a striped "dress" shape with ambiguous lighting
dress_w, dress_h = 150, 250

for variant, (tid, light_assumption) in enumerate([
    ("23a", "blue shadow over white/gold"),  # Bluish cast
    ("23b", "yellow light on blue/black"),    # Yellowish cast
    ("23c", "neutral"),                       # Balanced
]):
    dx = px + variant * 200
    dress = Image.new('RGB', (dress_w, dress_h), (245, 245, 240))
    dd = ImageDraw.Draw(dress)
    
    # The actual pixel colors are THE SAME in all three — they're the ambiguous colors
    # from the original dress phenomenon zone
    stripe_colors = [
        (130, 120, 165),  # The ambiguous blue/white stripe
        (100, 85, 55),    # The ambiguous black/gold stripe
    ]
    
    # But different backgrounds create different illumination context
    if variant == 0:
        # Blue-ish ambient light context (makes dress look white/gold)
        bg = (70, 80, 120)
        surround = (90, 100, 140)
    elif variant == 1:
        # Yellow-ish ambient light context (makes dress look blue/black)
        bg = (140, 130, 80)
        surround = (160, 150, 100)
    else:
        # Neutral
        bg = (120, 120, 120)
        surround = (140, 140, 140)
    
    # Fill background
    for y in range(dress_h):
        for x in range(dress_w):
            dress.putpixel((x, y), bg)
    
    # Draw dress shape (simple trapezoid)
    for y in range(30, 220):
        t = (y - 30) / 190
        half_width = int(25 + 40 * t)
        cx = dress_w // 2
        for x in range(cx - half_width, cx + half_width):
            stripe_idx = ((y - 30) // 15) % 2
            dress.putpixel((x, y), stripe_colors[stripe_idx])
    
    # Add surrounding context
    for y in range(dress_h):
        for x in range(dress_w):
            if dress.getpixel((x, y)) == bg:
                # Add slight gradient to suggest light direction
                grad = int((y / dress_h) * 20) - 10
                r, g, b = bg
                dress.putpixel((x, y), (
                    max(0, min(255, r + grad)),
                    max(0, min(255, g + grad)),
                    max(0, min(255, b + grad))
                ))
    
    img.paste(dress, (dx, py))
    draw.text((dx + 60, py + dress_h + 5), tid, fill=(120, 120, 120), font=font_small)
    
    ground_truth[tid] = {
        "test": "ambiguous_illumination",
        "stripe_colors_identical": True,
        "stripe_1_rgb": list(stripe_colors[0]),
        "stripe_2_rgb": list(stripe_colors[1]),
        "background_rgb": list(bg),
        "context": light_assumption,
        "question": f"Describe the colors of the stripes in {tid}. Do the three dresses look the same color to you?"
    }

py += dress_h + 30

# ============================================================
# PANEL 24: WHITE'S ILLUSION
# ============================================================
draw.text((px, py), "TEST 24: White's Illusion", fill=(30, 30, 30), font=font_label)
py += 25

wi_w, wi_h = 400, 100
wi = Image.new('RGB', (wi_w, wi_h), (180, 180, 180))
wid = ImageDraw.Draw(wi)

# Draw horizontal stripes
stripe_h = 20
for i in range(wi_h // stripe_h):
    y0 = i * stripe_h
    color = (20, 20, 20) if i % 2 == 0 else (230, 230, 230)
    wid.rectangle([0, y0, wi_w, y0 + stripe_h], fill=color)

# Insert identical gray patches in different stripe contexts
target = (128, 128, 128)
# Patch A: gray replacing part of WHITE stripe (will appear darker)
wid.rectangle([80, 1 * stripe_h, 130, 2 * stripe_h], fill=target)
wid.text((95, 1 * stripe_h + 3), "A", fill=(200, 200, 200), font=font_tiny)
# Patch B: gray replacing part of BLACK stripe (will appear lighter)
wid.rectangle([250, 2 * stripe_h, 300, 3 * stripe_h], fill=target)
wid.text((265, 2 * stripe_h + 3), "B", fill=(200, 200, 200), font=font_tiny)

img.paste(wi, (px, py))
draw.text((px + 180, py + wi_h + 5), "24a", fill=(120, 120, 120), font=font_small)

ground_truth["24a"] = {
    "test": "whites_illusion",
    "patch_A_rgb": list(target),
    "patch_B_rgb": list(target),
    "identical": True,
    "A_context": "replacing part of light stripe (flanked by dark stripes above/below)",
    "B_context": "replacing part of dark stripe (flanked by light stripes above/below)",
    "human_perception": "A appears darker than B despite identical RGB",
    "question": "Do patches A and B appear the same shade? Which looks lighter?"
}
py += wi_h + 30

# ============================================================
# PANEL 25: LOW-CONTRAST ON LIGHT BACKGROUND (counterpart to Test 1)
# ============================================================
draw.text((px, py), "TEST 25: Low-Contrast Discrimination — Light Background", fill=(30, 30, 30), font=font_label)
py += 25

light_bg = (220, 220, 215)
contrasts_light = [
    ("25a", light_bg, (170, 170, 165), "50-step darker"),
    ("25b", light_bg, (190, 190, 185), "30-step darker"),
    ("25c", light_bg, (205, 205, 200), "15-step darker"),
    ("25d", light_bg, (213, 213, 208), "7-step darker"),
    ("25e", light_bg, light_bg, "identical"),
    ("25f", light_bg, (220, 205, 215), "pink-shifted"),
]

for i, (tid, outer_col, inner_col, desc) in enumerate(contrasts_light):
    cx = px + 50 + i * 120
    cy = py + 55
    draw.ellipse([cx-45, cy-45, cx+45, cy+45], fill=outer_col)
    draw.pieslice([cx-28, cy-28, cx+28, cy+28], 180, 360, fill=inner_col)
    draw.text((cx-10, cy+50), tid, fill=(120, 120, 120), font=font_small)
    
    ground_truth[tid] = {
        "test": "low_contrast_light_bg",
        "outer_rgb": list(outer_col),
        "inner_rgb": list(inner_col),
        "delta": sum(abs(a-b) for a, b in zip(outer_col, inner_col)),
        "description": desc,
        "question": f"Is there a visible semicircle in the upper half of circle {tid}?"
    }

py += 130

# ============================================================
# PANEL 26: LOW-CONTRAST ON MEDIUM BACKGROUND 
# ============================================================
draw.text((px, py), "TEST 26: Low-Contrast Discrimination — Medium Background", fill=(30, 30, 30), font=font_label)
py += 25

med_bg = (130, 130, 128)
contrasts_med = [
    ("26a", med_bg, (80, 80, 78), "50-step darker"),
    ("26b", med_bg, (100, 100, 98), "30-step darker"),
    ("26c", med_bg, (115, 115, 113), "15-step darker"),
    ("26d", med_bg, (123, 123, 121), "7-step darker"),
    ("26e", med_bg, med_bg, "identical"),
    ("26f", med_bg, (180, 180, 178), "50-step lighter"),
    ("26g", med_bg, (160, 160, 158), "30-step lighter"),
    ("26h", med_bg, (145, 145, 143), "15-step lighter"),
]

for i, (tid, outer_col, inner_col, desc) in enumerate(contrasts_med):
    cx = px + 40 + i * 80
    cy = py + 45
    draw.ellipse([cx-32, cy-32, cx+32, cy+32], fill=outer_col)
    draw.pieslice([cx-20, cy-20, cx+20, cy+20], 180, 360, fill=inner_col)
    draw.text((cx-10, cy+38), tid, fill=(80, 80, 80), font=font_tiny)
    
    ground_truth[tid] = {
        "test": "low_contrast_medium_bg",
        "outer_rgb": list(outer_col),
        "inner_rgb": list(inner_col),
        "delta": sum(abs(a-b) for a, b in zip(outer_col, inner_col)),
        "description": desc,
        "question": f"Is there a visible semicircle in the upper half of circle {tid}?"
    }

py += 110

# ============================================================
# PANEL 27: GRADIENT THRESHOLDS ACROSS BACKGROUNDS
# ============================================================
draw.text((px, py), "TEST 27: Gradient Detection Across Backgrounds", fill=(30, 30, 30), font=font_label)
py += 25

# Same gradient, different background contexts
gradient_tests = [
    # (tid, bg, start, end, description)
    ("27a", (30, 30, 35), (60, 60, 65), (90, 90, 95), "30-step on dark bg"),
    ("27b", (130, 130, 128), (115, 115, 113), (145, 145, 143), "30-step on medium bg"),
    ("27c", (220, 220, 215), (190, 190, 185), (220, 220, 215), "30-step on light bg"),
    ("27d", (30, 30, 35), (35, 35, 40), (50, 50, 55), "15-step on dark bg"),
    ("27e", (130, 130, 128), (122, 122, 120), (137, 137, 135), "15-step on medium bg"),
    ("27f", (220, 220, 215), (212, 212, 207), (227, 227, 222), "15-step on light bg"),
]

for i, (tid, bg, start_col, end_col, desc) in enumerate(gradient_tests):
    row = i // 3
    col = i % 3
    gx = px + col * 200
    gy = py + row * 90
    gw, gh = 160, 60
    
    # Background
    draw.rectangle([gx - 5, gy - 5, gx + gw + 5, gy + gh + 5], fill=bg)
    
    # Gradient bar
    for x in range(gw):
        t = x / gw
        r = int(start_col[0] + (end_col[0] - start_col[0]) * t)
        g = int(start_col[1] + (end_col[1] - start_col[1]) * t)
        b = int(start_col[2] + (end_col[2] - start_col[2]) * t)
        for y in range(gh):
            img.putpixel((gx + x, gy + y), (r, g, b))
    
    draw.rectangle([gx, gy, gx + gw, gy + gh], outline=(100, 100, 100), width=1)
    draw.text((gx + 60, gy + gh + 3), tid, fill=(80, 80, 80), font=font_tiny)
    
    ground_truth[tid] = {
        "test": "gradient_across_bg",
        "background_rgb": list(bg),
        "start_rgb": list(start_col),
        "end_rgb": list(end_col),
        "step_range": sum(abs(e - s) for s, e in zip(start_col, end_col)),
        "description": desc,
        "question": f"Is {tid} a gradient or flat? If gradient, which direction?"
    }

py += 210

# ============================================================
# PANEL 28: COLOR CONSTANCY (colored illumination)
# ============================================================
draw.text((px, py), "TEST 28: Color Constancy Under Illumination", fill=(30, 30, 30), font=font_label)
py += 25

# Same "objects" under different simulated light colors
# A red square and a blue square under warm vs cool light
objects = [(200, 50, 50), (50, 50, 200)]  # "real" red and blue
illuminants = [
    ("28a", (1.0, 1.0, 1.0), "neutral"),
    ("28b", (1.2, 1.0, 0.7), "warm/yellowish"),
    ("28c", (0.7, 0.9, 1.3), "cool/bluish"),
    ("28d", (1.0, 1.2, 0.8), "greenish"),
]

for i, (tid, illum, desc) in enumerate(illuminants):
    bx = px + i * 160
    
    # Background "wall" under this illumination
    wall = tuple(max(0, min(255, int(200 * m))) for m in illum)
    draw.rectangle([bx, py, bx + 140, py + 100], fill=wall)
    
    # Objects under illumination
    for j, obj_color in enumerate(objects):
        lit_color = tuple(max(0, min(255, int(c * m))) for c, m in zip(obj_color, illum))
        ox = bx + 15 + j * 65
        draw.rectangle([ox, py + 25, ox + 50, py + 75], fill=lit_color)
    
    draw.text((bx + 55, py + 105), tid, fill=(80, 80, 80), font=font_small)
    
    ground_truth[tid] = {
        "test": "color_constancy",
        "illuminant": list(illum),
        "illuminant_desc": desc,
        "object_1_actual": [200, 50, 50],
        "object_1_rendered": [max(0, min(255, int(200 * illum[0]))), max(0, min(255, int(50 * illum[1]))), max(0, min(255, int(50 * illum[2])))],
        "object_2_actual": [50, 50, 200],
        "object_2_rendered": [max(0, min(255, int(50 * illum[0]))), max(0, min(255, int(50 * illum[1]))), max(0, min(255, int(200 * illum[2])))],
        "question": f"Describe the colors of the two squares in {tid}. Do you perceive them as the 'same objects' under different lighting across 28a-d?"
    }

py += 130

# ============================================================
# PANEL 29: MACH BANDS
# ============================================================
draw.text((px, py), "TEST 29: Mach Bands", fill=(30, 30, 30), font=font_label)
py += 25

# Uniform strips of increasing brightness with sharp boundaries
# Humans see dark/light edges at the boundaries (Mach bands)
mach_w, mach_h = 500, 80
mach = Image.new('RGB', (mach_w, mach_h), (128, 128, 128))

num_bands = 6
band_w = mach_w // num_bands
for i in range(num_bands):
    val = int(40 + (215 - 40) * i / (num_bands - 1))
    x0 = i * band_w
    for y in range(mach_h):
        for x in range(x0, x0 + band_w):
            mach.putpixel((x, y), (val, val, val))

img.paste(mach, (px, py))
draw.text((px + 230, py + mach_h + 5), "29a", fill=(80, 80, 80), font=font_small)

ground_truth["29a"] = {
    "test": "mach_bands",
    "description": "6 uniform bands of increasing brightness (40 to 215). Each band is internally uniform. Humans see illusory dark/light edges at boundaries (Mach bands effect).",
    "band_values": [int(40 + (215 - 40) * i / 5) for i in range(6)],
    "question": "Are the bands internally uniform, or do you see any variation within each band (especially at the edges between bands)?"
}

py += mach_h + 30

# ============================================================
# PANEL 30: HERMANN GRID
# ============================================================
draw.text((px, py), "TEST 30: Hermann Grid", fill=(30, 30, 30), font=font_label)
py += 25

grid_size = 200
sq_size = 35
gap = 8
grid_img = Image.new('RGB', (grid_size, grid_size), (200, 200, 200))
gd = ImageDraw.Draw(grid_img)

for row in range(5):
    for col in range(5):
        x0 = col * (sq_size + gap)
        y0 = row * (sq_size + gap)
        gd.rectangle([x0, y0, x0 + sq_size, y0 + sq_size], fill=(30, 30, 30))

img.paste(grid_img, (px, py))
draw.text((px + 80, py + grid_size + 5), "30a", fill=(80, 80, 80), font=font_small)

ground_truth["30a"] = {
    "test": "hermann_grid",
    "description": "5x5 grid of dark squares with light gray gaps. Humans typically see faint dark spots at the intersections of the light gaps (where they're not looking directly).",
    "gap_color_rgb": [200, 200, 200],
    "square_color_rgb": [30, 30, 30],
    "question": "Do you see any phantom dots or spots at the intersections of the gaps between the squares?"
}

# Also add inverted version (light squares, dark gaps)
inv_x = px + 230
inv_img = Image.new('RGB', (grid_size, grid_size), (40, 40, 40))
ivd = ImageDraw.Draw(inv_img)
for row in range(5):
    for col in range(5):
        x0 = col * (sq_size + gap)
        y0 = row * (sq_size + gap)
        ivd.rectangle([x0, y0, x0 + sq_size, y0 + sq_size], fill=(220, 220, 220))

img.paste(inv_img, (inv_x, py))
draw.text((inv_x + 80, py + grid_size + 5), "30b", fill=(80, 80, 80), font=font_small)

ground_truth["30b"] = {
    "test": "hermann_grid_inverted",
    "description": "Inverted: light squares on dark background. Humans may see bright phantom spots at dark intersections.",
    "question": "Do you see phantom spots in 30b?"
}

# Save
import json
img.save('/home/claude/vision_diagnostic_v3.png', quality=95)
with open('/home/claude/vision_diagnostic_v3_truth.json', 'w') as f:
    json.dump(ground_truth, f, indent=2)

print(f"Image: {WIDTH}x{HEIGHT}")
print(f"Tests: {len(ground_truth)} items across panels 20-30")
print(f"\nAdelson check — Square A pixel: {a_pixel}, Square B pixel: {b_pixel}, identical: {a_pixel == b_pixel}")
