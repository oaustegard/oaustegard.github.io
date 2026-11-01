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
- **Computer** in the lobby sets who the computer seats are (see below): **Easy** (calling stations, rocks
  and maniacs), **Mixed** (one of each kind, with tight-aggressive players among them), or **Hard** (all
  tight-aggressive and loose-aggressive). The host's table screen shows each seat's style.

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

With hints on, the line above your cards reads "Your share ≈ n% · price m% · computer: call": your share of
the pot against the hands the other players are likely to hold (read from what they have done this hand),
the price of calling as a share of the pot after the call, and what a tight-aggressive computer player
would do.

## How it is built

- `rules.js` is plain state with no DOM. Hand evaluation scores high hands as one integer from up to seven
  cards (no 21-combination loop), and ace-to-five lows from rank counts; Omaha enumerates its 60 two-plus-
  three combinations. `Hand` runs one deal: forced bets, streets, betting under each structure, the draw,
  side pots and the showdown. `Match` carries stacks, buy-ins, rebuys, the button, rising blinds and the
  mixed-game rotation from hand to hand. `hand.view(seat)` is the only thing the network sends.
- `ai.js` is the computer player; see the next section.
- `sound.js` synthesizes the table sounds with Web Audio, no sample files: chips are modal clacks (four
  decaying inharmonic partials and a click per chip, a few chips per bet by its size, a cascade when a pot
  is pushed to you), cards a swish of band-passed noise sweeping up as they slide, then a snap; a check
  is a knuckle double-knock; your turn a quiet two-note bell. All of it runs through a gentle compressor
  and a short synthetic room reverb.
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
- `node tests/poker-bots.mjs [deals] [game] [structure] [A] [B] [seats]` plays duplicate matches between
  two computer players (see below).
- `?renderer=2d` forces the Canvas 2D fallback, `?seed=N` fixes the deals, and `window.__poker` exposes
  state for tests.

## Computer players

A computer player sees only what a person in its seat would see, plus a table model: counts, from
public information only, of how each seat has played in earlier hands (how often it puts money in before
the flop, raises, folds to a bet, and shows down a weak hand after betting the last round).

**The first betting round** (before the flop, third street, or before the draw) follows ranges by
position, the way people play: raise first in with the top 14% of hands from early seats up to 42% on the
button (all hands ranked by the Chen formula in Hold'em, by sampled strength elsewhere), call a raise with
roughly the next 12% (wider in the big blind, heads-up, or at a good price), re-raise with the top 3–4%.
Sizes are the usual ones: open to 2.5 big blinds plus one per limper, re-raise to about three times. Each
style scales these ranges; the calling station also limps. A tight-aggressive bot plays about a quarter of
its hands and raises with about one in six, close to a solid human player.

**After that,** each decision has three parts.

1. **Its share of the pot.** It deals the unseen cards at random many times (as many deals as fit in about
   60 ms) and scores the showdowns under the game's rules. Each deal is weighted by how well the
   opponents' sampled hands fit what they did this hand: a player who raised holds the top part of the
   hands they raise with (narrower for a re-raise or a big raise, and narrower still for players the
   model knows raise rarely), with bluffs as a share of that range; a caller holds a wider band; a player
   who checked is less likely to hold a monster. Before the draw, every hand draws by the same rule of
   thumb.
2. **The value of each action.** Checking or calling is worth its share of the pot, less the price, which
   counts for less early in a hand (there is betting still to come) when chips remain behind, and less
   out of position. A bet or raise is tried at a third, half, three quarters and the whole pot
   (and all in, when that is not much more): each opponent folds or continues by its own chance, and the
   continuing hands come from the stronger part of its range; then the cards run out and the pot, with
   every caller's chips, is split as the game splits it, so multiway pots, scoops and quartered hi-lo
   pots count. Whether a hand continues depends on the price the bet offers: nearly everything continues
   against a tiny bet, about a third of hands against a pot-sized one, a few percent against a shove
   twenty times the pot. Players the model has seen fold a lot fold more.
3. **A style.** How tight it is (the margin a call must clear), how much it likes betting, how much it
   believes in folds, how far it trusts the table model, whether it reads ranges at all, and how much it
   varies close decisions. The choice is a soft maximum over the actions' values.

| style | plays |
|---|---|
| Tight-aggressive | few hands, bet and raised hard; reads ranges and adapts to the table |
| Loose-aggressive | more hands and more bluffs; reads ranges and adapts |
| Rock | very tight and cautious; half-trusts the model |
| Calling station | calls too much, rarely raises, does not read ranges |
| Maniac | raises and bluffs a lot, never adapts |

### Measuring them

`tests/poker-bots.mjs` plays duplicate matches: each deal is played twice from the same deck and button,
once with player A in the even seats and B in the odd ones and once swapped, so the luck of the cards
cancels. Every hand starts at 100 big blinds; each pass keeps its own table model. It prints A's result in
big blinds per 100 hands with a standard error. `v1` is the first computer player (equity against random
hands and fixed thresholds), frozen in `tests/poker-ai-v1.mjs` as the baseline.

Measurements, tight-aggressive against `v1` unless noted (6 seats; positive means A wins):

| game | bb/100 |
|---|---|
| Hold'em no-limit | +295 ± 35 (with position ranges); +289 ± 20 before them |
| Hold'em no-limit, loose-aggressive / rock / maniac / calling station | +294 ± 25 / +253 ± 22 / +185 ± 27 / −14 ± 25 |
| Hold'em no-limit, range reading on against off | +183 ± 28 |
| Hold'em fixed-limit | +25 ± 3 |
| Five-Card Draw | +47 ± 5 |
| Razz | +23 ± 6 |
| Seven-Card Stud | +16 ± 7 |
| Omaha Hi-Lo | +20 ± 8 |
| Omaha pot-limit | +254 ± 47 |
| Stud Hi-Lo | +3 ± 6 |

Each later change was measured against the version before it: valuing bets multiway added +41 ± 21
(no-limit Hold'em), +16 ± 3 (fixed-limit) and +13 ± 7 (Razz); playing the first round by position ranges
added +37 ± 22 (no-limit Hold'em) and +14 ± 9 (Stud) while cutting the median pot from 74 to 15 big blinds.

`tests/poker-tune.mjs <out.json> [generations]` searches the constants in `PARAMS` (and the
tight-aggressive style's own) with a (1+4) evolution strategy: each generation plays the incumbent and
four perturbed candidates on the same fresh deals against a mixed field, keeps a candidate only if it wins
by more than two paired standard errors, checkpoints every generation, and resumes from its file.
A 50-generation run (2026-11-01, against v1, the calling station, the maniac and the default
tight-aggressive player in no-limit and fixed-limit Hold'em and Stud Hi-Lo) accepted 5 candidates, about
the 4–5 that chance alone would pass at that bar, and moved no constant more than about 20%. On fresh
deals the tuned values lost to the defaults in no-limit Hold'em (−21 ± 9 bb/100) and were level elsewhere
(fixed-limit +2 ± 1, Stud 0 ± 3, Stud Hi-Lo −4 ± 7), so the hand-set values stand.

