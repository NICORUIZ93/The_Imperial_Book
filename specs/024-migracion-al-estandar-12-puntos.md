# 024 · Migración al estándar de la sección 4, una ruta por lote

**Estado:** en curso
**Origen:** 2026-11-21, orden del dueño: *«quiero que apliques el plan de acción del prompt de manera
estricta desde ya hasta dejar todo al 100 y siguiendo lo que dice el prompt»*. Este documento no inventa
criterios: convierte en verificables la sección 4 (definición de terminado), la 6 (rúbrica y revisión
independiente) y la 7 (una ruta por lote) de [`../MASTER-PROMPT.md`](../MASTER-PROMPT.md).

Medición de partida, ejecutada el 2026-11-21 sobre los 1608 temas:

| punto | cumplen | punto | cumplen |
|---|---:|---|---:|
| P1 encabezado con nivel, duración y prerrequisitos | 350 | P7 explicación por bloques | 1214 |
| P2 objetivo verificable | 1314 | **P8 captura real + salida en texto** | **28** |
| P3 por qué importa con caso real | 1421 | P9 fallo deliberado | 1543 |
| P4 analogía con su límite | 1281 | P10 ejercicios en tres niveles | 1098 |
| P5 ayuda visual propia | 939 | P11 checklist y siguiente paso | 1288 |
| P6 ejemplo ejecutable con nombres | 1605 | P12 proyecto integrador y fuentes fechadas | 74 |

Cero temas cumplen los doce a la vez: la intersección no puede superar a P8 (28).

Medición actual, también del 2026-11-21, después de cerrar el capítulo 0 de Fundamentos y de corregir el
reconocimiento de los dos detectores que estaban ciegos (`audit_master_prompt_items.py` leía mal los rótulos
partidos en dos renglones y `validate_official_sources.py` contaba como valla el marcador `~~~~~~~~~^^^` de los
tracebacks de Python 3.14, lo que ocultaba cuatro fuentes):

| punto | cumplen | punto | cumplen |
|---|---:|---|---:|
| P1 | 355 | P7 | 1215 |
| P2 | 1315 | **P8** | **34** |
| P3 | 1421 | P9 | 1543 |
| P4 | 1281 | P10 | 1099 |
| P5 | 944 | P11 | 1289 |
| P6 | 1605 | P12 | 79 |

Ninguna deuda de partida subió: los doce contadores son mayores o iguales que los de la tabla anterior. P8 pasó
de 28 a 34, P12 de 74 a 79 y P1 de 350 a 355 al cerrar los seis temas de `foundations/modulo-0` y al reparar los
dos detectores. La intersección sigue siendo cero porque ningún tema de los otros 15 cursos tiene a la vez
captura real (P8) y fuentes con fecha (P12).

## 1. Reglas de ejecución

1. **Una ruta por lote** (sección 7). Dentro de la ruta, un capítulo por entrega, y cada entrega se sube a
   `main` al cerrarse (sección 1.7 y orden del dueño de 2026-11-20).
2. **Orden de las rutas por dependencia, no por conveniencia:** Fundamentos → JavaScript → Node → React →
   Java → Spring Boot → Microservicios → DevOps → Cloud → Angular → Flutter → iOS → Kotlin Multiplatform →
   RutaFlow → Android → Control 1. Fundamentos abre porque los prerrequisitos de las demás rutas lo citan.
3. **Un tema no se marca `hecho` sin revisión de un agente que no lo escribió** (sección 1.6 y 6), con la
   rúbrica 1–5 registrada en `docs/revision/<curso>.tsv`: se publica con 4 o más en los ocho criterios y
   5 en exactitud técnica.
4. **Nada inventado** (sección 1.2). La captura de P8 se genera ejecutando el ejemplo de este mismo tema en
   esta máquina con `scripts/render_terminal_capture.py`; si el ejemplo no corre, el tema queda `pendiente`
   con el motivo y no se simula la salida.
5. **La deuda medida nunca aumenta** (sección 1.8): cada entrega vuelve a medir y compara contra la fila de
   partida de esta spec.

## 2. Criterios

El formato de estos criterios es el que parsea `scripts/validate_specs.py`: identificadores y estados del
vocabulario (`pendiente`, `en-curso`, `hecho`, `descartado`) y una línea `Verificación:` con el comando
literal. Ningún criterio se marca `hecho` si su comando no pasó en esta máquina hoy.

