# Why Would I Deceive You?

A staring game for a phone's front camera, after the teaser for *You Can See Everything*, the
Nathan Fielder and Lance Oppenheim documentary about Elizabeth Holmes. In the teaser she holds his
gaze without blinking and asks "Why would I deceive you? There's no reason for me to do that." He
answers "Okay. All right. Okay, good chat." The screen is laid out as the two close-ups the memes
are cut from: CAM A is the other person, CAM B is you, drawn as the character you are playing and
moved by your own eyes, mouth and brows.

Live: <https://austegard.com/games/why-would-i-deceive-you/>

## Two roles

**Deceive (you are Elizabeth).** Nathan asks a question and you get a line to say. Then you hold
the stare for the length of the scene: eyes open, eyes on his, half-smile on. A blink adds 30% to
his suspicion, looking away or dropping the smile adds to it for as long as it lasts, and it drains
slowly while you behave. Scenes run from 6 seconds up to 20. From the second scene on, notifications
slide in at the corners of the screen, a clapperboard flashes, a fly crosses and he asks follow-up
questions. Each scene held raises the valuation; the game ends when the meter fills.

**Detect (you are Nathan).** Elizabeth makes a claim and stares. Half the claims are deceptions,
and a deception carries one tell: a blink, a darting glance, a slipping smile, a flick of an
eyebrow or, later, a jump in pupil size. Tells get shorter and smaller every two right calls. Your
own eyes matter here too. The feed goes black while your eyes are shut, and two times in three she
uses your blink to get her tell out of the way. After each call the tell is replayed at quarter
speed. Three wrong calls end the game.

## How it is built

One HTML file, no build step.

- **Face tracking** is MediaPipe Face Landmarker (`@mediapipe/tasks-vision` 0.10.14 from jsDelivr,
  the float16 model from Google's model bucket, about 4 MB). It runs in the browser; no video or
  face data is sent anywhere. Blinks, smile, jaw and brows come from the blendshape scores.
  Horizontal gaze comes from where the iris landmarks sit between the eye corners, vertical gaze
  from the look-up and look-down blendshapes, and head turn from the face transformation matrix.
- **Calibration** takes about a second of your resting face before each game, and every rule is
  measured against it, so glasses, a low camera angle or a resting smile do not count against you.
- **The two faces** are Canvas 2D drawings with a pose (lids, gaze, smile, jaw, brows, pupil size)
  and a camera that pushes in on the eyes as the scene goes on. The same drawing code serves the
  opponent and your own puppet.
- **Sound** is Web Audio: a drone that rises with suspicion, and a few synthesized effects. Lines
  are read with the browser's speech synthesis, hers at a low pitch. The SND button turns both off.

## Tuning

The thresholds were set from the model's documented value ranges and checked against a test
portrait and a keyboard simulation, not against a range of real faces. Add `?debug` to the address
to see the live numbers next to their thresholds, and override them with `?blink=0.26` (how far
above your resting value the blink score must rise), `?eye=0.3` (gaze deviation that counts as
looking away) and `?head=17` (degrees of head turn). `?sim` plays without a camera: hold Space to
blink, arrow keys to look away, S to drop the smile.

A parody. Not affiliated with A24, the film or anyone who appears in it.
