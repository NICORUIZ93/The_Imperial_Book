#!/usr/bin/env bash
# Módulo 27 · F161 · ANTES/DESPUÉS en una malla Istio real (kind). Requiere Docker, kind, kubectl e istioctl 1.32.
# Uso: ./f161-mtls/k8s/probar-istio.sh    (crea el clúster kind «zt» si no existe; bórralo con: kind delete cluster --name zt)
set -u
cd "$(dirname "$0")" || exit 1
for h in kind kubectl istioctl; do
  command -v "$h" > /dev/null 2>&1 || { echo "falta ${h}: instálalo (ver docs/microservicios/08-herramientas-y-versiones.md)"; exit 2; }
done
kind get clusters | grep -qx zt || kind create cluster --name zt
istioctl install --set profile=default -y
kubectl create namespace tienda --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace tienda istio-injection=enabled --overwrite
kubectl apply -f app.yaml
kubectl -n tienda rollout status deploy/pagos deploy/pedidos deploy/catalogo --timeout=180s
cobrar() { kubectl -n tienda exec "deploy/$1" -c "$1" -- wget -qO- --post-data='{}' http://pagos:8080/cobros 2>&1 | tail -1; }
kubectl apply -f istio/antes.yaml
sleep 5
echo "ANTES   pedidos  -> $(cobrar pedidos)"
echo "ANTES   catalogo -> $(cobrar catalogo)"
kubectl apply -f istio/despues.yaml
sleep 5
echo "DESPUÉS pedidos  -> $(cobrar pedidos)"
echo "DESPUÉS catalogo -> $(cobrar catalogo)"
