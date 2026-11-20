#!/usr/bin/env bash
# F087 · Test de Blue-Green (cambio de selector) y Canary (proporción de réplicas).
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
$K apply -f k8s/despliegues/namespace.yaml
$K apply -f k8s/despliegues/blue-green.yaml
for d in catalogo-azul catalogo-verde; do
  $K -n despliegues rollout status "deployment/$d" --timeout=180s || fallos=$((fallos + 1))
done
contiene '"color":"azul"' curl -s http://localhost:30082/api/info || fallos=$((fallos + 1))
# El interruptor: el Service pasa a seleccionar los pods verdes. Sin redespliegue, sin pods nuevos.
$K -n despliegues patch service catalogo-bg -p '{"spec":{"selector":{"app":"catalogo-bg","color":"verde"}}}'
esperar 20 "todo el tráfico va a verde (1.1.0)" responde_con http://localhost:30082/api/info '"version":"1.1.0"' || fallos=$((fallos + 1))
verdes=0
i=0
while [ $i -lt 20 ]; do
  responde_con http://localhost:30082/api/info '"color":"verde"' && verdes=$((verdes + 1))
  i=$((i + 1))
done
[ "$verdes" -eq 20 ] && ok "20 de 20 peticiones en verde" || { mal "solo $verdes de 20 en verde"; fallos=$((fallos + 1)); }
# Rollback instantáneo: volver al azul
$K -n despliegues patch service catalogo-bg -p '{"spec":{"selector":{"app":"catalogo-bg","color":"azul"}}}'
esperar 20 "rollback: de vuelta en azul" responde_con http://localhost:30082/api/info '"color":"azul"' || fallos=$((fallos + 1))
$K delete -f k8s/despliegues/blue-green.yaml

$K apply -f k8s/despliegues/canary.yaml
for d in catalogo-estable catalogo-canario; do
  $K -n despliegues rollout status "deployment/$d" --timeout=180s || fallos=$((fallos + 1))
done
canario=0
i=0
while [ $i -lt 100 ]; do
  responde_con http://localhost:30083/api/info '"version":"1.1.0"' && canario=$((canario + 1))
  i=$((i + 1))
done
echo "   canario: $canario de 100 peticiones (esperado ≈ 25 con 1 de 4 pods)"
if [ "$canario" -ge 5 ] && [ "$canario" -le 50 ]; then ok "el canario recibe una fracción del tráfico"; else mal "proporción inesperada"; fallos=$((fallos + 1)); fi
$K delete namespace despliegues --wait=false
[ "$fallos" -eq 0 ]