- **C1** `hecho` — El medidor de P8 reconoce la captura real y no la figura dibujada, y acepta la forma
  `**Resultado esperado:**` que escribe la sección 4. Antes exigía la literal `Resultado:` (no contaba 34
  temas) y daba por captura cualquier imagen con alt (contaba 15 figuras que no capturan nada).
  Verificación: `python3 scripts/audit_master_prompt_items.py --check`
- **C2** `pendiente` — Registro de revisión independiente por tema (secciones 1.6 y 6) en
  `docs/revision/<curso>.tsv`: ocho notas de la rúbrica, autor y revisor distintos, fecha ISO, y publicado
  solo con 5 en exactitud y 4 o más en lo demás. El script existe; la primera fila real se escribe con el
  capítulo 0 de Fundamentos, revisada por un agente que no redactó ese capítulo.
  Verificación: `python3 scripts/validate_revision.py --curso foundations`
- **C3** `pendiente` — Fundamentos migrado al formato único de 12 secciones de
  `docs/reestructuracion/FORMATO-UNICO.md`, en orden, con encabezado `### Tema N: título · Nivel · NN min`,
  y el curso declarado en `docs/reestructuracion/cursos-en-formato.json`.
  Verificación: `python3 -c "import json,sys;sys.exit('foundations' not in json.load(open('docs/reestructuracion/cursos-en-formato.json'))['cursos'])" && python3 scripts/validate_formato.py --check`
- **C4** `pendiente` — Los 105 temas de Fundamentos cumplen los doce puntos de la sección 4. Medido el
  2026-11-21 con el capítulo 0 cerrado: 6 de 105 cumplen los doce; deben P1 97, P8 96, P12 80, P5 26, P11 18,
  P2 2, P4 3, P7 2, P10 3, P6 1, P9 1. Los seis son los temas 1 a 6 de `modulo-0`: el Tema 4 quedó dentro al
  escribir `**Prerrequisitos:** comprobar Python…` en un solo renglón, porque el detector exige contenido en la
  misma línea del rótulo. Cerrar el capítulo costó algo más que etiquetas: los comandos que el lector debe
  escribir nombran el intérprete fijado (`python3.14`, y `py -3.14` en Windows) en vez de un `python3` que en
  esta máquina responde 3.15.2 o 3.9.6 según el `PATH`; las transcripciones se reprodujeron literales con el
  corte a 96 columnas de la herramienta; y se corrigieron tres afirmaciones falsas (un `sha256` inventado en el
  Tema 6, un `segundo.py` que se ejecutaba antes de existir y una secuencia `cd ..` que dejaba al lector en la
  carpeta equivocada para el Paso 5).
  Verificación: `python3 scripts/plan_maestro_items.py --curso foundations`
- **C5** `pendiente` — Cada tema de Fundamentos tiene su ejemplo ejecutado en esta máquina y su captura
  versionada en `web/public/content/figures/foundations/`, enlazada con alt descriptivo y acompañada del
  bloque `**Resultado esperado:**` transcrito de esa ejecución. Si el ejemplo no corre, el tema queda
  `pendiente` con su motivo (sección 1.2): no se simula la salida.
  Verificación: `python3 scripts/audit_lesson_assets.py && [ $(grep -rl 'Captura de terminal' web/public/content/figures/foundations/ 2>/dev/null | wc -l) -ge 105 ]`
- **C6** `en-curso` — Cada capítulo cerrado deja la suite en verde y llega a `main`. Conseguido en la
  maquinaria el 2026-11-21: `python3 scripts/validate.sh` da `validate.sh: ok` tras cerrar las dos puertas
  que el hilo Manus dejó rojas (`specs/022` y `specs/023` ya declaran criterios con comando, y el
  laboratorio Maven `examples/microservicios-spring` lo cita el Tema 1 de `spring-boot/modulo-1.md` después
  de ejecutar sus 5 pruebas en esta máquina). Queda `en-curso` porque el criterio es para los 324 capítulos
  de la campaña, no para el primer paso.
  Verificación: `python3 scripts/validate.sh`
