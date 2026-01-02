# Merge BSky Lists

A web-based tool for merging BlueSky lists - merge another user's public list into your own, or combine two of your own lists.

**[Live Demo](https://austegard.com/bsky/list-to-list.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/bsky/list-to-list.html)**

## Overview

This tool allows you to merge the members of a BlueSky list (the "source" list) into one of your own lists (the "target" list). It will add any users from the source list who are not already in the target list, without creating duplicates. This is useful for consolidating or organizing your user lists.

The source list can be either:
- One of your own lists
- Another user's public list (by providing a URL)

## Features

- **List Merging**: Merges members from a source list to a target list.
- **External List Support**: Load and merge from any user's public list by pasting a URL.
- **Duplicate Prevention**: Automatically checks for and avoids adding duplicate members.
- **Authentication**: Securely logs into your BlueSky account to access your lists.
- **List Selection**: Provides a dropdown menu of your existing lists to choose from.

## Usage

1. **Login**: Enter your BlueSky handle and an app password to log in.
2. **Select Source List**: Choose either:
   - One of your own lists from the dropdown, OR
   - Paste another user's list URL (e.g., `https://bsky.app/profile/did:plc:.../lists/...`) and click "Load List"
3. **Select Target List**: Choose the list you want to merge into (must be one of your own lists).
4. **Merge**: Click the "Merge Lists" button to begin the process.
5. **View Result**: The tool will report how many new members were added to the target list.

## Technical Details

- Built with vanilla JavaScript.
- Uses the BlueSky API for authentication and list management.
- All operations happen in your browser; no data is stored on a server.

## Security and Privacy

- Authentication should be done using app passwords for security.
- Your credentials are only used for the duration of the session to perform the merge operation.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))