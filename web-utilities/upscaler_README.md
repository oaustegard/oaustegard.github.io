# Image Upscaler

Enlarges a small or soft photo 2x, 3x or 4x with a neural network running in the browser. The image is not uploaded.

**[Live Demo](https://austegard.com/web-utilities/upscaler.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/upscaler.html)**

## Usage

1. Drop, paste or choose an image (JPEG, PNG or WebP, up to 2.5 megapixels).
2. Pick a scale and press Upscale.
3. Drag the handle to compare against the original, then download the PNG.

## Technical details

- **Model**: `realesr-general-x4v3` from [Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) (Wang et al., BSD-3-Clause). It is a 1.2M-parameter convolutional network (32 conv layers, 64 channels, pixel-shuffle upsampler) trained on photos with noise and JPEG damage. It is fixed at 4x; 2x and 3x resize the 4x result down.
- **Conversion**: exported from the official `.pth` with `torch.onnx.export` (opset 17, dynamic height and width), 4.9 MB. The ONNX file matches PyTorch to 8e-7 on random input. It is stored at `web-utilities/upscaler-model/`.
- **Runtime**: [onnxruntime-web](https://www.npmjs.com/package/onnxruntime-web) 1.30.0 from jsDelivr. The page uses the WebGPU backend when the browser exposes an adapter, and falls back to WASM on the CPU, single-threaded because GitHub Pages cannot send the headers that threading needs. The CPU path takes minutes for a megapixel.
- **Tiling**: the image is cut into 128 px tiles, each padded by 20 px of edge-clamped context to a fixed 168 px input, so the GPU compiles one shape. Against a single full-image run with the same edge padding, the tiled result differs by at most 2 of 255 levels.
- **Alpha**: the network only sees RGB. If the image has transparency, the alpha plane is scaled separately with the canvas filter.
- **Checked**: in headless Chromium, both the WebGPU path (software adapter) and the WASM path matched a Python ONNX run with identical tiling to within 1 of 255 levels; 2x output and the alpha path also ran. WASM took 2.9 s for a 96x96 image. Speed on a real GPU has not been measured.

## Limits

- It invents texture. Fine detail in the output is a plausible guess and not recovered information.
- It is trained on photos. Line art and screenshots come out smoothed.
- Input is capped at 2.5 megapixels, which gives a 40 megapixel result at 4x.

## Credits

Real-ESRGAN: Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan. Page by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)).
