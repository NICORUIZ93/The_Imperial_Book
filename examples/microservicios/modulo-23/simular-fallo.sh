#!/usr/bin/env bash
# Simula fallos con la API HTTP de Toxiproxy 2.13.0 (puerto 8474). Requiere la infraestructura arriba
# (docker compose up -d --wait, o ./infra.sh up). El proxy por defecto es "inventario"; el otro es "redis".
# Uso:
#   ./simular-fallo.sh lento [ms] [proxy]   latencia en cada respuesta (toxic "latency", 2000 ms por defecto)
#   ./simular-fallo.sh caido [proxy]        apaga el proxy: conexión rechazada (enabled=false)
#   ./simular-fallo.sh cuelga [proxy]       acepta la conexión y nunca responde (toxic "timeout" con 0)
#   ./simular-fallo.sh sano                 quita todos los toxics y enciende todos los proxies (POST /reset)
#   ./simular-fallo.sh estado [proxy]       muestra el proxy y sus toxics activos
set -eu
API=${TOXIPROXY_API:-http://127.0.0.1:8474}
case "${1:-estado}" in
  lento)
    P=${3:-inventario}
    curl -fsS -X POST "$API/proxies/$P/toxics" -H 'Content-Type: application/json' \
      -d "{\"name\":\"lento\",\"type\":\"latency\",\"stream\":\"downstream\",\"toxicity\":1.0,\"attributes\":{\"latency\":${2:-2000},\"jitter\":0}}"
    ;;
  caido)
    curl -fsS -X POST "$API/proxies/${2:-inventario}" -H 'Content-Type: application/json' -d '{"enabled":false}'
    ;;
  cuelga)
    curl -fsS -X POST "$API/proxies/${2:-inventario}/toxics" -H 'Content-Type: application/json' \
      -d '{"name":"cuelga","type":"timeout","stream":"downstream","toxicity":1.0,"attributes":{"timeout":0}}'
    ;;
  sano)
    curl -fsS -X POST "$API/reset"
    ;;
  estado)
    curl -fsS "$API/proxies/${2:-inventario}"
    ;;
  *)
    echo "uso: $0 lento [ms] [proxy] | caido [proxy] | cuelga [proxy] | sano | estado [proxy]" >&2
    exit 2
    ;;
esac
echo
