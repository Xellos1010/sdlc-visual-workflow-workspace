#!/usr/bin/env bash
# Usage: ./sync-claude-folder.sh <target-directory>
# Copies the workspace .claude/ folder into <target-directory>/.claude/,
# overriding any files with the same relative path.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_DIR="$WORKSPACE_ROOT/.claude"

if [[ $# -lt 1 ]]; then
  echo "Error: target directory argument required." >&2
  echo "Usage: $0 <target-directory>" >&2
  exit 1
fi

TARGET_DIR="$1"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Error: target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Error: source .claude/ directory not found at: $SOURCE_DIR" >&2
  exit 1
fi

echo "Syncing .claude/ to $TARGET_DIR/.claude/"
echo "Source : $SOURCE_DIR"
echo "Target : $TARGET_DIR/.claude/"
echo ""

rsync -av --update "$SOURCE_DIR/" "$TARGET_DIR/.claude/"

echo ""
echo "Sync complete."
