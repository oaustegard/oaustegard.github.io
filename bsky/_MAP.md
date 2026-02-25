# bsky/
*Files: 15*

## Files

- **BlueReport.js**
- **at-protocol-extension.html**
- **bsky-core.js** — exports (14): `initializeBskyCore, resetProcessing, anonymize, formatPostForOutput, getRelativeTime, safeGetCreatedAt, reconstructTextWithFacets, extractPostInfo`... — imports: `bsky-lib.js`
- **bsky-lib.js** — exports (15): `initializeLib, login, logout, checkStoredSession, getAgent, getAuthAgent, getPublicAgent, resolveSkyLink`...
- **bsky-quote.js** — exports: `processQuotes` — imports: `bsky-core.js`
- **bsky-search.js** — exports: `initializeSearchProcessing, autoProcessSearch` — imports: `bsky-core.js`
- **bsky-thread.js** — exports: `processThread, processReverseThread, initializeThreadProcessing, autoProcessThread` — imports: `bsky-core.js`
- **bsky-zeitgeist.html** — exports (9): `extractEntities, expandEntity, App, startSampling, stopSampling, startTracking, stopTracking, reset`... — imports: `preact, hooks, signals, preact`
- **github-search.html** — exports: `sanitizeHTML, get3DaysAgoISO, extractLinksFromFacets, displayPost`
- **index.html**
- **list-to-list.html** — exports: `showStatus, showSection, updateProgress, toggleDropdown, parseListUrl, resolveHandle` — imports: `bsky-lib.js`
- **processor.html** — imports (7): `bsky-core.js, bsky-thread.js, bsky-quote.js, bsky-search.js, bsky-core.js`...
- **report.html** — imports: `BlueReport.js`
- **starterpack-to-list.html** — exports: `followRedirectUrl, findStarterPackFromUrl, showStatus, showSection, updateProgress, toggleDropdown` — imports: `bsky-lib.js`
- **thread-reader.html** — exports (31): `avatarHue, parseBskyUrl, resolveToAtUri, fetchThread, timeAgo, postUrl, validReplies, countAll`... — imports: `preact, hooks, preact`
