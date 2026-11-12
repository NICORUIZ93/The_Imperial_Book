#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p target
./mvnw -q clean test package >target/maven.log 2>&1 || { tail -80 target/maven.log; exit 1; }
JAR=target/spring-boot-probes-rutaflow-0.1.0-SNAPSHOT.jar
java -Dserver.port=18082 -jar "$JAR" --logging.level.root=WARN >target/app.log 2>&1 &
APP_PID=$!
cleanup() {
  kill "$APP_PID" 2>/dev/null || true
  wait "$APP_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
for attempt in $(seq 1 30); do
  if curl -fsS http://localhost:18082/actuator/health/liveness >/dev/null 2>&1; then break; fi
  sleep 1
done
printf 'Live HTTP liveness: '
curl -fsS http://localhost:18082/actuator/health/liveness
printf '\nLive HTTP readiness: '
curl -fsS http://localhost:18082/actuator/health/readiness
printf '\nApplication endpoint: '
curl -fsS http://localhost:18082/entrega
printf '\nMockMvc state-change tests: passed\n'
