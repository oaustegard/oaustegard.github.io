# Video About Making Videos

**A narrated explainer that plays as a live web page**

A 75-second video about how it was made. It is not a video file: your browser draws every frame from HTML, CSS and SVG, and the player sets the page's animation clock to each frame's timestamp, the same way the mp4 version was recorded.

## What It Does

1. **Plays** at 30 fps with a scrubber, chapter buttons, full screen and a transcript
2. **Narrates** when the audio file is present (see Narration below). Without it the page plays with the captions that are part of the picture
3. **Checks itself**: the frame counter in the corner is a pure CSS animation, and the Counter chapter shows it matching the frame index

Keys: Space or K play and pause, Left and Right skip 5 seconds, F full screen, M mute.

## How It Works

- `video-about-making-videos.html` holds the player and, as plain text, the video page. The video page loads into an iframe through `srcdoc`, and nested copies of it make the six thumbnails and the "previous frame" inset.
- For every 30 fps frame the player calls `seek(t)` on the video page, using the audio clock when there is audio. `seek` pauses every animation from `document.getAnimations()` and sets its `currentTime`.
- Frames match the rendered mp4 to within compression noise (mean pixel difference about 1.5 out of 255 across five checked frames).
- Fonts are Inter 5.3.0 (`@fontsource/inter`) and DejaVu Sans Mono 2.37.3 (`dejavu-fonts-ttf`), loaded from jsDelivr.
- Drawing all of this live is heavier than playing a video file, so a slow phone may drop frames.

## Narration

The page looks for `/images/video-about-making-videos-narration.mp3` (75 seconds, mono, 96 kbps). Without it the page says so and plays captions only. Adding the file turns the sound on with no change to the page.

## Credits

- Page, player and narration timing by Claude Sonnet 5.5 for Oskar Austegard
- Voice: [Kokoro](https://huggingface.co/hexgrad/Kokoro-82M) (`bm_george`), run offline
- [Inter](https://rsms.me/inter/) (SIL Open Font License) and [DejaVu Sans Mono](https://dejavu-fonts.github.io/)
