#!/usr/bin/env bash
# Bring up the full Foundry dev stack:
#   - Control plane API  (port 4010)
#   - Graph viewer UI    (port 5174)
#   - MCP server         (stdio / port per config)
#
# Usage: ./dev.sh
# Stop:  Ctrl+C  (kills all background processes)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FOUNDRY="$REPO_ROOT/apps/flagship-foundry"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[dev]${RESET} $*"; }
ok()   { echo -e "${GREEN}[dev]${RESET} $*"; }
warn() { echo -e "${YELLOW}[dev]${RESET} $*"; }

# ── Cleanup on exit ───────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  warn "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  warn "All processes stopped."
}
trap cleanup EXIT INT TERM

# ── Preflight: check node / pnpm ──────────────────────────────────────────────
command -v node  >/dev/null 2>&1 || { echo "node not found. Install Node.js 20+." >&2; exit 1; }
command -v pnpm  >/dev/null 2>&1 || { echo "pnpm not found. Run: npm i -g pnpm" >&2; exit 1; }

# ── Kill any stale instances on our ports ─────────────────────────────────────
kill_port() {
  local port=$1
  local pids
  pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    warn "Port $port in use — killing PID(s): $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 0.3
  fi
}

kill_port 4010
kill_port 5174

# Kill any stale foundry-mcp-server processes by script name
STALE_MCP=$(pgrep -f "foundry-mcp-server/src/server.mjs" 2>/dev/null || true)
if [ -n "$STALE_MCP" ]; then
  warn "Stale MCP server found — killing PID(s): $STALE_MCP"
  echo "$STALE_MCP" | xargs kill -9 2>/dev/null || true
fi

log "Starting Foundry dev stack..."
echo ""

# ── 1. Control plane API ──────────────────────────────────────────────────────
log "Starting control plane API → http://localhost:4010"
(
  cd "$FOUNDRY"
  FLAGSHIP_DEV_MODE=1 \
  FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH=1 \
  FLAGSHIP_CORS_ORIGINS="http://localhost:3000,http://localhost:4010,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:4010,http://127.0.0.1:5174" \
  node apps/control-plane/src/server.mjs 2>&1 | sed 's/^/[api]   /'
) &
PIDS+=($!)

# Give the API a moment to bind before the UI starts fetching
sleep 1

# ── 2. Graph viewer UI ────────────────────────────────────────────────────────
log "Starting graph viewer UI    → http://localhost:5174"
(
  cd "$FOUNDRY/apps/graph-viewer"
  pnpm run dev 2>&1 | sed 's/^/[ui]    /'
) &
PIDS+=($!)

# ── 3. MCP server ─────────────────────────────────────────────────────────────
log "Starting MCP server"
(
  cd "$FOUNDRY/apps/foundry-mcp-server"
  node src/server.mjs 2>&1 | sed 's/^/[mcp]   /'
) &
PIDS+=($!)

echo ""
ok "Stack is up. Open http://localhost:5174"
echo ""
echo "  API  → http://localhost:4010"
echo "  UI   → http://localhost:5174"
echo "  MCP  → stdio"
echo ""
echo "Press Ctrl+C to stop all processes."
echo ""

# ── Wait for any process to exit unexpectedly ─────────────────────────────────
wait -n 2>/dev/null || wait
