#!/usr/bin/env bash
# Package the cursor-companion extension as a .vsix file
#
# Usage: ./scripts/package.sh
# Output: cursor-companion/flagship-foundry-cursor-companion-<version>.vsix

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPANION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'
log() { echo -e "${CYAN}[package]${RESET} $*"; }
ok()  { echo -e "${GREEN}[package]${RESET} $*"; }
err() { echo -e "${RED}[package]${RESET} $*" >&2; }

cd "$COMPANION_DIR"

# Check for vsce
if ! command -v vsce >/dev/null 2>&1; then
  if command -v npx >/dev/null 2>&1; then
    log "vsce not found globally; using npx @vscode/vsce..."
    VSCE="npx @vscode/vsce"
  else
    err "vsce not found. Install with: npm i -g @vscode/vsce"
    exit 1
  fi
else
  VSCE="vsce"
fi

log "Packaging extension..."
$VSCE package --no-dependencies

VSIX=$(ls -t *.vsix 2>/dev/null | head -1)
if [ -n "$VSIX" ]; then
  ok "Created: $COMPANION_DIR/$VSIX"
  echo ""
  echo "  Install into VS Code:  code --install-extension $VSIX"
  echo "  Install into Cursor:   cursor --install-extension $VSIX"
else
  err "No .vsix file produced"
  exit 1
fi
