#!/usr/bin/env bash
# F084 · Test de readiness y liveness: sacar un pod del Service sin reiniciarlo, y reiniciar uno «roto».
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
$K -n catalogo rollout status deployment/catalogo --timeout=180s
# «rollout status» termina cuando los pods nuevos están listos, pero los del ReplicaSet anterior pueden seguir
# unos segundos en Terminating. Si eligieras uno de esos, desaparecería a mitad de la prueba.
esperar 120 "quedan exactamente 2 pods y ninguno terminando" pods_asentados catalogo app=catalogo 2 || fallos=$((fallos + 1))
esperar 60 "el Service tiene 2 endpoints listos" hay_endpoints catalogo catalogo 2 || fallos=$((fallos + 1))
POD=$(pods_vivos catalogo app=catalogo | head -1)
if [ -z "$POD" ]; then
  mal "no hay ningún pod vivo del catálogo"
  exit 1
fi
echo "   pod elegido: $POD"
# distroless no tiene curl: se habla con ESE pod a través de un port-forward.
$K -n catalogo port-forward "pod/$POD" 18084:8080 >/dev/null 2>&1 &
PF=$!
esperar 20 "port-forward listo" curl -fs http://localhost:18084/actuator/health/liveness || fallos=$((fallos + 1))

curl -s -X POST http://localhost:18084/admin/readiness/rechazar; echo
esperar 60 "readiness 503 -> el pod sale del Service (queda 1 endpoint listo)" hay_endpoints catalogo catalogo 1 \
  || fallos=$((fallos + 1))
reinicios=$($K -n catalogo get pod "$POD" -o jsonpath='{.status.containerStatuses[0].restartCount}')
[ "$reinicios" = "0" ] && ok "readiness NO reinicia el pod (restartCount=0)" || { mal "restartCount=$reinicios"; fallos=$((fallos + 1)); }
curl -s -X POST http://localhost:18084/admin/readiness/aceptar; echo
esperar 60 "vuelve a tener 2 endpoints listos" hay_endpoints catalogo catalogo 2 || fallos=$((fallos + 1))

curl -s -X POST http://localhost:18084/admin/liveness/romper; echo
kill "$PF" 2>/dev/null
esperar 90 "liveness 503 x3 -> el kubelet reinicia el contenedor (restartCount=1)" \
  jsonpath_mayor catalogo "pod/$POD" '{.status.containerStatuses[0].restartCount}' 0 || fallos=$((fallos + 1))
$K -n catalogo get events --field-selector "involvedObject.name=$POD" --sort-by=.lastTimestamp | tail -5
$K -n catalogo rollout status deployment/catalogo --timeout=120s
[ "$fallos" -eq 0 ]
