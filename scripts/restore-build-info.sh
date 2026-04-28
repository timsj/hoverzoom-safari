#!/bin/bash

# Restore placeholders in extension resource files after building
# Run this after building to keep the source files clean for git

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESOURCES_DIR="$PROJECT_ROOT/HoverZoom Extension/Resources"

# Restore commit hash and version placeholders in popup.html and options.html
for file in "$RESOURCES_DIR/popup.html" "$RESOURCES_DIR/options.html"; do
    if [ -f "$file" ]; then
        sed -i '' 's/\/commit\/[a-f0-9]\{7\}/\/commit\/__COMMIT_HASH__/g' "$file"
        sed -i '' 's/\/commit\/dev/\/commit\/__COMMIT_HASH__/g' "$file"
        sed -i '' 's/([a-f0-9]\{7\})/(__COMMIT_HASH__)/g' "$file"
        sed -i '' 's/(dev)/(__COMMIT_HASH__)/g' "$file"
        sed -i '' 's/releases\/tag\/v[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*/releases\/tag\/v__VERSION__/g' "$file"
        echo "Restored placeholder in $(basename "$file")"
    fi
done

# Restore version placeholder in manifest.json
sed -i '' 's/"version": "[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*"/"version": "__VERSION__"/g' "$RESOURCES_DIR/manifest.json"
echo "Restored version placeholder in manifest.json"
