# OneNote Protocol Forwarder

A client-side utility that allows you to open `onenote:` protocol links from applications that only permit `https:` links.

**[Live Demo](https://austegard.com/web-utilities/onenote.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/onenote.html)**

## Overview

Many applications, for security reasons, do not allow links that use custom protocols like `onenote:`. This makes it difficult to link directly to a specific page or section within the OneNote desktop application. This forwarder page acts as a bridge: you create a standard `https:` link to this page, including your OneNote link as a parameter. When visited, the page uses JavaScript to immediately redirect the user to the intended `onenote:` destination.

## Features

-   **Automatic Redirection**: If a OneNote URL is provided in the page's query string, it automatically forwards the user to the OneNote app.
-   **Link Generation Form**: Paste a `onenote:` link into the form to easily generate a valid, shareable `https:` forwarder link.
-   **Purely Client-Side**: The entire process is handled in your browser. No data is sent to or processed by a server.
-   **Safe and Secure**: Simply redirects to the URL you provide.

## Usage

### Method 1: Automatic Forwarding

1.  In the OneNote desktop app, right-click on a page or section and select "Copy Link to Page" or "Copy Link to Section".
2.  You will get a URL that looks like this:
    `onenote:https://your-sharepoint-site/...#PageName&section-id={...}&page-id={...}`
3.  Construct a new URL by appending your OneNote link (without the `onenote:` part) to this page's URL:
    `https://austegard.com/web-utilities/onenote.html?https://your-sharepoint-site/...`
4.  Use this new `https:` link in any application. When someone clicks it, they will be taken to this page, which will then redirect them to the OneNote link.

### Method 2: Using the Form

1.  Open the [OneNote Forwarder](https://austegard.com/web-utilities/onenote.html).
2.  Copy your `onenote:` link from the OneNote application.
3.  Paste the full link into the input box on the page.
4.  Click **Generate Forwarder Link**.
5.  Two links will be generated: the direct `onenote:` link and the new, shareable `https` forwarder link. You can copy and use the forwarder link.

## Technical Details

-   **Technology**: Built with vanilla JavaScript.
-   **Mechanism**: Reads the `window.location.href` to find the OneNote URL provided as a query string parameter, then sets `window.location.href` to the `onenote:` link to trigger the redirect.

## Credits

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.