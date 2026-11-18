#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
./gradlew --no-daemon --console=plain clean processAot bootJar
jar_file=build/libs/spring-boot-native-rutaflow-0.1.0-SNAPSHOT.jar
jar tf "$jar_file" > build/aot-jar-entries.txt
grep -F 'NativeRutaApplication__ApplicationContextInitializer.class' build/aot-jar-entries.txt >/dev/null
grep -F 'reachability-metadata.json' build/aot-jar-entries.txt >/dev/null
app_pid=''
cleanup() {
  if [[ -n "$app_pid" ]]; then
    kill "$app_pid" 2>/dev/null || true
    wait "$app_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM
java -Dspring.aot.enabled=true -jar "$jar_file" --server.port=18091 --logging.level.root=WARN > build/gradle-aot-app.log 2>&1 &
app_pid=$!
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:18091/estado > build/gradle-aot-estado.json 2>/dev/null; then break; fi
  sleep 1
done
python3 - <<'PY'
import json
from pathlib import Path
payload=json.loads(Path('build/gradle-aot-estado.json').read_text())
assert payload == {'codigo': 'RF-314', 'estado': 'en camino'}, payload
PY
curl -fsS http://127.0.0.1:18091/mensaje > build/gradle-aot-mensaje.txt
grep -F 'Tu entrega RF-314 va en camino.' build/gradle-aot-mensaje.txt >/dev/null
echo 'AOT Gradle comprobado sobre JVM: metadata y dos endpoints correctos; no binario nativo.'
