#!/usr/bin/env bash
# Módulo 5 · Introducción a microservicios y DDD (modulo-9)
# Levanta PostgreSQL 18.7 (F046), ejecuta los tests de las 6 fichas (F041–F046) con el Maven Wrapper,
# comprueba los guiones SQL de F046 y apaga el contenedor.
# Uso: ./verificar.sh     (requiere JDK 25 LTS y Docker con Compose v2)
set -u
cd "$(dirname "$0")"
java -version 2>&1 | head -1
docker compose version
docker compose up -d --wait || { echo "RESULTADO: FALLA · PostgreSQL no quedó healthy (docker compose logs postgres)"; exit 1; }
resultado=0
if ./mvnw -q test; then
  echo "OK · tests de F041–F046 en verde"
else
  resultado=1
  echo "FALLA · busca arriba el primer [ERROR] y el test marcado con FAILURE"
fi
# F046: los dos fallos deliberados deben fallar y la consulta correcta debe devolver 2 filas.
psql_en() { docker compose exec -T postgres psql -v ON_ERROR_STOP=1 "$1" -f - ; }
if psql_en "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/envios_db" < f046-bd-por-servicio/sql/02-facturacion-entra-a-envios.sql 2>/dev/null; then
  resultado=1; echo "FALLA · Facturación pudo entrar a envios_db"
fi
if psql_en "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/facturacion_db" < f046-bd-por-servicio/sql/03-join-entre-bases.sql 2>/dev/null; then
  resultado=1; echo "FALLA · el JOIN entre bases no debería funcionar"
fi
psql_en "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/facturacion_db" < f046-bd-por-servicio/sql/04-consulta-con-copia-local.sql | grep -q "(2 rows)" \
  || { resultado=1; echo "FALLA · la consulta con copia local no devolvió 2 filas"; }
docker compose down
if [ $resultado -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 5 (Introducción a microservicios y DDD) verificado"
else
  echo "RESULTADO: FALLA"
fi
exit $resultado
