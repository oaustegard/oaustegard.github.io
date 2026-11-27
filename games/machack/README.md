# Mac Hack VI

A playable re-creation of Richard Greenblatt's chess program for the PDP-6 at MIT's Project MAC
(1966–67), drawn on a bulging phosphor tube, with its search shown as it happens: the plausible
moves ranked at each node, the ones kept and the low-ranked ones it discards unexamined ("clipped"), alpha-beta cutoffs crossing out
branches, the main variation forming. Slow it down to follow each step, or switch to full speed.
Installable PWA, one self-contained page, no third-party requests.

Live: <https://austegard.com/games/machack/>

## Why

*National Geographic*, November 1970, "Behold the Computer Revolution", p. 627. The writer visits
MIT and meets "a 25-year-old Missourian, Richard Greenblatt":

> "In any given situation, some moves look more promising than others," he said. He drew me a
> "decision tree," showing various branches, or possible moves.
>
> Having made a losing move, he explained, the program will clip off that branch. And so it will
> sooner or later wind up with the optimum path. "Now I don't feed in moves any more," he said,
> "I feed in principles. The learning process is already built in. While it's playing, I don't
> feed in anything, of course."

The writer loses on the tenth move, asks "Could I take my last move back, and play on?", and lasts
to move 59, when the program delivers mate: "Queen from Queen's Bishop 8 to King's Rook 8!" The article also says the program "can
be adjusted to look two moves ahead, or four, or six". This page is that decision tree, drawn while
the program uses it. The TAKE BACK button, the 2 / 4 / 6 look-ahead buttons and the descriptive
notation come from the same page.

## Controls

The search follows Greenblatt, Eastlake and Crocker, "The Greenblatt Chess Program" (Fall Joint
Computer Conference, 1967), called "the paper" below. A ply is one move by one side.

