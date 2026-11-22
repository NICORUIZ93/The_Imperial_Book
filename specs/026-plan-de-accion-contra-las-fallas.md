# 026 · Plan de acción contra las fallas visibles y la deuda de los cursos

**Estado:** en curso
**Origen:** revisión completa del 2026-11-21 y plan presentado aldueño el 2026-11-22.
**Decisiones aplicadas:** Fase 1 antes que la migración; validadores reforzados antes de migrar;
tres líneas de contenido (Fundamentos, Microservicios, Angular); ramas y stash intactos hasta
confirmación. La migración completa de 1421 temas es una campaña larga: los criterios de las fases 3–5
quedan `pendiente` y se cierran por lotes con su verificación, no se marcan `hecho` por anticipado.

## Medición de partida (2026-11-22, informes regenerados por `validate.sh`)

- 16 cursos, 324 módulos, 1608 temas. Formato único: **187/1608 (11 %)**.
- 12 puntos de la sección 4: **10/1608**; P1 360, P8 40, P12 82.
- Coherencia de código: 1277/1608 temas sin incidencia. C1 39 temas/63 rutas, C2 22, C3 2 temas/5,
  C4 261 temas/357 bloques, C5 4 temas/6 punteros, C6 26 temas/30 rutas.
- Enlaces: 1181 URLs distintas, **39 rotas**, 0 pendientes de comprobar.
- Forma: 1421 temas `### Tema N:`, solo **624** con nivel y duración en 20–45 min (679 sin nivel/minutos
  y 118 fuera de rango); **56** títulos de módulo divergentes entre track y H1.
- Temarios: 8 aprobados, 2385 temas en 379 módulos; 210 IDs escritos, 110 verificados.
- Suite: 42 unitarias y 88 e2e en verde; `validate.sh: ok`.

## 1. Criterios

### Fase 1 — errores visibles

- **C1** `pendiente` — Cero rutas inventadas (C1), estructuras no creadas (C3) y punteros a
  laboratorio inexistente (C5) en `docs/auditoria/coherencia-codigo.csv`: se crean los archivos o se
  corrige el texto para que cada ruta que se usa sea creada por el propio tema o exista en el repo.
  Verificación: `python3 scripts/audit_code_coherence.py && python3 -c "import csv,sys; r=list(csv.DictReader(open('docs/auditoria/coherencia-codigo.csv'))); sys.exit(1 if any(x[k]!='0' for x in r for k in ('C1','C3','C5')) else 0)"`

- **C2** `pendiente` — Cero bloques de código de 4+ líneas sin declarar su archivo (C4), declarando
  `**Archivo:**` o el encabezado que el auditor reconoce, sin inventar contenido nuevo.
  Verificación: `python3 -c "import csv,sys; r=list(csv.DictReader(open('docs/auditoria/coherencia-codigo.csv'))); sys.exit(1 if any(x['C4']!='0' for x in r) else 0)"`

- **C3** `pendiente` — Cero carpetas incoherentes (C2) y cero rutas versionadas que ningún tema manda
  crear (C6): o el tema crea la ruta o el texto explica que ya está clonada (regla de reutilización
  explicada).
  Verificación: `python3 -c "import csv,sys; r=list(csv.DictReader(open('docs/auditoria/coherencia-codigo.csv'))); sys.exit(1 if any(x[k]!='0' for x in r for k in ('C2','C6')) else 0)"`

- **C4** `hecho` — Cero URLs rotas (2026-11-22): las 39 se sustituyeron por fuentes oficiales vivas
  verificadas con `curl -I -L` en tres lotes (control-1, Kotlin/iOS/Java/Spring, y el resto). Se
  regeneró el informe con `--red --urls 1300`: **1181 URLs, 0 rotas, 0 sin comprobar**.
  Verificación: `python3 scripts/validate_official_sources.py --check`

- **C5** `hecho` — Los 797 temas fuera de rango declaran nivel y duración (2026-11-22). La regla es
  derivada del `level`/`duration` del temario aprobado (`scripts/normalizar_tiempos.py`), no
  arbitraria; se corrigió el sufijo `min min` y el orden no decreciente de niveles en 28 módulos
  (`scripts/corregir_orden_niveles.py`). Medición: **1421/1421**.
  Verificación: `python3 scripts/check_tiempos.py --check`

- **C6** `hecho` — Los 56 títulos de módulo se alinearon con el H1 y los 749 conceptos (2026-11-22)
  que anunciaban temas no publicados se derivaron del índice (`scripts/alinear_concepts.py`).
  `audit_track_lesson_titles.py` comprueba ahora ambas cosas.
  Verificación: `python3 scripts/audit_track_lesson_titles.py --check`
  Resultado: 0 títulos y 0 módulos con concepts divergentes.

### Fase 2 — puertas que protegen

- **C7** `hecho` — `validate_formato.py --check` aplica a los 16 cursos, no solo a los declarados,
  y rechaza cursos con 0 temas reconocidos.
  Verificación: `python3 scripts/validate_formato.py --check && grep -q 'cursos_en_formato' scripts/umbrales.json`

- **C8** `hecho` — `check_deuda.py` recibe umbrales de las fases 1 y 3 y sube el suelo tras cada
  lote; la deuda nunca retrocede.
  Verificación: `python3 scripts/check_deuda.py --check`

