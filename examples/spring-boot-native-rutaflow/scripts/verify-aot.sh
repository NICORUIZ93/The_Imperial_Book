#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if ! ./mvnw -q clean package -Pnative >target/aot-build.log 2>&1; then
  tail -60 target/aot-build.log
  exit 1
fi
JAR=target/spring-boot-native-rutaflow-0.1.0-SNAPSHOT.jar
test -f target/spring-aot/main/sources/academia/rutaflow/nativeimage/NativeRutaApplication__ApplicationContextInitializer.java
test -f target/spring-aot/main/resources/META-INF/native-image/academia.rutaflow/spring-boot-native-rutaflow/reachability-metadata.json
grep -F 'mensajes\/*.txt' target/spring-aot/main/resources/META-INF/native-image/academia.rutaflow/spring-boot-native-rutaflow/reachability-metadata.json >/dev/null
echo "OK: Spring generó clases AOT y metadata de recursos"
java -Dspring.aot.enabled=true -Dserver.port=18081 -jar "$JAR" --logging.level.root=WARN > target/aot-app.log 2>&1 &
APP_PID=$!
cleanup() {
  kill "$APP_PID" 2>/dev/null || true
  wait "$APP_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
for attempt in $(seq 1 30); do
  if curl -fsS http://localhost:18081/estado >/dev/null 2>&1; then break; fi
  sleep 1
done
printf 'AOT JVM endpoint: '
curl -fsS http://localhost:18081/estado
printf '\nResource hint endpoint: '
curl -fsS http://localhost:18081/mensaje
printf '\n'
