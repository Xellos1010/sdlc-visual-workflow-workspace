#!/usr/bin/env bash
# cursor-companion dev lifecycle
#
# Brings up the control-plane via Docker, waits for health, then
# launches the VS Code / Cursor extension development host.
#
# Usage:
#   ./scripts/dev.sh           # default: docker mode
#   ./scripts/dev.sh --native  # skip docker, run control-plane as a local process
#
# Stop:  Ctrl+C  (tears down all resources)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPANION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FOUNDRY_DIR="$(cd "$COMPANION_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$FOUNDRY_DIR/../.." && pwd)"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[companion]${RESET} $*"; }
ok()   { echo -e "${GREEN}[companion]${RESET} $*"; }
warn() { echo -e "${YELLOW}[companion]${RESET} $*"; }
err()  { echo -e "${RED}[companion]${RESET} $*" >&2; }

MODE="docker"
SKIP_EXTENSION_HOST=false

for arg in "$@"; do
  case "$arg" in
    --native)       MODE="native" ;;
    --serve-only)   SKIP_EXTENSION_HOST=true ;;
    --help|-h)
      echo "Usage: $0 [--native] [--serve-only]"
      echo ""
      echo "  --native       Run control-plane as a local Node process instead of Docker"
      echo "  --serve-only   Only start support services; skip extension dev host"
      exit 0
      ;;
  esac
done

# ── Cleanup on exit ───────────────────────────────────────────────────────────
PIDS=()
cleanup() {
  echo ""
  warn "Shutting down..."

  # Kill any background processes we started (guard: empty "${PIDS[@]}" + set -u errors on some Bash)
  if [ "${#PIDS[@]}" -gt 0 ]; then
    for pid in "${PIDS[@]}"; do
      kill "$pid" 2>/dev/null || true
    done
  fi

  # Tear down Docker services if we started them
  if [ "$MODE" = "docker" ]; then
    log "Stopping Docker services..."
    docker compose -f "$COMPANION_DIR/docker-compose.yml" down --remove-orphans 2>/dev/null || true
  fi

  wait 2>/dev/null || true
  warn "All resources stopped."
}
trap cleanup EXIT INT TERM

# ── Preflight ─────────────────────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || { err "node not found. Install Node.js 20+."; exit 1; }

if [ "$MODE" = "docker" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    warn "Docker not found; falling back to --native (local Node control-plane)."
    MODE="native"
  elif ! docker info >/dev/null 2>&1; then
    warn "Docker daemon is not running; falling back to --native (local Node control-plane)."
    MODE="native"
  fi
fi

# ── Health check helper ──────────────────────────────────────────────────────
wait_for_health() {
  local url="$1"
  local max_attempts="${2:-30}"
  local attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if node -e "fetch('${url}').then(r=>{if(!r.ok)throw r.status;process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep 1
  done
  return 1
}

# Free host port 4010 so Docker publish or native Node can bind (e.g. stale native control-plane).
ensure_port_4010_free() {
  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi
  local stale
  stale=$(lsof -ti tcp:4010 2>/dev/null || true)
  if [ -n "$stale" ]; then
    warn "Port 4010 in use — killing PID(s): $stale"
    echo "$stale" | xargs kill -9 2>/dev/null || true
    sleep 0.3
  fi
}

# ── Start support services ───────────────────────────────────────────────────
CONTROL_PLANE_URL="http://localhost:4010"

if [ "$MODE" = "docker" ]; then
  ensure_port_4010_free
  log "Starting control-plane via Docker..."
  docker compose -f "$COMPANION_DIR/docker-compose.yml" up -d --build

  log "Waiting for control-plane health..."
  if wait_for_health "$CONTROL_PLANE_URL/health" 30; then
    ok "Control-plane is healthy at $CONTROL_PLANE_URL"
  else
    err "Control-plane failed to become healthy within 30s"
    docker compose -f "$COMPANION_DIR/docker-compose.yml" logs control-plane
    exit 1
  fi

else
  # Native mode: run control-plane as a local Node process
  log "Starting control-plane natively..."
  ensure_port_4010_free

  (
    cd "$FOUNDRY_DIR"
    FLAGSHIP_DEV_MODE=1 \
    FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH=1 \
    FLAGSHIP_CORS_ORIGINS="http://localhost:3000,http://localhost:4010,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:4010,http://127.0.0.1:5174" \
    node apps/control-plane/src/server.mjs 2>&1 | sed 's/^/[api]   /'
  ) &
  PIDS+=($!)

  log "Waiting for control-plane health..."
  if wait_for_health "$CONTROL_PLANE_URL/health" 15; then
    ok "Control-plane is healthy at $CONTROL_PLANE_URL"
  else
    err "Control-plane failed to start within 15s"
    exit 1
  fi
fi

# ── Extension development host ───────────────────────────────────────────────
if [ "$SKIP_EXTENSION_HOST" = true ]; then
  echo ""
  ok "Support services are up. Control-plane → $CONTROL_PLANE_URL"
  echo ""
  echo "  To load the extension manually:"
  echo "    code --extensionDevelopmentPath=$COMPANION_DIR"
  echo "  Or open VS Code, press F5, and select the cursor-companion launch config."
else
  echo ""
  ok "Dev environment ready!"
  echo ""
  echo "  Control Plane  → $CONTROL_PLANE_URL"
  echo "  Extension      → $COMPANION_DIR"
  echo ""

  # Do not add $! to PIDS: the `code` CLI usually exits immediately after spawning the editor,
  # which would make `wait` return and tear down Docker / the native API.
  if command -v code >/dev/null 2>&1; then
    log "Launching VS Code extension development host..."
    code --extensionDevelopmentPath="$COMPANION_DIR" "$REPO_ROOT" &
    ok "VS Code launched with extension loaded."
  else
    warn "'code' CLI not found. Open VS Code manually and load the extension:"
    echo "    code --extensionDevelopmentPath=$COMPANION_DIR"
  fi
fi

echo ""
echo "Press Ctrl+C to stop all services."
echo ""
# Docker mode has no shell job; `code` exits right away — keep the script alive until Ctrl+C.
# (Avoid `sleep infinity`: BSD/macOS sleep does not accept it.)
tail -f /dev/null &
PIDS+=($!)
wait
