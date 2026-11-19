# Six Degrees of Bluesky

https://austegard.com/bsky/six-degrees/

Finds the shortest chain of follows from one Bluesky account to another, and measures any one account's network.
It runs in your browser against Bluesky's public servers, needs no sign-in to read, and never sends more than
300 requests in any 60 seconds, a ceiling chosen to stay well inside what Bluesky's servers tolerate from one
address. Before each piece of work it says how many requests that will take.

## Using it

**Path.** Type two accounts (handle, DID or profile URL) into From and To and press Find path. The result is a
row of profile cards, From → … → To, where each account follows the next, and a line that says whether the path
is proven shortest. ⇄ swaps the two, which gives the path the other way round, the same as following followers instead of follows. "Mutual follows only" restricts the path to pairs that follow each other. "List every
shortest path" lists up to 50 when several tie.

**One account's network.** Type an account and press Load (one request). Seven measurements, called tiers,
appear with the number of requests each will take; press Run on any of them. Tier 7 compares the account with a
second one, typed into its own box.

**Results.** Every list of accounts the page produces opens as a table with CSV and JSON downloads and a button
that turns it into a Bluesky list (see Making lists).

`?a=austegard.com&b=jay.bsky.team` fills in the path search (`&go=1` also runs it); `?account=austegard.com`
fills in the account.

Words the page uses:

- **request** or **call**: one HTTP request to a Bluesky or atproto server.
- **page**: one list request returns at most 100 accounts, so an account with 879 follows takes 9 pages.
- **run**: everything one button press sets off (a path search, one tier). The budget counts per run.
- **step**: a part of a run that is estimated and approved on its own, such as one ring of a path search.
- **ring**: all the accounts the same number of follows away from From (or from To) in a path search.

## Request ceiling

Every request goes through `scheduler.js`, which holds it until sending it keeps the count of requests in the
last 60 seconds under the ceiling.

