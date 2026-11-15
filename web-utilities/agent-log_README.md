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
| `agentlog.start`, `agentlog.stop` | logging turned on or off |

A red **Logging** badge shows while it records. Its panel lists the newest records with a text and severity filter, and has **Download**, **Copy**, **Clear** and **Stop logging**.

## Export

Download and Copy produce an OTLP/JSON `ExportLogsServiceRequest` with one `resourceLogs` entry per page load. Resource attributes carry the page URL, title, user agent, viewport and `session.id`; each log record has `timeUnixNano`, `severityNumber`, `severityText`, `eventName`, `body` and `attributes`.

## Limits

- Stored in IndexedDB for the page's origin, newest 20,000 records (`AgentLog.start({ max })` changes the cap). Without IndexedDB it keeps the log in memory for that page load.
- Records from the moment it starts, for the page itself only: not iframes or workers.
- Query parameters with credential-like names are replaced with `REDACTED` in recorded URLs. Console arguments are recorded as given.

## API

`window.AgentLog`: `start(opts)`, `stop()`, `export()` (the OTLP object), `exportJSON()`, `download()`, `copy()`, `clear()`, `open()`, `close()`, plus `on`, `session` and `version`.

## Technical details

- One classic script, no dependencies, no build step.
- The badge and panel live in a shadow root with a constructed stylesheet, so the page's CSS does not reach them, and use a Trusted Types policy where the page enforces one.
- fetch and XHR are wrapped so the page gets the same promise and events it would have without the logger.

Created by Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
