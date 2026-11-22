#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
cat > out/App.java <<'JAVA'
public class App { public static void main(String[] args){ System.out.println("READY"); } }
JAVA
javac -d out out/App.java
START=$(python3 - <<'PY'
import time; print(time.time())
PY
)
java -cp out App >/tmp/m01l09.out
END=$(python3 - <<'PY'
import time; print(time.time())
PY
)
python3 - <<PY
start=float("$START"); end=float("$END")
ms=(end-start)*1000
print(f"startup_ms={ms:.2f}")
PY
grep -q READY /tmp/m01l09.out