| control | does |
|---|---|
| tap a piece, then a square | move (a promotion asks which piece) |
| LOOK-AHEAD 2 / 4 / 6 | how many plies every line is searched before captures and other extensions take over |
| WIDTH: NORMAL / TOURN. | how many moves are kept at each ply: 6 at every level, or 15, 15, 9, 9, 7 (the paper's two settings) |
| THINKING RATE | search steps per second, about 1.5 to 2,400 |
| FULL SPEED | run the search flat out; the tube shows the tree without labels, counters and the top-level table |
| NEW GAME, TAKE BACK, YOU: WHITE/BLACK | take back removes your last move and the reply; changing side starts a new game |
| SOUND | relay clicks for search steps, teletype clatter, a bell at the end |
| P-K4 / e4 | descriptive notation (default) or algebraic |
| P7 / P1 | screen colour, named for the phosphor: P7 is the blue-white with yellow-green afterglow of DEC's Type 340 display, which the PDP-6 drove; P1 is plain green |
| BOOK | a few opening lines (off by default so the first reply shows the search) |

Lamps: RUN while it thinks, YOUR MOVE when it waits for you, CLIP flashes on an alpha-beta cutoff,
HASH on a hit in the table of positions already valued, CHECK and MATE when they happen on the board.

## Reading the tube

The tree has one row per ply; `1B` is ply 1 with Black to move. Each row shows the moves at the
node being examined: a diamond is the move under study (labelled with its plausibility score),
filled squares have been valued, hollow squares are waiting, a ring marks the best so far, a cross
is a move cut off by alpha-beta. The short dashed stubs at the right, with a count, are legal moves
the plausible move generator ranked too low to keep: clipped by the width. Rows below the look-ahead
depth are capture sequences or a feedover extension: extra plies added when the position at the
look-ahead depth is still unsettled (a piece attacked, a king in check). On the board, the dashed arrow is the top-level
move being tried and the solid one is the best so far.

Under the tree: what the program did last, its best line, counters, and the paper's own debugging
aid, "printed record of plausibility of all moves at top level and main variation from each top
level move", with the two heuristics that added most to each move's plausibility score. Values are in pawns, positive for
White.

## What is reproduced, and from where

The source is Greenblatt, Eastlake and Crocker, "The Greenblatt Chess Program", Fall Joint Computer
Conference 1967, pp. 801–810
([scan at the Computer History Museum](https://d1yx3ys82bpsa0.cloudfront.net/chess/the-greenblatt-chess-program.greenblatt-eastlake-crocker.1967.fall-joint-computer-conference.062303060.pdf),
[catalogue page](https://www.computerhistory.org/chess/doc-431614f6c7a98/), also MIT
[AIM-174](https://dspace.mit.edu/handle/1721.1/6176)), with
[chessprogramming.org](https://www.chessprogramming.org/Mac_Hack) and
[Wikipedia](https://en.wikipedia.org/wiki/Mac_Hack) for context.

Taken from the paper as written:

- **Search.** Minimax over a tree in which the plausible move generator scores every legal move,
  sorts them, and keeps a subset. Basic width "usually all 6 for normal play, and … 15, 15, 9, 9, 7
  for tournament play". Alpha-beta, with a move "refuted if it is equally good as the best so far at
  the previous level", and ties going to the earlier, more plausible move.
- **The four widening rules.** All safe checks are searched; all captures at the first two levels;
  moves of at least min(half the width, pieces with safe moves) distinct pieces; moves that get
  mated are not counted against the width.
- **Static evaluator.** S = B + R + P + K + C with the piece values of Table 2 (pawn 128, knight
  416, bishop 448, rook 640, queen 1248). The king safety term applies only with queens on and is 8
  per rank; center control is ±1 for a pawn on the four center squares against none. The pawn
  structure term scores the opponent's isolated, doubled and isolated, tripled and backward pawns and
  our own passed pawns; a backward pawn counts for more on an open file or against rooks or queens.
- **End of the basic search.** The three feedover conditions (pieces en prise with the side to move
  in check, or trapped, or pinned, and so on) extend the search with the plausible move generator;
  otherwise the static value stands and "all plausible captures" are followed "without a depth or
  width limit".
- **En prise test.** "The value of the piece attacked, the number of attackers, the number of
  defenders and the values of the least valuable attacker and defender."
- **Hash table.** 32,768 entries (the paper: 32,000, two machine words each) holding value, depth
  and whether the value is exact or a bound; it also catches repetitions.
- **Value modifications.** A few points off a move the generator marked developmentally poor, and
  off a line that moves the same piece again two plies later (more if it goes back).
- **Secondary search.** A new best candidate at the top level gets two more plies from the end of
  its main variation, and keeps the worse of the two values.
- **Plausibility method.** Each square gets an importance (near the center, near the enemy king,
  occupied by our piece en prise, toward the enemy side); a piece's developmental value is the sum
  over the squares it attacks plus its attacks on enemy pieces; a move is scored by the change,
  plus captures, en prise tests, and special cases such as "it is bad to move pieces in front of
  center pawns on their original squares".

Assumed, because the paper is silent or "more representative than definitive":

- **Every weight in the plausible move generator**, and which of the "about 50" heuristics exist.
  This page has about twenty. The small preference for the king's pawn over the queen's on move one is an addition.
- **The weights of the pawn-structure sub-terms** (isolated 12, doubled and isolated +8, tripled 24,
  passed 16 + 6 per rank, backward 8 or 14, against a pawn of 128).
- **Backward pawns.** The paper's rules, read literally, call every pawn that lags a neighbour
  backward (after 1 P-K4, both neighbours of the king's pawn). Here the pawn must also be held:
  its next square occupied by an enemy or covered by an enemy pawn.
- **The piece ratio term.** The printed formula is garbled ("R = {N/(T-1)}*⅛*M"); this page uses
  (N/T − 1) · M/8, which gives a few points for an even trade when three pawns ahead, as the text
  describes.
- **King safety ranks** are counted from each side's own back rank.
- **Feedover limits** ("up to certain limits"): at most two extra plies. Pawns do not count as
  pieces en prise. "Trapped" and "pinned" are judged from the attack tables, pins against the king
  only.
- **Capture search** is capped at 12 plies beyond the basic depth; a capture is plausible if the
  victim is worth more, is undefended, or is outnumbered.
- **Hashing** uses XOR of random numbers per piece and square (published by Zobrist in 1970); the
  paper does not give Mac Hack's function.
- **The book.** The real one, "over 5000 moves" compiled by Larry Kaufman and Alan Baisley, is not
  available. The BOOK button plays the opening moves Mac Hack VI itself made in the games printed
  in the paper, plus 1…P-Q4 against 1 P-Q4.
- **Speed.** The PDP-6 did about 200,000 operations a second and one plausible move generation took
  about 80 ms. A phone does a six-ply tournament-width search in well under a second, so the
  thinking rate here is a brake, not a simulation.

Known blind spot, kept on purpose: a queen sacrifice that gives check is an *unsafe* check, scores
low, and can be clipped, so some two-move mates are missed that a full-width search would find.

## How it is built

- **Engine and worker.** Everything is in `index.html`, with no build step; edit it directly.
  `ENGINE()` holds the rules (0x88 board, castling, en passant,
  promotion, repetition, fifty moves), notation, the plausible move generator, evaluator and search.
  The page calls it for legal moves; a Web Worker built from the same function's source runs the
  search. Without workers the same driver runs on the page.
- **The search is a generator.** It yields at every step worth showing. The driver steps it at the
  chosen rate and posts a snapshot of the stack of nodes; at full speed it runs 60 ms slices with
  tracing off. Changing the rate mid-search takes effect on the next step.
- **The tube** is a 2D canvas (vector pieces, dot-shaded light squares, text) drawn in grey levels,
  then passed through a WebGL shader: barrel bend, phosphor colour, an afterglow buffer that decays
  between frames, bloom, scan lines, flicker, vignette and a glass highlight. Taps are run through
  the same bend to find the square. Without WebGL the canvas is shown flat and tinted.
- **Sound** is Web Audio: filtered noise bursts and short tones, started on the first tap.
- **State** (settings and the game) is kept in `localStorage`.

## Checks

- Move generation matches perft: start position depth 4 = 197,281; Kiwipete depth 3 = 97,862;
  positions 3 and 5 of the chessprogramming.org "Perft Results" page.
- Finds mate in one and a quiet two-move rook mate, finds Scholar's mate at 2 and 4 plies, and does
  not drop material in three opening positions at 4 plies.
- Played whole games, every move checked legal: against a random mover (mate in 11 plies as White,
  54 as Black) and 4 plies against 2 plies (mate after 97 plies).
- Playwright at desktop and phone size: moves by tap, slow and full-speed replies, an illegal move
  refused, take back, the engine delivering Fool's mate with the game ended, playing as Black, no
  console errors and no requests off the origin.

The engine tests (node) and the Playwright run were written for this build and are not in the repo.
