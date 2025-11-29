# Agent Instructions for oaustegard.github.io

This document provides guidance for AI assistants working on this codebase.

## Code Maps - Navigation & Maintenance

This repository uses **code maps** (`_MAP.md` files) to provide navigable overviews of the codebase structure without requiring you to read every file.

### Using Code Maps

1. **Start with the root map**: Read `_MAP.md` first to understand the overall structure
2. **Navigate hierarchically**: Click through subdirectory links (e.g., `[bsky/](./bsky/_MAP.md)`) to explore specific areas
3. **Understand dependencies**: Maps show exports/imports to reveal module relationships
4. **Only read source files when needed**: Use maps to identify relevant files before reading them

**Example workflow:**
```
1. Read _MAP.md (see 10 subdirectories)
2. Read bsky/_MAP.md (see bsky-core.js exports 16 functions)
3. Read bsky-quote.js (see it imports from bsky-core.js)
4. Now read the actual source files only if needed
```

### Maintaining Code Maps

**IMPORTANT**: When you modify code that affects exports or imports, you MUST regenerate the maps.

#### When to regenerate:
- ✅ After adding/removing exported functions, classes, or variables
- ✅ After adding/removing import statements
- ✅ After creating new files in the codebase
- ✅ After renaming or moving files
- ❌ Not needed for internal implementation changes that don't affect the module interface

#### How to regenerate:

```bash
# Install dependencies (once per session)
uv pip install --system tree-sitter==0.21.3 tree-sitter-languages==1.10.2

# Regenerate all maps
python .claude/skills/mapping-codebases/scripts/codemap.py .

# Include updated maps in your commit
git add '*/_MAP.md'
```

**Best practice**: Regenerate maps just before committing code changes that affect module interfaces.

## Bluesky Integration Notes

This repository includes client-side JavaScript tools for Bluesky:
- **bsky-core.js**: Core utilities (16 exports) - dependency for other modules
- **bsky-quote.js**: Quote post processing
- **bsky-search.js**: Search functionality with auto-processing
- **bsky-thread.js**: Thread processing and display

See `bsky/_MAP.md` for the current module structure and dependencies.

## Development Workflow

1. **Understand first**: Read relevant `_MAP.md` files before making changes
2. **Make changes**: Implement requested features or fixes
3. **Update maps**: Regenerate if you changed exports/imports
4. **Test**: Run tests if applicable
5. **Commit**: Include updated `_MAP.md` files in commits when relevant
