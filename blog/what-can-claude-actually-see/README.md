# What Can Claude Actually See? — Artifacts

Supplementary code for [the blog post](../what-can-claude-actually-see.html).

## Diagnostic Test Generators

Each script generates a test image with known ground truth and scores Claude's
visual responses against it.

| Script | Tests | Focus |
|--------|-------|-------|
| `vision_diagnostic_v1.py` | 42 | Low-contrast, color ID, counting, gradients, texture, spatial, fine detail |
| `vision_diagnostic_v2.py` | 38 | OCR (clean + degraded), UI elements, photographic nuance, compression, special chars |
| `vision_diagnostic_v3.py` | 38 | Classic illusions (Adelson, Cornsweet, Dress, White's, Mach, Hermann), cross-background contrast |
| `vision_diagnostic_v4.py` | 13 | Photorealistic scenes, transparency/alpha, scale, charts (line/bar/pie/scatter/heatmap/stacked) |

### Usage

```bash
pip install Pillow matplotlib
python vision_diagnostic_v1.py  # generates vision_diagnostic.png + _truth.json
```

Each script outputs:
- A composite test image (PNG)
- A ground truth JSON with correct answers and pixel values

The methodology: generate images with deliberate, recorded pixel values, have the
model describe what it sees, score against ground truth. The blindspot profile that
emerges is the specification for compensatory tools.

## Compensatory Skill

`see.py` is the [seeing-images skill](https://github.com/oaustegard/claude-skills/tree/main/seeing-images) —
12 Python functions that augment Claude's vision based on the measured blindspots.

| Tool | Compensates For |
|------|----------------|
| `grid` | Attentional competition |
| `sample` | Context color bias, luminance threshold |
| `enhance` | Sub-threshold contrast |
| `edges` | Invisible boundaries |
| `gradient_map` | Undetectable gradients |
| `isolate` | Simultaneous contrast / Dress effect |
| `compare` | Sub-threshold differences |
| `count_elements` | Dense counting errors |
| `histogram` | Hidden distributions |
| `palette` | Ground truth colors |
| `denoise` | Noise-masked features |
| `crop` | Elements below resolution |

All functions require only Pillow (pre-installed in Claude's container). All run in <1s.

## Key Findings

- **Luminance threshold**: ~15-20 RGB steps (consistent across dark/medium/light backgrounds)
- **Gradient threshold**: <30-step range invisible
- **Hue >> luminance**: hue shifts detected at lower total delta than luminance shifts
- **Illusion profile**: susceptible to cognitive illusions (Dress, Adelson, Cornsweet); immune to retinal illusions (Mach bands, Hermann grid)
- **OCR**: near-perfect through blur, rotation, low contrast, overlapping layers
- **Chart reading**: strong across all tested types including truncated axes

## Dependencies

```
Pillow >= 9.0
matplotlib >= 3.5  # v4 only
numpy >= 1.20      # v4 only
```
