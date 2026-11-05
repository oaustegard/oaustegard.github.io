# Sky Mixtape

https://austegard.com/bsky/sky-mixtape/

Makes a playlist from someone's last 50, 100 or 200 Bluesky posts, from a few keywords, or from a photo, for Spotify,
YouTube Music, Apple Music or Amazon Music. Thumbs up and down are written to the signed-in user's own
repo as `com.austegard.mixtape.rating` records, and every later mix reads them back.

## How posts become songs

1. The page reads the posts from Bluesky's public API, skipping reposts. Each post contributes its text,
   image alt text, and link card title and description.
2. Ettin-17m, the model in `../embedders/models/ettin/` that Answer Search also uses, embeds each post in
   the browser with its query prompt. With WebGPU it runs on the page's hand-written engine
   (`../embedders/engine.js`); without it, onnxruntime-web runs the same `model.onnx` on the CPU (WASM).
   `?engine=cpu` forces the CPU path. A visitor who has used Answer Search already has the 12 MB file cached.
3. `catalog.json` holds 247 tags: moods, genres, themes, settings and textures. Each tag has a
   description written in the words posts use ("code, bug, debugging, deploy, refactor…" for
   Programming), embedded with the same model and stored as int8. Each post-to-tag cosine is z-scored
   against that tag's mean and spread over 1,500 English posts sampled from Jetstream, so a tag counts
   only when these posts sit closer to it than ordinary Bluesky posts do. Each post spreads one unit of
   weight over its four strongest tags; the sum over posts is the profile.
4. The catalog's 2,718 songs carry the tags they were chosen for; genre tags also spread to the
   artist's other songs. A song scores the sum of its tags' weights, scaled by Deezer popularity and
   perturbed by Gumbel noise from the Familiar/Adventurous slider. After each pick the weights of its
   tags decay, so the mix covers the profile instead of filling up from the top tag. One song per artist.
5. Ratings move the weights of the rated song's tags up or down, skip disliked songs, damp artists with
   net dislikes and lift liked songs. Dropping a tag chip (×) zeroes it for the current mix.

The code for steps 3 to 5 is `mix-core.js`; the page and `build/tune.mjs` share it.

## How a photo becomes songs

The photo never leaves the device. MobileCLIP-S0 (`Xenova/mobileclip_s0`, Apple's small CLIP model)
maps images and text into one vector space, so a photo can be scored against each tag by cosine
similarity. The page downloads only its image encoder (fp16, 23 MB, through transformers.js 4.3.1) when
a photo is first used, and runs it on the CPU through onnxruntime-web, so any browser works. The int8
build of that encoder, half the size, is broken: it ranks techno and IDM first for a photo of cats.

`image-tags.json` holds the 247 tags embedded with MobileCLIP-S0's text model. Each tag's vector is
the average of two phrasings, "a photo of autumn" and "Autumn: falling leaves, pumpkin spice…", the
description the posts path uses. The file also holds each tag's mean and spread of cosine over 2,969
popular Bluesky photos, an even sample of the index behind the sibling Bluesky image search
(`../image-search/`). The photo is z-scored against that background, so a tag counts only when this
photo sits closer to it than Bluesky photos usually do.

The photo spreads its weight over up to eight tags with z of at least 1, the same `tagProfile` call
posts use (step 3 above, with `perPost: 8, zMin: 1, temp: 0.8`), and the mix is then made as in steps 4
and 5. An autumn woodland photo with a squirrel on a fallen log gives autumn, nature and wildlife,
spring, campfire, birds, acoustic, dogs and southern rock; a rainy street gives weather, rain, eerie and
ambient.

A 160-pixel thumbnail of the photo is kept with the last mix in this browser's localStorage, to show
next to the tags; the saved playlist record holds nothing of the photo.

## Services

| service | what the page does | needs |
|---|---|---|
| Spotify | searches each song by ISRC; ▶ plays full songs through Spotify's Web Playback SDK in desktop browsers, or on the listener's open Spotify app (Spotify Connect) on phones; saves a private playlist | the app's client ID (PKCE, no secret) with the page URL as redirect URI; Premium for full songs; in development mode each listener's account must be allowlisted |
| YouTube Music | searches each song, plays the list in full in the YouTube player, saves a private playlist | a Google OAuth web client ID with YouTube Data API v3, the page URL as authorized redirect URI and `https://austegard.com` as JavaScript origin; sign-in is a full-page redirect with the token in the URL fragment (the code flow would need the client secret), good for one hour; each search costs 100 of 10,000 daily quota units |
| Apple Music | 30-second previews in the page; each song opens an Apple Music search | nothing. Creating Apple Music playlists needs a MusicKit developer token, which a static page cannot sign |
| Amazon Music | 30-second previews in the page; each song opens an Amazon Music search | nothing. Amazon has no public playlist API |

Spotify's embed was the first player, and it played only previews: it needs the open.spotify.com cookie,
which Safari and most phone browsers block inside another site. It is now the fallback for accounts
without Premium. Previews for the other services come from Deezer's track API by JSONP, because Deezer sends no CORS headers. The iTunes Search
API allows CORS but returned 403 on 15 of 25 rapid requests, too few for a 25-song mix.

`DEFAULT_SPOTIFY_CLIENT_ID` at the top of the page script holds austegard.com's Spotify app (redirect URI
`https://austegard.com/bsky/sky-mixtape/`; in development mode only allowlisted accounts can sign in).
`DEFAULT_GOOGLE_CLIENT_ID` holds its Google OAuth client (same redirect URI; while the consent screen is in
Testing, only listed test users can sign in). A listener can paste their own IDs under Settings instead;
they stay in localStorage.

