#!/usr/bin/env bash
# F088 · Test de GitOps con Argo CD v3.5.6: sincroniza desde Git y revierte un cambio manual (selfHeal).
set -u
cd "$(dirname "$0")/.." || exit 1
. pruebas/comun.sh
fallos=0
ARGO=https://raw.githubusercontent.com/argoproj/argo-cd/v3.5.6/manifests/install.yaml
$K create namespace argocd --dry-run=client -o yaml | $K apply -f -
# --server-side: algunos CRD de Argo CD superan el límite de tamaño de la anotación del apply clásico.
$K apply -n argocd --server-side --force-conflicts -f "$ARGO" >/dev/null || fallos=$((fallos + 1))
for d in argocd-server argocd-repo-server argocd-redis; do
  $K -n argocd rollout status "deployment/$d" --timeout=300s || fallos=$((fallos + 1))
done
$K -n argocd rollout status statefulset/argocd-application-controller --timeout=300s || fallos=$((fallos + 1))

$K apply -f argocd/guestbook.yaml
esperar 300 "guestbook: Synced y Healthy" \
  jsonpath_es argocd application/guestbook '{.status.sync.status} {.status.health.status}' "Synced Healthy" \
  || fallos=$((fallos + 1))
$K -n argocd get application guestbook

# Deriva: alguien escala a mano. Git dice 1 réplica; selfHeal lo devuelve a 1.
$K -n guestbook scale deployment guestbook-ui --replicas=3
esperar 180 "selfHeal: Argo CD devuelve guestbook-ui a 1 réplica" \
  jsonpath_es guestbook deployment/guestbook-ui '{.spec.replicas}' 1 || fallos=$((fallos + 1))
$K -n argocd get application guestbook -o jsonpath='{.status.operationState.syncResult.revision}'; echo
$K delete -f argocd/guestbook.yaml --wait=true
[ "$fallos" -eq 0 ]
