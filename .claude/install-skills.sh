#!/bin/bash
set -e

REPO_URL="https://github.com/oaustegard/claude-skills.git"
TEMP_DIR=$(mktemp -d)
SKILLS_DIR=".claude/skills"

# Skills to install (edit this list as needed)
SKILLS=(
  "mapping-codebases"
  "generating-patches"
  "versioning-skills"
)

echo "Cloning claude-skills repository..."
git clone --depth 1 --quiet "$REPO_URL" "$TEMP_DIR"

mkdir -p "$SKILLS_DIR"

for skill in "${SKILLS[@]}"; do
  if [ -d "$TEMP_DIR/$skill" ] && [ -f "$TEMP_DIR/$skill/SKILL.md" ]; then
    echo "Installing $skill..."

    # Remove existing skill directory if present
    rm -rf "$SKILLS_DIR/$skill"

    # Copy skill directory
    cp -r "$TEMP_DIR/$skill" "$SKILLS_DIR/"

    # Remove VERSION and README files (workflow metadata, not needed)
    rm -f "$SKILLS_DIR/$skill/VERSION"
    rm -f "$SKILLS_DIR/$skill/README.md"

    # Remove any symlinks (from the source repo)
    find "$SKILLS_DIR/$skill" -type l -delete

    echo "✓ Installed $skill"
  else
    echo "⚠ Skill not found or invalid: $skill"
  fi
done

rm -rf "$TEMP_DIR"
echo "Done! Installed ${#SKILLS[@]} skills."
