# Continuación de la metodología de siete pasos

Estado al 2026-10-30: **1100/1100 temas completos**. El criterio
`learningEvidence` se retiró el 2026-10-30 junto con la sección de evidencia por
tema; el auditor mide 16 marcadores. El punto de partida
histórico de esta deuda fue 496; los números «752/1007» de versiones anteriores
de este documento quedaron obsoletos al fusionar la reescritura de Java.

Este documento conserva el método de trabajo. La estrategia de fondo —no seguir
midiendo presencia de marcadores sino sustancia— vive en
[PLAN-TOTAL-DE-CAMBIO.md](PLAN-TOTAL-DE-CAMBIO.md).

## Qué se corrigió en el auditor (no repetir)

1. **Falsos negativos de vocabulario legítimo** en
   `scripts/audit_seven_step_methodology.py`:
   - `standaloneExample`: acepta `npm create vite`, `create-next-app`,
     `dart create`, «Nuevo proyecto» de Xcode, `cp -R examples/…` y la vía nube.
   - `guidedDemo`: acepta demos que aprovisionan recursos cloud y demos que
     crean un proyecto Xcode y lo compilan. Ahora también reconoce artefactos de
     configuración (`conf`, `service`, `env`, `ini`, `toml`).
   - `execution`: acepta las CLI reales de operación (`ssh`, `systemctl`,
     `nginx`, `certbot`, `ufw`, `restic`, `redis-cli`, `openssl`, `k6`, …).
   - `deliberateFailure`: acepta «provocar deliberadamente» y el orden inverso.
2. **Reescritura real de contenido** en temas que fallaban de verdad:
   `java/modulo-9.md` T3, `java/modulo-8.md` T2 y `java/modulo-15.md` T6.

## Regla de oro

**No aflojar el auditor para maquillar deuda.** Antes de tocar una expresión
regular, leer el tema y decidir si el contenido ya existe (falso negativo) o
falta (reescribir). Ampliar la lista de herramientas reales es legítimo;
aceptar una mención como si fuera una demostración, no.

## Los 5 temas que faltaban (resueltos)

| Tema | Qué se hizo |
|---|---|
| `android/modulo-13` T5 | La demo ahora produce `README.md` con memoria, térmica y arranque; el auditor reconoce el artefacto |
| `devops/modulo-5` T7 | El laboratorio arranca de carpeta vacía creando `deployment.mjs`, `package.json` y el test; se citó la fuente oficial |
| `foundations/modulo-7` T5 | Se reconoce `dotnet` como ejecución y `.cs`/`.csproj` como artefactos; el ejemplo crea el proyecto desde cero |
| `rutaflow/modulo-5` T5 | El cierre pide la salida de las pruebas y el rechazo de `NoRoute` |
| `spring-boot/modulo-15` T8 | La demo crea `Main.java` y `test.sh`, se citó la fuente y el cierre pide la compilación |

## Cómo encontrar los temas exactos

```bash
python3 - <<'PY'
import json
from collections import defaultdict
data = json.load(open("docs/seven-step-methodology.json"))
near = defaultdict(list)
for track, topics in data["topics"].items():
    for topic in topics:
        missing = [k for k, v in topic["criteria"].items() if not v]
        if len(missing) == 1:
            near[missing[0]].append((track, topic["module"], topic["topic"]))
for key, items in near.items():
    print(f"\n## {key} ({len(items)})")
    for track, module, title in items:
        print(f"  {track}/modulo-{module}: {title}")
PY
```

## Verificación tras cada tanda

```bash
python3 scripts/audit_seven_step_methodology.py
python3 scripts/audit_lesson_substance.py --update-baseline   # solo si la deuda baja
python3 scripts/build_repo_graph.py
./scripts/validate.sh
```

`audit_lesson_substance.py --strict` es el candado nuevo: impide que un tema
nazca con secciones repetidas, cola pegada o andamiaje genérico.
