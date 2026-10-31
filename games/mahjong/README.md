# Mahjong

Hong Kong (old style) mahjong for four players. Play three computer opponents, or host a table and
invite up to three friends: each friend opens an invite link or scans a QR code, sends back a reply
the same way, and the phones connect directly over WebRTC. No server and no accounts are involved.
Installable PWA; WebGPU draws the tiles and the scene, with a Canvas 2D fallback where WebGPU is missing.

Live: <https://austegard.com/games/mahjong/>

## Rules

The rules follow Hong Kong old-style play. The game's own rules panel ("How to play and score")
has the full faan table.

- 144 tiles: characters, dots and bamboo 1–9, four winds, three dragons (four of each), plus four
  flowers and four seasons. Bonus tiles are set aside when drawn or dealt and replaced from the back
  of the wall.
- Thirteen tiles each, fourteen for the dealer (East). Draw, then discard. Play goes to the right.
- Any player may claim a discard for a pung or kong, and the next player may claim it for a chow. A win
  beats a pung or kong, which beats a chow. When two players can win on one discard, the next in turn
  takes it (head bump).
- Concealed kongs, kongs added to your own melded pung (another player may rob one to win), and a
  replacement draw after every kong.
- A hand is four sets and a pair, or thirteen orphans, worth at least the minimum faan: 3 by default,
  or 0 or 1 in the lobby settings. Seven pairs is not a hand in these rules.
- Faan: self-drawn, concealed, no flowers, seat flower, a full set of flowers, dragon and wind pungs,
  all chows, all pungs (3), mixed one suit (3), small three dragons (5), small four winds (6), pure one
  suit (7), great three dragons and four concealed pungs (8), the situational hands (last tile, last
  discard, kong replacement, robbing a kong), and the limit hands (thirteen orphans, nine gates,
  great four winds, all honours, all terminals, four kongs, heavenly and earthly hands, all eight
  bonus tiles). A tile set that can be read several ways scores the reading worth most.
- Points: the half-spicy (半辣) table, 1, 2, 4, 8, 16, 24, 32, 48, 64, 96, 128 for 0–10 faan, capped at
  10. Half-gun (半銃) payment: on a discard win the discarder pays in full and the other two pay half;
  on a self-draw all three pay in full.
- The dealer keeps the deal after winning or after a drawn hand (the wall runs out); otherwise the deal
  passes to the right. A game is the East round, or four wind rounds.

## Playing with friends

1. The host picks **Host a table**, then **Invite a friend** for a seat. Empty seats play as the
   computer, and the host can also invite from the menu during a game.
2. The friend scans the invite QR with their phone camera, or opens the link the host texted them
   with **Text or share the link**.
3. The friend's page shows a reply QR and link. The host scans it with **Scan their reply**, or opens
   the texted reply link on their own phone (a new tab passes it to the table tab), or pastes it.
4. Once the seat shows connected, start the game.

The host's page runs the game. Each guest receives only what its seat may see: its own tiles, the
melds, the discards and the other hands' tile counts, so no guest's browser ever holds another
player's tiles. A friend who closes the page hands the seat back to the computer. One who wanders off
passes on claims after 30 s, and the computer discards for them after 75 s.

Pairing uses FileDrop's manual signaling (`/scripts/fd/signaling.js` and `sdp-codec.js`): the SDP
offer and answer are packed to about 115 characters, which makes 169-character links and small QR
codes. The connection uses STUN only, with no TURN relay, so two phones behind strict NATs (some
carrier networks, corporate Wi-Fi) may fail to connect. The same Wi-Fi network always works.

## Controls

| input | does |
|---|---|
| tap a tile | choose it (it lifts); the hint line says what discarding it leaves you waiting on |
| tap it again, double-tap, or **打 Discard** | discard it |
| ← → and Enter | choose and discard with the keyboard |
| claim buttons | 吃 chow (one button per run), 碰 pung, 槓 kong, 糊 win, 過 pass (Esc) |

With hints on, the computer's choice of discard glows blue, and the hint line names the tiles you are
waiting on once your hand is ready.

## How it is built

- `rules.js` holds the rules as plain state: wall, deal, bonus replacement, claims with priority, kongs
  and robbing, win decomposition, faan scoring, payments, and a `Match` for dealer rotation and wind
  rounds. `Hand.view(seat)` is the only thing the network sends.
- `ai.js` is the computer player. For every decision it picks a plan (any hand, one suit in a given
  suit, or all pungs) by shanten and by whether the plan can reach the minimum faan. It ranks discards
  by shanten, unseen improving tiles and, late in a hand or against an open one-suit hand, how
  dangerous the tile is. It claims only when a claim brings the hand closer and keeps the faan in
  reach. It sees what a human at its seat would see.
- `node tests/mahjong-rules.mjs [hands]` tests the scoring on known hands and plays whole bot hands
  and an East round, checking that all 144 tiles stay accounted for and payments balance. At the
  3-faan minimum the bots win about 85% of hands (103 of 120 in the test run), and the rest end with the wall exhausted.
- `render.js` draws the tile faces once into an atlas with Canvas 2D (Noto Serif SC, subset to the
  characters used, for the numerals, winds, dragons and bonus names). Two WGSL pipelines do the rest:
  - **Scene**: a full-screen pass, drawn at half resolution and stretched up. A night sky with a moon
    and stars, four ink-wash mountain layers with drifting mist, a pagoda with a lit window, a pine
    branch and falling plum petals. In front is a rosewood table with brass corners and a jade felt
    top with cloud motifs, a gold fret line, a flickering lamp pool and a glow on the edge of whoever
    is to play.
  - **Tiles**: one instanced draw. Each tile is a rounded box with thickness (an ivory face over a jade
    back), a bevel lit by a slowly circling lamp, and a soft shadow that spreads as the tile lifts. A
    sheen crosses the face every 7–12 s, phased per tile, and hand tiles sway slightly. The chosen
    tile lifts with a gold glow; the latest discard pulses jade, a claimable one gold, and a winning
    hand gets a gold sweep.
  - Tiles ease toward their places, so a draw, a discard or a claim moves across the table.
- `?renderer=2d` forces the Canvas 2D fallback, `?seed=N` fixes the deal, and `window.__mahjong`
  exposes state for tests.
