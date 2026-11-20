#!/usr/bin/env bash
# F083 · Test de Deployment, Service, ConfigMap y Secret en kind.
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
$K apply -f k8s/base/namespace.yaml
$K apply -f k8s/base/
$K -n catalogo rollout status deployment/catalogo --timeout=180s || fallos=$((fallos + 1))
$K -n catalogo get deploy,rs,pods,svc -o wide
contiene '"mensaje":"Hola desde Kubernetes"' curl -s http://localhost:30080/api/info || fallos=$((fallos + 1))
contiene '"claveApiConfigurada":true' curl -s http://localhost:30080/api/info || fallos=$((fallos + 1))
[ "$(endpoints_listos catalogo catalogo)" -eq 2 ] && ok "el Service tiene 2 endpoints listos" || { mal "endpoints"; fallos=$((fallos + 1)); }

# Cambiar el ConfigMap NO cambia los pods que ya corren (las variables se leen al arrancar)...
$K -n catalogo patch configmap catalogo-config --type merge -p '{"data":{"CATALOGO_MENSAJE":"Mensaje nuevo"}}'
contiene '"mensaje":"Hola desde Kubernetes"' curl -s http://localhost:30080/api/info || fallos=$((fallos + 1))
# ...hasta reiniciarlos con un rollout.
$K -n catalogo rollout restart deployment/catalogo
$K -n catalogo rollout status deployment/catalogo --timeout=180s || fallos=$((fallos + 1))
esperar 30 "los pods nuevos leen el ConfigMap nuevo" responde_con http://localhost:30080/api/info "Mensaje nuevo" || fallos=$((fallos + 1))
$K apply -f k8s/base/configmap.yaml
$K -n catalogo rollout restart deployment/catalogo
$K -n catalogo rollout status deployment/catalogo --timeout=180s
[ "$fallos" -eq 0 ]
