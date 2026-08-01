# Bluesky Advanced Search

[advanced-search.html](https://austegard.com/bsky/advanced-search.html) — a form
that builds a `bsky.app/search` URL.

The standalone counterpart to the
[BlueSky Advanced Search bookmarklet](https://github.com/oaustegard/bookmarklets/blob/main/bsky_advanced_search_README.md),
which does the same job as an overlay injected into bsky.app. This page needs no
bookmarklet, no extension, and no bookmarks bar — it is just a page.

## It searches nothing

The page is a pure URL builder. No login, no OAuth, no app password, no API
calls, no analytics. Everything happens in the browser: you fill in fields, it
assembles a link, you follow the link, and Bluesky does the searching. Nothing
you type leaves the page until you click through.

## What it covers

Bluesky's search takes free text in `q` plus a set of structured filter params
alongside it. The form writes both.

### Words → `q`

| Field | Produces |
|---|---|
| All of these words | free text, verbatim |
| This exact phrase | `"phrase"` |
| None of these words | `-word` per term |

Quoted phrases and `(a OR b)` groups typed into the first field pass through
untouched — the tokenizer keeps them intact rather than splitting on their
spaces.

### Accounts, links & tags → sibling params

Repeatable rows. Each row picks a field, an include/exclude mode, and one or
more space-separated values (OR-matched within a row). Rows of the same field
and mode merge and dedupe.

| Row field | Include param | Exclude param |
|---|---|---|
| From account | `author` | `excludeAuthor` |
| Mentions | `mentions` | `excludeMentions` |
| Links domain | `domain` | `excludeDomain` |
| Links URL | `url` | `excludeUrl` |
| Hashtag | `tag` | `excludeTag` |

A leading `@` on handles and `#` on tags is stripped — the params want the bare
value, and passing the marker through makes the appview 400.

### Post attributes

| Control | Produces |
|---|---|
| Author: People I follow | `following=true` |
| Author: Me | `from=me` |
| Replies: Exclude / Only | `replies=none` / `replies=only` |
| Media: Has media | `media=true` |
| Media: Has video | `video=true` |
| Language | `lang=<ISO 639-1>` |
| Since / Until | `since=` / `until=` (`YYYY-MM-DD`) |

`following` and `from=me` only mean anything when you are signed in to Bluesky
in the browser you open the link in.

Dates filter on Bluesky's *index* timestamp, which can drift from a post's
`createdAt`. `since` is inclusive; `until` is not.

## Two URL styles

**Structured params (default)** — what the Bluesky app itself produces when you
share a search from its advanced-search dialog:

```
https://bsky.app/search?q=%22atproto%22+-spam&author=austegard.com&excludeDomain=example.com&tag=bsky&lang=en&replies=none
```

**Query operators (classic)** — everything packed into a single `q=`, using the
operator syntax that predates the params:

```
https://bsky.app/search?q=%22atproto%22+-spam+from%3Aaustegard.com+%23bsky+lang%3Aen
```

The classic form is paste-able straight into Bluesky's own search box, and works
in older clients that only read `q`. It cannot express the exclude filters, the
replies filter, media, video, or following — the page lists exactly what it had
to drop when you switch modes. Multi-value fields also degrade: an older client
honours only the first `from:`/`domain:`/`url:` it sees.

The two are not mutually exclusive in Bluesky itself: operators found in `q` are
merged with the sibling params rather than overriding them. The toggle just
picks which of the two the page writes.

## Round-tripping

**Load an existing search** takes a `bsky.app/search` URL — or a bare query
string — and fills the form from it. Structured params and query operators are
both understood, so a link shared from the Bluesky app and one typed by hand
both load.

The page also mirrors the search it built into its own address bar, so any
configured form is bookmarkable and shareable. Reloading such a link restores
every field.

## Operator reference

Inside `q`:

| Syntax | Effect |
|---|---|
| `"exact phrase"` | phrase match |
| `-word` | exclude a word |
| `(a OR b)` | alternation group |
| `#tag` | hashtag |
| `from:handle`, `from:me` | author |
| `mentions:handle`, `to:handle` | mentions an account |
| `domain:example.com` | links to a domain |
| `url:https://…` | links to a URL |
| `lang:en` | post language |
| `since:2026-01-01`, `until:…` | date range |

The exclude/replies/media/video/following filters exist only as params — there
is no operator spelling for them.

## Author

Concept and edits by [Oskar Austegard](https://austegard.com). Code by Claude.
