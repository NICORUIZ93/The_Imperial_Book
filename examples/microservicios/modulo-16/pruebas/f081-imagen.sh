#!/usr/bin/env bash
# F081 · Test de la imagen: multi-stage + distroless. Requiere haber construido academia/catalogo:1.0.0
# (y, para comparar, academia/catalogo:ingenuo).
set -u
. "$(dirname "$0")/comun.sh"
fallos=0
IMG=academia/catalogo:1.0.0
if ! docker image inspect "$IMG" >/dev/null 2>&1; then
  mal "no existe la imagen $IMG: constrúyela con «docker build -t $IMG app»"
  exit 1
fi

usuario=$(docker image inspect -f '{{.Config.User}}' "$IMG")
echo "   usuario de la imagen: «${usuario}»"
case "$usuario" in
  ""|0|root|0:0) mal "la imagen corre como root" || fallos=$((fallos + 1)) ;;
  *) ok "no corre como root" ;;
esac

if docker run --rm --entrypoint sh "$IMG" -c "echo hola" >/dev/null 2>&1; then
  mal "la imagen tiene shell (no es distroless)" || fallos=$((fallos + 1))
else
  ok "no hay shell dentro de la imagen"
fi

tam=$(docker image inspect -f '{{.Size}}' "$IMG")
echo "   tamaño distroless: $((tam / 1000000)) MB"
if docker image inspect academia/catalogo:ingenuo >/dev/null 2>&1; then
  tam_ing=$(docker image inspect -f '{{.Size}}' academia/catalogo:ingenuo)
  echo "   tamaño ingenuo:    $((tam_ing / 1000000)) MB"
  if [ "$tam" -lt "$tam_ing" ]; then ok "la imagen multi-stage es más pequeña"; else mal "no es más pequeña" || fallos=$((fallos + 1)); fi
fi

docker rm -f f081-prueba >/dev/null 2>&1
docker run -d --name f081-prueba -p 18081:8080 "$IMG" >/dev/null
esperar 60 "el contenedor responde en :18081" curl -fs http://localhost:18081/actuator/health/readiness || fallos=$((fallos + 1))
contiene '"version":"1.0.0"' curl -s http://localhost:18081/api/info || fallos=$((fallos + 1))
# SIGTERM -> apagado ordenado: docker stop debe terminar con código 143 (128 + 15) en menos de 10 s
inicio=$SECONDS
docker stop f081-prueba >/dev/null
codigo=$(docker inspect -f '{{.State.ExitCode}}' f081-prueba)
echo "   docker stop: código $codigo en $((SECONDS - inicio)) s"
if [ "$codigo" = "143" ] && [ $((SECONDS - inicio)) -lt 10 ]; then ok "java es PID 1 y atiende SIGTERM"; else mal "apagado no ordenado" || fallos=$((fallos + 1)); fi
docker rm f081-prueba >/dev/null
[ "$fallos" -eq 0 ]
