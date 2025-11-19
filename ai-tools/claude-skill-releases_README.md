# Claude Skills - Releases Viewer

A web application that fetches and displays all releases from the [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills) GitHub repository, providing an organized and searchable interface for browsing Claude skills and downloading them.

## Overview

This tool provides a user-friendly interface for exploring Claude skills releases, with real-time data fetched directly from the GitHub API. It offers multiple viewing modes, automatic table of contents generation, and download links for all available skills.

## Features

### Real-Time GitHub Integration
- Fetches latest release data from GitHub API on every page load
- Displays release names, descriptions, and publication dates
- Shows download counts and file information
- Automatically updates when new releases are published

### Dual Sorting Modes
- **Alphabetical (A-Z)**: Sort releases by name for easy browsing
- **Latest**: Sort by publication date to see newest releases first
- Sort mode persisted in URL for shareable links
- Toggle between modes with single click

### Interactive Table of Contents
- Fixed sidebar navigation on larger screens
- Automatic scroll tracking highlights current section
- Click any release name to jump directly to it
- Smooth scrolling for better user experience
- Responsive - hides on mobile/tablet screens

### Rich Release Display
- Markdown-rendered descriptions for proper formatting
- Publication timestamps in local time zone
- Truncated descriptions (stops at horizontal rule `---`)
- Automatic header removal for cleaner display
- Visual download buttons for each .zip asset

### Download Management
- Lists all .zip files available for each release
- Direct download links with clear visual buttons
- Shows file names for easy identification
- Indicates when no downloads are available

### URL State Management
- Current sort mode stored in URL query parameters
- Shareable links maintain view preferences
- Browser back/forward navigation support
- Preserves state across sessions

### Responsive Design
- Tailwind CSS for modern, clean styling
- Mobile-optimized layout
- Adaptive table of contents (desktop only)
- Touch-friendly interface elements

## Usage

1. **Open the Tool**: Navigate to the Claude Skills Releases page
2. **Browse Releases**: Scroll through the list or use the table of contents
3. **Switch Views**: Toggle between "A-Z" and "Latest" sorting modes
4. **Navigate**: Click any item in the table of contents to jump to that release
5. **Download**: Click download buttons to get .zip files for any skill
6. **Share**: Copy the URL to share your current view (sort mode is preserved)
7. **Return**: Use the "Back to AI Tools" link to navigate to the main tools page

## Technical Details

### Frontend Framework
- **Preact**: Lightweight React alternative for efficient rendering
- **Preact Signals**: Reactive state management
- **HTM**: JSX-like syntax without build step
- **Marked.js**: Markdown parsing and rendering
- **Tailwind CSS**: Utility-first CSS framework

### API Integration
- Fetches from `https://api.github.com/repos/oaustegard/claude-skills/releases`
- Handles API errors gracefully with user-friendly messages
- No authentication required (uses public GitHub API)
- Respects GitHub API rate limits

### State Management
- Reactive signals for releases data, loading, and error states
- Computed values for sorted releases
- Active section tracking via Intersection Observer
- URL-based state persistence

### Performance Optimizations
- ESM module imports via CDN (no bundling required)
- Efficient re-rendering with Preact
- Lazy loading of external dependencies
- Client-side filtering and sorting

### Scroll Tracking
- Intersection Observer API for active section detection
- Automatic highlighting in table of contents
- Optimized observer settings for smooth tracking
- Disconnects observers on cleanup

## Release Description Processing

The tool intelligently processes release descriptions:
1. Splits content at horizontal rules (`---`) to remove changelog details
2. Removes the first markdown heading (typically `# skill-name`)
3. Parses remaining markdown to HTML
4. Renders with appropriate prose styling

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+)
- **Mobile browsers**: Responsive layout with touch support

## Data Source

All release data comes from the [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills) repository, which contains various skills and utilities for use with Claude (Anthropic's AI assistant).

## Privacy

- No data collection or analytics
- No cookies or local storage (except URL state)
- Direct GitHub API calls (no proxy server)
- All processing happens client-side

## Error Handling

- Loading states with animated spinner
- Error messages for API failures
- Graceful handling of missing data
- User-friendly error displays with retry suggestions

## Responsive Breakpoints

- **Desktop (1024px+)**: Shows table of contents sidebar with content offset
- **Tablet/Mobile (<1024px)**: Hides table of contents for more space
- Smooth transitions between breakpoints

## Credits

- **Data Source**: [oaustegard/claude-skills](https://github.com/oaustegard/claude-skills)
- **Libraries**: Preact, Preact Signals, HTM, Marked.js, Tailwind CSS
- **Tool Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
