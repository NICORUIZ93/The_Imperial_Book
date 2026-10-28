# Continuación: completar la metodología de siete pasos

Estado al corte: **752/1007 temas completos** (deuda 255). Punto de partida de
la sesión: 496. Todo lo subido está en `main` vía PR con CI en verde.

Este documento es la hoja de ruta para retomar el trabajo sin volver a
diagnosticar desde cero.

## Qué ya se hizo (no repetir)

1. **Correcciones de falsos negativos del auditor** (`scripts/audit_seven_step_methodology.py`).
   El auditor no reconocía andamiaje/ejecución reales que las lecciones **ya tenían**:
   - `standaloneExample`: acepta `npm create vite`, `create-next-app`, `dart create`,
     «Nuevo proyecto» de Xcode, `cp -R examples/… ejemplo-…`, y la vía nube (el Paso 4
     crea su propio recurso con `aws/az/gcloud … create`). Siempre exige frase de
     arranque **y** comando real; verificado 0 falsos positivos.
   - `guidedDemo`: acepta demo que aprovisiona recursos cloud (`create/apply/deploy`)
     y demo que crea un proyecto Xcode y lo compila.
   - `execution`: acepta `aws/az/gcloud/sam/serverless/helm` y `xcodebuild/xcrun/dart`.
   - `deliberateFailure`: acepta «provocar deliberadamente …» y el orden inverso
     «… deliberadamente … provoca …», siempre con señal de error/falla/diagnóstico.
   - `learningEvidence`: acepta «entregá … del Paso N» y «Evidencia de aprendizaje: entrega …».

2. **Reescritura real de contenido** (mejoras pedagógicas, no cosméticas):
   - `java/modulo-9.md` T3 (tests parametrizados): fallo deliberado que **falla una
     aserción real** (`@ValueSource` con un no-Fibonacci) y JUnit señala el parámetro.
   - `java/modulo-8.md` T2 (ciclo de vida/scopes): fallo deliberado explícito —
     dependencia de test filtrada al jar de producción, diagnosticada con `jar tf`.
   - `java/modulo-15.md` T6 (SLF4J/MDC): fallo deliberado de contaminación de contexto
     entre solicitudes, diagnóstico por `traceId` incorrecto.

## Regla de oro para continuar

**No aflojar el auditor para maquillar deuda.** Ya se corrigieron los falsos
negativos de vocabulario legítimos. Lo que queda es, en su mayoría, **contenido
real faltante**: cada tema incompleto necesita que se le añada, de verdad, el paso
que le falta (una demostración autocontenida, un fallo deliberado genuino, una
pista, una fuente oficial). Antes de tocar el regex otra vez, **leer el tema** y
confirmar si el contenido ya existe (falso negativo) o falta (reescribir).

Verificación tras cada tanda:
```bash
python3 scripts/audit_seven_step_methodology.py        # regenera reporte
python3 scripts/build_repo_graph.py                    # si cambió el árbol
./scripts/validate.sh                                  # debe dar CÓDIGO 0
```

## Plan priorizado (mayor retorno primero)

### A falta de UN SOLO marcador (48+20+… = ~87 temas, el camino más rápido)

Cada uno ya tiene 16/17; solo falta añadir una pieza concreta:

- **standaloneExample (48)**: cloud 21, ios 12, foundations 8, resto 7.
  Para cloud/ios suele bastar que el Paso 4 arranque creando su propio recurso o
  proyecto; leer cada uno y, si genuinamente depende de un módulo previo,
  reescribir el arranque para que sea autocontenido.
- **guidedDemo (20)**: foundations 7, java 6, node 3, rutaflow 2, angular/spring 1.
  Revisar que el Paso 4 cree un archivo concreto con un verbo de acción, o
  (infra) aprovisione un recurso real.
- **guidedPractice (7)**: react 5, ios 1, java 1. Falta una **«Pista:»** en el Paso 5.
- **closure (4)**: rutaflow 3, foundations 1. Falta un **«Siguiente paso:»** en el Paso 7.
- **resources (2, java)**: falta una **fuente oficial con URL**.
- **prerequisites (2, node)**: falta declarar **prerrequisitos / conocimiento previo**.
- **learningEvidence (2, spring-boot)**: falta **entregar un artefacto concreto**.
- **execution (1, android)**: falta un bloque ```bash con un ejecutable real.
- **deliberateFailure (1, cloud)**: falta un fallo deliberado diagnosticable.

### Deuda mayor por track (requiere reescritura de varios pasos por tema)

- **cloud 66**, **foundations 41**, **kotlin-multiplatform 23**, **spring-boot 19**,
  **ios 18**, **java 18**, **flutter 13**, **devops 13**, **rutaflow 12**, **react 12**.

Sugerencia de orden: terminar primero TODOS los «a falta de uno» (sube el total
rápido y con cambios pequeños y seguros), luego atacar track por track los que
necesitan reescritura más profunda, empezando por foundations (base del
currículo) y cloud (mayor volumen).

## Cómo encontrar los temas exactos

```bash
python3 - <<'PY'
import json
from collections import Counter, defaultdict
data=json.load(open("docs/seven-step-methodology.json"))
near=defaultdict(list)
for tr,topics in data["topics"].items():
    for t in topics:
        miss=[k for k,v in t["criteria"].items() if not v]
        if len(miss)==1: near[miss[0]].append((tr,t["module"],t["topic"]))
for mk,items in near.items():
    print(f"\n## {mk} ({len(items)})")
    for tr,m,topic in items: print(f"  {tr}/modulo-{m}: {topic}")
PY
```

Esto imprime la lista exacta de temas y su marcador faltante para trabajarlos uno a uno.
