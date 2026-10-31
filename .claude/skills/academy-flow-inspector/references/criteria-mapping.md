# Qué capa revisa qué

Tres capas, cada una respondiendo algo distinto. No se solapan a propósito.

## Capa 1 — Contenido en el Markdown (ya automatizada, no la repitas)

`scripts/audit_topic_learning_quality.py` evalúa por tema, sobre el texto fuente en
`web/public/content/<track>/modulo-N.md`, estos 9 criterios de `docs/editorial-contract.md`:

| Criterio | Qué detecta |
|---|---|
| `explanation` | El bloque del tema tiene al menos ~90 palabras de prosa |
| `code` | Hay un bloque ```` ``` ```` que no es `mermaid` |
| `filePath` | Se menciona una ruta de archivo o extensión real (`src/`, `.ts`, `.py`, ...) |
| `runCommand` | Aparece un comando ejecutable reconocido (`npm`, `python3`, `docker`, `tofu`, ...) |
| `expectedResult` | El texto dice "resultado esperado" / "salida esperada" / "debe mostrar" |
| `practice` | Hay práctica, ejercicio o laboratorio propuesto |
| `project` | Conecta con el proyecto integrador / RutaFlow |
| `modelMental` | Hay analogía o "por qué es importante" |
| `limitsDecision` | Se explicitan límites, cuándo no usarlo, o un trade-off |

`scripts/audit_seven_step_methodology.py` evalúa, también sobre el Markdown, si el tema completa
las 7 etapas (objetivo, contexto, teoría, demostración, práctica guiada, práctica independiente,
cierre y evidencia) que usan los módulos nuevos (ver `web/public/content/foundations/modulo-12.md`
como ejemplo de la forma esperada).

Estos scripts ya corren dentro de `./scripts/validate.sh` y escriben `docs/topic-learning-quality.json`
y `docs/seven-step-methodology.json`. Si necesitas saber qué tema le falta un ejemplo o una
explicación, lee esos JSON -- no releas el Markdown a mano.

## Capa 2 — Renderizado y flujo en el DOM real (`scripts/sweep_topics.cjs`)

El script de esta skill visita cada página `/curso/<trackId>/<moduleId>` con un navegador real y
compara contra lo que el Markdown promete. No decide si el contenido es bueno; decide si lo que
ya pasó la Capa 1 llegó intacto a la pantalla:

| Señal en el DOM | Qué implica si falla |
|---|---|
| `.topic-card` por tema, contadas | El componente no generó una tarjeta por cada tema esperado |
| `pre.mermaid svg` por cada `pre.mermaid` | El diagrama no compiló (mermaid tiró error silencioso) |
| `.topic-learning-prompts` presente, `textarea` no vacío | `lesson-viewer.ts` no generó los prompts de estudio para ese tema |
| `.lesson-error[role="alert"]` ausente | La lección cargó sin error visible |
| eventos `console` tipo `error` / `pageerror` | Hubo una excepción de Angular/JS al renderizar |
| `a[href]` internos resuelven (no 4xx/5xx) | Los enlaces entre temas/rutas no están rotos |

El script exporta un hallazgo por fila con `severity` (`error`/`warning`), `segment` y `message` —
úsalo como lista de pistas, no como aserción absoluta; confírmalas en la Capa 3 cuando importen
para la respuesta final.

## Capa 3 — Juicio humano sobre una muestra (navegador, visión)

Lo que ninguna de las dos capas anteriores puede medir:

- ¿El ejemplo básico realmente ayuda a entender antes del caso real, o se siente pegado?
- ¿La analogía es correcta y no contradice la teoría?
- ¿El layout se ve bien en móvil, hay texto cortado, un botón fuera del viewport?
- ¿El recorrido de "elegir ruta -> abrir módulo -> siguiente tema" es obvio para alguien nuevo?

Esta capa cubre solo una muestra (todo lo que la Capa 2 marcó, más 1-2 temas al azar por ruta
inspeccionada) porque no escala a los 1100 temas en una sesión razonable. Documenta siempre cuántos
temas pasaron por aquí realmente, frente a cuántos solo pasaron por las Capas 1 y 2.
