"""
Vision Diagnostic v2: Photographic Nuance + OCR
Tests capabilities with realistic image challenges, not just synthetic shapes.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import json
import math
import random
import struct
import zlib

random.seed(42)

WIDTH, HEIGHT = 1200, 2200
BG = (240, 240, 235)  # light background like a document
img = Image.new('RGB', (WIDTH, HEIGHT), BG)
draw = ImageDraw.Draw(img)

try:
    font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    font_mono = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 12)
    font_mono_sm = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 9)
    font_serif = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 12)
    font_serif_it = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", 11)
except:
    font_label = font_body = font_small = font_mono = font_mono_sm = font_serif = font_serif_it = ImageFont.load_default()

ground_truth = {}
px, py = 30, 20

# ============================================================
# PANEL 11: OCR - CLEAN TEXT AT VARIOUS SIZES AND FONTS
# ============================================================
draw.text((px, py), "TEST 11: OCR — Clean Text", fill=(30, 30, 30), font=font_label)
py += 25

ocr_samples = [
    ("11a", font_label, "The quick brown fox jumps over the lazy dog.", 16, "sans-bold"),
    ("11b", font_body, "Pack my box with five dozen liquor jugs. 0123456789", 13, "sans"),
    ("11c", font_small, "Sphinx of black quartz, judge my vow! @#$%^&*()", 11, "sans-small"),
    ("11d", font_mono, "def hello(): return 'world'  # comment", 12, "monospace"),
    ("11e", font_mono_sm, "SELECT id, name FROM users WHERE active = 1 LIMIT 10;", 9, "mono-small"),
    ("11f", font_serif, "In Xanadu did Kubla Khan a stately pleasure-dome decree.", 12, "serif"),
    ("11g", font_serif_it, "Where Alph, the sacred river, ran through caverns measureless to man.", 11, "serif-italic"),
]

for tid, font, text, size, style in ocr_samples:
    draw.text((px + 40, py), text, fill=(20, 20, 20), font=font)
    draw.text((px, py + 2), tid, fill=(120, 120, 120), font=font_small)
    ground_truth[tid] = {
        "test": "ocr_clean",
        "text": text,
        "font_size": size,
        "font_style": style,
        "question": f"Read the text in {tid} exactly."
    }
    py += 22

py += 15

# ============================================================
# PANEL 12: OCR - DEGRADED / NOISY TEXT
# ============================================================
draw.text((px, py), "TEST 12: OCR — Degraded Text", fill=(30, 30, 30), font=font_label)
py += 25

# 12a: Low contrast text (light gray on white)
text_12a = "This text has very low contrast against its background."
draw.text((px + 40, py), text_12a, fill=(200, 200, 195), font=font_body)
draw.text((px, py + 2), "12a", fill=(120, 120, 120), font=font_small)
ground_truth["12a"] = {"test": "ocr_degraded", "text": text_12a, "degradation": "low contrast (light gray on near-white)", "question": "Read 12a."}
py += 25

# 12b: Dark text on dark background
rect_y = py
draw.rectangle([px + 38, py - 2, px + 600, py + 18], fill=(35, 35, 40))
text_12b = "Dark text on a dark background is hard to read."
draw.text((px + 40, py), text_12b, fill=(75, 75, 80), font=font_body)
draw.text((px, py + 2), "12b", fill=(120, 120, 120), font=font_small)
ground_truth["12b"] = {"test": "ocr_degraded", "text": text_12b, "degradation": "dark on dark (75,75,80 on 35,35,40)", "question": "Read 12b."}
py += 25

# 12c: Rotated text (slight angle)
text_12c = "Slightly rotated text, about 5 degrees."
txt_img = Image.new('RGBA', (500, 30), (240, 240, 235, 255))
txt_draw = ImageDraw.Draw(txt_img)
txt_draw.text((0, 5), text_12c, fill=(20, 20, 20, 255), font=font_body)
rotated = txt_img.rotate(5, expand=True, fillcolor=(240, 240, 235, 255))
img.paste(rotated.convert('RGB'), (px + 40, py))
draw.text((px, py + 2), "12c", fill=(120, 120, 120), font=font_small)
ground_truth["12c"] = {"test": "ocr_degraded", "text": text_12c, "degradation": "rotated 5 degrees", "question": "Read 12c."}
py += 35

# 12d: Blurred text
text_12d = "This text has been gaussian blurred."
txt_img2 = Image.new('RGB', (500, 25), BG)
txt_draw2 = ImageDraw.Draw(txt_img2)
txt_draw2.text((0, 3), text_12d, fill=(20, 20, 20), font=font_body)
blurred = txt_img2.filter(ImageFilter.GaussianBlur(radius=1.5))
img.paste(blurred, (px + 40, py))
draw.text((px, py + 2), "12d", fill=(120, 120, 120), font=font_small)
ground_truth["12d"] = {"test": "ocr_degraded", "text": text_12d, "degradation": "gaussian blur radius 1.5", "question": "Read 12d."}
py += 25

# 12e: JPEG artifact simulation (downsample + upsample)
text_12e = "JPEG compression artifacts degrade text quality."
txt_img3 = Image.new('RGB', (500, 25), BG)
txt_draw3 = ImageDraw.Draw(txt_img3)
txt_draw3.text((0, 3), text_12e, fill=(20, 20, 20), font=font_body)
tiny = txt_img3.resize((125, 6), Image.NEAREST)
jpeggy = tiny.resize((500, 25), Image.NEAREST)
img.paste(jpeggy, (px + 40, py))
draw.text((px, py + 2), "12e", fill=(120, 120, 120), font=font_small)
ground_truth["12e"] = {"test": "ocr_degraded", "text": text_12e, "degradation": "severe downscale + nearest-neighbor upscale (simulated heavy JPEG)", "question": "Read 12e."}
py += 25

# 12f: Colored text on colored background
draw.rectangle([px + 38, py - 2, px + 600, py + 18], fill=(40, 60, 100))
text_12f = "Blue text on a slightly different blue background."
draw.text((px + 40, py), text_12f, fill=(70, 100, 160), font=font_body)
draw.text((px, py + 2), "12f", fill=(120, 120, 120), font=font_small)
ground_truth["12f"] = {"test": "ocr_degraded", "text": text_12f, "degradation": "blue on blue (70,100,160 on 40,60,100)", "question": "Read 12f."}
py += 30

# 12g: Overlapping text
text_12g_back = "Background text that should be ignored"
text_12g_front = "Foreground text is what matters here."
draw.text((px + 40, py), text_12g_back, fill=(180, 180, 175), font=font_body)
draw.text((px + 55, py + 3), text_12g_front, fill=(30, 30, 30), font=font_body)
draw.text((px, py + 2), "12g", fill=(120, 120, 120), font=font_small)
ground_truth["12g"] = {
    "test": "ocr_degraded", 
    "text_foreground": text_12g_front,
    "text_background": text_12g_back,
    "degradation": "overlapping text layers",
    "question": "Read both text layers in 12g."
}
py += 35

py += 10

# ============================================================
# PANEL 13: SCREENSHOT / UI ELEMENT RECOGNITION
# ============================================================
draw.text((px, py), "TEST 13: UI Element Recognition", fill=(30, 30, 30), font=font_label)
py += 25

# 13a: Simulated button row
buttons = [
    ("Save", (59, 130, 246), (255, 255, 255)),      # blue button
    ("Cancel", (240, 240, 235), (60, 60, 60)),       # gray button
    ("Delete", (220, 50, 50), (255, 255, 255)),      # red button
]
bx = px
for label, bg_col, txt_col in buttons:
    bw = 90
    draw.rounded_rectangle([bx, py, bx + bw, py + 32], radius=6, fill=bg_col, outline=(180, 180, 180))
    tw = draw.textlength(label, font=font_body)
    draw.text((bx + (bw - tw) / 2, py + 8), label, fill=txt_col, font=font_body)
    bx += bw + 12

draw.text((bx + 20, py + 8), "13a", fill=(120, 120, 120), font=font_small)
ground_truth["13a"] = {
    "test": "ui_recognition",
    "elements": [{"type": "button", "label": b[0], "color": b[1]} for b in buttons],
    "question": "Describe the UI elements in 13a (types, labels, colors, states)."
}
py += 45

# 13b: Simulated form with labels + inputs
form_fields = [
    ("Name:", "John Doe", False),
    ("Email:", "john@example.com", False),
    ("Password:", "••••••••", True),
]
for label, value, is_password in form_fields:
    draw.text((px, py + 5), label, fill=(60, 60, 60), font=font_body)
    # Input box
    draw.rounded_rectangle([px + 80, py, px + 320, py + 26], radius=4, fill=(255, 255, 255), outline=(200, 200, 200))
    draw.text((px + 86, py + 5), value, fill=(40, 40, 40), font=font_body)
    py += 32

draw.text((px + 340, py - 50), "13b", fill=(120, 120, 120), font=font_small)
ground_truth["13b"] = {
    "test": "ui_recognition",
    "elements": [{"type": "form_field", "label": f[0], "value": f[1], "masked": f[2]} for f in form_fields],
    "question": "Read all form labels and values in 13b."
}
py += 15

# 13c: Simulated table
draw.text((px, py), "13c", fill=(120, 120, 120), font=font_small)
py += 5
headers = ["ID", "Name", "Status", "Score"]
rows = [
    ["001", "Alice Chen", "Active", "94.2"],
    ["002", "Bob Kumar", "Pending", "87.5"],
    ["003", "Carol Ø'Brien", "Inactive", "91.8"],
    ["004", "Dan Müller", "Active", "76.3"],
]
col_widths = [60, 140, 90, 80]
col_x = px + 20

# Header
rx = col_x
draw.rectangle([col_x - 5, py, col_x + sum(col_widths) + 15, py + 22], fill=(50, 50, 60))
for hi, header in enumerate(headers):
    draw.text((rx + 5, py + 4), header, fill=(255, 255, 255), font=font_body)
    rx += col_widths[hi]
py += 22

# Rows
for ri, row in enumerate(rows):
    bg = (255, 255, 255) if ri % 2 == 0 else (245, 245, 250)
    draw.rectangle([col_x - 5, py, col_x + sum(col_widths) + 15, py + 20], fill=bg)
    rx = col_x
    for ci, cell in enumerate(row):
        color = (40, 40, 40)
        if ci == 2:
            color = {"Active": (30, 130, 50), "Pending": (180, 140, 20), "Inactive": (180, 50, 50)}[cell]
        draw.text((rx + 5, py + 3), cell, fill=color, font=font_small)
        rx += col_widths[ci]
    py += 20

ground_truth["13c"] = {
    "test": "ui_recognition",
    "table": {"headers": headers, "rows": rows},
    "special_chars": ["Ø in O'Brien", "ü in Müller"],
    "question": "Read the entire table including special characters. What color coding is used for Status?"
}
py += 25

# ============================================================
# PANEL 14: PHOTOGRAPHIC NUANCE (simulated)
# ============================================================
draw.text((px, py), "TEST 14: Photographic Nuance (simulated scenes)", fill=(30, 30, 30), font=font_label)
py += 25

# 14a: Shadow gradient - object casting shadow
scene_w, scene_h = 250, 150
scene = Image.new('RGB', (scene_w, scene_h), (200, 195, 180))  # warm surface
sdraw = ImageDraw.Draw(scene)

# Floor gradient (light from upper-right)
for y in range(scene_h):
    for x in range(scene_w):
        base = 200 - int(y * 0.2)
        # Shadow region (cast by object to lower-left)
        shadow_intensity = 0
        if 80 < x < 160 and 70 < y < 130:
            dist_from_center = math.hypot(x - 120, y - 100) / 50
            shadow_intensity = max(0, int(40 * (1 - dist_from_center)))
        v = max(0, min(255, base - shadow_intensity))
        scene.putpixel((x, y), (v, v - 5, v - 15))

# Object (simple cube-ish shape)
sdraw.polygon([(100, 30), (150, 20), (160, 60), (110, 70)], fill=(180, 60, 40))  # top face
sdraw.polygon([(100, 30), (110, 70), (110, 120), (100, 80)], fill=(140, 45, 30))  # left face
sdraw.polygon([(110, 70), (160, 60), (160, 110), (110, 120)], fill=(160, 55, 35))  # front face

# Subtle reflection on surface below
for x in range(105, 155):
    for y in range(122, 135):
        existing = scene.getpixel((x, y))
        # Very faint red tint from reflected object
        r = min(255, existing[0] + 8)
        scene.putpixel((x, y), (r, existing[1], existing[2]))

img.paste(scene, (px, py))
draw.text((px + 100, py + scene_h + 3), "14a", fill=(120, 120, 120), font=font_small)
ground_truth["14a"] = {
    "test": "photographic_nuance",
    "elements": [
        "red/brown box-like object",
        "soft shadow cast below and to the left",
        "subtle warm surface gradient (lighter at top)",
        "very faint reddish reflection on surface below object"
    ],
    "question": "Describe everything visible in 14a including lighting, shadows, and any reflections."
}

# 14b: Depth of field simulation
dof_x = px + 280
dof = Image.new('RGB', (250, 150), (100, 140, 90))  # green "field"
ddraw = ImageDraw.Draw(dof)

# "Near" objects (sharp) — foreground circles
for cx, cy, r, col in [(40, 110, 18, (220, 60, 50)), (80, 120, 14, (50, 60, 200))]:
    ddraw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)

# "Far" objects (should be blurred) — background circles
bg_layer = Image.new('RGB', (250, 150), (0, 0, 0))
bg_draw = ImageDraw.Draw(bg_layer)
for cx, cy, r, col in [(150, 40, 20, (220, 200, 50)), (200, 50, 15, (200, 50, 180))]:
    bg_draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)
bg_blurred = bg_layer.filter(ImageFilter.GaussianBlur(radius=4))

# Composite: blend blurred background onto field, then sharp foreground
for y in range(150):
    for x in range(250):
        bg_pix = bg_blurred.getpixel((x, y))
        fg_pix = dof.getpixel((x, y))
        if bg_pix != (0, 0, 0):
            dof.putpixel((x, y), bg_pix)

# Re-draw sharp foreground objects on top
ddraw2 = ImageDraw.Draw(dof)
for cx, cy, r, col in [(40, 110, 18, (220, 60, 50)), (80, 120, 14, (50, 60, 200))]:
    ddraw2.ellipse([cx-r, cy-r, cx+r, cy+r], fill=col)

img.paste(dof, (dof_x, py))
draw.text((dof_x + 100, py + 155), "14b", fill=(120, 120, 120), font=font_small)
ground_truth["14b"] = {
    "test": "photographic_nuance",
    "elements": {
        "foreground_sharp": ["red circle (lower left)", "blue circle (lower center)"],
        "background_blurred": ["yellow circle (upper right area)", "purple/magenta circle (far right)"],
        "background": "green field"
    },
    "question": "Describe 14b. Which objects appear sharp vs blurred? What does the blur suggest about depth?"
}

# 14c: Highlights and specular
spec_x = px + 560
spec = Image.new('RGB', (250, 150), (30, 30, 35))
for y in range(150):
    for x in range(250):
        # Sphere shape
        cx, cy, r = 125, 75, 60
        dx, dy = x - cx, y - cy
        dist = math.hypot(dx, dy)
        if dist < r:
            # Basic sphere shading (light from upper-right)
            nx, ny = dx / r, dy / r
            nz = math.sqrt(max(0, 1 - nx*nx - ny*ny))
            # Diffuse
            lx, ly, lz = 0.5, -0.5, 0.7
            lmag = math.sqrt(lx*lx + ly*ly + lz*lz)
            lx, ly, lz = lx/lmag, ly/lmag, lz/lmag
            diffuse = max(0, nx*lx + ny*ly + nz*lz)
            # Specular
            rx_r = 2 * (nx*lx + ny*ly + nz*lz) * nx - lx
            ry_r = 2 * (nx*lx + ny*ly + nz*lz) * ny - ly
            rz_r = 2 * (nx*lx + ny*ly + nz*lz) * nz - lz
            spec_val = max(0, rz_r) ** 32
            
            base_r = int(60 + 120 * diffuse + 200 * spec_val)
            base_g = int(30 + 40 * diffuse + 200 * spec_val)
            base_b = int(30 + 40 * diffuse + 200 * spec_val)
            spec.putpixel((x, y), (min(255, base_r), min(255, base_g), min(255, base_b)))

img.paste(spec, (spec_x, py))
draw.text((spec_x + 100, py + 155), "14c", fill=(120, 120, 120), font=font_small)
ground_truth["14c"] = {
    "test": "photographic_nuance",
    "elements": [
        "red/dark-red sphere with 3D shading",
        "light source from upper-right",
        "specular highlight (bright spot) on upper-right of sphere",
        "dark shadowed area on lower-left",
        "gradual falloff across surface (diffuse shading)"
    ],
    "question": "Describe the 3D qualities of 14c. Where is the light coming from? Where is the specular highlight?"
}
py += 180

# ============================================================
# PANEL 15: COMPRESSION ARTIFACT DETECTION
# ============================================================
draw.text((px, py), "TEST 15: Compression Artifacts", fill=(30, 30, 30), font=font_label)
py += 25

# Create sharp original
orig = Image.new('RGB', (200, 120), (240, 240, 235))
odraw = ImageDraw.Draw(orig)
# Sharp diagonal line
odraw.line([(10, 10), (190, 110)], fill=(0, 0, 0), width=2)
# Sharp circle
odraw.ellipse([60, 20, 140, 100], outline=(200, 40, 40), width=2)
# Text
odraw.text((70, 45), "SHARP", fill=(0, 0, 0), font=font_body)

# 15a: Original (clean)
img.paste(orig, (px, py))
draw.text((px + 80, py + 125), "15a", fill=(120, 120, 120), font=font_small)

# 15b: Moderate JPEG (quality=20)
import io
buf = io.BytesIO()
orig.save(buf, format='JPEG', quality=20)
buf.seek(0)
jpeg_20 = Image.open(buf)
img.paste(jpeg_20, (px + 220, py))
draw.text((px + 300, py + 125), "15b", fill=(120, 120, 120), font=font_small)

# 15c: Severe JPEG (quality=5)
buf2 = io.BytesIO()
orig.save(buf2, format='JPEG', quality=5)
buf2.seek(0)
jpeg_5 = Image.open(buf2)
img.paste(jpeg_5, (px + 440, py))
draw.text((px + 520, py + 125), "15c", fill=(120, 120, 120), font=font_small)

# 15d: Downscaled 4x then upscaled (pixelation)
tiny_orig = orig.resize((50, 30), Image.NEAREST)
pixelated = tiny_orig.resize((200, 120), Image.NEAREST)
img.paste(pixelated, (px + 660, py))
draw.text((px + 740, py + 125), "15d", fill=(120, 120, 120), font=font_small)

ground_truth["15a"] = {"test": "compression_artifacts", "quality": "original", "question": "Describe 15a image quality and read any text."}
ground_truth["15b"] = {"test": "compression_artifacts", "quality": "JPEG q=20", "question": "Describe 15b artifacts vs 15a. Can you still read the text?"}
ground_truth["15c"] = {"test": "compression_artifacts", "quality": "JPEG q=5", "question": "Describe 15c artifacts. Is the text readable?"}
ground_truth["15d"] = {"test": "compression_artifacts", "quality": "4x downscale+upscale", "question": "Describe 15d. What type of degradation is this?"}

py += 155

# ============================================================
# PANEL 16: MIXED-SCRIPT / SPECIAL CHARACTER OCR
# ============================================================
draw.text((px, py), "TEST 16: Special Characters & Mixed Content", fill=(30, 30, 30), font=font_label)
py += 25

special_texts = [
    ("16a", "Ångström → naïve café résumé", "diacritics"),
    ("16b", "π ≈ 3.14159  ∑(n²) = n(n+1)(2n+1)/6", "math symbols"),
    ("16c", "Temperature: 72°F / 22.2°C  ±0.5°", "units and degrees"),
    ("16d", "user@host:~$ git diff HEAD~3..HEAD --stat", "terminal/shell"),
    ("16e", "if (x != null && x.length > 0) { return x[0]; }", "code with operators"),
    ("16f", "Price: $1,234.56 | €1,089.12 | ¥142,500", "currency"),
    ("16g", "v2.1.0-rc.3+build.2026.03.25", "semantic version string"),
    ("16h", "https://api.example.com/v1/users?page=2&limit=50", "URL with params"),
]

for tid, text, desc in special_texts:
    f = font_mono if "code" in desc or "terminal" in desc or "version" in desc or "URL" in desc else font_body
    draw.text((px + 40, py), text, fill=(20, 20, 20), font=f)
    draw.text((px, py + 2), tid, fill=(120, 120, 120), font=font_small)
    ground_truth[tid] = {
        "test": "special_char_ocr",
        "text": text,
        "category": desc,
        "question": f"Read {tid} exactly, including all special characters."
    }
    py += 22

py += 15

# ============================================================
# PANEL 17: HANDWRITING SIMULATION
# ============================================================
draw.text((px, py), "TEST 17: Handwriting-like Text", fill=(30, 30, 30), font=font_label)
py += 25

# Simulate wobbly handwriting by drawing text with jitter
def draw_wobbly_text(draw, x, y, text, fill, font, jitter=2):
    for i, ch in enumerate(text):
        cx = x + i * 9
        cy = y + random.randint(-jitter, jitter)
        draw.text((cx, cy), ch, fill=fill, font=font)

# 17a: Neat handwriting sim
draw.text((px, py + 2), "17a", fill=(120, 120, 120), font=font_small)
text_17a = "Meeting at 3pm Tuesday"
draw_wobbly_text(draw, px + 40, py, text_17a, fill=(30, 30, 120), font=font_body, jitter=1)
ground_truth["17a"] = {"test": "handwriting_ocr", "text": text_17a, "jitter": 1, "question": "Read 17a."}
py += 25

# 17b: Messier handwriting sim
draw.text((px, py + 2), "17b", fill=(120, 120, 120), font=font_small)
text_17b = "Call Dr. Johnson re: lab results"
draw_wobbly_text(draw, px + 40, py, text_17b, fill=(30, 30, 120), font=font_body, jitter=3)
ground_truth["17b"] = {"test": "handwriting_ocr", "text": text_17b, "jitter": 3, "question": "Read 17b."}
py += 25

# 17c: Very messy + small
draw.text((px, py + 2), "17c", fill=(120, 120, 120), font=font_small)
text_17c = "Pick up milk + eggs (organic)"
draw_wobbly_text(draw, px + 40, py, text_17c, fill=(40, 40, 130), font=font_small, jitter=4)
ground_truth["17c"] = {"test": "handwriting_ocr", "text": text_17c, "jitter": 4, "question": "Read 17c."}
py += 30

# ============================================================
# PANEL 18: INFORMATION HIERARCHY / LAYOUT UNDERSTANDING
# ============================================================
draw.text((px, py), "TEST 18: Layout & Information Hierarchy", fill=(30, 30, 30), font=font_label)
py += 25

# Simulated card/dashboard layout
card_w, card_h = 180, 100
cards_data = [
    ("Revenue", "$42.3K", "+12.5%", (30, 130, 70)),
    ("Users", "8,241", "-3.2%", (200, 50, 50)),
    ("Orders", "1,847", "+8.1%", (30, 130, 70)),
]

for i, (title, value, change, change_color) in enumerate(cards_data):
    cx = px + i * (card_w + 15)
    draw.rounded_rectangle([cx, py, cx + card_w, py + card_h], radius=8, fill=(255, 255, 255), outline=(220, 220, 220))
    draw.text((cx + 12, py + 10), title, fill=(120, 120, 120), font=font_small)
    draw.text((cx + 12, py + 30), value, fill=(30, 30, 30), font=font_label)
    draw.text((cx + 12, py + 55), change, fill=change_color, font=font_body)
    # Arrow indicator
    arrow_y = py + 58
    if change.startswith("+"):
        draw.polygon([(cx+75, arrow_y+10), (cx+80, arrow_y), (cx+85, arrow_y+10)], fill=change_color)
    else:
        draw.polygon([(cx+75, arrow_y), (cx+80, arrow_y+10), (cx+85, arrow_y)], fill=change_color)

draw.text((px + 3 * (card_w + 15) + 5, py + 40), "18a", fill=(120, 120, 120), font=font_small)
ground_truth["18a"] = {
    "test": "layout_understanding",
    "cards": [{"title": c[0], "value": c[1], "change": c[2], "direction": "up" if c[2].startswith("+") else "down"} for c in cards_data],
    "question": "Read all metric cards in 18a. For each: title, value, change percentage, and direction (up/down)."
}
py += card_h + 20

# 18b: Two-column layout with different content
col1_x = px
col2_x = px + 350
draw.text((col1_x, py), "Latest Updates", fill=(30, 30, 30), font=font_label)
draw.text((col2_x, py), "Quick Stats", fill=(30, 30, 30), font=font_label)
py += 22

updates = [
    "• Server migration completed at 14:32 UTC",
    "• New API endpoint /v2/batch deployed",
    "• SSL certificate renewed (expires 2027-03-24)",
]
stats = [
    "Uptime: 99.97%",
    "Avg Response: 142ms",
    "Error Rate: 0.03%",
    "Active Connections: 12,847",
]

for i, update in enumerate(updates):
    draw.text((col1_x, py + i * 18), update, fill=(50, 50, 50), font=font_small)
for i, stat in enumerate(stats):
    draw.text((col2_x, py + i * 18), stat, fill=(50, 50, 50), font=font_small)

draw.text((col1_x, py + max(len(updates), len(stats)) * 18 + 5), "18b", fill=(120, 120, 120), font=font_small)
ground_truth["18b"] = {
    "test": "layout_understanding",
    "left_column": {"title": "Latest Updates", "items": updates},
    "right_column": {"title": "Quick Stats", "items": stats},
    "question": "Read both columns in 18b completely, maintaining the two-column structure."
}
py += max(len(updates), len(stats)) * 18 + 25

# ============================================================
# PANEL 19: SUBTLE VISUAL DIFFERENCES
# ============================================================
draw.text((px, py), "TEST 19: Spot the Difference", fill=(30, 30, 30), font=font_label)
py += 25

# Two near-identical panels with subtle differences
panel_w, panel_h = 250, 130
p1 = Image.new('RGB', (panel_w, panel_h), (255, 255, 255))
p2 = Image.new('RGB', (panel_w, panel_h), (255, 255, 255))
p1d, p2d = ImageDraw.Draw(p1), ImageDraw.Draw(p2)

# Shared elements
for d in [p1d, p2d]:
    d.rectangle([20, 20, 80, 80], fill=(60, 60, 200))           # blue square
    d.ellipse([100, 30, 160, 90], fill=(200, 60, 60))           # red circle
    d.polygon([(190, 80), (210, 30), (230, 80)], fill=(60, 180, 60))  # green triangle

# Differences:
# 1. Blue square slightly different shade in p2
p2d.rectangle([20, 20, 80, 80], fill=(60, 60, 215))  # slightly lighter blue
# 2. Extra small yellow dot in p2 only
p2d.ellipse([145, 65, 155, 75], fill=(230, 210, 50))
# 3. Triangle slightly taller in p1 vs p2
# (p1 already has correct triangle; p2 is slightly shorter)
p2d.polygon([(190, 80), (210, 40), (230, 80)], fill=(60, 180, 60))

# 4. Tiny text in corner
p1d.text((200, 105), "v1.0", fill=(180, 180, 180), font=font_small)
p2d.text((200, 105), "v1.1", fill=(180, 180, 180), font=font_small)

img.paste(p1, (px, py))
img.paste(p2, (px + panel_w + 30, py))
draw.text((px + panel_w // 2 - 5, py + panel_h + 3), "19L", fill=(120, 120, 120), font=font_small)
draw.text((px + panel_w + 30 + panel_w // 2 - 5, py + panel_h + 3), "19R", fill=(120, 120, 120), font=font_small)

ground_truth["19"] = {
    "test": "spot_the_difference",
    "differences": [
        "Blue square: slightly lighter blue in 19R (60,60,200 vs 60,60,215)",
        "Small yellow dot present in 19R only (near red circle)",
        "Green triangle: slightly shorter in 19R (peak at y=40 vs y=30)",
        "Version text in bottom-right: 'v1.0' in 19L vs 'v1.1' in 19R"
    ],
    "question": "Find all differences between 19L and 19R."
}

# Save
img.save('/home/claude/vision_diagnostic_v2.png', quality=95)

with open('/home/claude/vision_diagnostic_v2_truth.json', 'w') as f:
    json.dump(ground_truth, f, indent=2)

print(f"Image: {WIDTH}x{HEIGHT}")
print(f"Tests: {len(ground_truth)} items across panels 11-19")
