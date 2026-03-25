"""
Vision Diagnostic v4: Real-world scenarios
- Photographic realism (noise, DOF, JPEG, mixed lighting)
- Transparency / alpha compositing
- Scale comprehension
- Chart/graph reading
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import math, random, json, io

random.seed(42)
np.random.seed(42)

WIDTH, HEIGHT = 1200, 2400
img = Image.new('RGB', (WIDTH, HEIGHT), (245, 245, 240))
draw = ImageDraw.Draw(img)

try:
    fl = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    fs = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    ft = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
except:
    fl = fs = ft = ImageFont.load_default()

gt = {}
px, py = 30, 20

# ============================================================
# PANEL 31: PHOTOGRAPHIC REALISM — noise, grain, mixed lighting
# ============================================================
draw.text((px, py), "TEST 31: Photo-Realistic Scenes", fill=(30,30,30), font=fl)
py += 25

# 31a: Indoor scene with warm lamp + cool window light, noise
scene_w, scene_h = 280, 180
sc = Image.new('RGB', (scene_w, scene_h), (45, 40, 35))

for y in range(scene_h):
    for x in range(scene_w):
        # Base: dark room
        r, g, b = 45, 40, 35

        # Warm lamp glow (upper-left)
        lamp_cx, lamp_cy = 60, 30
        lamp_dist = math.hypot(x - lamp_cx, y - lamp_cy)
        if lamp_dist < 120:
            intensity = max(0, 1 - lamp_dist / 120)
            r += int(80 * intensity)
            g += int(50 * intensity)
            b += int(15 * intensity)

        # Cool window light (right side)
        if x > 180:
            win_intensity = (x - 180) / 100
            r += int(20 * win_intensity)
            g += int(35 * win_intensity)
            b += int(55 * win_intensity)

        # Floor reflection
        if y > 130:
            floor_t = (y - 130) / 50
            r += int(15 * floor_t)
            g += int(12 * floor_t)
            b += int(8 * floor_t)

        # Photographic noise
        noise = random.randint(-8, 8)
        r = max(0, min(255, r + noise))
        g = max(0, min(255, g + noise))
        b = max(0, min(255, b + noise))
        sc.putpixel((x, y), (r, g, b))

# Objects in scene
scd = ImageDraw.Draw(sc)
# Book on table (warm-lit)
scd.rectangle([30, 80, 90, 110], fill=(140, 90, 50))
scd.rectangle([32, 82, 88, 108], fill=(180, 160, 120))  # pages
# Cup (cool-lit side)
scd.ellipse([200, 70, 240, 90], fill=(80, 90, 110))
scd.rectangle([205, 80, 235, 120], fill=(75, 85, 105))
scd.ellipse([200, 110, 240, 130], fill=(70, 80, 100))
# Subtle steam from cup (very faint)
for i in range(20):
    sx = 220 + random.randint(-8, 8)
    sy = 65 - i * 2 + random.randint(-2, 2)
    if 0 <= sx < scene_w and 0 <= sy < scene_h:
        existing = sc.getpixel((sx, sy))
        sc.putpixel((sx, sy), (min(255, existing[0]+6), min(255, existing[1]+8), min(255, existing[2]+10)))

img.paste(sc, (px, py))
draw.text((px+120, py+scene_h+3), "31a", fill=(120,120,120), font=fs)
gt["31a"] = {
    "test": "photorealistic_scene",
    "elements": ["warm lamp glow upper-left", "cool window light right side",
                 "book with pages on table (warm-lit)", "cup/mug (cool-lit side)",
                 "very faint steam above cup (~6-10 RGB units)", "photographic noise throughout",
                 "floor reflection at bottom"],
    "question": "Describe everything in 31a including lighting conditions, objects, and subtle details."
}

# 31b: Outdoor scene — bright sky gradient, foreground shadow
out_w, out_h = 280, 180
out = Image.new('RGB', (out_w, out_h), (100, 150, 200))
for y in range(out_h):
    sky_t = y / out_h
    # Sky gradient: blue at top → lighter at horizon
    if y < out_h * 0.55:
        t = y / (out_h * 0.55)
        r = int(80 + 100 * t)
        g = int(130 + 70 * t)
        b = int(210 - 20 * t)
    else:
        # Ground
        gt_t = (y - out_h * 0.55) / (out_h * 0.45)
        r = int(90 + 40 * (1-gt_t))
        g = int(130 - 30 * gt_t)
        b = int(60 - 20 * gt_t)
    # Noise
    n = random.randint(-5, 5)
    out.putpixel((out_w//2, y), (max(0,min(255,r+n)), max(0,min(255,g+n)), max(0,min(255,b+n))))

# Fill columns
for y in range(out_h):
    center_pixel = out.getpixel((out_w//2, y))
    for x in range(out_w):
        n = random.randint(-4, 4)
        out.putpixel((x, y), tuple(max(0, min(255, c+n)) for c in center_pixel))

od = ImageDraw.Draw(out)
# Tree silhouette (foreground)
od.polygon([(40,60),(70,20),(100,60)], fill=(30,50,25))
od.polygon([(50,80),(70,30),(90,80)], fill=(25,45,20))
od.rectangle([63, 80, 77, 120], fill=(60,40,25))
# Shadow of tree on ground
for x in range(70, 150):
    for y in range(int(out_h*0.55), int(out_h*0.55)+40):
        if 0 <= x < out_w and 0 <= y < out_h:
            shadow_strength = max(0, 1 - abs(x-110)/40) * max(0, 1-(y-out_h*0.55)/40)
            existing = out.getpixel((x, y))
            darkened = tuple(max(0, int(c - 25*shadow_strength)) for c in existing)
            out.putpixel((x, y), darkened)

# Distant mountains (atmospheric perspective)
for x in range(out_w):
    mountain_y = int(out_h*0.45 + 15*math.sin(x/30) + 8*math.sin(x/12))
    for y in range(mountain_y, int(out_h*0.55)):
        # Hazy, desaturated — atmospheric perspective
        dist_haze = 0.5
        base = out.getpixel((x, y))
        haze_color = (160, 170, 190)
        blended = tuple(int(c*(1-dist_haze) + h*dist_haze) for c, h in zip(base, haze_color))
        out.putpixel((x, y), blended)

img.paste(out, (px + 310, py))
draw.text((px+310+120, py+out_h+3), "31b", fill=(120,120,120), font=fs)
gt["31b"] = {
    "test": "photorealistic_scene",
    "elements": ["sky gradient (deep blue top → lighter horizon)", "ground (green-brown)",
                 "tree silhouette foreground with trunk", "tree shadow cast on ground (subtle)",
                 "distant mountains with atmospheric haze/perspective",
                 "photographic noise throughout"],
    "question": "Describe 31b's scene, lighting, depth cues, and atmospheric effects."
}

py += scene_h + 30

# ============================================================
# PANEL 32: TRANSPARENCY / ALPHA COMPOSITING
# ============================================================
draw.text((px, py), "TEST 32: Transparency & Alpha", fill=(30,30,30), font=fl)
py += 25

# 32a: Overlapping semi-transparent colored panels
tw, th = 250, 180
tp = Image.new('RGB', (tw, th), (240, 240, 235))
# Red panel at 50% opacity
for y in range(30, 130):
    for x in range(20, 140):
        bg = (240, 240, 235)
        fg = (220, 50, 50)
        alpha = 0.5
        blended = tuple(int(f*alpha + b*(1-alpha)) for f, b in zip(fg, bg))
        tp.putpixel((x, y), blended)
# Blue panel at 50% opacity, overlapping red
for y in range(60, 160):
    for x in range(80, 200):
        existing = tp.getpixel((x, y))
        fg = (50, 50, 220)
        alpha = 0.5
        blended = tuple(int(f*alpha + e*(1-alpha)) for f, e in zip(fg, existing))
        tp.putpixel((x, y), blended)
# Green panel at 30% opacity over everything
for y in range(10, 110):
    for x in range(130, 230):
        existing = tp.getpixel((x, y))
        fg = (50, 200, 50)
        alpha = 0.3
        blended = tuple(int(f*alpha + e*(1-alpha)) for f, e in zip(fg, existing))
        tp.putpixel((x, y), blended)

img.paste(tp, (px, py))
draw.text((px+110, py+th+3), "32a", fill=(120,120,120), font=fs)
gt["32a"] = {
    "test": "transparency",
    "panels": [
        {"color": "red", "alpha": 0.5, "position": "left"},
        {"color": "blue", "alpha": 0.5, "position": "center-right, overlapping red"},
        {"color": "green", "alpha": 0.3, "position": "right, overlapping blue area"}
    ],
    "overlap_zones": [
        "red+blue → muted purple/mauve",
        "blue+green → teal-ish",
        "red+blue+green in small overlap region"
    ],
    "question": "Identify all transparent layers, their colors, approximate opacities, and overlap zones in 32a."
}

# 32b: Frosted glass / gaussian blur behind object
fg_w, fg_h = 250, 180
fgimg = Image.new('RGB', (fg_w, fg_h), (240, 240, 235))
fgd = ImageDraw.Draw(fgimg)
# Background pattern
for i in range(20):
    cx = random.randint(0, fg_w)
    cy = random.randint(0, fg_h)
    r = random.randint(8, 25)
    color = random.choice([(200,60,60), (60,60,200), (60,180,60), (200,200,60)])
    fgd.ellipse([cx-r, cy-r, cx+r, cy+r], fill=color)
fgd.text((20, 80), "HELLO WORLD", fill=(30,30,30), font=fl)

# Apply frosted glass to center rectangle
frost_region = fgimg.crop((60, 40, 190, 140))
frosted = frost_region.filter(ImageFilter.GaussianBlur(radius=6))
# Lighten slightly (glass tint)
from PIL import ImageEnhance
frosted = ImageEnhance.Brightness(frosted).enhance(1.15)
fgimg.paste(frosted, (60, 40))
# Draw glass border
fgd2 = ImageDraw.Draw(fgimg)
fgd2.rectangle([60, 40, 190, 140], outline=(200, 200, 210, 180), width=2)

img.paste(fgimg, (px + 280, py))
draw.text((px+280+110, py+fg_h+3), "32b", fill=(120,120,120), font=fs)
gt["32b"] = {
    "test": "frosted_glass",
    "description": "Random colored circles + text 'HELLO WORLD' behind a frosted glass rectangle in center",
    "glass_effect": "gaussian blur r=6, slight brightness increase",
    "question": "Describe 32b. Can you read text through the frosted area? Can you identify shapes behind it?"
}

py += max(th, fg_h) + 30

# ============================================================
# PANEL 33: SCALE COMPREHENSION
# ============================================================
draw.text((px, py), "TEST 33: Scale Comprehension", fill=(30,30,30), font=fl)
py += 25

# 33a: Objects at known relative sizes — is the model confused?
sc_w, sc_h = 500, 150
sc_img = Image.new('RGB', (sc_w, sc_h), (245, 245, 240))
scd = ImageDraw.Draw(sc_img)

# Draw objects at "correct" relative scale with labels
objects_scale = [
    ("ant", 4, (30, 100)),
    ("coin", 12, (70, 95)),
    ("apple", 30, (130, 85)),
    ("basketball", 50, (220, 75)),
    ("person", 80, (330, 50)),
    ("car", 70, (430, 55)),  # intentionally shorter than person but wider
]

for name, height, (ox, oy) in objects_scale:
    # Simple rectangle representation
    width = max(height // 2, 8)
    if name == "car":
        width = height * 2  # cars are wider than tall
    scd.rectangle([ox, oy + (100 - height), ox + width, oy + 100], fill=(100, 120, 140))
    scd.text((ox, oy + 102), name, fill=(80, 80, 80), font=ft)

img.paste(sc_img, (px, py))
draw.text((px + 220, py + sc_h + 3), "33a", fill=(120,120,120), font=fs)
gt["33a"] = {
    "test": "scale_comprehension",
    "objects_left_to_right": ["ant (tiny)", "coin (small)", "apple (medium-small)",
                               "basketball (medium)", "person (tall)", "car (wide, shorter than person)"],
    "question": "List the objects in 33a from smallest to largest. Does the car being shorter than the person look wrong?"
}

# 33b: Perspective / foreshortening
persp_w, persp_h = 500, 150
persp = Image.new('RGB', (persp_w, persp_h), (180, 195, 170))
pd = ImageDraw.Draw(persp)

# Road with perspective convergence
# Vanishing point
vx, vy = persp_w // 2, 20
# Road edges
pd.polygon([(vx-5, vy), (0, persp_h), (persp_w, persp_h), (vx+5, vy)], fill=(80, 80, 85))
# Center line
pd.line([(vx, vy), (persp_w//2-40, persp_h)], fill=(220, 200, 50), width=1)
pd.line([(vx, vy), (persp_w//2+40, persp_h)], fill=(220, 200, 50), width=1)

# Trees at different "distances" along the road
tree_positions = [
    (0.2, 15, "far"),    # far: small
    (0.4, 25, "mid-far"),
    (0.6, 40, "mid"),
    (0.8, 60, "near"),   # near: large
]

for t, size, label in tree_positions:
    ty = int(vy + (persp_h - vy) * t)
    # Tree position offset from road
    road_half_width = int(5 + (persp_w//2 - 5) * t)
    tx = vx + road_half_width + 20
    # Tree
    pd.polygon([(tx, ty-size), (tx-size//3, ty), (tx+size//3, ty)], fill=(40, 90, 35))
    pd.rectangle([tx-2, ty, tx+2, ty+size//3], fill=(80, 50, 30))

img.paste(persp, (px, py + sc_h + 25))
draw.text((px+220, py + sc_h + persp_h + 30), "33b", fill=(120,120,120), font=fs)
gt["33b"] = {
    "test": "perspective_comprehension",
    "description": "Road converging to vanishing point with trees at increasing distance. Near trees are large, far trees are small.",
    "question": "Are the trees in 33b all the same 'real' size despite appearing different? Describe the depth cues."
}

py += sc_h + persp_h + 55

# ============================================================
# PANEL 34: CHART READING
# ============================================================
draw.text((px, py), "TEST 34: Chart & Graph Reading", fill=(30,30,30), font=fl)
py += 25

# 34a: Line chart
fig, ax = plt.subplots(figsize=(4.5, 2.5), dpi=100)
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
series_a = [42, 45, 38, 52, 48, 55]
series_b = [30, 35, 40, 38, 42, 44]
ax.plot(months, series_a, 'b-o', label='Product A', markersize=4)
ax.plot(months, series_b, 'r-s', label='Product B', markersize=4)
ax.set_ylabel('Sales (units)', fontsize=9)
ax.set_title('Monthly Sales Comparison', fontsize=10)
ax.legend(fontsize=8)
ax.set_ylim(20, 60)
ax.grid(True, alpha=0.3)
plt.tight_layout()
buf = io.BytesIO()
fig.savefig(buf, format='png', bbox_inches='tight')
plt.close()
buf.seek(0)
chart_a = Image.open(buf)
img.paste(chart_a, (px, py))
draw.text((px + 200, py + chart_a.size[1] + 3), "34a", fill=(120,120,120), font=fs)
gt["34a"] = {
    "test": "chart_reading",
    "chart_type": "line chart",
    "data": {
        "Product A": dict(zip(months, series_a)),
        "Product B": dict(zip(months, series_b))
    },
    "questions": [
        "What are the exact values for Product A in March and June?",
        "In which month does Product B first exceed 40?",
        "What is the overall trend for each product?",
        "When do the lines come closest together?"
    ]
}

# 34b: Bar chart with close values
fig2, ax2 = plt.subplots(figsize=(4.5, 2.5), dpi=100)
categories = ['Q1', 'Q2', 'Q3', 'Q4']
val_2024 = [127, 134, 141, 138]
val_2025 = [131, 138, 135, 145]
x_pos = np.arange(len(categories))
w = 0.35
ax2.bar(x_pos - w/2, val_2024, w, label='2024', color='steelblue')
ax2.bar(x_pos + w/2, val_2025, w, label='2025', color='coral')
ax2.set_xticks(x_pos)
ax2.set_xticklabels(categories)
ax2.set_ylabel('Revenue ($M)', fontsize=9)
ax2.set_title('Quarterly Revenue', fontsize=10)
ax2.legend(fontsize=8)
ax2.set_ylim(120, 150)
ax2.grid(True, axis='y', alpha=0.3)
plt.tight_layout()
buf2 = io.BytesIO()
fig2.savefig(buf2, format='png', bbox_inches='tight')
plt.close()
buf2.seek(0)
chart_b = Image.open(buf2)
img.paste(chart_b, (px + 470, py))
draw.text((px + 470 + 200, py + chart_b.size[1] + 3), "34b", fill=(120,120,120), font=fs)
gt["34b"] = {
    "test": "chart_reading",
    "chart_type": "grouped bar chart",
    "data": {
        "2024": dict(zip(categories, val_2024)),
        "2025": dict(zip(categories, val_2025))
    },
    "y_axis_starts_at": 120,
    "questions": [
        "Read the Q3 values for both years",
        "Which quarter shows 2024 beating 2025?",
        "Is the y-axis truncated? What effect does this have on perception?"
    ]
}

py += max(chart_a.size[1], chart_b.size[1]) + 30

# 34c: Pie chart
fig3, ax3 = plt.subplots(figsize=(3.5, 3), dpi=100)
labels = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other']
sizes = [63.5, 19.8, 6.2, 5.1, 5.4]
colors_pie = ['#4285f4', '#ff9500', '#e66000', '#0078d4', '#888888']
wedges, texts, autotexts = ax3.pie(sizes, labels=labels, autopct='%1.1f%%',
                                     colors=colors_pie, startangle=90, textprops={'fontsize': 8})
ax3.set_title('Browser Market Share', fontsize=10)
plt.tight_layout()
buf3 = io.BytesIO()
fig3.savefig(buf3, format='png', bbox_inches='tight')
plt.close()
buf3.seek(0)
chart_c = Image.open(buf3)
img.paste(chart_c, (px, py))
draw.text((px + 160, py + chart_c.size[1] + 3), "34c", fill=(120,120,120), font=fs)
gt["34c"] = {
    "test": "chart_reading",
    "chart_type": "pie chart",
    "data": dict(zip(labels, sizes)),
    "questions": [
        "Read all percentages",
        "Which two smallest slices are hardest to distinguish?",
        "What's Chrome's approximate share?"
    ]
}

# 34d: Scatter plot with trend
fig4, ax4 = plt.subplots(figsize=(4, 3), dpi=100)
np.random.seed(42)
x_data = np.random.uniform(1, 10, 40)
y_data = 2.5 * x_data + np.random.normal(0, 4, 40)
# Add 3 outliers
x_out = [2, 8, 5]
y_out = [25, 5, 30]
ax4.scatter(x_data, y_data, c='steelblue', s=20, alpha=0.7, label='Data')
ax4.scatter(x_out, y_out, c='red', s=30, marker='x', label='Outliers')
# Trend line
z = np.polyfit(x_data, y_data, 1)
ax4.plot([1, 10], [z[0]*1+z[1], z[0]*10+z[1]], 'k--', alpha=0.5, label=f'Trend (slope≈{z[0]:.1f})')
ax4.set_xlabel('X', fontsize=9)
ax4.set_ylabel('Y', fontsize=9)
ax4.set_title('Scatter with Outliers', fontsize=10)
ax4.legend(fontsize=7)
ax4.grid(True, alpha=0.3)
plt.tight_layout()
buf4 = io.BytesIO()
fig4.savefig(buf4, format='png', bbox_inches='tight')
plt.close()
buf4.seek(0)
chart_d = Image.open(buf4)
img.paste(chart_d, (px + 400, py))
draw.text((px + 400 + 180, py + chart_d.size[1] + 3), "34d", fill=(120,120,120), font=fs)
gt["34d"] = {
    "test": "chart_reading",
    "chart_type": "scatter with trend line",
    "trend_slope": round(z[0], 1),
    "n_points": 40,
    "n_outliers": 3,
    "outlier_coords": list(zip(x_out, y_out)),
    "questions": [
        "How many outlier points (red x) are there?",
        "What's the approximate slope of the trend line?",
        "Is the correlation positive or negative?",
        "Roughly how many blue data points are there?"
    ]
}

py += max(chart_c.size[1], chart_d.size[1]) + 30

# ============================================================
# PANEL 35: COMPLEX INFOGRAPHIC-STYLE READING
# ============================================================
draw.text((px, py), "TEST 35: Dense Information Display", fill=(30,30,30), font=fl)
py += 25

# 35a: Heatmap
fig5, ax5 = plt.subplots(figsize=(5, 3), dpi=100)
data_heat = np.array([
    [0.2, 0.4, 0.8, 0.6, 0.3],
    [0.5, 0.9, 0.7, 0.3, 0.1],
    [0.1, 0.3, 0.5, 0.8, 0.9],
    [0.7, 0.6, 0.2, 0.4, 0.5],
])
row_labels = ['Team A', 'Team B', 'Team C', 'Team D']
col_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
im = ax5.imshow(data_heat, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)
ax5.set_xticks(range(5))
ax5.set_xticklabels(col_labels, fontsize=8)
ax5.set_yticks(range(4))
ax5.set_yticklabels(row_labels, fontsize=8)
# Add text annotations
for i in range(4):
    for j in range(5):
        ax5.text(j, i, f'{data_heat[i,j]:.1f}', ha='center', va='center', fontsize=7,
                color='black' if data_heat[i,j] > 0.4 else 'white')
ax5.set_title('Weekly Performance Score', fontsize=10)
plt.colorbar(im, ax=ax5, shrink=0.8)
plt.tight_layout()
buf5 = io.BytesIO()
fig5.savefig(buf5, format='png', bbox_inches='tight')
plt.close()
buf5.seek(0)
chart_e = Image.open(buf5)
img.paste(chart_e, (px, py))
draw.text((px + 230, py + chart_e.size[1] + 3), "35a", fill=(120,120,120), font=fs)
gt["35a"] = {
    "test": "chart_reading",
    "chart_type": "heatmap",
    "data": {row: dict(zip(col_labels, [float(v) for v in data_heat[i]]))
             for i, row in enumerate(row_labels)},
    "questions": [
        "What's Team B's score on Tuesday?",
        "Which team-day combination has the highest score?",
        "Which team has the most consistent performance?",
        "Read all values for Team C."
    ]
}

# 35b: Stacked area chart
fig6, ax6 = plt.subplots(figsize=(5, 3), dpi=100)
x_area = np.arange(2020, 2026)
y1 = [20, 25, 28, 30, 35, 38]
y2 = [15, 18, 22, 25, 28, 30]
y3 = [10, 12, 15, 18, 20, 22]
ax6.stackplot(x_area, y1, y2, y3, labels=['Mobile', 'Desktop', 'Tablet'],
              colors=['#ff6b6b', '#4ecdc4', '#45b7d1'], alpha=0.8)
ax6.set_ylabel('Users (M)', fontsize=9)
ax6.set_title('Platform Growth', fontsize=10)
ax6.legend(loc='upper left', fontsize=7)
ax6.set_xlim(2020, 2025)
ax6.grid(True, alpha=0.3)
plt.tight_layout()
buf6 = io.BytesIO()
fig6.savefig(buf6, format='png', bbox_inches='tight')
plt.close()
buf6.seek(0)
chart_f = Image.open(buf6)
img.paste(chart_f, (px + 540, py))
draw.text((px + 540 + 230, py + chart_f.size[1] + 3), "35b", fill=(120,120,120), font=fs)
gt["35b"] = {
    "test": "chart_reading",
    "chart_type": "stacked area",
    "data": {
        "Mobile": dict(zip([str(y) for y in x_area], y1)),
        "Desktop": dict(zip([str(y) for y in x_area], y2)),
        "Tablet": dict(zip([str(y) for y in x_area], y3)),
    },
    "questions": [
        "What's the total for all platforms in 2025?",
        "Which platform grows the fastest?",
        "Read individual values for 2023."
    ]
}

py += max(chart_e.size[1], chart_f.size[1]) + 30

# ============================================================
# PANEL 36: ANNOTATION / MARKUP READING
# ============================================================
draw.text((px, py), "TEST 36: Annotated Screenshot", fill=(30,30,30), font=fl)
py += 25

# Simulate an annotated screenshot with arrows, callouts, numbered markers
ann_w, ann_h = 600, 200
ann = Image.new('RGB', (ann_w, ann_h), (250, 250, 245))
ad = ImageDraw.Draw(ann)

# Fake "UI" in background
ad.rectangle([20, 20, 280, 40], fill=(59, 130, 246))  # nav bar
ad.text((30, 23), "Dashboard > Settings > Profile", fill=(255,255,255), font=fs)
ad.rectangle([20, 50, 280, 180], fill=(255,255,255), outline=(220,220,220))
ad.text((30, 55), "Display Name:", fill=(80,80,80), font=fs)
ad.rectangle([30, 72, 200, 92], fill=(250,250,255), outline=(180,180,200))
ad.text((35, 75), "Oskar Austegard", fill=(40,40,40), font=fs)
ad.text((30, 100), "Email:", fill=(80,80,80), font=fs)
ad.rectangle([30, 117, 260, 137], fill=(250,250,255), outline=(180,180,200))
ad.text((35, 120), "oskar@austegard.com", fill=(40,40,40), font=fs)
ad.rounded_rectangle([30, 150, 110, 172], radius=4, fill=(59,130,246))
ad.text((42, 153), "Save", fill=(255,255,255), font=fs)
ad.rounded_rectangle([120, 150, 200, 172], radius=4, fill=(240,240,240), outline=(200,200,200))
ad.text((132, 153), "Cancel", fill=(60,60,60), font=fs)

# Red circle annotations
annotations = [
    (1, 145, 82, "Name field"),
    (2, 175, 127, "Email field"),
    (3, 70, 161, "Save button"),
]
for num, cx, cy, label in annotations:
    # Red circle with number
    ad.ellipse([cx-12, cy-12, cx+12, cy+12], fill=(220,50,50))
    ad.text((cx-4, cy-7), str(num), fill=(255,255,255), font=fs)
    # Arrow + label to the right
    ad.line([(cx+12, cy), (cx+50, cy)], fill=(220,50,50), width=2)
    ad.polygon([(cx+48, cy-4), (cx+55, cy), (cx+48, cy+4)], fill=(220,50,50))
    ad.text((cx+60, cy-7), label, fill=(220,50,50), font=fs)

# Callout box
ad.rectangle([330, 30, 580, 170], fill=(255,255,230), outline=(200,180,100))
ad.text((340, 35), "NOTES:", fill=(150,120,50), font=fl)
ad.text((340, 58), "1. Name must be 2+ chars", fill=(80,80,80), font=fs)
ad.text((340, 78), "2. Email validates on blur", fill=(80,80,80), font=fs)
ad.text((340, 98), "3. Save is disabled until", fill=(80,80,80), font=fs)
ad.text((352, 115), "changes are made", fill=(80,80,80), font=fs)
ad.text((340, 140), "BUG: Cancel doesn't reset", fill=(200,50,50), font=fs)

img.paste(ann, (px, py))
draw.text((px + 270, py + ann_h + 3), "36a", fill=(120,120,120), font=fs)
gt["36a"] = {
    "test": "annotation_reading",
    "ui_content": {
        "nav": "Dashboard > Settings > Profile",
        "name_field": "Oskar Austegard",
        "email_field": "oskar@austegard.com",
        "buttons": ["Save", "Cancel"]
    },
    "annotations": [
        {"number": 1, "label": "Name field"},
        {"number": 2, "label": "Email field"},
        {"number": 3, "label": "Save button"}
    ],
    "callout_notes": [
        "1. Name must be 2+ chars",
        "2. Email validates on blur",
        "3. Save is disabled until changes are made",
        "BUG: Cancel doesn't reset"
    ],
    "question": "Read everything in 36a: the UI content, all 3 annotations, and the full callout box including the bug note."
}

# Save
img_final = img.crop((0, 0, WIDTH, py + ann_h + 30))
img_final.save('/home/claude/vision_diagnostic_v4.png', quality=95)
with open('/home/claude/vision_diagnostic_v4_truth.json', 'w') as f:
    json.dump(gt, f, indent=2)
print(f"Image: {WIDTH}x{py + ann_h + 30}")
print(f"Tests: {len(gt)} items across panels 31-36")
