# Poker

Poker for two to eight players: Texas Hold'em, Omaha, Omaha Hi-Lo, Seven-Card Stud, Stud Hi-Lo, Razz,
Five-Card Stud, Five-Card Draw, or a mixed game that rotates through H.O.R.S.E. Play the computer, or
host a table and invite friends: each friend opens an invite link or scans a QR code, sends back a reply
the same way, and the phones connect directly over WebRTC. No server and no accounts are involved.
Installable PWA; WebGPU draws the room, the table and the cards, with a Canvas 2D fallback where WebGPU
is missing.

Live: <https://austegard.com/games/poker/>

## A game is a session

A game runs hand after hand until the host ends it (menu, **End the game**), the hand limit set in the
lobby is reached, or only one player has chips and nobody may rebuy.

- Everyone starts with the same **buy-in**: 1,000, 2,000 or 5,000 chips, with blinds of 10/20.
- A player who runs out is asked before the next hand whether to **rebuy** for the same amount. The table
  allows unlimited rebuys, up to three, one, or none. A player who declines sits out and watches, and can
  buy back in later from the menu while rebuys remain.
- **Blinds** stay at 10/20, or rise every 12 hands (×1.5, ×2, ×3, ×4, …).
- The **standings** (menu, and at the end) show each player's chips, what they have bought in, and the net.
  The nets always sum to zero.
- The computer seats rebuy whenever the table allows it.

## Games

| game | cards | forced bets | betting | pot |
|---|---|---|---|---|
| Texas Hold'em | 2 down, 5 shared | blinds | no-limit, pot-limit or fixed | high |
| Omaha | 4 down (use exactly 2), 5 shared (use exactly 3) | blinds | pot-limit, no-limit or fixed | high |
| Omaha Hi-Lo | as Omaha | blinds | fixed or pot-limit | split, eight or better |
| Seven-Card Stud | 2 down, 4 up, 1 down | antes, bring-in | fixed | high |
| Stud Hi-Lo | as Stud | antes, bring-in | fixed | split, eight or better |
| Razz | as Stud | antes, bring-in | fixed | ace-to-five low |
| Five-Card Stud | 1 down, 4 up | antes, bring-in | fixed | high |
| Five-Card Draw | 5 down, one draw | blinds | fixed, pot-limit or no-limit | high |
| Mixed | Hold'em, Omaha Hi-Lo, Razz, Stud, Stud Hi-Lo, one orbit each | | fixed for the stud games | |

A betting structure a game does not allow is greyed out in the lobby, and that game plays its usual one.

- Fixed-limit bets are the big blind early and twice that on the later streets (turn and river; fifth
  street on in Stud; after the draw). A round allows a bet and three raises. In the high stud games an
  open pair on fourth street lets the round use the big bet.
- No-limit and pot-limit raises must be at least the last bet or raise. A short all-in raise reopens the
  betting only for players who had not yet acted. Pot-limit caps a raise at the pot after the call.
- Stud antes are a tenth of the big blind; the bring-in is a quarter. The lowest up card brings in (clubs
  lowest, then diamonds, hearts, spades); in Razz the highest. The bring-in may complete to a full bet
  instead, and cannot fold. From fourth street the best hand showing acts first (the lowest in Razz).
- When eight players stay to seventh street the deck runs short, so the last card is dealt face up to the
  middle and shared, as in a casino.
- In Draw, discards are shuffled back to make a new stub if the deck runs out.
- Side pots form when a player is all in; the bet nobody called goes back. Odd chips go to the first
  winner clockwise from the button, and in a split pot to the high half.
- At showdown every hand still in is shown; the winning cards are lit.

## Playing with friends

1. The host picks **Host a table**, sets the number of players, then **Invite a friend** for any seat.
   Seats nobody takes play as the computer, and the host can also invite from the menu during a game.
2. The friend scans the invite QR with their phone camera, or opens the link the host texted them
   with **Text or share the link**.
3. The friend's page shows a reply QR and link. The host scans it with **Scan their reply**, opens
   the texted reply link on their own phone (a new tab passes it to the table tab), or pastes it.
4. Once the seat shows connected, deal.

The host's page runs the game. Each guest receives only what its seat may see: its own cards, the up
cards, the board, and everyone's stacks and bets; hidden cards travel only at showdown. A friend who
joins mid-game takes over that seat's chips (or a fresh buy-in if it has none). A friend who closes the
page hands the seat back to the computer; one who wanders off has the computer act for them after 45 s.

Pairing is the shared table-game library in [`/scripts/tabletop/`](../../scripts/tabletop/), also used by
[Mahjong](../mahjong/): `net.js` (the WebRTC star over FileDrop's manual signaling, about 169-character
links), `pairing.js` (QR codes, share sheet, camera scanning, wake lock) and `seats.js` (which seat is
the host, a bot or a friend, and how a question reaches it). STUN only, no TURN relay, so two phones
behind strict NATs may fail to connect; the same Wi-Fi network always works.

## Controls

| input | does |
|---|---|
| **Fold**, **Check** / **Call**, **Bet** / **Raise** | act; F, C and R on a keyboard, Enter for the highlighted button |
| slider and **Min**, **½ pot**, **Pot**, **All in** | size a no-limit or pot-limit bet |
| **Bring in** / **Complete** | the stud bring-in |
| tap your cards, then **Draw n** or **Stand pat** | the draw; **Suggest** picks the computer's discards |

With hints on, the line above your cards shows your estimated share of the pot, the price of calling as a
share of the pot after the call, and what the computer would do.

## How it is built

- `rules.js` is plain state with no DOM. Hand evaluation scores high hands as one integer from up to seven
  cards (no 21-combination loop), and ace-to-five lows from rank counts; Omaha enumerates its 60 two-plus-
  three combinations. `Hand` runs one deal: forced bets, streets, betting under each structure, the draw,
  side pots and the showdown. `Match` carries stacks, buy-ins, rebuys, the button, rising blinds and the
  mixed-game rotation from hand to hand. `hand.view(seat)` is the only thing the network sends.
- `ai.js` is the computer player. It estimates its share of the pot by dealing the unseen cards at random
  (as many deals as fit in about 60 ms) and scoring the showdowns under the game's rules; before the draw
  it also draws every hand by its own rule of thumb. It calls when that share beats the price, discounted
  on early streets for the betting still to come, raises its strong hands at half to full pot, and bluffs
  now and then when few players are left. It sees only what a player in its seat would see.
- `render.js` paints the 52 faces, the back, six chip colours and the dealer button into an atlas with
  Canvas 2D. Two WGSL pipelines draw the rest:
  - **Room**: a full-screen pass at half resolution: a panelled card room with sconces, a brass lamp that
    flickers, haze drifting through its light, and an oval table with a stitched leather rail, a wood trim
    and green felt with a gold betting line. The felt glows toward the player to act.
  - **Cards and chips**: one instanced draw: rounded cards with a soft shadow that spreads as a card lifts,
    a lamp-lit bevel and a sheen that crosses each face now and then; chips as discs.
  - Cards ease from the deck to their places and flip over at showdown; chips slide in from the seats.
- `node tests/poker-rules.mjs [hands]` checks the evaluator on known hands, Omaha's two-card rule, lows and
  the eight qualifier, blinds and heads-up order, a three-way side pot, the fixed-limit cap, the pot-limit
  maximum, stud bring-ins, the draw, and then plays bot hands in every game and long matches with rebuys,
  checking that chips are conserved and no hidden card reaches another seat.
- `?renderer=2d` forces the Canvas 2D fallback, `?seed=N` fixes the deals, and `window.__poker` exposes
  state for tests.
