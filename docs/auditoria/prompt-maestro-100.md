# Auditoría para llegar al 100 % de los ítems del prompt maestro

**Fecha:** 2026-11-20 · **Medición:** `python3 scripts/audit_master_prompt_items.py` sobre los
**1608 temas indexados** en los 16 cursos (`web/public/content/topic-index.json`).

El prompt maestro tiene dos clases de ítems. Los de la **sección 4** (los 12 puntos de la definición
de terminado) son comprobables tema por tema: eso es lo que mide este informe. Los de las secciones 1,
2, 3, 5, 6, 8, 9 y 10 son de proceso y de aparato; esos se auditan aparte y se listan al final, porque
varios apuntaban a cosas que ya no existen.

## 1. Estado de los 12 puntos, medido

Cero temas de los 1608 cumplen los doce puntos hoy. Esta es la deuda por punto:

| Punto | Qué exige la sección 4 | Cumplen | % | Temas pendientes | La pieza que ata |
|---|---|---:|---:|---:|---|
| P1 | Encabezado con nivel y duración + prerrequisitos | 350 | 22 % | 1258 | solo 732 temas declaran nivel y minutos en el encabezado; 854 escriben prerrequisitos como rótulo |
| P2 | Objetivo verificable | 1314 | 82 % | 294 | |
| P3 | Por qué importa, con caso real | 1421 | 88 % | 187 | los 187 temas de Microservicios: la ficha no tiene punto «por qué importa» |
| P4 | Explicación sencilla y precisa + analogía | 1281 | 80 % | 327 | |
| P5 | Ayuda visual propia | 939 | 58 % | **669** | Java 96, Cloud 82, Spring Boot 77, Control 73, Node 49 |
| P6 | Ejemplo ejecutable con nombre de archivo | 1605 | 100 % | 3 | |
| P7 | Explicación por bloques del código | 1214 | 75 % | 394 | |
| P8 | Captura real + resultado en texto | **9** | **1 %** | **1599** | solo 43 temas tienen una imagen con texto alternativo; 58 tienen un bloque «Salida» |
| P9 | Fallo deliberado con error exacto | 1543 | 96 % | 65 | |
| P10 | Ejercicios en tres niveles | 1098 | 68 % | 510 | 1093 temas tienen la práctica guiada; el escalón independiente o el reto faltan en 510 |
| P11 | Checklist de salida y siguiente paso | 1288 | 80 % | 320 | |
| P12 | Aporte al proyecto integrador + fuentes con fecha | 74 | 5 % | **1534** | 1311 temas mencionan el proyecto; solo 772 tienen sección de fuentes y solo 301 una fecha |

Lo que más trabajo cuesta no es lo que parecía: **P8 (capturas reales) y P12 (fuentes fechadas) están
prácticamente sin hacer en toda la academia**, y son los dos que el prompt pide en su definición de
terminado. P5 (diagrama por tema) tiene 669 pendientes repartidos, no concentrados en un curso.

## 2. Los dos formatos de tema, medidos por separado

| Función | Formato estándar (1421 temas) | Ficha de Microservicios (187 temas) |
|---|---:|---:|
| Nivel y duración en el encabezado | 732 | **0** — la ficha no lleva sufijo `· Nivel · XX min` |
| Prerrequisitos | 667 | 187 |
| Objetivo | 1127 | 187 |
| Por qué importa | 1421 | **0** |
| Analogía / modelo mental | 1094 | 187 |
| Explicación por bloques | 1027 | 187 |
| Código con nombre de archivo | 1418 | 187 |
| Fallo deliberado | 1358 | 185 |
| Práctica guiada | 1093 | 185 |
| Práctica independiente o reto | 1119 | **19** |
| Proyecto integrador | 1311 | **0** |
| Fuentes | 756 | 16 |
| Fecha | 183 | 118 |
| Captura con texto alternativo | 43 | **0** |
| Bloque de salida en texto | 54 | 4 |

Lectura: la ficha de Microservicios es la más completa en estructura fija (14 puntos siempre presentes)
pero le faltan exactamente cuatro cosas: **nivel y duración, «por qué importa», aporte al proyecto y
capturas reales**. El formato estándar tiene esas cuatro, pero le falta sistemáticamente lo que la
ficha sí tiene: objetivos, prerrequisitos y cierres escritos como rótulo reconocible.

## 3. Qué se arregló en la medición para poder ver esto

Sin estos tres cambios el número del 100 % no era audible, y la suite seguía dando verde:

