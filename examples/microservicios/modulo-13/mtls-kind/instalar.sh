#!/usr/bin/env bash
# F067 · Crea el clúster kind "malla", instala Istio y despliega httpbin (servidor) y curl (cliente).
# Requiere: Docker, kind, kubectl, curl. Variables: ISTIO_VERSION (por defecto 1.32.0).
set -euo pipefail
cd "$(dirname "$0")"
ISTIO_VERSION="${ISTIO_VERSION:-1.32.0}"
kind get clusters | grep -qx malla || kind create cluster --config kind.yaml
if [ ! -d "istio-$ISTIO_VERSION" ]; then
  curl -sL https://istio.io/downloadIstio | ISTIO_VERSION="$ISTIO_VERSION" sh -
fi
export PATH="$PWD/istio-$ISTIO_VERSION/bin:$PATH"
istioctl version --remote=false
istioctl install --set profile=default -y
kubectl apply -f k8s/espacios.yaml
kubectl apply -n tienda -f "istio-$ISTIO_VERSION/samples/httpbin/httpbin.yaml"
kubectl apply -n tienda -f "istio-$ISTIO_VERSION/samples/curl/curl.yaml"
kubectl apply -n legado -f "istio-$ISTIO_VERSION/samples/curl/curl.yaml"
kubectl wait -n tienda --for=condition=Available deployment/httpbin deployment/curl --timeout=180s
kubectl wait -n legado --for=condition=Available deployment/curl --timeout=180s
kubectl get pods -n tienda -o custom-columns=POD:.metadata.name,CONTENEDORES:.spec.containers[*].name
kubectl get pods -n legado -o custom-columns=POD:.metadata.name,CONTENEDORES:.spec.containers[*].name
