#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# start-dev.sh  —  Nexus Chat local development launcher
# Usage: ./start-dev.sh [backend|frontend|all]
# ─────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

log()  { echo -e "${GREEN}[nexus]${NC} $1"; }
warn() { echo -e "${YELLOW}[nexus]${NC} $1"; }
err()  { echo -e "${RED}[nexus]${NC} $1"; exit 1; }

# ── Check dependencies ────────────────────────────────────────
check_deps() {
  command -v java  >/dev/null 2>&1 || err "Java 17+ is required. Install from https://adoptium.net"
  command -v node  >/dev/null 2>&1 || err "Node.js 20+ is required. Install from https://nodejs.org"
  command -v redis-cli >/dev/null 2>&1 || warn "Redis not found. Install Redis and ensure it's running on :6379"

  JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
  [ "$JAVA_VER" -lt 17 ] 2>/dev/null && err "Java 17+ required. Found: $JAVA_VER"
  log "Dependencies OK (Java $JAVA_VER, Node $(node -v))"
}

# ── Backend ───────────────────────────────────────────────────
start_backend() {
  log "Starting Spring Boot backend on :8080 ..."
  cd "$SCRIPT_DIR/backend"
  if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw spring-boot:run &
  else
    mvn spring-boot:run &
  fi
  BACKEND_PID=$!
  log "Backend PID: $BACKEND_PID"
  echo $BACKEND_PID > /tmp/nexus_backend.pid
}

# ── Frontend ──────────────────────────────────────────────────
start_frontend() {
  log "Installing frontend dependencies..."
  cd "$SCRIPT_DIR/frontend"
  npm install --silent

  log "Starting Vite dev server on :3000 ..."
  npm run dev &
  FRONTEND_PID=$!
  log "Frontend PID: $FRONTEND_PID"
  echo $FRONTEND_PID > /tmp/nexus_frontend.pid
}

# ── Cleanup on Ctrl+C ─────────────────────────────────────────
cleanup() {
  log "Shutting down..."
  [ -f /tmp/nexus_backend.pid  ] && kill "$(cat /tmp/nexus_backend.pid)"  2>/dev/null || true
  [ -f /tmp/nexus_frontend.pid ] && kill "$(cat /tmp/nexus_frontend.pid)" 2>/dev/null || true
  rm -f /tmp/nexus_backend.pid /tmp/nexus_frontend.pid
  log "Stopped."
}
trap cleanup INT TERM

# ── Main ──────────────────────────────────────────────────────
MODE="${1:-all}"
check_deps

echo ""
echo "  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗"
echo "  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝"
echo "  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗"
echo "  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║"
echo "  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║"
echo "  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝"
echo ""
log "Mode: $MODE"
echo ""

case "$MODE" in
  backend)
    start_backend
    wait
    ;;
  frontend)
    start_frontend
    wait
    ;;
  all|*)
    start_backend
    sleep 3  # give backend time to start
    start_frontend
    echo ""
    log "🚀 Nexus Chat is starting!"
    log "   Frontend  → http://localhost:3000"
    log "   Backend   → http://localhost:8080"
    log "   H2 Console→ http://localhost:8080/h2-console"
    echo ""
    log "Demo accounts (password: password123)"
    log "   alice / bob / carol / dave"
    echo ""
    log "Press Ctrl+C to stop all services"
    wait
    ;;
esac
