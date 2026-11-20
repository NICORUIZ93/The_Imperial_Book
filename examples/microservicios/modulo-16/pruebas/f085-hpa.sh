#!/usr/bin/env bash
# F085 · Test del HPA: con carga, el Deployment pasa de 2 a más réplicas.
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
METRICS=https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.9.0/components.yaml
if ! $K -n kube-system get deployment metrics-server >/dev/null 2>&1; then
  $K apply -f "$METRICS"
  # kind usa certificados autofirmados en el kubelet: metrics-server debe aceptarlos (solo en laboratorio).
  $K -n kube-system patch deployment metrics-server --type=json \
    -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
fi
$K -n kube-system rollout status deployment/metrics-server --timeout=180s || fallos=$((fallos + 1))
esperar 120 "kubectl top devuelve métricas" $K -n catalogo top pods || fallos=$((fallos + 1))
$K apply -f k8s/hpa/hpa.yaml
esperar 90 "el HPA lee la CPU (TARGETS deja de ser <unknown>)" \
  jsonpath_mayor catalogo hpa/catalogo '{.status.currentMetrics[0].resource.current.averageUtilization}' -1 \
  || fallos=$((fallos + 1))
$K -n catalogo get hpa catalogo
$K delete pod carga -n catalogo --ignore-not-found >/dev/null
$K apply -f k8s/hpa/carga.yaml
esperar 300 "con carga, el HPA sube a más de 2 réplicas" \
  jsonpath_mayor catalogo hpa/catalogo '{.status.desiredReplicas}' 2 || fallos=$((fallos + 1))
$K -n catalogo get hpa catalogo
$K -n catalogo describe hpa catalogo | tail -8
$K delete pod carga -n catalogo --ignore-not-found
$K delete -f k8s/hpa/hpa.yaml --ignore-not-found
$K -n catalogo scale deployment catalogo --replicas=2
[ "$fallos" -eq 0 ]
