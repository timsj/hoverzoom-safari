#!/bin/bash

# Restore the commit hash placeholder in popup.html and options.html
# Run this after building to keep the source files clean for git

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_ROOT/HoverZoom Extension/Resources"

# Replace any commit hash (7 char hex or 'dev') back to placeholder in both files
for file in "$RESOURCES_DIR/popup.html" "$RESOURCES_DIR/options.html"; do
    if [ -f "$file" ]; then
        sed -i '' 's/v1\.0 ([a-f0-9]\{7\})/v1.0 (__COMMIT_HASH__)/g' "$file"
        sed -i '' 's/v1\.0 (dev)/v1.0 (__COMMIT_HASH__)/g' "$file"
        echo "Restored placeholder in $(basename "$file")"
    fi
done
