# Bluesky Post Constellation

A 2D spatial visualization of Bluesky posts and their relationships — thread replies, ancestors, quoted posts, and quote posts — all on one pannable, zoomable canvas.

## Overview

Unlike linear thread viewers, Post Constellation shows the full graph of relationships around any "seed" post:

- **Thread ancestors** are displayed above the seed in a vertical chain
- **Thread replies** branch downward in a tree layout, with popular replies centered
- **Quoted posts** (what the seed quotes) appear to the upper-left
- **Quote posts** (who quoted the seed) appear to the lower-right

Each post is rendered as a card with avatar, author info, text preview, and engagement metrics. Connections between posts are drawn as SVG curves: solid blue for thread relationships, dashed orange with arrows for quote relationships.

## Usage

1. Paste a Bluesky post URL into the input field and click **Load** (or press Enter)
2. **Pan**: Click and drag on the background
3. **Zoom**: Use the +/− buttons, scroll wheel, or pinch gesture on touch devices
4. **Tap a card**: Expand it to see full text, embeds, and action buttons
5. **Re-seed**: On an expanded card, click "Re-seed ⟳" to make that post the new center
6. **Center**: Click ⊙ to re-center on the seed post
7. **Fit**: Click "Fit" to zoom out and see the entire graph

## Features

- **Three parallel API calls** on load: thread down (replies), thread up (ancestors), and quote posts
- **Deterministic tree layout**: Same graph always looks the same
- **Compact cards** with 2-line text preview; expand on click for full content and embeds
- **SVG connection lines**: Solid blue for thread relationships, dashed orange with arrows for quotes
- **Minimap**: Small overview in the bottom-right corner showing all nodes and the current viewport
- **Legend**: Color-coded line styles explained in the bottom-left corner
- **Thread indicators**: Posts that are part of their own threads show a 🧵 indicator
- **URL parameters**: Shareable links via `?url=` query parameter

## Technology

- **Preact + HTM** for reactive UI (same stack as thread-reader.html)
- **Tailwind CSS** via CDN for styling
- **panzoom** (~3KB gzipped) for smooth pan/zoom with touch support
- **Direct fetch** to Bluesky public API (no authentication required)

## Layout Algorithm

The layout uses a two-pass tree algorithm:

1. **Bottom-up**: Compute subtree widths for each node in the reply tree
2. **Top-down**: Assign x/y positions, centering children under their parent

Ancestors are placed in a single column above the seed. Quoted posts step diagonally to the upper-left. Quote posts are arranged vertically to the lower-right.

All positions are normalized so the minimum coordinate is padded from the canvas origin, ensuring no clipping.

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `app.bsky.feed.getPostThread` (depth=1000, parentHeight=0) | Fetch full reply tree below the seed |
| `app.bsky.feed.getPostThread` (depth=0, parentHeight=1000) | Fetch ancestor chain above the seed |
| `app.bsky.feed.getQuotes` (limit=100) | Fetch posts that quote the seed |
| `com.atproto.identity.resolveHandle` | Resolve handle to DID (if needed) |

## Future Enhancements

- Proportional time mode (vertical position maps to real time)
- Branch collapse/expand toggles
- Expand sub-graphs for quote posts (load their own threads)
- Load-more for truncated thread branches
- Viewport-based card virtualization for large threads
- Keyboard navigation