1. **`scripts/audit_track_master_prompt.py`** — su `topic_blocks()` solo reconocía `### Tema N:`. Para
   Microservicios devolvía la lista vacía y el informe publicaba `T5 ⬜ 0/0`, que en una tabla en verde
   se lee «nada que medir». Ahora reconoce la ficha por su primer punto, igual que el índice web: Microservicios
   mide `easy 187/187` y su T5 pasa a **cumple**; su T1 sigue **pendiente de verdad** porque las fichas
   no declaran nivel.
2. **`scripts/audit_lesson_assets.py --docs-counts`** — comprobaba la cifra declarada solo en `CLAUDE.md`.
   `MASTER-PROMPT.md` llevaba diciendo «289 módulos · 1420 temas» mientras Microservicios añadía 187 temas,
   porque nadie la medía. Ahora el gate compara las tres declaraciones (`CLAUDE.md`, `README.md` y
   `MASTER-PROMPT.md`) contra el índice, y la cifra del prompt se corrigió a la medida (16 · 324 · 1608).
3. **`scripts/validate.sh`** — engancha el informe nuevo en modo frescura (`--check`), no como umbral:
   un umbral puesto ahora legalizaría el 1 % de P8. La puerta de umbral se pondrá cuando el punto exista
   en todos.

## 4. Ítems del prompt que NO son medibles con este auditor

Hay que decirlo para no vender un 100 % falso:

- **Sección 6 (rúbrica 1–5, mínimo 4 en todo y 5 en exactitud, estudiante simulado, máximo tres rondas).**
  Es revisión humana o de otro agente; ninguna estructura de Markdown la acredita. Lo automatizable es el
  aparato: que exista la puntuación por tema. Hoy no hay ningún registro de puntuaciones.
- **Sección 1.6 (quien escribe no aprueba).** Requeda trazabilidad por agente, no contenido.
- **Sección 8 (la app dibuja las 12 secciones con los mismos componentes en todos los cursos).**
  Es de la app, no del texto; se comprueba en navegador y en la hoja de criterios de specs/021 (Z10).

## 5. Apuntadores rotos que impedían auditar (comprobados uno por uno)

| Dónde | Qué decía | Realidad comprobada | Estado |
|---|---|---|---|
| `MASTER-PROMPT.md:62` | el mapa de temas oficiales vive en `docs/official-topic-coverage.json` | ese archivo **no existe**; el que lee el criterio T3 de `audit_track_master_prompt.py` es `docs/official-topic-atlas.json` | **corregido** |
| `docs/reestructuracion/FORMATO-UNICO.md:27` vs `:63` | el encabezado de tema es **siempre** `### Tema N: … · Nivel · NN min` | contradice a su propia sección de Microservicios, que exime a la ficha de 14 puntos; medido: `validate_formato.py:35` usa `^### (.+)$` para ese curso, pero `audit_topic_order` y `audit_topic_citations` siguen atados a `### Tema N:`, así que el orden y las citas de las 187 fichas **no están comprobados** | **corregido** con la excepción escrita y su consecuencia |
| `specs/README.md:8`, `CLAUDE.md:24`, `CONTINUAR.md:43` y `:112` | «el repositorio solo tiene la rama `main`» | `origin` sí tiene solo `main`, pero **el repo local conserva 6 ramas viejas** (`git branch`) | **corregidas** las cuatro líneas |
| `docs/reestructuracion/fusion-2026-11-20.md:5` | el trabajo del dueño está «íntegro» en las ramas `respaldo/dueno-local-2026-11-20` y `respaldo/dueno-wip-2026-11-20` | **esas ramas no existen** (`git for-each-ref \| grep respaldo` vacío): las borró `~/Downloads/imperial-verificacion/main-y-limpiar-ramas.command:11-13` al quedar contenidas en `main`. Los dos HEAD (`c77513d6`, `a377c1d9`) **sí son ancestros de `main`** y el material está también en `imperial-final.bundle` como `dueno-local` y `dueno-local-wip`; lo sin commitear está en el `stash` de hoy | **corregido** |
| `docs/reestructuracion/CONTINUAR.md:88` | Java con 0 temas escritos y 0 verificados | Java tiene **14 registrados** (`temas-escritos.txt`, sin `;verificado`) y su laboratorio `modulo-0` **falla** 2 aserciones | **corregido**, con el resultado real del Gradle |
| `docs/reestructuracion/CONTINUAR.md:143` | «escribir 2.212 temas» | la columna «Por escribir» de `ESTADO-DE-TEMAS.md` suma **2.198** (2.385 − 187) | **corregido** |
| `docs/reestructuracion/CONTINUAR.md:144` | faltan los temarios de 12 cursos, incluidos Docker, Kubernetes y Diseño de sistemas | esos tres **ya tienen temario en propuesta** (`docs/temarios/docker.md`, `kubernetes.md`, `diseno-de-sistemas.md`); falta la versión extendida y la aprobación | **corregido** |
| `docs/reestructuracion/CONTINUAR.md:147` | «migrar a Kotlin DSL los 52 builds Groovy de `examples/`» | 52 `build.gradle` en Groovy es cierto, pero hay además **57 `pom.xml`** (55 fuera de Microservicios) y 83 `build.gradle.kts` | **corregido** |
| `docs/reestructuracion/CONTINUAR.md:189` | módulos «de 4 a 7 temas» | `FORMATO-UNICO.md:23` dice 3 a 7 y **ningún validador mide el tamaño**; lo publicado va de 1 a 17 temas (11 módulos de 1–2, 32 de 8+) | **corregidos** los dos, con la medición |
| `docs/reestructuracion/CONTINUAR.md:47` | AWS tarda «unos 16 s» en estar `healthy` | `README.md:34` mide y dice **entre 15 y 45 segundos** | **corregido** |
| `docs/reestructuracion/CONTINUAR.md:130` | regenerar el wrapper a **9.9.2** | el piloto Java fija **9.8.2** (`cursos/java/CURSO.md:140` y sus dos `gradle-wrapper.properties`) mientras Microservicios usa 9.9.2: conviven dos versiones «oficiales» | **anotado como decisión pendiente del dueño** |
| `docs/reestructuracion/CONTINUAR.md:19` | los módulos de cada curso se declaran en `web/src/app/tracks/<curso>.track.ts` | hay **15 archivos para 16 cursos**: Cloud no tiene `.track.ts`, vive inline en `web/src/app/course-data.ts:42` (`COURSE_MODULES`) y se registra en `:874` | **corregido** |
| `docs/reestructuracion/ESTADO.md:25` | temarios aprobados: Java, Gradle y Spring (3) | `grep «Aprobado por el dueño» docs/temarios/*-objetivo.md` da **8** (añade Microservicios, Fundamentos, Flutter, iOS, Angular); CONTINUAR ya decía 8 | **corregido**, y limpiadas las 4 líneas de estado contradictorias dentro de los propios temarios aprobados |

