#!/usr/bin/env bash
# F085 · Test del HPA: con carga, el Deployment pasa de 2 a más réplicas.
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
METRICS=https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.9.0/components.yaml
IMG=registry.k8s.io/metrics-server/metrics-server:v0.9.0
NODO=$(kind get nodes --name "$CLUSTER" | head -1)
# El nodo kind no descarga solo cuando el host trabaja con proxy: dentro del nodo 127.0.0.1 es el propio
# nodo y allí el proxy no escucha (ErrImagePull · proxyconnect tcp · connection refused). La imagen se
# baja en el host y se inyecta en el nodo. No se usa «kind load docker-image»: con el almacén containerd
# de Docker Desktop ejecuta «ctr images import --all-platforms» y falla (ctr: content digest
# sha256:25d291fd…: not found) porque el host solo tiene la plataforma local, linux/arm64.
if docker exec "$NODO" crictl images 2>/dev/null | grep -q "metrics-server *${IMG##*:}"; then
  ok "metrics-server ya está en el nodo $NODO"
elif docker pull "$IMG" > logs/metrics-pull.log 2>&1 &&
     docker save "$IMG" | docker exec -i "$NODO" ctr -n k8s.io images import - >> logs/metrics-pull.log 2>&1; then
  ok "metrics-server cargado en el nodo $NODO desde el host"
else
  fallos=$((fallos + 1)); mal "no se pudo cargar $IMG en el nodo $NODO (mira logs/metrics-pull.log)"
fi
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
