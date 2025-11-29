#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing dependencies for oaustegard.github.io..."

# Install Node.js dependencies for Playwright tests
if [ -f package.json ]; then
  echo "Installing npm dependencies..."
  npm install --silent
  echo "Installing Playwright browsers..."
  npx playwright install --with-deps chromium
fi

# Install Python dependencies for mapping-codebases skill
if [ -f .claude/skills/mapping-codebases/scripts/codemap.py ]; then
  echo "Installing Python dependencies for code mapping..."
  uv pip install --system --quiet tree-sitter==0.21.3 tree-sitter-languages==1.10.2
fi

echo "Dependencies installed successfully!"
