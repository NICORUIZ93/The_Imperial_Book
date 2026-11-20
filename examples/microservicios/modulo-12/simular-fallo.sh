#!/usr/bin/env bash
# Simula fallos del inventario con la API HTTP de Toxiproxy (puerto 8474). Requiere docker compose up.
# Uso:
#   ./simular-fallo.sh lento [ms]        latencia en cada respuesta (toxic "latency", 2000 ms por defecto)
#   ./simular-fallo.sh caido             apaga el proxy: conexión rechazada (enabled=false)
#   ./simular-fallo.sh cuelga            acepta la conexión y nunca responde (toxic "timeout" con 0)
#   ./simular-fallo.sh intermitente [p]  corta con RST una fracción p de las conexiones (toxic "reset_peer")
#   ./simular-fallo.sh sano              quita todos los toxics y vuelve a encender el proxy (POST /reset)
#   ./simular-fallo.sh estado            muestra el proxy y sus toxics activos
set -euo pipefail
API=${TOXIPROXY_API:-http://localhost:8474}
P=inventario
case "${1:-estado}" in
  lento)
    curl -fsS -X POST "$API/proxies/$P/toxics" -H 'Content-Type: application/json' \
      -d "{\"name\":\"lento\",\"type\":\"latency\",\"stream\":\"downstream\",\"toxicity\":1.0,\"attributes\":{\"latency\":${2:-2000},\"jitter\":0}}"
    ;;
  caido)
    curl -fsS -X POST "$API/proxies/$P" -H 'Content-Type: application/json' -d '{"enabled":false}'
    ;;
  cuelga)
    curl -fsS -X POST "$API/proxies/$P/toxics" -H 'Content-Type: application/json' \
      -d '{"name":"cuelga","type":"timeout","stream":"downstream","toxicity":1.0,"attributes":{"timeout":0}}'
    ;;
  intermitente)
    curl -fsS -X POST "$API/proxies/$P/toxics" -H 'Content-Type: application/json' \
      -d "{\"name\":\"intermitente\",\"type\":\"reset_peer\",\"stream\":\"downstream\",\"toxicity\":${2:-0.5},\"attributes\":{\"timeout\":0}}"
    ;;
  sano)
    curl -fsS -X POST "$API/reset"
    ;;
  estado)
    curl -fsS "$API/proxies/$P"
    ;;
  *)
    echo "uso: $0 lento [ms] | caido | cuelga | intermitente [p] | sano | estado" >&2
    exit 2
    ;;
esac
echo
