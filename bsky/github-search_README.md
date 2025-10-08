# BlueSky/atproto GitHub Link Search

A web-based tool for searching for BlueSky posts that contain links to GitHub.

**[Live Demo](https://austegard.com/bsky/github-search.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/github-search.html)**

## Overview

This tool allows you to search for posts on the BlueSky network that include URLs pointing to `github.com`. It is useful for finding discussions about projects, code, and other GitHub-hosted content. The tool requires authentication with your BlueSky credentials to access the search API.

## Features

- **GitHub Link Search**: Searches for posts containing `github.com` links.
- **Keyword Filtering**: Allows you to add additional keywords to refine your search.
- **Authentication**: Securely logs into your BlueSky account to perform the search.
- **Recent Posts**: The search is limited to posts from the last three days.

## Usage

1. **Login**: Enter your BlueSky handle (or email) and an app password to log in.
2. **Search**: Enter any additional keywords you want to search for in combination with "github.com". Leave it blank to search for all GitHub links.
3. **View Results**: The tool will display a feed of posts that match your search query.

## Technical Details

- Built with vanilla JavaScript.
- Uses the BlueSky API (`com.atproto.server.createSession` and `app.bsky.feed.searchPosts`) for authentication and data retrieval.
- All operations happen in your browser; no data is stored on a server.

## Security and Privacy

- Authentication should be done using app passwords for security.
- Your credentials are only used to obtain an access token and are not stored.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
Inspired by the original idea and Go code from [veekaybee/gitfeed](https://github.com/veekaybee/gitfeed).