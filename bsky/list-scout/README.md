# Bluesky List Scout

https://austegard.com/bsky/list-scout/

Finds Bluesky accounts that post about AI and are not on your list yet, then adds the ones you pick to a
list. Sign in with an app password (Bluesky answers post searches only for signed-in accounts); everything
else runs in the tab:

1. **Search.** Each term is searched as a phrase over the last N days, newest first, a page of 100 posts at
   a time. Authors not on the lists you choose to skip, seen at least the minimum number of times, become
   candidates; the most-seen are sampled first.
2. **Sample.** Each candidate's last 100 posts and replies, without reposts, from the public AppView, plus
   the share of them that are replies and posts per day.
3. **Classify.** Ettin-17m (`../embedders/models/ettin/`, the WebGPU engine in `../embedders/engine.js`)
   embeds every sampled post, and a logistic regression (`about-ai.json`, 768 weights and a bias) gives the
   probability that it is about AI. An account's AI share is the mean. The browser's probabilities match the
   Python model within 0.004.
4. **Review.** The table pre-ticks accounts with an AI share at or above the threshold, no bot or feed words
   in name or bio, at most 40 posts a day and at least 15% replies; bots, feeds and marketers post a lot about
   AI but rarely reply. Sort by any column; open an account's most and least on-topic posts.
5. **List.** The ticked accounts go on a new curate list or an existing one; accounts already on it are skipped.

The classifier comes from oaustegard/experiments `bsky-list-ai-share` (600 posts labelled about-AI or not
by Claude Haiku, cross-validated AUC 0.885), where the same pipeline, with a Claude judge in place of the
review table, found 41 people for the "Artificial (and real) Intelligence" list. It only measures "about AI":
other search terms still find people, but the share column will not measure their topic.

Needs WebGPU. Settings are kept in localStorage; the session is stored as on the site's other list tools
(`../bsky-lib.js`).
