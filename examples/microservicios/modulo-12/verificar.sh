#!/usr/bin/env bash
# Módulo 8 · Resiliencia (modulo-12)
# 1) Ejecuta las 4 demostraciones de jdk/ (solo JDK 25): fallos inyectados con ProxyDeFallos.java.
# 2) Levanta inventario + Toxiproxy 2.13.0 con Docker Compose y comprueba cada fallo de simular-fallo.sh.
# 3) Ejecuta los tests Spring Boot 4.1.3 + Resilience4j 2.4.0 de F057–F060 (F060 usa Testcontainers).
# Uso: ./verificar.sh            (requiere JDK 25, Docker con Compose v5 y curl)
#      ./verificar.sh --solo-jdk (solo el paso 1: no necesita Docker ni Maven Central)
set -u -o pipefail
cd "$(dirname "$0")"
java -version 2>&1 | grep -v Picked | head -1
fallos=0
echo "== 1. Demostraciones con JDK puro (fallos inyectados con jdk/ProxyDeFallos.java)"
for demo in Patrones Presupuesto Fallbacks Caos; do
  echo "-- jdk/$demo.java"
  java -Dstdout.encoding=UTF-8 "jdk/$demo.java" 2>&1 | grep -v '^Picked up' || fallos=$((fallos + 1))
done
if [ "${1:-}" != "--solo-jdk" ]; then
  echo "== 2. Toxiproxy con Docker Compose"
  docker compose version
  if docker compose up -d --wait; then
    tiempo() { curl -s -o /dev/null -w '%{http_code} %{time_total}' --max-time 5 localhost:21212/stock/7 || true; }
    sano=$(tiempo); echo "sano:   $sano"
    ./simular-fallo.sh lento 1500 > /dev/null; lento=$(tiempo); echo "lento:  $lento"
    ./simular-fallo.sh sano > /dev/null
    ./simular-fallo.sh caido > /dev/null; caido=$(tiempo); echo "caido:  $caido"
    ./simular-fallo.sh sano > /dev/null; despues=$(tiempo); echo "sano:   $despues"
    case "$sano" in 200*) ;; *) echo "FALLA: el inventario no responde por Toxiproxy"; fallos=$((fallos + 1));; esac
    awk -v t="${lento#* }" 'BEGIN { exit !(t >= 1.5) }' || { echo "FALLA: la latencia no se aplicó"; fallos=$((fallos + 1)); }
    case "$caido" in 000*) ;; *) echo "FALLA: con el proxy apagado la conexión no se rechazó"; fallos=$((fallos + 1));; esac
    case "$despues" in 200*) ;; *) echo "FALLA: tras /reset el inventario no volvió"; fallos=$((fallos + 1));; esac
    docker compose down
  else
    echo "FALLA: inventario o Toxiproxy no quedaron healthy (docker compose logs)"; fallos=$((fallos + 1))
  fi
  echo "== 3. Tests Spring Boot + Resilience4j (F057–F060)"
  ./mvnw -q test || fallos=$((fallos + 1))
fi
if [ "$fallos" -eq 0 ] && [ "${1:-}" = "--solo-jdk" ]; then
  echo "RESULTADO: OK · Módulo 8 (Resiliencia) · parte JDK verificada (falta ./verificar.sh completo)"
elif [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 8 (Resiliencia) verificado"
else
  echo "RESULTADO: FALLA · $fallos bloque(s) fallaron: busca arriba FALLA o el primer [ERROR] de Maven"
  exit 1
fi
