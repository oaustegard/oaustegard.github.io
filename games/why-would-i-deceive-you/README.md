# Why Would I Deceive You?

A one-player staring game that watches your eyes through a front camera. You either hold an
unblinking stare to get a lie past a cartoon Nathan Fielder, or you watch a cartoon Elizabeth
Holmes for the moment her stare slips.

It is modeled on the teaser for *You Can See Everything*, the 2026 documentary by Nathan Fielder
and Lance Oppenheim about Holmes, who founded the blood-testing company Theranos and was convicted
of defrauding its investors. In the teaser she holds his gaze without blinking and asks "Why would
I deceive you? There's no reason for me to do that." He answers "Okay. All right. Okay, good chat."
Stills of the two close-ups, his above hers, spread as a reaction meme, and the game's screen has
the same layout: two stacked 4:3 frames. CAM A, on top, is the character the game plays. CAM B is
you, drawn as the character you are playing and moved by your own eyes, mouth and brows.

Live: <https://austegard.com/games/why-would-i-deceive-you/>

It needs a phone or a laptop with a front camera, and the browser asks for permission to use it
when you press "Roll camera". Hold the screen at eye level in decent light.

## Two roles

**Deceive (you play Elizabeth).** Nathan asks a question and the game shows you a line to answer
with. Say it aloud if you like; the game does not listen. Then hold the stare for the length of
the scene, which means three things: keep your eyes open, keep looking at his eyes in CAM A, and
keep a half-smile. A suspicion meter under the frames tracks how you are doing. Each blink fills
30% of the meter. Looking away, turning your head or dropping the smile fills it for as long as
that lasts, and it drains slowly while you do all three. Scenes start at 6 seconds and grow by a
second and a half each, up to 20. From the second scene on the game tries to pull your eyes off
him: fake notifications slide in at the corners of the screen, a clapperboard flashes, a fly
crosses, and he asks follow-up questions. Your score is a company valuation that rises with each
scene you hold, from $500K to $9B. There is no last scene. The game runs until the meter fills.

**Detect (you play Nathan).** Elizabeth makes a claim and stares at you for 5 to 8 seconds. Half
the claims are deceptions, and a deception carries exactly one tell: a blink, a darting glance, a
slipping smile, a flick of an eyebrow or, after eight right calls, a jump in pupil size. When the
stare ends you make the call with one of two buttons: "Okay. Good chat." if you believe her,
"You're deceiving me." if you saw a tell. Tells get shorter and smaller every two right calls.
Your own eyes count in this role as well. CAM A goes black while your eyes are shut, and two times
in three she uses your blink to get her tell out of the way. After each deception the tell is
replayed at quarter speed. Three wrong calls end the game.

## Implementation

The game is one HTML file with no build step. It has four parts:

- **Face tracking** is MediaPipe Face Landmarker (`@mediapipe/tasks-vision` 0.10.14 from jsDelivr,
  with Google's published `face_landmarker.task` model, about 4 MB). It runs in the browser; no
  video or face data is sent anywhere. For every frame the model returns face landmarks and a set
  of scores from 0 to 1 for expressions such as "left eye closed" or "mouth smiling" (MediaPipe
  calls them blendshapes). Blinks, smile, jaw and brows come from those scores. Horizontal gaze
  comes from where the iris landmarks sit between the eye corners, vertical gaze from the look-up
  and look-down scores, and head turn from the face's rotation matrix.
- **Calibration** takes about a second of your resting face before each game. Blinking, looking
  away and smiling are all measured as a change from that resting face, so glasses, a low camera
  angle or a resting smile do not count against you.
- **The two faces** are Canvas 2D drawings with a pose (lids, gaze, smile, jaw, brows, pupil
  size). The frame zooms in on the eyes as a scene goes on. One set of drawing code serves the
  character the game plays and the one your face moves.
- **Sound** is Web Audio: a drone that rises with suspicion, and a few synthesized effects. The
  browser's speech synthesis reads the lines, hers at a low pitch after the deep voice Holmes was
  known for. The SND button turns both off.

## Tuning

Three numbers decide what counts as a blink or a look away. They were set from the model's
documented value ranges and checked against a test portrait and a keyboard simulation, not against
a range of real faces. Add `?debug` to the address to see the live values next to them. Each can be
overridden in the address, and a larger number makes the game more forgiving:

| parameter | default | meaning |
|---|---|---|
| `?blink=` | 0.26 | how far the eye-closed score must rise above your resting value to count as a blink |
| `?eye=` | 0.3 | how far your gaze may drift from where it rested before it counts as looking away |
| `?head=` | 17 | degrees of head turn that count as looking away |

`?sim` plays without a camera: hold Space to blink, arrow keys to look away, S to drop the smile.

A parody. Not affiliated with A24 (the film's distributor), the film or anyone who appears in it.
