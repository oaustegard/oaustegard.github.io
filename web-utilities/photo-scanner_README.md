# SnapScan — Photo Scanner

A client-side photo scanner that runs entirely in the browser. Designed for digitizing printed photos with automatic edge detection, perspective correction, and EXIF metadata support.

**[Live Demo](https://austegard.com/web-utilities/photo-scanner.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/photo-scanner.html)**

## Features

- **Corner Detection**: OpenCV.js (WASM) automatically finds photo edges via Canny edge detection + contour analysis. Corners are manually adjustable via touch-draggable handles.
- **Perspective Correction**: Computes a homography transform to produce a properly rectangular output from skewed camera captures.
- **White Balance**: Gray-world algorithm with adjustable strength to correct color casts from indoor lighting.
- **Brightness & Contrast**: Standard image adjustment controls for fine-tuning scan output.
- **EXIF Metadata**: Reads date/location from original photos. Allows setting custom date, time, and GPS coordinates. Writes EXIF data (DateTimeOriginal, GPS) into saved JPEGs via piexifjs.
- **iOS-Optimized Save**: Uses the Web Share API to present the iOS share sheet (Save to Photos, AirDrop, etc.) with download fallback.
- **Batch Scanning**: Returns to the capture screen after each save with a running count.
- **100% Client-Side**: No server, no uploads. All processing happens in the browser.

## Usage

1. Open the page and wait for the image processor to load (~8MB OpenCV.js, cached after first load).
2. Take a photo of a printed photo or choose one from your library.
3. Adjust the corner handles if auto-detection missed the edges, or tap "Skip" for flat photos.
4. Tweak white balance, brightness, and contrast as needed.
5. Optionally set the date/time and location metadata.
6. Tap "Save" to share/download the corrected JPEG.

## Technical Details

- **Edge Detection**: OpenCV.js Canny → findContours → approxPolyDP on a downscaled (800px max) working copy for speed, with the perspective transform applied at full resolution (up to 4096px).
- **Dependencies**: [OpenCV.js 4.10.0](https://docs.opencv.org/4.10.0/opencv.js) (WASM, ~8MB), [piexifjs 1.0.6](https://github.com/nicklockwood/piexifjs) (~20KB). Both loaded from CDN.
- **No build step**: Single HTML file with inline CSS and JS.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues or feature requests, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