- **C7** `hecho` — La regla 1.3 del prompt («las fuentes caducan a los 120 días y se vuelven a verificar»)
  tiene herramienta: hasta el 2026-11-21 el apuntador `scripts/validate_official_sources.py` no existía y
  nadie podía comprobar una fecha de consulta. Ahora lee la sección de fuentes de cada tema, separa lo que
  es cita de lo que es enlace de ejemplo dentro del código, consulta cada URL por red y versiona el
  resultado. Medido hoy sobre los 1608 temas: 772 declaran fuentes, 1181 URLs oficiales distintas (39 no
  responden), 696 con enlace pero **sin fecha de consulta**, 6 con fecha, 0 caducadas. La deuda de P12 es
  de fecha, no de enlace. El separador de vallas se corrigió hoy mismo: contaba como apertura de bloque el
  marcador `~~~~~~~~~^^^` que Python 3.14 imprime bajo una llamada errónea, lo que dejaba cuatro fuentes del
  Tema 1 de Fundamentos fuera del registro; con el reconocimiento correcto (cierre = mismo carácter, sin info
  string) las URLs medias subieron de 1177 a 1181 y las regiones con fuentes de 770 a 772, y esas cuatro URLs
  respondieron `200` hoy.
  Verificación: `python3 scripts/validate_official_sources.py --check`

## 3. Lotes

| lote | ruta | temas | trabajo principal |
|---|---|---:|---|
| 1 | **Fundamentos** | 105 | P8 (68 capturas nuevas sobre las 28 existentes no cubren este curso), P5, P12, y las 12 secciones |
| 2 | JavaScript | 92 | idem |
| 3 | Node | 78 | P8 y P12 sobre la base Aprende/Practica/Aplica |
| 4 | React | 64 | |
| 5 | Java | 120 | P5 96 pendientes y P8 casi nulo: el curso con más deuda visual |
| 6 | Spring Boot | 123 | |
| 7 | Microservicios | 187 | la ficha le debe nivel y minutos, «por qué importa», aporte al proyecto y capturas |
| 8 | DevOps | 139 | |
| 9 | Cloud | 168 | |
| 10 | Angular | 78 | |
| 11 | Flutter | 119 | |
| 12 | iOS | 69 | |
| 13 | Kotlin Multiplatform | 66 | |
| 14 | RutaFlow | 29 | |
| 15 | Android | 83 | |
| 16 | Control 1 | 88 | examen: decidir el género aparte (tres temas no son lección) |

## 4. Las dos listas de doce, y cuál mide cada puerta

Hay dos estándares de doce elementos y no son el mismo. Confundirlos produce capítulos que pasan una puerta
y siguen rojos en la otra, así que se documentan las dos con su medidor:

- Los **doce puntos** de la sección 4 del `MASTER-PROMPT.md` son requisitos de contenido, reconocidos por
  rótulos (`**Prerrequisitos:**`, `**Resultado esperado:**`, `#### Paso 5 · Práctica guiada`…) y medidos por
  `scripts/audit_master_prompt_items.py` y `scripts/plan_maestro_items.py`. Es lo que mide **C4**.
- Las **doce secciones** de `docs/reestructuracion/FORMATO-UNICO.md` son encabezados numerados obligatorios
  (`#### 1. Ubicación y prerrequisitos` … `#### 12. Cuándo usarlo y cuándo no`), aprobadas por el dueño el
  2026-11-20 como regla de toda la academia, y medidas por `scripts/validate_formato.py`. Es lo que mide
  **C3**.

Medido el 2026-11-21: `validate_formato.py` da 187 de 1608 temas en formato (11 %), y los 187 son las fichas
de Microservicios; Fundamentos está en 0 de 105 porque sus temas reescritos usan la estructura `Paso 1…7`. El
capítulo 0 de Fundamentos cumple los doce puntos y no cumple las doce secciones. Cerrar **C3** exige una
migración de forma sobre el trabajo ya hecho, tema por tema, con contenido nuevo en las secciones que hoy no
existen (Explicación en tres niveles, Mini-laboratorio con «Listo cuando…», Verificación ejecutable, Error
común con Síntoma/Causa/Arreglo, Pregunta con respuesta modelo y Cuándo usarlo y cuándo no). Es el lote
inmediato después de este; no se declara nada hecho hasta que `validate_formato.py` cuente esos temas.

## 5. Fuera de alcance de esta spec

La sección 8 del prompt (la app renderiza las 12 secciones con los mismos componentes en todos los cursos)
vive en `specs/021` (criterio Z10). Los cursos nuevos (Docker, Kubernetes, Diseño de sistemas) viven en
`specs/017`. Esta spec solo lleva el contenido existente al estándar, sin borrar ni retirar ningún tema
(regla 1.8 y 1.9 del prompt).
