#!/usr/bin/env bash
# Cursor Companion — watch mode for application development
#
# - Native (default): node --watch restarts the control-plane when server/core code changes.
# - Docker: compose up + debounced container restart when mounted API sources change.
# - Extension: *.js edits print a reminder (Extension Development Host must still Reload Window).
#
# Usage:
#   ./scripts/watch-dev.sh              # native API + extension hints + launch Extension Host
#   ./scripts/watch-dev.sh --docker     # docker API + restarts + extension hints + launch
#   ./scripts/watch-dev.sh --serve-only # no Extension Host launch
#
# Stop: Ctrl+C

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPANION_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FOUNDRY_DIR="$(cd "$COMPANION_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$FOUNDRY_DIR/../.." && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[companion watch]${RESET} $*"; }
ok()   { echo -e "${GREEN}[companion watch]${RESET} $*"; }
warn() { echo -e "${YELLOW}[companion watch]${RESET} $*"; }
err()  { echo -e "${RED}[companion watch]${RESET} $*" >&2; }

MODE="native"
SKIP_EXTENSION_HOST=false

for arg in "$@"; do
  case "$arg" in
    --docker)     MODE="docker" ;;
    --native)     MODE="native" ;;
    --serve-only) SKIP_EXTENSION_HOST=true ;;
    --help|-h)
      echo "Usage: $0 [--native] [--docker] [--serve-only]"
      echo ""
      echo "  --native       (default) Control-plane via node --watch (fast API reload)"
      echo "  --docker       Control-plane in Docker; restarts container on API file changes"
      echo "  --serve-only   Skip launching VS Code Extension Development Host"
      exit 0
      ;;
  esac
done

PIDS=()
cleanup() {
  echo ""
  warn "Shutting down watch..."
  if [ "${#PIDS[@]}" -gt 0 ]; then
    for pid in "${PIDS[@]}"; do
      kill "$pid" 2>/dev/null || true
    done
  fi
  if [ "$MODE" = "docker" ]; then
    log "Stopping Docker services..."
    docker compose -f "$COMPANION_DIR/docker-compose.yml" down --remove-orphans 2>/dev/null || true
  fi
  wait 2>/dev/null || true
  warn "Watch stopped."
}
trap cleanup EXIT INT TERM

command -v node >/dev/null 2>&1 || { err "node not found. Install Node.js 20+."; exit 1; }

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

CONTROL_PLANE_URL="http://localhost:4010"

# ── API: native (node --watch) or Docker + restart watcher ───────────────────
if [ "$MODE" = "docker" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    err "Docker not found. Use --native or install Docker."
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    err "Docker daemon is not running."
    exit 1
  fi
  ensure_port_4010_free
  log "Starting control-plane (Docker)..."
  docker compose -f "$COMPANION_DIR/docker-compose.yml" up -d --build
  log "Waiting for control-plane health..."
  if ! wait_for_health "$CONTROL_PLANE_URL/health" 45; then
    err "Control-plane failed health check"
    docker compose -f "$COMPANION_DIR/docker-compose.yml" logs control-plane
    exit 1
  fi
  ok "Control-plane is up; watching API paths for changes (container restart)..."
  node "$SCRIPT_DIR/watch-docker-api-restart.mjs" \
    "$COMPANION_DIR/docker-compose.yml" \
    "$FOUNDRY_DIR/apps/control-plane/src" \
    "$FOUNDRY_DIR/packages/core/src" \
    "$FOUNDRY_DIR/packages/model-gateway/src" \
    "$FOUNDRY_DIR/configs" \
    "$FOUNDRY_DIR/services/system-orchestrator" &
  PIDS+=($!)
else
  ensure_port_4010_free
  log "Starting control-plane with node --watch (native)..."
  (
    cd "$FOUNDRY_DIR"
    export FLAGSHIP_DEV_MODE=1
    export FLAGSHIP_ALLOW_LOOPBACK_NO_AUTH=1
    export FLAGSHIP_CORS_ORIGINS="http://localhost:3000,http://localhost:4010,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:4010,http://127.0.0.1:5174"
    exec node --watch apps/control-plane/src/server.mjs
  ) 2>&1 | sed 's/^/[api]   /' &
  PIDS+=($!)
  log "Waiting for control-plane health..."
  if ! wait_for_health "$CONTROL_PLANE_URL/health" 25; then
    err "Control-plane failed to start"
    exit 1
  fi
  ok "Control-plane is healthy; server restarts automatically on .mjs changes under imports."
fi

# ── Extension file hints ─────────────────────────────────────────────────────
log "Watching extension *.js — reload Extension Host after edits."
node "$SCRIPT_DIR/watch-extension-notify.mjs" "$COMPANION_DIR" &
PIDS+=($!)

# ── Extension Development Host (optional) ────────────────────────────────────
if [ "$SKIP_EXTENSION_HOST" = true ]; then
  echo ""
  ok "Watch mode — services only. Control-plane → $CONTROL_PLANE_URL"
  echo ""
  echo "  Extension path: $COMPANION_DIR"
  echo "  Reload Extension Host after changing .js files (Developer: Reload Window)."
  echo ""
else
  echo ""
  ok "Watch dev ready!"
  echo ""
  echo "  Control Plane  → $CONTROL_PLANE_URL (auto-restart on API changes when native)"
  echo "  Extension      → $COMPANION_DIR (reload Extension Host manually after .js edits)"
  echo ""
  if command -v code >/dev/null 2>&1; then
    log "Launching VS Code extension development host..."
    code --extensionDevelopmentPath="$COMPANION_DIR" "$REPO_ROOT" &
    ok "VS Code launched with extension loaded."
  else
    warn "'code' CLI not found. Load the extension manually:"
    echo "    code --extensionDevelopmentPath=$COMPANION_DIR"
  fi
  echo ""
fi

echo "Press Ctrl+C to stop watch and services."
echo ""

tail -f /dev/null &
PIDS+=($!)
wait
