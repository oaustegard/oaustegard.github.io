# TODO

## Completed Consolidation (2025-02-10)

-   **Shared Library (`bsky-lib.js`):** Created a shared library to handle Bluesky API interactions, authentication, and session management. It uses `@atproto/api` from `esm.sh`.
-   **Link Resolution:** Implemented `resolveSkyLink` in `bsky-lib.js` to resolve `go.bsky.app` short links (and potentially others) using client-side `fetch`.
-   **`bsky-core.js` Refactor:** Updated `bsky-core.js` to use `bsky-lib.js` for agent and session management, maintaining compatibility with `processor.html` and other tools.
-   **List Tools Refactor:** Updated `starterpack-to-list.html` and `list-to-list.html` to use `bsky-lib.js` and support `go.bsky.app` link resolution.

## Future Consolidation Ideas

-   **Unified List Manager:** Merge `starterpack-to-list.html` and `list-to-list.html` into a single "List Manager" tool with tabs or a wizard interface.
-   **Extend `bsky-lib.js` usage:**
    -   Update `report.html` (and `BlueReport.js`) to use `bsky-lib.js` for API interactions if beneficial (currently uses raw fetch).
    -   Consider moving `anonymize` and `processPost` logic from `bsky-core.js` to a `bsky-processing.js` module if other tools need it, or keep it in `bsky-core.js` as the "Processor" specific logic.
-   **UI Components:** Consolidate common UI elements (login form, progress bars, dropdowns) into reusable web components or a shared UI library.
-   **Error Handling:** Unify error display logic across tools.
