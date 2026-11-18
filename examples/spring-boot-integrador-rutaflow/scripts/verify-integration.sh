#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
PODMAN_SOCKET=
if command -v podman >/dev/null 2>&1; then
  PODMAN_SOCKET="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}' 2>/dev/null || true)"
fi
if [ -z "$PODMAN_SOCKET" ] && [ -n "${XDG_RUNTIME_DIR:-}" ] && [ -S "${XDG_RUNTIME_DIR}/podman/podman.sock" ]; then
  PODMAN_SOCKET="${XDG_RUNTIME_DIR}/podman/podman.sock"
fi

./mvnw -q clean
if [ -n "$PODMAN_SOCKET" ]; then
  DOCKER_HOST="unix://${PODMAN_SOCKET}" \
  TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock \
  TESTCONTAINERS_RYUK_DISABLED=true \
    ./mvnw -q test
else
  ./mvnw -q test
fi
cat target/surefire-reports/academia.rutaflow.integrador.entrega.ArquitecturaIntegradaTest.txt
