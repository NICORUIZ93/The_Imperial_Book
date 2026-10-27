---
name: academy-flow-inspector
description: Inspecciona The Imperial Book (la app Angular en web/) como lo haría un humano que la usa de verdad -- navegando catálogo -> ruta -> módulo -> tema -- para encontrar errores de flujo (enlaces rotos, diagramas que no renderizan, excepciones de consola, páginas donde el DOM no coincide con lo que el Markdown promete) y para confirmar que cada tema tiene explicación y ejemplo reales, no solo que "aparece en el índice". Usa esta skill siempre que el usuario pida auditar, inspeccionar, revisar de inicio a fin, validar el flujo, o encontrar errores/bugs en la app, los cursos, las rutas, los módulos o los temas de The Imperial Book -- incluso si no menciona "inspector", "QA" o "end to end" explícitamente. También aplica cuando pregunte si "todos los temas tienen ejemplo y explicación" o si algo "se ve mal" al navegar un curso.
---

# Academia Flow Inspector

Esta skill es para un proyecto concreto: The_Imperial_Book, una academia de 14 rutas / 236 módulos /
983 temas servida por una sola app Angular (`web/`). El contenido real vive en Markdown
(`web/public/content/<track>/modulo-N.md`); la app lo renderiza con `marked` y `lesson-viewer.ts`
le añade estructura por tema (`.topic-card`, callouts, prompts de estudio, etc.).

El objetivo es responder dos preguntas que los validadores existentes **no** responden:

1. ¿Lo que el Markdown promete se ve igual una vez que Angular lo renderiza de verdad en un
   navegador? (diagramas que no compilan, bloques de código que no aparecen, excepciones de JS,
   enlaces internos rotos, estados de error visibles)
2. ¿El recorrido real -- catálogo, elegir ruta, abrir módulo, leer tema, pasar al siguiente -- se
   siente coherente para alguien que llega por primera vez, o hay saltos/inconsistencias que solo
   se notan mirando la página real?

**No vuelvas a inventar lo que ya existe.** `scripts/audit_topic_learning_quality.py` y
`scripts/audit_seven_step_methodology.py` ya evalúan, sobre el Markdown, los 9 criterios
editoriales de `docs/editorial-contract.md` (explicación, código, ruta de archivo, comando
ejecutable, resultado esperado, práctica, proyecto, modelo mental, límites) para los 983 temas.
Si un tema no tiene ejemplo o explicación, esos scripts ya lo saben -- correrlos es más rápido y
más fiable que leer markdown a mano. Esta skill empieza por ahí y se concentra en la capa que
esos scripts no pueden ver porque nunca abren un navegador: renderizado real y flujo de
navegación. Ver `references/criteria-mapping.md` para la tabla completa de qué corresponde a cada
capa.

## Flujo de trabajo

### 1. Reusa las auditorías de contenido (no las repitas)

```bash
python3 scripts/audit_topic_learning_quality.py --check --require-practicable
python3 scripts/audit_seven_step_methodology.py --check
```

Lee `docs/topic-learning-quality.json` y `docs/seven-step-methodology.json`: ya traen, por tema,
qué criterio falta. Si el usuario preguntó "¿todos los temas tienen ejemplo y explicación?", la
respuesta a esa pregunta específica sale de aquí, no de abrir el navegador 983 veces.

### 2. Decide el alcance con el usuario

Barrer las 236 páginas de módulo con un navegador real toma varios minutos. Antes de lanzarlo,
confirma el alcance si no es obvio por el pedido: ¿toda la academia, una ruta, o un módulo? Si el
usuario ya fue específico ("revisa Fundamentos", "la ruta de Angular"), no hace falta preguntar.

### 3. Barrido automatizado de renderizado y flujo

Necesitas la app corriendo. Si no hay un servidor activo:

```bash
cd web && npm start    # deja esto corriendo en segundo plano; sirve en http://localhost:4200
```

