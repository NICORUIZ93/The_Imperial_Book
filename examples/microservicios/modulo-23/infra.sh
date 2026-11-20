#!/usr/bin/env bash
# Levanta o baja la infraestructura del laboratorio: inventario (:9000), Redis y Toxiproxy (:8474, :21212, :26379).
#   ./infra.sh up     ./infra.sh down     ./infra.sh modo
# Modo "docker" (por defecto si hay daemon Docker): docker compose up -d --wait.
# Modo "local" (sin Docker): usa los binarios toxiproxy-server 2.13.0 y redis-server de tu PATH
#   (macOS: brew install toxiproxy redis). Fuerza uno con MODO=docker o MODO=local.
set -u
cd "$(dirname "$0")"
mkdir -p logs
modo() {
  if [ -n "${MODO:-}" ]; then echo "$MODO"; return; fi
  if docker info >/dev/null 2>&1; then echo docker; return; fi
  if command -v toxiproxy-server >/dev/null 2>&1 && command -v redis-server >/dev/null 2>&1; then echo local; return; fi
  echo ninguno
}
esperar() { # esperar url-o-puerto descripción
  local i=0
  while [ $i -lt 100 ]; do
    if curl -s -o /dev/null "$1"; then return 0; fi
    sleep 0.2; i=$((i + 1))
  done
  echo "✘ $2 no respondió en 20 s" >&2; return 1
}
case "${1:-modo}" in
  modo) modo ;;
  up)
    case "$(modo)" in
      docker) docker compose up -d --wait ;;
      local)
        "$0" down >/dev/null 2>&1
        : > logs/infra.pids
        node comun/inventario.js 9000 > logs/inventario.log 2>&1 & echo $! >> logs/infra.pids
        redis-server --port 16379 --bind 127.0.0.1 --save '' --appendonly no > logs/redis.log 2>&1 & echo $! >> logs/infra.pids
        # Misma configuración que toxiproxy.json, pero con los upstream en 127.0.0.1.
        sed -e 's/0\.0\.0\.0:/127.0.0.1:/' -e 's/inventario:9000/127.0.0.1:9000/' -e 's/redis:6379/127.0.0.1:16379/' toxiproxy.json > logs/toxiproxy.local.json
        toxiproxy-server -host 127.0.0.1 -port 8474 -config logs/toxiproxy.local.json > logs/toxiproxy.log 2>&1 & echo $! >> logs/infra.pids
        esperar http://127.0.0.1:9000/salud inventario && esperar http://127.0.0.1:8474/version Toxiproxy && esperar http://127.0.0.1:21212/salud "el proxy inventario"
        ;;
      *) echo "✘ No hay Docker en marcha ni toxiproxy-server + redis-server en el PATH." >&2; exit 1 ;;
    esac
    ;;
  down)
    case "$(modo)" in
      docker) docker compose down ;;
      *) if [ -f logs/infra.pids ]; then while read -r p; do kill "$p" 2>/dev/null; done < logs/infra.pids; rm -f logs/infra.pids; fi ;;
    esac
    ;;
  *) echo "uso: $0 up | down | modo" >&2; exit 2 ;;
esac
