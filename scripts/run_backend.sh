#!/usr/bin/env bash
set -euo pipefail

# Lightweight runner for the backend. Use this to start/stop the uvicorn
# process from the project root. Logs are written to `backend/uvicorn.log`.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV="$REPO_ROOT/.venv"
BACKEND_DIR="$REPO_ROOT/backend"
UVICORN_LOG="$BACKEND_DIR/uvicorn.log"
UVICORN_PIDFILE="$BACKEND_DIR/uvicorn.pid"

usage() {
  cat <<EOF
Usage: $0 {start|stop|status|restart}

Commands:
  start     Activate venv, rotate log, start uvicorn (detached)
  stop      Stop uvicorn using pidfile or pkill
  status    Show uvicorn status and tail of log
  restart   Stop then start
EOF
}

start() {
  if [ -f "$UVICORN_PIDFILE" ]; then
    pid=$(cat "$UVICORN_PIDFILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "uvicorn already running (PID $pid)"
      exit 0
    else
      echo "Removing stale pidfile"
      rm -f "$UVICORN_PIDFILE"
    fi
  fi

  if [ -f "$UVICORN_LOG" ]; then
    mv "$UVICORN_LOG" "$UVICORN_LOG.$(date +%Y%m%d%H%M%S)" || true
  fi

  if [ -f "$VENV/bin/activate" ]; then
    # Activate venv for environment variables, then run the venv's uvicorn
    # using its full path to avoid relying on a login shell.
    : "$VENV"
  else
    echo "Virtualenv not found at $VENV. Activate manually or adjust script." >&2
  fi

  # Start uvicorn detached from the backend working directory and record PID
  pushd "$BACKEND_DIR" > /dev/null
  nohup "$VENV/bin/uvicorn" app.main:app --host 127.0.0.1 --port 8000 > "$UVICORN_LOG" 2>&1 &
  pid=$!
  popd > /dev/null
  echo "$pid" > "$UVICORN_PIDFILE"
  echo "Started uvicorn (PID $pid), log: $UVICORN_LOG"
}

stop() {
  if [ -f "$UVICORN_PIDFILE" ]; then
    pid=$(cat "$UVICORN_PIDFILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping uvicorn PID $pid"
      kill "$pid"
      sleep 1
      rm -f "$UVICORN_PIDFILE"
      echo "Stopped"
      return 0
    else
      echo "No process $pid, removing stale pidfile"
      rm -f "$UVICORN_PIDFILE"
    fi
  fi

  # Fallback: try pkill
  pkill -f "uvicorn app.main:app" || true
}

status() {
  if [ -f "$UVICORN_PIDFILE" ]; then
    pid=$(cat "$UVICORN_PIDFILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "uvicorn running (PID $pid)"
    else
      echo "pidfile present but process not running"
    fi
  else
    echo "No pidfile. Checking running processes..."
    pgrep -af "uvicorn app.main:app" || echo "No uvicorn process found"
  fi
  echo "--- last 40 lines of log ---"
  tail -n 40 "$UVICORN_LOG" || true
}

case "${1:-}" in
  start) start ;; 
  stop) stop ;; 
  status) status ;; 
  restart) stop; start ;; 
  *) usage; exit 1 ;;
esac
