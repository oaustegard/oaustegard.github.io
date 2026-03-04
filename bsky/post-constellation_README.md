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
6. **Collapse/Expand**: Click the ▼/▶ toggle on reply cards to collapse or expand their subtrees
7. **Center**: Click ⊙ to re-center on the seed post
8. **Fit**: Click "Fit" to zoom out and see the entire graph

## Features

- **Three parallel API calls** on load: thread down (replies), thread up (ancestors), and quote posts
- **Deterministic tree layout**: Same graph always looks the same
- **Compact cards** with 2-line text preview; expand on click for full content and embeds
- **SVG connection lines**: Solid blue for thread relationships, dashed orange with arrows for quotes
- **Viewport virtualization**: Only cards and edges visible on screen (plus a 300px buffer) are rendered to the DOM, enabling smooth performance on large graphs
- **Adaptive compaction**: When a node has many siblings, horizontal gaps shrink proportionally, keeping the tree shape while limiting spread
- **Auto-collapse**: Nodes with more than 20 direct children start collapsed; click ▶ to expand and explore
- **Zoom-aware rendering**: At low zoom levels (<0.35), cards are replaced with lightweight colored rectangles for fast rendering; zoom in to see full card content
- **Branch collapse/expand**: Click the toggle on any reply node to collapse its subtree; shows descendant count so you know what's hidden
- **Quote pagination**: Initial load fetches 25 quote posts; click "more quotes" in the toolbar to load additional batches
- **Minimap**: Small overview in the bottom-right corner showing all nodes and the current viewport, drawn via requestAnimationFrame for smooth updates during pan/zoom
- **Legend**: Color-coded line styles explained in the bottom-left corner
- **Thread indicators**: Posts that are part of their own threads show a 🧵 indicator
- **URL parameters**: Shareable links via `?url=` query parameter
- **Stats display**: Shows visible/total post count in the toolbar

## Technology

- **Preact + HTM** for reactive UI (same stack as thread-reader.html)
- **Tailwind CSS** via CDN for styling
- **panzoom** (~3KB gzipped) for smooth pan/zoom with touch support
- **Direct fetch** to Bluesky public API (no authentication required)

## Layout Algorithm

The layout uses a two-pass tree algorithm:

1. **Bottom-up**: Compute subtree widths for each node in the reply tree
2. **Top-down**: Assign x/y positions, centering children under their parent

When a node has many siblings, horizontal gaps between them shrink adaptively (full 28px gap for ≤4 siblings, down to 4px for very wide groups), keeping the tree shape visible while limiting horizontal spread. Nodes with more than 20 direct children start collapsed to keep the initial view navigable.

Ancestors are placed in a single column above the seed. Quoted posts step diagonally to the upper-left. Quote posts are arranged vertically to the lower-right, positioned past the rightmost edge of the reply tree.

All positions are normalized so the minimum coordinate is padded from the canvas origin, ensuring no clipping.

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `app.bsky.feed.getPostThread` (depth=1000, parentHeight=0) | Fetch full reply tree below the seed |
| `app.bsky.feed.getPostThread` (depth=0, parentHeight=1000) | Fetch ancestor chain above the seed |
| `app.bsky.feed.getQuotes` (limit=25, paginated) | Fetch posts that quote the seed |
| `com.atproto.identity.resolveHandle` | Resolve handle to DID (if needed) |

## Future Enhancements

- Proportional time mode (vertical position maps to real time)
- Expand sub-graphs for quote posts (load their own threads)
- Load-more for truncated thread branches
- Keyboard navigation
- Smooth animation on layout changes