Luego, desde la raíz del repo:

```bash
PLAYWRIGHT_CHANNEL=chrome node .claude/skills/academy-flow-inspector/scripts/sweep_topics.cjs \
  --base-url=http://127.0.0.1:4200 \
  --tracks=foundations,devops \
  --out=docs/app-flow-inspection.json
```

Omite `--tracks` para barrer las 14 rutas. El script visita cada página `/curso/<track>/<modulo>`,
y por cada `.topic-card` revisa: que el conteo de temas coincida con `topic-index.json`, que los
diagramas `pre.mermaid` hayan producido un `<svg>` real, que exista el bloque de prompts de
estudio generado por `lesson-viewer.ts`, que no haya excepciones de consola/JS, y que los enlaces
internos de cada tema no devuelvan error. Escribe un JSON con un hallazgo por fila (severidad,
segmento de flujo, tema, mensaje) -- no un simple pase/falla. Usa `--concurrency` para ajustar
velocidad si la máquina lo permite.

Lee el reporte generado. Trata cada hallazgo como una pista a confirmar, no como una afirmación
final: un falso positivo ocasional (por ejemplo una carrera de red en una sola página) es más
probable que un bug real repetido en varios módulos.

### 4. Capa humana: inspección visual con el navegador

El script anterior no puede juzgar si una lección "se siente bien" para alguien que la lee por
primera vez -- solo detecta roturas estructurales. Para eso, abre el navegador (Claude in Chrome o
el navegador integrado, según cuál esté disponible en esta sesión) y mira con tus propios ojos:

- **Todo lo que el barrido marcó como hallazgo**, para confirmar si es un bug real o un falso
  positivo, con una captura como evidencia.
- **Una muestra al azar** de 1-2 temas por ruta inspeccionada que el barrido NO marcó, para
  detectar lo que un script no puede: texto que no se lee natural, un ejemplo que no conecta con
  el caso real, un callout que contradice el texto, un layout roto en móvil.
- El **recorrido de entrada**: desde `/catalogo` o `/`, haz clic como lo haría alguien nuevo --
  elegir una ruta, abrir el primer módulo, pasar al siguiente tema, volver al catálogo -- y anota
  cualquier punto donde el camino no sea obvio o se rompa la navegación (progreso que no se
  guarda, breadcrumbs inconsistentes, botones que no responden).

No necesitas abrir los 983 temas a mano: el barrido ya cubrió la escala; esta capa es para
calidad humana sobre una muestra con sentido, no para repetir el barrido con tus ojos.

### 5. Reporta hallazgos, no un veredicto global

Nunca resumas el resultado como "todo bien" o "todo mal". Usa esta tabla (agrega filas, no
resumas de más):

| Ruta/Módulo/Tema | Capa | Segmento | Severidad | Hallazgo | Evidencia |
|---|---|---|---|---|---|
| foundations/12 · Tema 5 | renderizado | diagrama | error | Mermaid no generó `<svg>` | captura o mensaje de consola |
| devops/8 · Tema 2 | contenido | código | warning | Falta `expectedResult` según audit_topic_learning_quality.json | ruta del JSON |

Cierra siempre con lo que NO se revisó (por ejemplo, rutas fuera del alcance acordado, o que el
barrido corrió con el servidor de desarrollo y no con el build de producción) -- es el mismo
estándar de `docs/editorial-contract.md`: no reclames más cobertura de la que realmente hiciste.

## Qué NO hacer

- No reescribas los 9 criterios editoriales a mano revisando Markdown: ya están automatizados.
- No conviertas un hallazgo del barrido en un veredicto sin mirarlo tú mismo cuando sea relevante
  para la respuesta que le vas a dar al usuario.
- No reportes "983/983 temas verificados visualmente" -- nunca es cierto a esa escala; sé preciso
  sobre cuántos se inspeccionaron con el navegador y cuántos solo pasaron por el barrido o las
  auditorías estáticas.
