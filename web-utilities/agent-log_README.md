# Agent Log

Records what a web page does (console output, errors, network calls) as OpenTelemetry log records in your browser, so you can export the log and hand it to an AI agent that is debugging the page.

**[Docs, bookmarklet and console snippet](https://austegard.com/web-utilities/agent-log.html)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/web-utilities/agent-log.js)** | **[Agent skill](https://github.com/oaustegard/claude-skills/tree/main/capturing-browser-logs)**

## Turning it on

- **Bookmarklet**: drag it from the docs page to the bookmarks bar and click it on any page. Pages with a strict Content Security Policy block it.
- **Console**: paste the snippet from the docs page into devtools. For strict-CSP pages, paste the full script instead (the docs page has a button that copies it).
- **Your own pages**: include `<script src="https://austegard.com/web-utilities/agent-log.js"></script>` and open the page with `?logging=true`. Logging then stays on in that tab until **Stop logging** or `?logging=false`. Add `data-start` to the tag to log on every load.

The script is also served from GitHub through jsDelivr: `https://cdn.jsdelivr.net/gh/oaustegard/oaustegard.github.io@main/web-utilities/agent-log.js`. `raw.githubusercontent.com` cannot be used in a script tag, since it serves `text/plain` with `nosniff`.

## Recorded events

| eventName | source |
|---|---|
| `console.log`, `.info`, `.debug`, `.warn`, `.error`, `.trace`, `.assert` | console calls; object arguments become attributes |
| `error.uncaught`, `error.rejection`, `error.resource` | uncaught exceptions, unhandled rejections, failed image/script/stylesheet loads |
| `csp.violation` | resources the page's CSP blocked |
| `http.fetch`, `http.xhr` | method, URL, status, duration, size; no bodies or headers |
| `page.navigation`, `page.visibility` | history changes, tab hidden or shown |
| `dom.click`, `.dblclick`, `.input`, `.change`, `.submit`, `.focus`, `.blur`, `.keydown` | events on watched elements (see below) |
| `dom.mutation`, `dom.watch` | changes inside a watched element; watches added, removed or matching a different number of elements |
| `agentlog.start`, `agentlog.stop` | logging turned on or off |

A red **Logging** badge shows while it records. Its panel lists the newest records with a text and severity filter, and has **Download**, **Copy**, **Clear** and **Stop logging**.

## Watching elements

The panel's **Watch an element** button starts a picker: hover highlights an element and shows its selector, click or Enter picks it, ↑/↓ move to the parent or first child, Esc cancels. The click that picks is not passed to the page. A watch is a CSS selector, built from an id or a test attribute (`data-testid`, `name`, `aria-label`) where the element has one, otherwise from a short tag path that matches only that element.

Events are caught by listeners on the document and matched with `closest()`, so a watch keeps working when an app redraws the element; a MutationObserver per matched element (re-attached each second if the element is replaced) records attribute, text and child changes, at most 20 records a second per watch. Typing is recorded once per pause, with the value; values of password, email and phone fields, and of fields whose name, id, autocomplete, label or placeholder points to a credential or personal data, are `[hidden]` (with their length), and printable keys typed into a field are not recorded as keys. Watches are kept per site in localStorage until removed.

An agent can set watches without the picker: `?watch=<selector>` (repeatable) on a page that includes the script and is logging, or `AgentLog.watch(selector, { label })` in the console.

## Export

Download and Copy produce an OTLP/JSON `ExportLogsServiceRequest` with one `resourceLogs` entry per page load. Resource attributes carry the page URL, title, user agent, viewport and `session.id`; each log record has `timeUnixNano`, `severityNumber`, `severityText`, `eventName`, `body` and `attributes`.

## Limits

- Stored in IndexedDB for the page's origin, newest 20,000 records (`AgentLog.start({ max })` changes the cap). Without IndexedDB it keeps the log in memory for that page load.
- Records console output and errors from the moment it starts, for the page itself only: not iframes or workers. Requests made before it started come from the browser's Resource Timing list, marked `agentlog.before_start`.
- Apps that keep their own reference to `fetch` from startup (Bluesky's API client does) bypass the wrapper when Agent Log starts late; their requests are still recorded from Resource Timing (`agentlog.source: resource-timing`), without the method.
- Recorded URLs have credentials replaced with `REDACTED`: query parameters named `key`, `code`, `auth`, `sig`, `state` or `nonce`, names containing `token`, `secret`, `password`, `api_key`, `session` or `signature` (`auth_token`, `x-api-key`), and names ending in `_key` or `_code`. The same rule covers `key=value` pairs in the `#fragment` (OAuth implicit flow, `#key=` share links), and a fragment that is one long token is replaced whole; hash routes such as `#/settings` are kept.
- Console arguments, the text of watched elements and ordinary field values are recorded as given.

## API

`window.AgentLog`: `start(opts)`, `stop()`, `export()` (the OTLP object), `exportJSON()`, `download()`, `copy()`, `clear()`, `open()`, `close()`, `watch(selectorOrElement, { label, mutations })`, `unwatch(selector)`, `watches()`, `pick()` (resolves to the picked selector, or null), `selectorFor(element)`, plus `on`, `session` and `version`.

## Technical details

- One classic script, no dependencies, no build step.
- The badge and panel live in a shadow root with a constructed stylesheet, so the page's CSS does not reach them, and use a Trusted Types policy where the page enforces one.
- fetch and XHR are wrapped so the page gets the same promise and events it would have without the logger. A Resource Timing observer records the requests the wrappers did not see, and each request is recorded once.

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard)). Apache License 2.0, as the rest of this repository ([LICENSE](https://github.com/oaustegard/oaustegard.github.io/blob/main/LICENSE)).
