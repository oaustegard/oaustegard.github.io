# Anything → List

A web-based tool to turn any Bluesky source into a user list — starter packs, feeds, followers, search results, post engagement, and more.

**[Live Demo](https://austegard.com/bsky/anything-to-list.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/anything-to-list.html)**

## Overview

This tool accepts virtually any Bluesky URL, handle, hashtag, or search query as input, resolves the accounts associated with that source, and adds them to a new or existing user list. It replaces the need for separate starter-pack-to-list and list-to-list tools by unifying all source types into a single workflow.

## Supported Sources

| Input | Source Type | What It Fetches |
|---|---|---|
| List URL | List | All list members |
| Starter pack URL | Starter Pack | All pack members |
| Profile URL or `@handle` | Profile | Following, followers, mutuals, blocks, or mutes (you choose) |
| Post URL | Post Engagement | Likers, reposters, quoters, and/or repliers (multi-select) |
| Feed URL | Feed | Unique authors from recent feed posts |
| `#hashtag` | Hashtag | Unique authors from posts using that hashtag |
| Search query (bare text) | Search | Unique authors from matching posts |
| `go.bsky.app/...` and `bsky.app/...-short/...` links | Auto-resolved | Expanded via go.bsky.app, then classified normally |
| `at://` URIs | AT-URI | Classified by collection type |
| `did:plc:...` | DID | Treated as a profile |
| Multi-line handles or DIDs | Bulk List | Each resolved individually |

Short URLs are resolved to their full form before classification. Both
`https://go.bsky.app/CODE` and `https://bsky.app/starter-pack-short/CODE` are
accepted; they are expanded by asking `go.bsky.app` for JSON
(`Accept: application/json` returns `{"url": "..."}`) rather than by following
its redirect, which a browser cannot read because the redirect lands on
`bsky.app` and `bsky.app` sends CORS headers only for its own origin.

A short link that cannot be expanded (network failure, unknown or expired code)
reports that directly rather than falling through as an unrecognized URL.

A `bsky.app` URL that matches none of the patterns above is now reported as an
error. It used to fall through to the free-text search branch, which searched
for the URL as a string and returned whoever had posted that link — a wrong
result that looked like a working one.

## Features

- **Universal Input**: Paste any Bluesky URL, handle, DID, hashtag, or free-text search query.
- **Auto-Detection**: Classifies the input and shows relevant options (e.g., which engagement types for a post, max accounts for a profile).
- **Configurable Limits**: Set max accounts to fetch for large sources like following lists or search results.
- **Mutuals Calculation**: Computes the intersection of following and followers for any account.
- **Duplicate Prevention**: Checks existing list members before adding; only adds new accounts.
- **Progress Log**: Terminal-style log shows pagination progress in real time.
- **New or Existing List**: Add to any of your existing lists, or create a new one on the fly.

## Usage

1. **Login**: Enter your BlueSky handle and an app password to log in.
2. **Paste Source**: Enter any supported URL, handle, hashtag, or search query.
3. **Resolve**: Click "Resolve Source" — the tool classifies the input and may show sub-options (e.g., following vs. followers for a profile, or likers vs. reposters for a post).
4. **Fetch**: Click "Fetch Accounts" to retrieve the accounts from the source.
5. **Select Target**: Choose an existing list or create a new one.
6. **Add**: Click "Add to List" to populate the target list.
7. **View Result**: A link to the updated list is provided on completion.

## Technical Details

- Built with vanilla JavaScript using the shared `bsky-lib.js` library.
- Uses the BlueSky public AppView API for reads and the authenticated PDS for writes.
- Blocks and mutes require authentication as the account owner.
- All operations happen in your browser; no data is stored on a server.

## Security and Privacy

- Authentication should be done using app passwords for security.
- Your credentials are only used for the duration of the session.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