- **C9** `hecho` — Los e2e de contenido derivan sus conteos de `topic-index.json` en lugar de
  números literales, de modo que un cambio de lección no rompa la suite.
  Verificación: `cd web && npm run e2e`

- **C10** `hecho` — Se eliminan verificaciones frágiles: la recursiva de la spec 011 C3
  (`validate.sh` llamaba a `validate_specs.py`), la dependencia de red de la spec 011 C1
  (`git ls-remote` → etiquetas locales) y el Maven sin caché de la spec 023 C4 (`mvn -o` → `mvn`).
  `validate_specs.py --run` ejecuta cada verificación con timeout de 300 s.
  Verificación: `grep -q 'timeout=300' scripts/validate_specs.py && ! grep -q 'git ls-remote' specs/011-limpieza-total.md && ! grep -q 'mvn -o' specs/023-fase-2-maven-compose-y-presentacion-spring.md`

### Fase 3 — migración de forma (campaña por lotes)

- **C11** `pendiente` — **Lote 1, Fundamentos (88 temas)**: las 12 secciones y los 12 puntos en los
  temas pendientes, partiendo de los 6 ya migrados del capítulo 1. Se cierra capítulo por capítulo.
  Verificación: `python3 scripts/validate_formato.py --check && python3 scripts/audit_master_prompt_items.py --resumen`

- **C12** `pendiente` — **Lote 2, Microservicios (187 temas)**: nivel y minutos, «por qué importa»,
  aporte al proyecto y capturas reales sobre la ficha ya existente.
  Verificación: `python3 scripts/validate_formato.py --check`

- **C13** `pendiente` — **Lote 3, Angular (78 temas)**: 12 secciones y 12 puntos, con foco en las
  4 rutas inventadas y los bloques sin archivo corregidos en la Fase 1.
  Verificación: `python3 scripts/validate_formato.py --check`

- **C14** `pendiente` — Los 13 cursos restantes se migran en lotes de una ruta, con un commit por
  capítulo y `validate.sh` + e2e en verde al cierre de cada lote.
  Verificación: `python3 scripts/validate_formato.py --check`

### Fase 4 — rigor y revisión

- **C15** `pendiente` — `docs/revision/<curso>.tsv` por tema con revisor distinto del autor; `hecho`
  exige revisión registrada.
  Verificación: `python3 scripts/validate_revision.py --curso foundations`

- **C16** `pendiente` — 88 capturas reales en Fundamentos (15 SVG hoy) y cobertura de P8/P12 en los
  tres cursos de las líneas activas.
  Verificación: `python3 scripts/audit_master_prompt_items.py --resumen`

### Fase 5 — cobertura de temarios

- **C17** `pendiente` — Los 8 temarios aprobados se convierten en lecciones publicadas en el orden que
  apruebe el dueño (2385 temas, 210 IDs escritos, 110 verificados). No se escribe ningún tema nuevo sin
  aprobación previa.
  Verificación: `python3 scripts/build_estado_temas.py --check`

## 2. Reglas de ejecución

1. Un criterio solo pasa a `hecho` cuando su verificación se ejecutó en esta máquina y se registró aquí.
2. Todo cambio de contenido lleva detrás `build_web_topic_index.py`, los informes que `validate.sh`
   comprueba y la suite e2e. Un lote no se cierra con validadores rojos.
3. Cero deuda nueva: los contadores de partida son el suelo; `check_deuda.py` lo hace cumplir.
4. Las fases 3–5 se ejecutan por lotes pequeños verificables. Ningún lote se marca `hecho` en bloque.
5. No se borran ramas, stash ni material retirado sin confirmación del dueño.
6. Si el contenido cambia mientras corre un lote, se regeneran los informes antes de cerrarlo.

## 3. Estado del lote (2026-11-22)

Cerrados y verificados en esta máquina: **C4, C5, C6, C7, C8, C9 y C10**. `validate.sh: ok`,
42 unitarias y 88 e2e en verde, `npm run build` correcto. El trinquete recoge las mejoras:
`urls_rotas 39 → 0`, `titulos_divergentes 56 → 0`, `temas_con_nivel_minutos 624 → 1421`,
`temas_sin_incidencia_codigo 1277 → 1284`, más dos techos nuevos para orden de niveles y concepts.

Siguen `pendiente` y se cierran por lotes, no en bloque:

- **C1** — quedan 39 temas con rutas inventadas y 1 estructura no creada (los 6 punteros a
  laboratorio eran falsos positivos: el tema manda crearlos o usa un comodín).
- **C2** — quedan 257 temas con 353 bloques de 4+ líneas sin declarar su archivo. Exigir el nombre
  en fragmentos ilustrativos sin inventar contenido necesita una decisión por bloque.
- **C3** — quedan 22 carpetas incoherentes y 26 rutas versionadas que ningún tema manda crear.

El auditor de coherencia se ajustó para no contar como defectos: comentarios de archivo que terminan
en fin de línea, comentarios HTML (`<!-- … -->`), instrucciones «Crea <archivo>» y rutas con comodín.
Ningún ajuste ocultó una incidencia real: las cuatro correcciones salieron de inspeccionar el texto.
