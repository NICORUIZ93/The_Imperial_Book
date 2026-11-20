#!/usr/bin/env bash
# F086 · Test del chart: lint, template, install, helm test, upgrade, history y rollback.
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
H="helm --kube-context kind-$CLUSTER"
helm lint charts/catalogo || fallos=$((fallos + 1))
contiene "image: \"academia/catalogo:1.1.0\"" helm template demo charts/catalogo --set image.tag=1.1.0 || fallos=$((fallos + 1))
contiene "kind: HorizontalPodAutoscaler" helm template demo charts/catalogo --set autoscaling.enabled=true || fallos=$((fallos + 1))

$H uninstall demo -n catalogo-helm >/dev/null 2>&1
$H install demo charts/catalogo -n catalogo-helm --create-namespace --wait --timeout 5m || fallos=$((fallos + 1))
$H test demo -n catalogo-helm || fallos=$((fallos + 1))
$H upgrade demo charts/catalogo -n catalogo-helm --set image.tag=1.1.0 --wait --timeout 5m || fallos=$((fallos + 1))
$H test demo -n catalogo-helm || fallos=$((fallos + 1))
$H history demo -n catalogo-helm
contiene "1.1.0" $K -n catalogo-helm get deployment demo-catalogo -o jsonpath='{.spec.template.spec.containers[0].image}' || fallos=$((fallos + 1))
$H rollback demo 1 -n catalogo-helm --wait --timeout 5m || fallos=$((fallos + 1))
$H test demo -n catalogo-helm || fallos=$((fallos + 1))
contiene "academia/catalogo:1.0.0" $K -n catalogo-helm get deployment demo-catalogo -o jsonpath='{.spec.template.spec.containers[0].image}' || fallos=$((fallos + 1))
$H uninstall demo -n catalogo-helm
[ "$fallos" -eq 0 ]