## Records

Sign-in is Bluesky OAuth (`@atproto/oauth-client-browser`, `client-metadata.json` in this directory),
asking for `repo:com.austegard.mixtape.rating` and `repo:com.austegard.mixtape.playlist`. If a PDS
rejects granular scopes, the page retries once with `transition:generic`.

`com.austegard.mixtape.rating`, record key `s` + the first 20 hex digits of SHA-256 of the normalized
`artist|title`, so rating a song again overwrites the old record and clearing a rating deletes it:

```json
{ "subject": { "artist": "Brian Eno", "title": "An Ending (Ascent)", "isrc": "GBUM71900378", "deezer": "674055242" },
  "rating": 1, "tags": ["serene", "awe", "dreamy", "ambient", "space", "programming", "focus-study", "minimal"], "mix": "at://…/com.austegard.mixtape.playlist/…",
  "createdAt": "2026-11-04T15:30:00.000Z" }
```

`com.austegard.mixtape.playlist` is written when a mix is saved to Spotify or YouTube, or with
"Save this mix to Bluesky": name, service, source (`posts` with handle and count, `keywords` with the query, or `photo` with nothing else), the
top 12 tags with weights in thousandths, the tracks, the service URL and `createdAt`.

Ratings made before sign-in stay in localStorage and are uploaded at the next sign-in.

## Rebuilding the catalog

Everything is in `build/`. Python scripts need numpy, onnxruntime and tokenizers; `jet.mjs` needs Node 22.

1. `tags.json`: the tag vocabulary, generated from `taxonomy_prompt.txt` by Claude Sonnet and kept as is.
2. `python3 gen_tracks.py`: asks Claude Sonnet (`claude -p`) for 18 songs per tag, 12 tags per call,
   into `candidates/`.
3. `python3 validate_deezer.py`: looks each candidate up on Deezer and keeps exact artist and title
   matches in `resolved.json` (cached; rerunning only looks up new candidates). 2,790 of 3,230
   candidates matched. Classical works are credited to performers on Deezer, so those were matched on
   title and composer surname in a separate pass.
4. `node jet.mjs`: samples 1,500 English posts from Jetstream into `background.json` (not committed).
5. `python3 embed_tags.py background.json tag_emb.json --post-prompt query`: Ettin tag vectors (CPU
   onnxruntime, as `scripts/answer-search/refresh.py` does) and per-tag background mean and spread. The
   query prompt for posts gave better tags than no prompt: "heartbroken, missing her, lonely winter nights"
   maps to heartbreak, snow and winter, and lonely with it, and to female vocals without it.
6. `python3 build_catalog.py tag_emb.json`: writes `../catalog.json`. Live recordings are dropped.
7. `node embed_tags_clip.mjs`: writes `../image-tags.json` for photos, after step 6 (it checks that
   `tags.json` and `catalog.json` list the same tags). Run `npm i @huggingface/transformers@4.3.1` in
   `build/` first. It reads `../../image-search/data/rows.json` and fetches 3,000 of those photos from
   Bluesky's CDN (about 6 minutes); `--cache FILE` keeps their vectors for reruns, and
   `--try PHOTO ...` prints a photo's top tags under each phrasing.
8. `python3 tune.py tag_emb.json [...] --actor <handle> --n 100` (or `--words "..."`) prints the tag
   profile for each embedding file, to compare variants.

Bump `V` in `index.html` after changing `catalog.json`, `image-tags.json` or `mix-core.js`; it versions those requests.
