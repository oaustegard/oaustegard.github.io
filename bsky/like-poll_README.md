# Like Poll

A poll builder for Bluesky, which has no polls. You sign in with a Bluesky
handle and app password, type a question and 2–10 options, and the page posts
a thread: the question with a one-line instruction on how to vote, then one
reply per option. People vote by liking the option they want.

Live: <https://austegard.com/bsky/like-poll.html>

## How the thread is built

- The question post ends with `🗳️ Poll: open the thread and ♥ like ONE reply
  to vote.` and `🧵 N options below 👇`, so someone who sees it in a feed knows
  to open the thread.
- Each option is `1️⃣ Tacos` plus `♥ like to vote`, posted as a direct reply
  to the question. The first version chained them (each option replying to the
  one before), which Bluesky draws as a staircase that reads as a
  conversation. As siblings, Bluesky's reply sort decides their order; the
  keycap numbers keep them identifiable if it reorders them.
- With "via Like Poll" checked (the default), the question ends with that
  line, and "Like Poll" is a link facet to this page. It goes in the question
  rather than a closing reply because a closing reply would sit among the
  options and collect likes like one. Bare URLs in the question or options are
  also turned into links.
- By default a threadgate with an empty allow list turns off replies from
  everyone else, so the thread holds only the options. Quote posts still work.
  The gate is written after the options, so it can't block the author's own
  replies.
- The preview counts graphemes against Bluesky's 300 limit and disables
  posting when any post is over.

If a post fails partway, the page says how many went up and links the root so
you can delete them.

## Counting

Likes are deduplicated per post, not across options, so one account can like
every option. The Results box takes the question post's link and shows two
columns: **Likes** (raw) and **Votes** (likes from accounts that liked exactly
one option). It needs no sign-in, and `?poll=<post link>` loads it directly.

It doesn't read the thread from Bluesky's AppView. When the poll's author has
turned on "discourage apps from showing my account to logged-out users", the
AppView leaves their replies out of logged-out thread views, and not
consistently: the first live poll counted correctly in some runs and showed no
options in others. Instead the page lists the author's posts straight from
their PDS, which serves them to anyone, starting at the question's record key
(keys are timestamps, and the options are posted seconds later). It keeps the
posts whose reply root is the question and whose text starts with a keycap, so
polls from the chained first version still count.

Likers come from [Constellation](https://constellation.microcosm.blue), a
backlink index over the whole network, which returns every account that liked
a post. If it is unreachable the page falls back to Bluesky's logged-out
`getLikes`, says so, and warns that the count may miss likers who hide their
account from logged-out viewers.

## Limits

- Sign-in uses an app password through `com.atproto.server.createSession`
  against the user's own PDS (resolved from the handle's DID document). There
  is no server: the password goes only to the PDS, and the session tokens sit
  in `sessionStorage` until the tab closes. OAuth would avoid handling a
  password at all but needs a hosted client-metadata document and redirect
  flow; app passwords were the smallest working version.
- Mentions and hashtags are posted as plain text (no facets); only URLs are
  linked.
- Votes are public: anyone can see who liked which option.
- Counting depends on the option posts keeping their keycap prefix
  (`1️⃣`…`🔟`); editing isn't possible on Bluesky, so that holds.

## Testing

`node bsky/tests/like-poll.browser.js` drives the page in headless Chromium with the network
mocked. It signs in, builds a three-option poll, and checks the five records
written (root, three replies whose `root` and `parent` are both the question,
and the threadgate keyed to the root's rkey). It then counts a mocked repo listing in which one
account liked two options, one option's likers span two pages, and one
option's Constellation lookup fails so the `getLikes` fallback runs, and
checks both columns, for both the current layout and the chained one. It
also checks the facet byte offsets for the credit link and for a URL with a
non-ASCII character. It passes. The real PDS, Constellation and `getLikes`
endpoints were checked by hand for response shape and CORS. Run against the first live poll, the
counter returned the same result (one vote, on option 4) in three of three
runs after the switch to reading the PDS.
