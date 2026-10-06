# Image Upscaler

Enlarges a small or soft photo 2x, 3x or 4x with a neural network running in the browser. The image is not uploaded.

**[Live Demo](https://austegard.com/web-utilities/upscaler.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/upscaler.html)**

## Usage

1. Drop, paste or choose an image (JPEG, PNG or WebP). The result is limited to 36 megapixels, or 16 on touch devices.
2. Pick a scale and press Upscale.
3. Drag the handle to compare against the original, then download the PNG.

## Technical details

- **Model**: `realesr-general-x4v3` from [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) (Wang et al., BSD-3-Clause). It is a 1.2M-parameter convolutional network (32 conv layers, 64 channels, pixel-shuffle upsampler) trained on photos with noise and JPEG damage. It is fixed at 4x; 2x and 3x resize the 4x result down.
- **Conversion**: exported from the official `.pth` with `torch.onnx.export` (opset 17, dynamic height and width), 4.9 MB. The ONNX file matches PyTorch to 8e-7 on random input. It is stored at `web-utilities/upscaler-model/`.
- **Runtime**: [onnxruntime-web](https://www.npmjs.com/package/onnxruntime-web) 1.30.0 from jsDelivr. The page uses the WebGPU backend when the browser exposes an adapter, and falls back to WASM on the CPU, single-threaded because GitHub Pages cannot send the headers that threading needs. The CPU path takes minutes for a megapixel.
- **Tiling**: the image is cut into tiles (128 px, or 64 px on touch devices to keep working memory low), each padded with 20 px (16 on touch) of edge-clamped context to a fixed input size, so the GPU compiles one shape. Each tile is written straight into the output canvas, which is the only full-size buffer. That canvas is never attached to the page, because a visible canvas that changes every tile gets re-snapshotted each frame; the page shows a preview at most 2048 px wide and the download is the full-size canvas. Against a single full-image run with the same edge padding, the tiled result differs by at most 2 of 255 levels on desktop and 8 on touch devices.
- **Saved work**: the input image, a job record and every finished tile go into IndexedDB as the run proceeds (about one copy of the output in storage). If the tab is reloaded or killed by the browser, the next visit offers Resume, which repaints the saved tiles and runs only the missing ones, or Restore for a finished result, with no model calls. Loading a different image or pressing Discard clears it. If the browser has no storage or too little room, the run works as before and is lost on reload.
- **Alpha**: the network only sees RGB. If the image has transparency, the alpha plane is scaled separately with the canvas filter.
- **Checked**: in headless Chromium, both the WebGPU path (software adapter) and the WASM path matched a Python ONNX run with identical tiling to within 1 of 255 levels; 2x output and the alpha path also ran. Resume was tested by reloading mid-run: the resumed and restored results were pixel-identical to an uninterrupted run, at 3x and 4x. WASM took 2.9 s for a 96x96 image. Speed on a real GPU has not been measured.

## Limits

- It invents texture. Fine detail in the output is a plausible guess and not recovered information.
- It is trained on photos. Line art and screenshots come out smoothed.
- The result must fit one canvas: 36 megapixels on desktop, 16 on touch devices (iOS Safari refuses canvases above 16.7 megapixels). A 1,600 x 1,600 px photo can go 3x on desktop but not 4x.

## Credits

Real-ESRGAN: Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan. Page by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).
