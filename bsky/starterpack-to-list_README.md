# Convert a BSky Starter Pack to a List

A web-based tool to convert a BlueSky starter pack into a new or existing user list.

**[Live Demo](https://austegard.com/bsky/starterpack-to-list.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/starterpack-to-list.html)**

## Overview

This tool allows you to take a BlueSky starter pack and add all of its members to one of your own user lists. You can either create a new list from the starter pack or add the members to a list you already own. This is useful for quickly curating lists from starter packs you find interesting.

## Features

- **Starter Pack Conversion**: Converts a starter pack into a user list.
- **New or Existing List**: Option to create a new list or add to an existing one.
- **Authentication**: Securely logs into your BlueSky account to manage your lists.
- **Duplicate Prevention**: When adding to an existing list, it avoids adding duplicate members (although the current implementation adds all members).

## Usage

1. **Login**: Enter your BlueSky handle and an app password to log in.
2. **Enter Starter Pack URL**: Paste the URL of the starter pack you want to convert. All four forms work:
   `https://bsky.app/starter-pack/<handle>/<rkey>`, `https://bsky.app/start/<did>/<rkey>`,
   the older `https://bsky.app/profile/<handle>/starter-pack/<rkey>`, and short links
   (`https://bsky.app/starter-pack-short/<code>` or `https://go.bsky.app/<code>`).
3. **Select Target List**: Choose an existing list from the dropdown or select "Create New List" and provide a name.
4. **Convert**: Click the "Convert Pack to List" button to begin.
5. **View Result**: The tool will confirm when the conversion is complete and provide a link to the new/updated list.

## Technical Details

- Built with vanilla JavaScript.
- Uses the BlueSky API for authentication, fetching starter pack data, and managing lists.
- All operations happen in your browser; no data is stored on a server.
- Short links are expanded by requesting `https://go.bsky.app/<code>` with
  `Accept: application/json`, which returns `{"url": "..."}` and
  `Access-Control-Allow-Origin: *`. Following the redirect instead does not work
  from a browser: it lands on `bsky.app`, which sends CORS headers only for
  Origin `https://bsky.app`, so the fetch fails and `response.url` is never
  readable.
- `go.bsky.app` content-negotiates on `Accept` but sends no `Vary` header, with
  `cache-control: max-age=604800`. The browser's HTTP cache keys on the URL
  alone, so a 301 cached from an earlier plain visit to the same short link is
  replayed for the JSON request for a week, and following it lands on
  `bsky.app` and its CORS wall. The request therefore uses `cache: 'no-store'`
  and `redirect: 'manual'`, and retries once under a cache-busting query key if
  a redirect arrives anyway.
- A short link that cannot be expanded (network failure, unknown or expired
  code) reports that directly, rather than being passed along unchanged and
  reported as an unrecognized starter pack URL.
- The starter pack is fetched by AT-URI built from the URL, rather than by
  listing the creator's packs and matching the rkey. Handle authorities in
  AT-URIs are resolved by the appview, so no separate handle lookup is needed.

## Security and Privacy

- Authentication should be done using app passwords for security.
- Your credentials are only used for the duration of the session to perform the conversion.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))