Rechacé tres afirmaciones de los barridos previos que resultaron ser falsas al comprobarlas:
`scripts/validate_specs.py --run` **sí** existe, `scripts/render_terminal_capture.py` **sí** existe, y
**no existe** ninguna frase «todas las rutas (13 rutas)» en `specs/` (la fila que lo afirmaba en la primera
versión de este informe se eliminó: `specs/README.md` son 25 líneas y no declara recuentos de rutas).

Rechacé dos afirmaciones del barrido que resultaron ser falsas al comprobarlas: `scripts/validate_specs.py --run`
**sí** existe (flag en la línea 81) y `scripts/render_terminal_capture.py` **sí** existe.

## 6. Ruta al 100 %, por coste

El orden importa porque los puntos caros (P8, P12) requieren ejecutar cosas en la máquina del dueño.

| Lote | Qué hace | Temas que desbloquea | Depende de |
|---|---|---|---|
| **1. Sin coste de máquina** | P12 en el formato estándar: sección de fuentes con fecha de consulta (772 ya tienen fuentes, 183 con fecha) y P2/P11 donde faltan como rótulo | ~800 | solo redacción |
| **2. Etiquetado de Microservicios** | añadir nivel y minutos a las 187 fichas, su punto «por qué importa» y su aporte al proyecto (187×3) | P1 187, P3 187, P12 187 | decisión del dueño: ampliar la ficha o migrarla al formato de 12 secciones |
| **3. Diagramas** | P5 en los 669 pendientes, empezando por Java (96), Cloud (82) y Spring Boot (77) | 669 | ninguno |
| **4. Laboratorio y capturas** | P8: generar la captura real por tema con `scripts/render_terminal_capture.py` y su bloque de salida. Es el lote grande y va por curso cerrado | 1599 | Docker, Gradle, Xcode, Flutter en el Mac del dueño |
| **5. Ejercicios** | P10: escribir el escalón independiente y el reto donde solo existe el guiado | 510 | proyecto guía por curso definido |

El lote 4 no se puede acelerar: el prompt prohíbe capturas inventadas (sección 1.2). Mientras no se ejecute,
P8 se queda en 1 % y **el 100 % de la sección 4 no es alcanzable con solo editar texto**.
