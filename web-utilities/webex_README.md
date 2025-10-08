# Webex IM Space Forwarder

A client-side utility that allows you to open `webexteams:` protocol links from applications that only permit standard `https:` links.

**[Live Demo](https://austegard.com/web-utilities/webex.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/webex.html)**

## Overview

Many enterprise applications (including Jira, Confluence, and even Webex itself) restrict the use of custom URL protocols like `webexteams://` for security reasons. This makes it impossible to create a direct link to a specific Webex chat space. This forwarder page solves that problem by acting as a secure bridge. You can create a standard `https:` link that points to this page, which then uses JavaScript to instantly redirect the user to the correct Webex space, prompting the Webex desktop client to open.

## Features

-   **Automatic Redirection**: Immediately forwards users to the specified Webex space.
-   **Flexible URL Formatting**: Works whether you provide the full `webexteams://` link or just the `space` ID as a query parameter.
-   **Client-Side & Private**: The entire redirection process is handled in your browser. No data is ever transmitted to a server.
-   **Safe and Secure**: The page only performs a URL rewrite and redirection. It does not use cookies or track any data.

## Usage

1.  In the Webex application, go to the chat space you want to link to.
2.  Click the settings "gear" icon for that space and select "Copy space link".
3.  You will get a URL that looks like this:
    `webexteams://im?space=2715dc50-ec59-11ea-a2c3-a73bb0df49ab`
4.  Construct a new, shareable `https:` link by appending your Webex space link to this page's URL:
    `https://austegard.com/web-utilities/webex.html?webexteams://im?space=...`
    *Alternatively, you can provide just the space ID:*
    `https://austegard.com/web-utilities/webex.html?space=...`
5.  Use this new `https:` link in any application. When a user clicks it, they will be taken to this page and immediately redirected to the Webex space.

## Technical Details

-   **Technology**: Built with vanilla JavaScript, with no external libraries.
-   **Mechanism**: The page reads the `window.location.search` or `window.location.hash` to find the Webex space ID. It then reconstructs the `webexteams://` URL and sets `window.location.href` to trigger the redirect.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.