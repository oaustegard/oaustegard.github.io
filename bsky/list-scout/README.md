# Bluesky List Scout

https://austegard.com/bsky/list-scout/

Builds a Bluesky list on any topic. You give it search terms; it finds accounts that use them and are not on
your lists yet, measures how much of what each one posts is on topic, and adds the ones you pick to a curate
list (the kind a feed or a reader follows, as opposed to a moderation list). Sign in with an app password
(Bluesky answers post searches only for signed-in accounts); everything else runs in the tab.

The topic is measured by one of two models, chosen under "Measure the topic with":

- **Learned from the search results** (the default, for any topic). The page fits a classifier during the run
  from the posts your terms found, as described below.
- **Pre-trained about-AI model**, for lists about AI. It was trained on 600 Bluesky posts labelled about-AI or
  not by Claude Haiku (cross-validated AUC 0.885) in oaustegard/experiments `bsky-list-ai-share`, and is stored
  as `about-ai.json` (768 weights and a bias). Choosing it fills in the 40 AI terms it was built with when the
  term box is empty; the "example: AI terms" button fills them in at any time.

## Steps

1. **Search.** Each term is searched as a phrase over the last "Days back" days, newest first, "Pages per term"
   pages of 100 posts. Authors not on the lists you choose to skip, who turn up at least "Min. hits" times,
   become candidates; the "Max. accounts" seen most often are sampled.
2. **Learn the topic** (learned model only). Ettin-17m, a small text-embedding model that runs on the GPU
   (`../embedders/models/ettin/`, engine `../embedders/engine.js`), turns posts into vectors. The on-topic
   examples are up to 1,500 of the posts the search found, at most 25 per author; the off-topic examples are
   1,200 posts from Bluesky's Discover feed. A logistic regression fitted in the tab (`topic.js`) tells the two
   apart, giving the probability that any post is on topic. The log reports its AUC on a fifth of the examples
   held out from fitting; below 0.9 it warns that the terms may be too general.
3. **Sample.** Each candidate's last 100 posts and replies, without reposts, from the public AppView, plus
   the share of them that are replies and posts per day.
4. **Classify.** The model scores every sampled post; an account's topic share is the mean.
5. **Review.** The table pre-ticks accounts whose topic share is at least the pre-tick threshold (50% for the
   learned model, 40% for the about-AI one), with no bot or feed words in name or bio, at most 40 posts a day
   and at least 15% replies. All four are editable defaults. Bots, feeds and marketers post a lot on most topics
   but rarely reply. Sort by any column; "hits" is how many search results an account wrote. Each row opens the
   account's most and least on-topic posts.
6. **List.** The ticked accounts go on a new list or an existing one; accounts already on it are skipped.

## How good the learned model is

Use terms that mostly mean the topic: the posts they find are the model's only idea of what the topic is. To
check it, both models scored 18,550 posts by 200 members of an AI list, taken from the corpus behind
`../answer-search/`. The learned model put members in nearly the same order as the about-AI model (rank
correlation 0.89 when learned from three terms, 0.93 from forty) but gave them shares 0.08 to 0.2 higher, so
read its share as a ranking and set the threshold by looking at the table. The shares run high because Discover
posts are further from the topic than the off-topic posts of people who write about it.

Needs WebGPU. Settings, including the lists to skip, are kept in localStorage; the sign-in session is kept in
the browser by the site's shared Bluesky library (`../bsky-lib.js`).
