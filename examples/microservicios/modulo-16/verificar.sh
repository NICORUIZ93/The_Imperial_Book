#!/usr/bin/env bash
# Módulo 12 · Docker, Kubernetes y despliegue (modulo-16)
# 1) Tests de la app «catalogo» (sin Docker): configuración y probes.
# 2) F081 Imagen multi-stage + distroless (1.0.0 y 1.1.0) y la «ingenua» para comparar.   F082 Docker Compose.
# 3) Clúster kind (Kubernetes 1.37.0): F083 objetos · F084 probes · F085 HPA · F086 Helm · F087 Blue-Green y Canary
#    · F088 GitOps con Argo CD. Cada prueba está en pruebas/fNNN-*.sh y se puede ejecutar sola.
# Uso: ./verificar.sh              todo y al final borra el clúster (≈ 15–25 min la primera vez)
#      ./verificar.sh --conservar  deja el clúster academia-m12 para explorarlo (bórralo con: kind delete cluster --name academia-m12)
# Requisitos: JDK 25, Docker (6 GB de RAM para Docker Desktop), kind v0.33.0, kubectl 1.37, Helm 4.3, curl.
#   macOS: brew install kind kubectl helm
# No se detiene en el primer fallo: ejecuta todos los pasos y al final lista los que fallaron. Compatible con bash 3.2.
set -u
cd "$(dirname "$0")" || exit 1
# Toda la salida queda también en logs/verificar-AAAAMMDD-HHMMSS.log (carpeta ignorada por Git).
mkdir -p logs
LOG="logs/verificar-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee "$LOG") 2>&1
echo "Log: $LOG"
CLUSTER=academia-m12
fallos=0
resumen=""

registrar() {
  if [ "$2" -eq 0 ]; then
    resumen="$resumen
  ✔ $1"
  else
    fallos=$((fallos + 1))
    resumen="$resumen
  ✘ $1"
  fi
}

paso() {
  nombre=$1
  shift
  echo
  echo "== $nombre"
  "$@"
  registrar "$nombre" $?
}

version_de() {   # version_de "texto esperado" comando args...
  esperado=$1
  shift
  salida=$("$@" 2>&1)
  echo "$salida" | head -3
  case "$salida" in
    *"$esperado"*) return 0 ;;
    *) echo "   (se esperaba «$esperado»)"; return 1 ;;
  esac
}

paso "JDK 25" version_de 'version "25' java -version
paso "Docker" docker version --format '{{.Server.Version}}'
paso "kind v0.33" version_de "v0.33" kind version
paso "kubectl 1.37" version_de "v1.37" kubectl version --client
paso "Helm 4" version_de "v4." helm version --short

paso "Tests de la app catalogo (configuración y probes)" ./mvnw -q test

paso "F081 · docker build academia/catalogo:1.0.0 (multi-stage + distroless)" \
  docker build --provenance=false -t academia/catalogo:1.0.0 app
paso "F081 · docker build academia/catalogo:1.1.0" \
  docker build --provenance=false -t academia/catalogo:1.1.0 --build-arg VERSION=1.1.0 app
paso "F081 · docker build academia/catalogo:ingenuo (para comparar)" \
  docker build --provenance=false -f app/Dockerfile.ingenuo -t academia/catalogo:ingenuo app
docker image ls academia/catalogo
paso "F081 · imagen: no root, sin shell, más pequeña, SIGTERM" ./pruebas/f081-imagen.sh
paso "F082 · Docker Compose" ./pruebas/f082-compose.sh

crear_cluster() {
  if kind get clusters 2>/dev/null | grep -qx "$CLUSTER"; then
    echo "   el clúster $CLUSTER ya existe: se reutiliza"
  else
    kind create cluster --config kind/cluster.yaml --wait 120s || return 1
  fi
  kind load docker-image academia/catalogo:1.0.0 academia/catalogo:1.1.0 --name "$CLUSTER"
}
# Sin kind, kubectl o el clúster, las pruebas de Kubernetes fallarían esperando sus timeouts: se marcan como fallidas al instante.
hay_cluster=0
if command -v kind >/dev/null 2>&1 && command -v kubectl >/dev/null 2>&1; then
  paso "kind: clúster $CLUSTER (Kubernetes 1.37.0) con las imágenes cargadas" crear_cluster
  kubectl --context "kind-$CLUSTER" get nodes >/dev/null 2>&1 && hay_cluster=1
else
  registrar "kind: clúster $CLUSTER (falta kind o kubectl: brew install kind kubectl)" 1
fi

prueba_k8s() {   # prueba_k8s "nombre" script
  if [ "$hay_cluster" -eq 1 ]; then
    paso "$1" "$2"
  else
    registrar "$1 (sin clúster)" 1
  fi
}
prueba_k8s "F083 · Deployments, Services, ConfigMaps, Secrets" ./pruebas/f083-objetos.sh
prueba_k8s "F084 · Readiness/Liveness Probes" ./pruebas/f084-probes.sh
prueba_k8s "F085 · HPA" ./pruebas/f085-hpa.sh
if command -v helm >/dev/null 2>&1; then
  prueba_k8s "F086 · Helm" ./pruebas/f086-helm.sh
else
  registrar "F086 · Helm (falta helm: brew install helm)" 1
fi
prueba_k8s "F087 · Blue-Green y Canary" ./pruebas/f087-despliegues.sh
prueba_k8s "F088 · GitOps con Argo CD" ./pruebas/f088-argocd.sh

if [ "${1:-}" != "--conservar" ] && [ "$hay_cluster" -eq 1 ]; then
  echo
  echo "== kind delete cluster --name $CLUSTER"
  kind delete cluster --name "$CLUSTER"
fi

echo
echo "Resumen:$resumen"
if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 12 (Docker, Kubernetes y despliegue) verificado"
else
  echo "RESULTADO: FALLA ($fallos pasos) · revisa arriba los pasos marcados con ✘"
  exit 1
fi
