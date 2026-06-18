#!/usr/bin/env bash
#
# Start / stop / inspect the FlowManager stack on Fly.io.
#
# The stack is ten separate Fly apps (see deploy/*/fly.toml and the per-app
# fly.toml under nomenclator/, api-gateway/ and frontend/):
#
#   flowmanager-keycloak-db   Postgres for Keycloak      (private, volume)
#   flowmanager-mysql         MySQL for nomenclator       (private, volume)
#   flowmanager-redis         Redis cache                 (private, volume)
#   flowmanager-zipkin        Tracing collector           (private)
#   flowmanager-prometheus    Metrics scraper             (private, volume)
#   flowmanager-grafana       Dashboards                  (public,  volume)
#   flowmanager-keycloak      Identity / OIDC issuer      (public)
#   flowmanager-nomenclator   Spring Boot backend         (private)
#   flowmanager-api-gateway   Spring Boot gateway         (public)
#   flowmanager-frontend      React Router SSR            (public)
#
# Stopping the machines halts compute billing while preserving the apps and
# their volumes (Postgres / MySQL / Redis / Prometheus / Grafana data is kept).
# Starting brings them back.
#
# Order matters: Keycloak needs its Postgres, and nomenclator/api-gateway need
# MySQL + Redis + Keycloak up first, so we start in dependency order and stop in
# reverse.
#
# Usage:
#   scripts/fly-stack.sh start     # start all machines (data layer first)
#   scripts/fly-stack.sh stop      # stop all machines (frontend first)
#   scripts/fly-stack.sh restart   # stop then start
#   scripts/fly-stack.sh status    # show each app's machine state
#
# flyctl is resolved via devbox (if present), then PATH, then ~/.fly/bin/flyctl.

set -euo pipefail

# Dependency order for starting. Stopping uses the reverse.
START_ORDER=(
  flowmanager-keycloak-db
  flowmanager-mysql
  flowmanager-redis
  flowmanager-zipkin
  flowmanager-prometheus
  flowmanager-keycloak
  flowmanager-nomenclator
  flowmanager-api-gateway
  flowmanager-grafana
  flowmanager-frontend
)

# Resolve how to invoke flyctl. Prefer a real flyctl binary (on PATH or the
# default install location), and only fall back to running it through devbox.
if command -v flyctl >/dev/null 2>&1; then
  FLY=(flyctl)
elif [[ -x "$HOME/.fly/bin/flyctl" ]]; then
  FLY=("$HOME/.fly/bin/flyctl")
elif command -v devbox >/dev/null 2>&1; then
  FLY=(devbox run -- flyctl)
else
  echo "error: flyctl not found (checked PATH, ~/.fly/bin, devbox)" >&2
  exit 1
fi

fly() {
  # Strip devbox's noisy "Info:" lines so output stays readable.
  "${FLY[@]}" "$@" 2>&1 | grep -v '^Info:' || true
}

# Print the machine IDs for an app, space-separated.
machine_ids() {
  local app="$1"
  "${FLY[@]}" machine list -a "$app" --json 2>/dev/null \
    | grep -v '^Info:' \
    | python3 -c "import sys, json; print(' '.join(m['id'] for m in json.load(sys.stdin)))" 2>/dev/null \
    || true
}

do_action() {
  local action="$1" app="$2"
  local ids
  ids="$(machine_ids "$app")"
  if [[ -z "$ids" ]]; then
    echo "  $app: no machines found (skipped)"
    return
  fi
  for id in $ids; do
    echo "  $app: $action machine $id"
    fly machine "$action" "$id" -a "$app" >/dev/null
  done
}

cmd_start() {
  echo "Starting FlowManager stack (data layer first)..."
  for app in "${START_ORDER[@]}"; do
    do_action start "$app"
  done
  echo "Done."
  echo "  Frontend: https://flowmanager-frontend.fly.dev"
  echo "  Gateway:  https://flowmanager-api-gateway.fly.dev"
  echo "  Keycloak: https://flowmanager-keycloak.fly.dev"
  echo "  Grafana:  https://flowmanager-grafana.fly.dev"
}

cmd_stop() {
  echo "Stopping FlowManager stack (frontend first)..."
  # Reverse of START_ORDER.
  for (( i=${#START_ORDER[@]}-1; i>=0; i-- )); do
    do_action stop "${START_ORDER[$i]}"
  done
  echo "Done. Machines stopped; apps and volumes (data) preserved."
}

cmd_status() {
  for app in "${START_ORDER[@]}"; do
    local states
    states="$("${FLY[@]}" machine list -a "$app" --json 2>/dev/null \
      | grep -v '^Info:' \
      | python3 -c "import sys, json; ms=json.load(sys.stdin); print(', '.join(m['state'] for m in ms) if ms else 'no machines')" 2>/dev/null)" || true
    printf '  %-26s %s\n' "$app" "${states:-unknown}"
  done
}

case "${1:-}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status)  cmd_status ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}" >&2
    exit 2
    ;;
esac
