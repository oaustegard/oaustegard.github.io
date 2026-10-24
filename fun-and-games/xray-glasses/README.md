# X-ray glasses

Point your camera at a person, cat or dog and the page shows a live X-ray: the feed rendered as a radiograph, with a skeleton fitted to the pose and following it as it moves. Everything runs on the device; no video leaves the browser.

![X-ray glasses](https://austegard.com/images/xray-glasses-og.jpg)

**[Live](https://austegard.com/fun-and-games/xray-glasses/)** | **[Source and tests](https://github.com/oaustegard/experiments/tree/main/xray-glasses)** | **[Results](https://github.com/oaustegard/experiments/blob/main/xray-glasses/RESULTS.md)**

## How it works

- **People**: MediaPipe Pose Landmarker finds 33 joints. When the face is close enough, Face Landmarker gives the head's rotation and how far the mouth is open. The skull is a 3D model posed with the head, and its jaw opens with yours.
- **Cats and dogs**: EfficientDet-Lite0 finds the animal and RTMPose-m (trained on AP-10K) finds 17 joints.
- **Drawing**: the skeleton is a few hundred bone shapes rendered by two WebGPU passes. The first adds up bone density and the second turns the camera feed into film.
- **View label**: AP when you face the camera, PA when you turn away, lateral in profile. The R marker stays on your right side.

The skeleton is a template drawn to fit the joints. It is not a scan and shows nothing about the real anatomy in front of the camera.

Needs a browser with WebGPU: Chrome or Edge 121+, Safari 26+, or Firefox 141+ on Windows. `rtm_animal_fp16.bin` is the animal pose model (27.5 MB, Apache-2.0, from `litert-community/RTMPose-Animal-AP10K-LiteRT`). It loads only the first time a cat or dog is needed.

The page is published from `experiments/xray-glasses/web/`, where the tests live; edit it there and copy it here.
