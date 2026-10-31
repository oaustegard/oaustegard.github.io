# Mahjong

Mahjong for four players under Hong Kong (old style) or Taiwanese 16-tile rules, chosen in the lobby.
Play three computer opponents, or host a table and
invite up to three friends: each friend opens an invite link or scans a QR code, sends back a reply
the same way, and the phones connect directly over WebRTC. No server and no accounts are involved.
Installable PWA; WebGPU draws the tiles and the scene, with a Canvas 2D fallback where WebGPU is missing.

Live: <https://austegard.com/games/mahjong/>

## Hong Kong rules

The default rules follow Hong Kong old-style play. The game's own rules panel ("How to play and score")
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

## Taiwanese rules

Pick **Taiwan (16 tiles)** under Rules in the lobby. The host's choice applies to every guest. The
rules panel's Taiwan tab has the full tai table.

- The same 144 tiles. Sixteen tiles each, seventeen for the dealer; a hand is five sets and a pair, or
  seven pairs and a pung (嚦咕嚦咕).
- The last 16 tiles of the wall are kept back, so the hand is a draw when the wall reaches them.
- No minimum: any complete hand wins, even one worth no tai (屁胡).
- Claims and head bump as in Hong Kong rules.
- All eight flowers and seasons win at once (八仙過海, 8 tai). A player holding seven takes the eighth
  from whoever draws it and wins (七搶一, 8 tai); the drawer pays as a discarder.
- Tai: self-drawn 1, concealed 1, concealed and self-drawn 3 (in place of those two), seat flower or
  season 1 each, a full set of four 2, dragon pung 1, seat and prevailing wind pungs 1, single wait 1
  (only one tile kind completes the hand), kong replacement, robbing a kong, last tile and last discard
  1 each, all chows 2 (no honours, no flowers, won on a discard, not a single wait), all five sets
  melded 2, three/four/five concealed pungs 2/5/8, all pungs 4, mixed one suit 4, small three dragons 4,
  pure one suit 8, great three dragons 8, small four winds 8, all honours 16, great four winds 16,
  heavenly hand 16, and earthly hand 16 (a non-dealer wins on their first draw). No cap.
- Payment: base 100 plus 20 a tai. On a discard win only the discarder pays; on a self-draw all three
  pay. Any payment the dealer makes or receives adds dealer tai: 1, plus 2 for each consecutive deal
  (連莊拉莊). The top bar shows 連n while a dealer holds the deal.

Tai tables differ from one Taiwanese table to the next. This one uses commonly cited values.

## Playing with friends

1. The host picks **Host a table**, chooses their own seat (East, South, West, North, or Random as the
   dice would decide; East deals the first hand), then **Invite a friend** for any other seat. Empty seats play as the
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

- `rules.js` holds both rule sets as plain state, `rules.variant` choosing between them: wall, deal, bonus replacement, claims with priority, kongs
  and robbing, win decomposition, faan scoring, payments, and a `Match` for dealer rotation and wind
  rounds, plus the Taiwanese tai scorer, the 16-tile dead wall, the flower wins and dealer-streak
  payments. `Hand.view(seat)` is the only thing the network sends.
- `ai.js` is the computer player. For every decision it picks a plan (any hand, one suit in a given
  suit, or all pungs) by shanten and by whether the plan can reach the minimum faan. It ranks discards
  by shanten, unseen improving tiles and, late in a hand or against an open one-suit hand, how
  dangerous the tile is. It claims only when a claim brings the hand closer and keeps the faan in
  reach. It sees what a human at its seat would see.
- `node tests/mahjong-rules.mjs [hands]` tests the scoring on known hands under both rule sets and plays whole bot hands
  and an East round, checking that all 144 tiles stay accounted for and payments balance. At the
  3-faan minimum the bots win about 85% of hands (87 of 100 in the last run), and the rest end with the
  wall exhausted. Under Taiwanese rules they won 46 of 50, mostly for 0–2 tai.
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
