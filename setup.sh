#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# All directories containing a package.json (excluding node_modules)
PACKAGES=(
  "flagship-foundry-work"
  "flagship-foundry-work/apps/cursor-companion"
  "flagship-foundry-work/apps/foundry-mcp-server"
  "flagship-foundry-work/apps/graph-viewer"
  "flagship-foundry-work/packages/model-gateway"
  "flagship-foundry-work/packages/runtime-adapters"
)

echo "==> Foundry setup — installing all packages"
echo ""

for pkg in "${PACKAGES[@]}"; do
  dir="$REPO_ROOT/$pkg"
  if [ -f "$dir/package.json" ]; then
    echo "--- $pkg"
    (cd "$dir" && pnpm install)
    echo ""
  else
    echo "--- SKIP $pkg (no package.json)"
  fi
done

echo "==> Done. All packages installed."