| Host | Requests per rolling 60 s |
|---|---|
| all hosts together | 300; the ceiling box in the top bar can lower it, not raise it |
| `public.api.bsky.app` (Bluesky's public AppView, which serves profiles, follows and feeds) | no cap of its own beyond the 300; it sends no rate-limit headers |
| each PDS (the server that stores an account's own records) | 120; Bluesky's PDSes allow 3,000 per 5 minutes per IP |
| `plc.directory` (maps an account's DID, its permanent ID, to its PDS) | 120 |
| `constellation.microcosm.blue` (a community-run index of which records point at which) | 60 |

At most 4 requests are in flight at once. A 429 answer, or a `RateLimit-Remaining` header under 10% of
`RateLimit-Limit`, pauses that host until the time in `RateLimit-Reset` (60 s when there is none). The refused
request then waits a further 1, 2, 4, 8 or 16 seconds and gives up after six tries. The last minute's send
times are kept in `localStorage`, so reloading the page does not reset the count.

The bar at the top shows the requests in the last 60 s against 300, the requests of the current run, the queue,
any host paused for its rate limit, the ceiling and the budget. Stop cancels every queued request.

## Budget

Each step shows "Next step: ~N calls, ~T at the current ceiling" before it starts. Page counts come from each
account's `followsCount` and `followersCount`. When a step would take the run past its budget (500 calls unless
changed in the bar), the run waits: Continue raises the budget to cover that step and asks again at the next
step that would pass it; Stop here ends the run. A path search ended that way says its result is unproven. The
budget never interrupts a step once it has started; the Stop button does.

Counts include deleted and taken-down accounts that the list requests leave out (`getFollows` returned 879 of
904 counted follows for austegard.com on 2026-11-18), so estimates run a little high.

## Path search

`path.js` searches from both ends. From's side grows along follows (`app.bsky.graph.getFollows`), To's side
along followers (`getFollowers`), one ring at a time, always the side whose next ring costs fewer pages. An
account with more pages than the page cap (10 by default, so 1,000 accounts; the Page cap box changes it) is not
read, though a path can still pass through it. After each ring on From's side, the last-hop check asks
`getRelationships?actor=To&others=…` (30 accounts per call) which of the new accounts follow To. That finds the
last hop to a celebrity whose followers could never be read.

Every ring is finished before the search stops, and it stops only when no path it has not seen could be shorter
than the best one found. With f rings read on From's side and t on To's side, every path of f + t hops or fewer
has been seen (f + 1 when only the last-hop check covers To's side). The prototype in `prototype/sixdeg.py`
stopped at the first meeting in the middle of a ring and could report 4 hops when 3 were possible.

An account that was too big to read can still hide a shorter path. The gap check works out which skipped
accounts could: one skipped k rings from From matters only if a path through it could be shorter than the best
without reaching To's complete rings, and the same in the other direction. For each skipped account on To's side
that remains, one `getRelationships` call asks whether any remaining skipped account on From's side follows it,
which settles every path in which the two are neighbours. A path with an unseen account between them stays
possible, and those skipped accounts are listed under the result, which then reads "no shorter path exists unless
it runs through one of these accounts". Raising the page cap reads them.

"Mutual follows only" uses only pairs that follow each other. It reads both lists of an account, or its smaller
list plus `getRelationships` for the other direction, whichever takes fewer requests.

Measured on 2026-11-19 at the full ceiling, with "list every shortest path" on:

| Pair | Result | Requests | Time |
|---|---|---|---|
| austegard.com → jay.bsky.team | 2 hops, proven shortest, at least 20 paths | 44 | 5 s in Chromium, 11 s in Node |
| thetractorbeam.bsky.social → tractorbeambenny.bsky.social | 4 hops, proven shortest, 19 paths | 514 | 71–81 s over two Node runs |

The second pair passes the default budget once. Its rings left 13 accounts unread at depth 1, on both sides
together; the gap check cost 5 requests and ruled out a 3-hop path through them.

## Tiers

Each tier shows its estimated requests and runs only when asked.

1. **Follows and followers.** Follows, followers, mutuals, accounts it follows that don't follow back, and
   followers it doesn't follow back. For follows and followers separately: the year each account was made, its
   post count, its followers per account it follows, handle kind (bsky.social, own domain, Bridgy Fed bridges
   from the fediverse or the web) and domain, labels, and verification. One request per page plus one per 25
   profiles: 68 for austegard.com.
2. **Follow timeline.** The account's own follow records, read from its PDS with
   `com.atproto.repo.listRecords`. Follows per month, and follows of accounts the AppView no longer shows
   (deleted, deactivated or taken down). 12 requests for austegard.com.
3. **Recent posts of each follow.** `getAuthorFeed?limit=10` for each account followed: when it last posted
   (no post in 90 days counts as dormant), the main language of its posts, and the hours its follows post in. The
   account's own last 100 posts give its posting hours; the middle of its quietest six hours is taken to be about
   03:45 local time, which gives a guess at its UTC offset. One request per follow.
4. **Lists and starter packs** that include the account. Constellation lists the list-item records that point at
   the account's DID; `getRecord` and `getList` read each list, and starter packs come from Constellation records
   that point at those lists. Moderation lists (block and mute lists) are left out.
5. **Echo-chamber sample.** The follow lists of a random sample of the account's follows (100 by default).
   Density is the share of the account's other follows that a sampled follow also follows: 5% means a typical
   follow follows one in twenty of them, and a higher number means a tighter circle. Jaccard overlap (shared
   accounts over all accounts) of each sampled follow's follows with the account's, and between pairs of sampled
   follows. Each comes with a percentile-bootstrap 95% interval over the sampled accounts.
6. **Full ego network.** The follow records of every account followed, read from each one's own PDS, which
   spreads the requests over many hosts and their separate limits. From them: communities (Louvain), bridge
   accounts (betweenness: how many shortest routes between other follows pass through an account; participation:
   how evenly its links spread over communities), and a drawing coloured by community. About 9,100 requests and
   30 minutes for austegard.com. Each follow list is cached when read, so a stopped run picks up where it stopped.
7. **Two accounts compared.** Shared follows and shared followers, with Jaccard overlap of each.

## Caching

Follow lists, follower lists, profiles, follow records, feeds and PDS addresses are kept in IndexedDB for 24
hours, keyed by DID. A cached result costs no requests. "Clear cache" at the bottom empties it.

## Making lists

"Make a Bluesky list…" under any table of accounts creates a curated list in your account and adds the accounts
with `com.atproto.repo.applyWrites`, 200 per request. Bluesky lists are public, so anyone can see a list of, say,
accounts that don't follow you back. Making one needs sign-in with atproto OAuth (`@atproto/oauth-client-browser`,
client metadata in `client-metadata.json`), which asks only to write list and list-item records. Sign-in leaves
the page and reloads it, which clears the results on screen; the cache makes running the same search or tier
again free.

## Files

| File | |
|---|---|
| `index.html` | page and styles |
| `app.js` | top bar, budget, rendering, downloads, sign-in and list making |
| `scheduler.js` | the request ceiling |
| `api.js` | reads from the AppView, PDSes, PLC and Constellation; the IndexedDB cache |
| `path.js` | path search, stopping rule, gap check |
| `metrics.js` | the seven tiers; Louvain, betweenness, bootstrap |
| `client-metadata.json` | OAuth client description |
| `build.json` | current build; a cached older copy of the page that sees a newer one reloads itself |
| `prototype/sixdeg.py` | the Python prototype the search was ported from |

The page also loads `/experiments/gpu-bridge/web/relay.js`, a logger from the `oaustegard/experiments` site that
does nothing unless switched on with `?log=1` in a browser holding its GitHub token.

Tests, run with Node 22 from the repository root:

```bash
node tests/six-degrees-scheduler.mjs && node tests/six-degrees-path.mjs && node tests/six-degrees-metrics.mjs
```

The scheduler test queues 1,000 mocked requests in simulated time and checks that no 60-second window holds more
than 300 sends (and no host more than its cap), that 429s and low remaining counts pause their host until the
reset, and that Stop cancels the queue. The path test compares the search with plain breadth-first search on
hundreds of random follow graphs, with and without accounts too big to read and in mutual mode, and replays the
case the prototype got wrong. The metrics test checks Louvain, betweenness, Jaccard, the bootstrap and the
timezone guess on hand-worked cases.

## Not built yet

An about-AI classifier, ported to JavaScript from `bsky-list-ai-share` in `oaustegard/experiments`, would score
the posts tier 3 collects (kept in memory as `data.posts`) for how much each follow posts about AI. Named-entity
recognition would follow it.
