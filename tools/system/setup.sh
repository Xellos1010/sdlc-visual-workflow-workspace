#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Foundry setup — installing all packages via pnpm workspace"
echo ""

# Install from workspace root (picks up apps/flagship-foundry and all sub-packages)
(cd "$REPO_ROOT" && pnpm install)

echo ""
echo "==> Done. All packages installed."
echo "    Run: pnpm exec nx run flagship-foundry:test"
