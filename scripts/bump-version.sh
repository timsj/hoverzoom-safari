#!/bin/bash

# Bump MARKETING_VERSION in the Xcode project, the single source of truth for the
# extension version (manifest.json and the HTML pages get it injected at build time),
# then commit and tag it. Pushing and the GitHub release are left to be done by hand.
#
# Usage: scripts/bump-version.sh patch|minor|major|X.Y.Z

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PBXPROJ="$PROJECT_ROOT/HoverZoom.xcodeproj/project.pbxproj"

if [ $# -ne 1 ]; then
    echo "Usage: $(basename "$0") patch|minor|major|X.Y.Z" >&2
    exit 1
fi

[ -f "$PBXPROJ" ] || { echo "Error: $PBXPROJ not found" >&2; exit 1; }

# A dirty tree would be swept into the bump commit, tagging something never tested
if [ -n "$(git -C "$PROJECT_ROOT" status --porcelain)" ]; then
    echo "Error: working tree is not clean" >&2
    git -C "$PROJECT_ROOT" status --short >&2
    exit 1
fi

# Every build configuration must already agree, otherwise a bump would paper over a mismatch
FOUND=$(grep -oE "MARKETING_VERSION = [^;]+;" "$PBXPROJ" | sed 's/MARKETING_VERSION = //; s/;//')
if [ -z "$FOUND" ]; then
    echo "Error: no MARKETING_VERSION found in project.pbxproj" >&2
    exit 1
fi
COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
CURRENT=$(echo "$FOUND" | sort -u)
if [ "$(echo "$CURRENT" | wc -l | tr -d ' ')" -ne 1 ]; then
    echo "Error: build configurations disagree on MARKETING_VERSION:" >&2
    echo "$FOUND" | sort | uniq -c | sed 's/^/  /' >&2
    exit 1
fi

if ! [[ "$CURRENT" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: current version '$CURRENT' is not X.Y.Z" >&2
    exit 1
fi

IFS=. read -r MAJOR MINOR PATCH <<< "$CURRENT"
case "$1" in
    major) NEW="$((MAJOR + 1)).0.0" ;;
    minor) NEW="$MAJOR.$((MINOR + 1)).0" ;;
    patch) NEW="$MAJOR.$MINOR.$((PATCH + 1))" ;;
    *)
        NEW="$1"
        if ! [[ "$NEW" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Error: '$NEW' is not patch, minor, major or X.Y.Z" >&2
            exit 1
        fi
        ;;
esac

if [ "$NEW" = "$CURRENT" ]; then
    echo "Error: already at $CURRENT" >&2
    exit 1
fi

if git -C "$PROJECT_ROOT" rev-parse "v$NEW" >/dev/null 2>&1; then
    echo "Error: tag v$NEW already exists" >&2
    exit 1
fi

sed -i '' "s/MARKETING_VERSION = $CURRENT;/MARKETING_VERSION = $NEW;/g" "$PBXPROJ"

UPDATED=$(grep -c "MARKETING_VERSION = $NEW;" "$PBXPROJ")
if [ "$UPDATED" -ne "$COUNT" ]; then
    echo "Error: updated $UPDATED of $COUNT occurrences, reverting" >&2
    git -C "$PROJECT_ROOT" checkout -- "$PBXPROJ"
    exit 1
fi

plutil -lint "$PBXPROJ" >/dev/null || {
    echo "Error: project.pbxproj no longer parses, reverting" >&2
    git -C "$PROJECT_ROOT" checkout -- "$PBXPROJ"
    exit 1
}

git -C "$PROJECT_ROOT" add "$PBXPROJ"
git -C "$PROJECT_ROOT" commit -q -m "bump version"
git -C "$PROJECT_ROOT" tag "v$NEW"

echo "$CURRENT -> $NEW ($UPDATED occurrences)"
echo "committed $(git -C "$PROJECT_ROOT" rev-parse --short HEAD) and tagged v$NEW"
echo
echo "Next:"
echo "  git push origin main && git push origin v$NEW"
echo "  gh release create v$NEW --title v$NEW --notes-file <notes>"
