#!/usr/bin/env bash
# F067 · Comprueba el efecto de PeerAuthentication: PERMISSIVE deja entrar texto plano, STRICT no.
# Termina con "RESULTADO: OK" si legado recibe 200 en PERMISSIVE y es rechazado en STRICT.
set -uo pipefail
cd "$(dirname "$0")"
probar() { # imprime "<origen> -> httpbin.tienda: <código>" para tienda y legado
  for origen in tienda legado; do
    codigo=$(kubectl exec -n "$origen" deploy/curl -c curl -- \
      curl -s -o /dev/null -w "%{http_code}" http://httpbin.tienda:8000/ip 2>&1)
    echo "curl.$origen -> httpbin.tienda: $codigo"
  done
}
kubectl apply -f k8s/antes-permissive.yaml >/dev/null
sleep 5
echo "== ANTES: PeerAuthentication PERMISSIVE"
antes=$(probar); echo "$antes"
kubectl apply -f k8s/despues-strict.yaml >/dev/null
sleep 5
echo "== DESPUÉS: PeerAuthentication STRICT"
despues=$(probar); echo "$despues"
if echo "$antes" | grep -q "curl.legado -> httpbin.tienda: 200" \
   && echo "$despues" | grep -q "curl.tienda -> httpbin.tienda: 200" \
   && echo "$despues" | grep -q "curl.legado -> httpbin.tienda: 000"; then
  echo "RESULTADO: OK · F067 mTLS STRICT rechaza al cliente sin sidecar"
else
  echo "RESULTADO: FALLA · revisa 'istioctl proxy-status' y 'kubectl get peerauthentication -A'"; exit 1
fi
