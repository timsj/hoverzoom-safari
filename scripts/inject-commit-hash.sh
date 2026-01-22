#!/bin/bash

# Inject commit hash into popup.html and options.html
# Run this script from the project root or as an Xcode build phase

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_ROOT/HoverZoom Extension/Resources"

# Get the short commit hash
COMMIT_HASH=$(git -C "$PROJECT_ROOT" rev-parse --short HEAD 2>/dev/null)

if [ -z "$COMMIT_HASH" ]; then
    echo "Warning: Could not get commit hash, using 'dev'"
    COMMIT_HASH="dev"
fi

# Replace placeholder with actual commit hash in both files
for file in "$RESOURCES_DIR/popup.html" "$RESOURCES_DIR/options.html"; do
    if [ -f "$file" ]; then
        sed -i '' "s/__COMMIT_HASH__/$COMMIT_HASH/g" "$file"
        echo "Injected commit hash into $(basename "$file")"
    fi
done

echo "Commit hash: $COMMIT_HASH"
