# Bluesky Engagement Data Processor

A web-based tool for processing and analyzing engagement data from Bluesky social posts.

**[Live Demo](https://austegard.com/bsky/processor.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/processor.html)**

## Overview

This tool allows you to extract, anonymize, and analyze interaction data from Bluesky posts. It provides two main functions:

1. **Post Processing**: Extract reply threads or quote posts from any public Bluesky post
2. **Search Processing**: Search for posts matching specific queries (requires authentication)

The processor extracts relevant data and presents it in a clean JSON format suitable for further analysis, with usernames anonymized for privacy.

## Features

### Post Processing

- Process complete reply threads for any Bluesky post
- Extract quote posts that reference the original post (up to 100)
- De-identify user data for privacy
- Preserve engagement metrics (likes, reposts)
- Calculate time delays between posts

### Search Processing

- Search across Bluesky using keywords and phrases
- Sort by relevance ("top") or recency ("latest")
- Retrieve up to 1000 results with pagination
- Consistent user anonymization

## Usage

### Post Processing

1. Enter a Bluesky post URL (format: `https://bsky.app/profile/username.bsky.social/post/postid`)
2. Click either:
   - **Process Replies**: Extract the complete reply thread
   - **Process Quotes**: Extract posts quoting the original post

### Search Processing

1. Authenticate using your Bluesky credentials
   - Uses app passwords for secure authentication
   - Credentials are only used for API calls and never stored
2. Enter a search query
3. Select sorting method (top results or latest)
4. Choose result limit (25-1000)
5. Click **Process Search**

## Technical Details

- Built with vanilla JavaScript using ES modules
- Uses the official Bluesky API (@atproto/api) for data retrieval
- When needed, handles authentication securely via app passwords
- Maintains state through URL parameters for easy sharing

## Security and Privacy

- User data is anonymized, replacing DIDs with consistent pseudonyms
- Authentication should be done using app passwords (never your main password)
- No server-side processing - all operations happen in your browser
- No data is stored beyond your browser session

## License

See [LICENSE](../LICENSE)

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
