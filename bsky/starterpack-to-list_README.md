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
2. **Enter Starter Pack URL**: Paste the URL of the starter pack you want to convert.
3. **Select Target List**: Choose an existing list from the dropdown or select "Create New List" and provide a name.
4. **Convert**: Click the "Convert Pack to List" button to begin.
5. **View Result**: The tool will confirm when the conversion is complete and provide a link to the new/updated list.

## Technical Details

- Built with vanilla JavaScript.
- Uses the BlueSky API for authentication, fetching starter pack data, and managing lists.
- All operations happen in your browser; no data is stored on a server.

## Security and Privacy

- Authentication should be done using app passwords for security.
- Your credentials are only used for the duration of the session to perform the conversion.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))