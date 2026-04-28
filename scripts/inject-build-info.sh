#!/bin/bash

# Inject commit hash and version into extension resource files
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

# Replace commit hash and version placeholders in popup.html and options.html
for file in "$RESOURCES_DIR/popup.html" "$RESOURCES_DIR/options.html"; do
    if [ -f "$file" ]; then
        sed -i '' "s/__COMMIT_HASH__/$COMMIT_HASH/g" "$file"
        echo "Injected commit hash into $(basename "$file")"
    fi
done

echo "Commit hash: $COMMIT_HASH"

# Replace version placeholder in manifest.json and HTML files using Xcode's MARKETING_VERSION
if [ -n "$MARKETING_VERSION" ]; then
    sed -i '' "s/__VERSION__/$MARKETING_VERSION/g" "$RESOURCES_DIR/manifest.json"
    echo "Injected version $MARKETING_VERSION into manifest.json"

    for file in "$RESOURCES_DIR/popup.html" "$RESOURCES_DIR/options.html"; do
        if [ -f "$file" ]; then
            sed -i '' "s/__VERSION__/$MARKETING_VERSION/g" "$file"
            echo "Injected version $MARKETING_VERSION into $(basename "$file")"
        fi
    done
else
    echo "Warning: MARKETING_VERSION not set, skipping version injection"
fi
