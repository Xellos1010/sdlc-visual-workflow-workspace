#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Nx + pnpm bootstrap starting"
echo "Workspace: $ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed or not on PATH."
  echo "Install Node LTS first, then rerun this script."
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "ERROR: corepack not found."
  echo "Use Node >=16.13 (recommended: Node LTS via nvm), then rerun."
  exit 1
fi

echo "==> Enabling Corepack and activating pnpm (from package.json packageManager when present)"
corepack enable
if [ -f "package.json" ] && grep -q '"packageManager"' package.json 2>/dev/null; then
  corepack install
else
  corepack prepare pnpm@latest --activate
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm still not found after Corepack activation."
  echo "Open a new shell and rerun: $0"
  exit 1
fi

echo "==> pnpm version"
pnpm --version

if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in workspace root."
  exit 1
fi

echo "==> Installing dependencies"
pnpm install

echo "==> Verifying local Nx"
pnpm exec nx --version

echo "==> Starting Nx daemon"
pnpm exec nx daemon --start

echo "==> Bootstrap complete"
echo
echo "If Cursor Nx Console still reports 'pnpm: command not found':"
echo "  1) Run this once in terminal:"
echo "     launchctl setenv PATH \"\$HOME/.nvm/versions/node/\$(nvm version default)/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\""
echo "  2) Fully quit and relaunch Cursor."
