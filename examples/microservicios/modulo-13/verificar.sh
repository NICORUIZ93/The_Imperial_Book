#!/usr/bin/env bash
# Módulo 9 · Seguridad (modulo-13)
# 1) Demostraciones con JDK puro (jdk/): filtros, JWT, OAuth2+PKCE, RBAC, token exchange, mTLS, escáner.
# 2) Keycloak 26.8.2 y Vault 2.2.0 con Docker Compose: tokens reales, token exchange (RFC 8693),
#    F064 contra Keycloak, Vault sembrado con política de solo lectura y Trivy 0.76.1 sobre F069.
# 3) Tests Spring Boot 4.1.3 de F061–F066 y F068 con el Maven Wrapper.
# Uso: ./verificar.sh              (JDK 25, Docker con Compose v5, curl, openssl)
#      ./verificar.sh --solo-jdk   (solo el paso 1: sin Docker ni Maven Central)
#      ./verificar.sh --mtls       (además, F067 con kind + Istio: ver mtls-kind/README.md)
set -u -o pipefail
cd "$(dirname "$0")"
java -version 2>&1 | grep -v Picked | head -1
fallos=0
mkdir -p logs                                   # logs de las apps y tokens decodificados, para diagnosticar
falla() { echo "FALLA: $1"; fallos=$((fallos + 1)); }

echo "== 1. Demostraciones con JDK puro"
jdk/generar-certs.sh target/certs > /dev/null || falla "generar-certs.sh"
for demo in CadenaDeFiltros JwtFirmas OAuthPkce RbacScopes IntercambioDeTokens MtlsDemo; do
  echo "-- jdk/$demo.java"
  java -Dstdout.encoding=UTF-8 "jdk/$demo.java" 2>&1 | grep -v '^Picked up' || falla "jdk/$demo.java"
done
echo "-- jdk/MiniEscaner.java (antes debe fallar con código 1, después pasar)"
java jdk/MiniEscaner.java f069-escaneo/antes/pom.xml > /dev/null 2>&1; [ $? -eq 1 ] || falla "MiniEscaner antes"
java jdk/MiniEscaner.java f069-escaneo/despues/pom.xml > /dev/null 2>&1 || falla "MiniEscaner después"

if [ "${1:-}" != "--solo-jdk" ]; then
  echo "== 2. Keycloak, Vault y Trivy con Docker Compose"
  docker compose version
  if docker compose up -d --wait; then
    realm=http://localhost:8180/realms/tienda
    token() { # $1 usuario, $2 scope: password grant del cliente de laboratorio (solo dev)
      curl -fsS "$realm/protocol/openid-connect/token" -d grant_type=password -d client_id=tienda-cli \
        -d username="$1" -d password=clave-demo -d scope="$2" | sed -E 's/.*"access_token":"([^"]+)".*/\1/'
    }
    ana=$(token ana "openid pedidos:leer pedidos:crear")
    java jdk/VerToken.java "$ana" 2>/dev/null | tee logs/token-ana.txt
    grep -q '"cliente"' logs/token-ana.txt && grep -q '"pedidos"' logs/token-ana.txt \
      && echo "OK: token de ana con realm_access.roles=[cliente] y aud=pedidos" || falla "claims del token de ana"
    canje=$(curl -fsS -u pedidos:solo-dev-pedidos "$realm/protocol/openid-connect/token" \
      -d grant_type=urn:ietf:params:oauth:grant-type:token-exchange -d subject_token="$ana" \
      -d subject_token_type=urn:ietf:params:oauth:token-type:access_token \
      -d audience=pagos -d scope=pagos:cobrar)
    echo "$canje" | grep -q '"issued_token_type":"urn:ietf:params:oauth:token-type:access_token"' || falla "token exchange: $canje"
    java jdk/VerToken.java "$(echo "$canje" | sed -E 's/.*"access_token":"([^"]+)".*/\1/')" 2>/dev/null | tee logs/token-canjeado.txt
    grep -q '^aud: *"pagos"' logs/token-canjeado.txt && echo "OK: token canjeado con aud=pagos" || falla "aud del token canjeado"

    echo "-- F064 contra Keycloak real"
    ./mvnw -q -f f064-keycloak/pom.xml package -DskipTests && {
      java -jar f064-keycloak/target/f064-keycloak-1.0.0.jar > logs/f064.log 2>&1 & pid=$!
      for _ in $(seq 1 40); do sleep 1; curl -s -o /dev/null localhost:8081/pedidos && break; done
      c1=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ana" localhost:8081/pedidos)
      c2=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $ana" localhost:8081/admin/reportes)
      c3=$(curl -s -o /dev/null -w "%{http_code}" localhost:8081/pedidos)
      echo "GET /pedidos con ana -> $c1 · GET /admin/reportes con ana -> $c2 · sin token -> $c3"
      [ "$c1-$c2-$c3" = "200-403-401" ] || falla "F064 contra Keycloak"
      kill "$pid"; wait "$pid" 2>/dev/null; true     # wait devuelve 143 tras el kill: no es un fallo
    } || falla "empaquetar F064"

    echo "-- Vault: secreto + política de solo lectura"
    VAULT_TOKEN=$(./vault/sembrar.sh) && export VAULT_TOKEN || falla "vault/sembrar.sh"

    echo "-- Trivy 0.76.1 sobre F069 (antes: exit 1 · después: exit 0)"
    trivy() { docker run --rm -v academia-trivy-cache:/root/.cache/ -v "$PWD/f069-escaneo":/src:ro \
      aquasec/trivy:0.76.1 fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 --quiet "/src/$1"; }
    trivy antes; [ $? -eq 1 ] || falla "Trivy no detectó las vulnerabilidades de antes/"
    trivy despues || falla "Trivy encontró HIGH/CRITICAL en despues/"
    echo "-- Trivy config sobre los Dockerfile (antes: exit 1 · después: exit 0)"
    trivyc() { docker run --rm -v academia-trivy-cache:/root/.cache/ -v "$PWD/f069-escaneo":/src:ro \
      aquasec/trivy:0.76.1 config --severity HIGH,CRITICAL --exit-code 1 --quiet "/src/$1"; }
    trivyc antes; [ $? -eq 1 ] || falla "Trivy config no detectó el USER root de antes/Dockerfile"
    trivyc despues || falla "Trivy config encontró HIGH/CRITICAL en despues/Dockerfile"

    echo "== 3. Tests Spring Boot 4.1.3 (F061–F066, F068)"
    ./mvnw -q test || falla "tests Maven"
    docker compose down
  else
    falla "Keycloak o Vault no quedaron healthy (docker compose logs)"
  fi
fi
if [ "${1:-}" = "--mtls" ]; then
  echo "== 4. F067 mTLS con kind + Istio"
  mtls-kind/instalar.sh && mtls-kind/verificar-mtls.sh || falla "mTLS con kind + Istio"
fi

if [ "$fallos" -eq 0 ] && [ "${1:-}" = "--solo-jdk" ]; then
  echo "RESULTADO: OK · Módulo 9 (Seguridad) · parte JDK verificada (falta ./verificar.sh completo)"
elif [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 9 (Seguridad) verificado"
else
  echo "RESULTADO: FALLA · $fallos bloque(s) fallaron: busca arriba FALLA o el primer [ERROR] de Maven"
  exit 1
fi
