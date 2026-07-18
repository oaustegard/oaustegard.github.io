# Motion Player

An installable PWA (Progressive Web App) that plays YouTube videos inline with **motion-based pan, zoom, and 360° roll stabilization**. Open `/motion-player/` on [austegard.com](https://austegard.com/motion-player/).

## Using Motion Player

### Opening a video

- **Direct URL**: `/motion-player/?v=dQw4w9WgXcQ` (YouTube video ID)
- **Full URL**: `/motion-player/?url=https://youtu.be/dQw4w9WgXcQ` (auto-extracts ID from `watch?v=`, `youtu.be/`, `shorts/`, `embed/`, `live/` links)
- **Landing screen**: Paste a YouTube URL or ID, then tap Play. Recent videos are shown if you've used the app before.

### Touch controls

- **One-finger drag**: Pan the video around the screen.
- **Two-finger pinch**: Zoom in/out (0.5× to 5× scale).
- **Double-tap**: Reset zoom and pan, recenter motion baseline.
- **Single tap**: Toggle control chrome (buttons and settings).

### Motion controls (phone orientation)

Enable via the **Motion** toggle in the controls (requires iOS permission prompt on first use).

- **Yaw** (turn phone left/right): Pans the picture horizontally — a window metaphor. Turn your phone left and you see the left side of the video.
- **Pitch** (tilt phone up/down): Pans vertically (toggleable in settings).
- **Roll** (twist phone about the screen): Auto-stabilizes the picture against your twirl — the video stays level as you rotate your phone 360°.

### Install to home screen

**iOS**: Tap Share → Add to Home Screen. Gives you a shortcut that opens Motion Player in fullscreen.

**Android**: Chrome menu (⋮) → Add to Home Screen. The app installs as a standalone PWA.

### Note on motion permission

iOS requires explicit user permission to access device motion. The first time you enable Motion, you'll see a permission prompt. If you deny it, Motion Player falls back to touch only.

## Developer info

### File layout

```
motion-player/
├── index.html           (markup, meta tags, PWA links)
├── app.js               (bootstrap, UI, video playback, state management)
├── motion.js            (pure math: coordinate transforms, motion engine)
├── gestures.js          (touch gesture recognition)
├── styles.css           (all styling)
├── manifest.webmanifest (PWA manifest)
├── sw.js                (service worker, offline caching)
├── icons/
│   ├── icon-source.png  (canonical 1024×1024 art, Gemini-generated)
│   ├── icon-192.png     (app icon, 192×192)
│   ├── icon-512.png     (app icon, 512×512)
│   ├── maskable-512.png (maskable icon for adaptive display, 512×512)
│   └── apple-touch-icon.png (iOS home screen icon, 180×180)
├── scripts/
│   └── make_icons.py    (icon derivation from source art)
├── tests/
│   └── motion.test.mjs  (unit tests for motion math)
└── SPEC.md              (normative implementation spec)
```

### Generating icons

The canonical art (`icons/icon-source.png`, 1024×1024) was generated with a Gemini image call (`gemini-2.5-flash-image`) routed through a Cloudflare AI Gateway; `scripts/make_icons.py` downscales it into the four icon files (requires Pillow). If the source art is deleted, the script regenerates it via the gateway (needs `CF_ACCOUNT_ID`, `CF_GATEWAY_ID`, `CF_API_TOKEN` in the environment — the Google key is stored gateway-side).

To regenerate:
```bash
cd motion-player
python3 scripts/make_icons.py
```

Derivation from the committed source art is deterministic; regenerating the source art itself is a fresh Gemini generation and will differ.

### Testing motion math

The motion engine's coordinate transforms and unwrapping logic are verified via Node.js unit tests:

```bash
cd motion-player
node --test tests/motion.test.mjs
```

Test vectors enforce spec requirements: Euler-angle conversions, yaw/pitch/roll extraction, gimbal handling, and continuous 360° twirl stability.

### Architecture notes

- **No build step**: Plain ES modules, inline SVG icons, direct CSS/JS inclusion.
- **Coordinate frames**: Device frame (screen x/y/z), world frame (East/North/Up), intrinsic Tait-Bryan angles (Z-X'-Y'').
- **Service worker**: Stale-while-revalidate caching for offline support; never intercepts YouTube (cross-origin).
- **Motion baseline**: Captured on enable, reset on screen orientation change (~300ms settle delay), and on double-tap recenter.
- **View transform**: CSS transforms chain `translate / rotate / scale / translate`, with motion and touch pans composed in the video frame.

---

Part of [austegard.com](https://austegard.com).
