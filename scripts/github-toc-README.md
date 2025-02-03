# GitHub ToC Web Component

A lightweight web component that generates a table of contents from a GitHub repository folder. Simply drop it into your page and configure the repository path and link prefix to create an automatically updating list of files.

See it in action at [http://austegard.com/bsky/](http://austegard.com/bsky/)

## Installation

Add the web component script to your page:

```html
<script src="https://austegard.com/scripts/github-toc.js"></script>
```

## Usage

Add the component to your HTML with the required attributes:

```html
<github-toc 
    repo-path="https://github.com/username/repo/tree/branch/path"
    link-prefix="https://your-site.com/path"
    exclude="index.html, *.js, *.css">
</github-toc>
```

## Attributes

| Attribute | Required | Description | Example |
|-----------|----------|-------------|---------|
| `repo-path` | Yes | Full GitHub URL to the repository folder | `"https://github.com/username/repo/tree/main/docs"` |
| `link-prefix` | Yes | Base URL prefix for generated links | `"https://your-site.com/docs"` |
| `exclude` | No | Comma-separated list of patterns to exclude | `"index*, *.js, *.css"` |

### Exclusion Patterns

The `exclude` attribute supports wildcard patterns:
- Use `*` to match any sequence of characters
- Separate multiple patterns with commas
- Patterns are case-sensitive
- Leading/trailing whitespace is ignored

Examples:
- `"index*"` - Excludes all files starting with "index"
- `"*.js"` - Excludes all JavaScript files
- `"temp*, *.bak"` - Excludes files starting with "temp" and ending with ".bak"

## Features

- Automatically fetches and displays repository contents
- Sorts entries (directories first, then files)
- Formats filenames for display (removes extensions, adds spaces between camel case)
- Excludes hidden files (starting with . or _)
- Supports custom exclusion patterns with wildcards
- Uses shadow DOM for style isolation
- Handles errors gracefully with user feedback
- Updates automatically when attributes change

## Example Implementation

Complete HTML page example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Repository Contents</title>
    <script src="https://austegard.com/scripts/github-toc.js"></script>
    <style>
        body {
            font-family: system-ui, sans-serif;
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
    </style>
</head>
<body>
    <h1>Repository Contents</h1>
    <github-toc 
        repo-path="https://github.com/username/repo/tree/main/docs"
        link-prefix="https://your-site.com/docs"
        exclude="index*, *.js, *.css">
    </github-toc>
</body>
</html>
```

## Browser Support

Works in all modern browsers that support Web Components:
- Chrome
- Firefox
- Safari
- Edge

## Limitations

- Requires JavaScript to be enabled
- Repository must be public
- Subject to GitHub API rate limits
- No support for nested directory traversal

## License

MIT License
