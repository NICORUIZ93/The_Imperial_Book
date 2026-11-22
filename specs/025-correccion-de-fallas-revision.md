# 025 · Corrección de las fallas encontradas en la revisión de 2026-11-21

**Estado:** hecho (C1–C9, C13–C16); C10–C12 quedan `pendiente` como campañas de contenido de la spec 024.
**Origen:** revisión completa del repositorio (app, contenido, validadores y CI) del 2026-11-21.
Esta spec convierte los hallazgos verificados en criterios. Los que no se pueden cerrar en un lote
quedan `pendiente` con su comando: la deuda no se marca `hecho` sin pasar la verificación.

## Medición de partida

- `npm test -- --watch=false`: 10 ficheros, 37 pruebas en verde.
- `scripts/validate_specs.py --run`: 16 specs, 99 criterios (59 hechos, 38 pendientes, 2 en curso), todos los verificables pasan.
- `scripts/validate.sh`: `validate.sh: ok`.
- Formato único: 187/1608 temas (solo Microservicios). Los 12 puntos de la sección 4: 10/1608 temas completos; P8 38/1608, P12 82/1608.
- `docs/revision/` no existe: la revisión independiente (sección 1.6 del prompt) no está registrada.

## Hallazgo descartado por medición

El informe de revisión decía que `docker-compose.yml` no define `healthcheck` y que `README.md:34`
prometía un estado «healthy» imposible. **Falso**: la imagen `floci/floci:2.2.0` trae
`HEALTHCHECK CMD /usr/local/bin/healthcheck.sh` (medido con `docker inspect` el 2026-11-21) y
`docker compose ps` muestra `health: starting` / `healthy`. No se cambia nada ahí.

## 1. Criterios

- **C1** `hecho` — El enlace «Abrir lección» del temario pasa un índice numérico 1-based a la ruta
  `:topicIndex`, igual que el visor y la paleta; antes generaba `tema-<n>`, que daba `NaN` y abría la
  lección sin enfocar el tema. Se añade prueba unitaria del enlace.
  Verificación: `cd web && npm test -- --watch=false && npx playwright test e2e/academy.spec.ts --grep 'temario: solo publica'`

- **C2** `hecho` — La paleta de búsqueda, al abrirse desde un botón, recibe el foco, guarda y
  restaura el foco anterior, limpia consulta y selección al cerrar y marca el fondo como `inert` mientras
  `aria-modal="true"` está activo. Antes solo funcionaba con el atajo de teclado. El atajo `⌘K` de la
  interfaz se calcula igual en macOS que en Windows/Linux (C2 de la spec 023 usa `git ls-remote`, que
  tampoco está garantizado en el CI; queda documentado como deuda fuera de este lote).
  Verificación: `cd web && npm test -- --watch=false && npx playwright test e2e/academy.spec.ts --grep 'specs/025 C2'`

- **C3** `hecho` — El enlace «Saltar al contenido principal» funciona en `/temario` y
  `/temario/:stackId` (los dos `<main>` llevan `id="main-content"`), y se elimina la aserción no nula
  de `curriculum-stack.html:82`, que rompería la plantilla con un tema candidato sin lección.
  Verificación: `test "$(grep -l 'id="main-content"' web/src/app/catalog/curriculum-library.html web/src/app/catalog/curriculum-stack.html | wc -l | tr -d ' ')" = 2 && ! grep -q 'current!' web/src/app/catalog/curriculum-stack.html`

- **C4** `hecho` — Copiar código informa del fallo si el navegador deniega el permiso (sin
  `Promise` rechazada sin manejar), y una URL desconocida muestra una página 404 en vez de redirigir
  al inicio. Se corrige el e2e que daba por buena la URL `tema-1` y se añaden pruebas del componente 404
  y de la navegación a tema único.
  Verificación: `cd web && npm test -- --watch=false && npx playwright test e2e/academy.spec.ts --grep 'specs/025 C4' && grep -q 'No se pudo copiar' web/src/app/course/lesson-viewer.ts && grep -q "path: '\*\*'" web/src/app/app.routes.ts`

- **C5** `hecho` — Las cuatro cifras de Floci que mostraba la portada de Cloud (`24 ms`, `13 MiB`,
  `68`, `1.925/1.925`) no tenían fuente en el repo; se sustituyen por datos comprobados y citados en
  `README.md:34-57` (cuatro servicios, puerto 4566, health 200, arranque de 15 a 45 s).
  Verificación: `! grep -Eq '24 ms|13 MiB|1\.925/1\.925|value: .68.' web/src/app/course/lesson-viewer.ts && grep -q "value: '4566'" web/src/app/course/lesson-viewer.ts`

- **C6** `hecho` — `validate_formato.py --check` deja de aprobar un curso con cero temas
  reconocidos, y una nueva puerta impide que la deuda medida retroceda (formato, doce puntos y URLs
  rotas) respecto a la medición de partida de esta spec.
  Verificación: `python3 scripts/validate_formato.py --check && python3 scripts/check_deuda.py --check`

- **C7** `hecho` — CI deja de depender de un checkout superficial para la verificación con SHA
  fijo de la spec 023 y de un Maven sin caché en modo offline: `fetch-depth: 0`, Java 25 (el que declara
  `pom.xml`) con caché Maven y calentamiento de dependencias antes de `validate.sh`.
  Verificación: `grep -q 'fetch-depth: 0' .github/workflows/ci.yml && grep -q 'cache: maven' .github/workflows/ci.yml && grep -q 'dependency:go-offline' .github/workflows/ci.yml`

- **C8** `hecho` — La captura `clases-objetos-init.svg` quedó enlazada con alt descriptivo en el
  Tema 6 de `foundations/modulo-1.md` y sus recursos pasan la auditoría. La cerró el hilo paralelo en
  `fe91d483` mientras corría este lote; se comprueba aquí sin tocar su trabajo. No se borró contenido
  (regla 1.9 del prompt).
  Verificación: `grep -q 'clases-objetos-init.svg' web/public/content/foundations/modulo-1.md && python3 scripts/audit_lesson_assets.py`

- **C9** `hecho` — Se retiran del mapa de nombres 13 stacks que no existen, se añade `control-1`,
  que faltaba aunque es uno de los 16 publicados, y se corrige el texto que anunciaba coincidencias
  con libros y cursos cuando el catálogo tiene 0 referencias.
  Verificación: `test "$(sed -n '/const STACK_NAMES/,/^};/p' web/src/app/catalog/curriculum-library.ts | grep -Ec "^  [a-z0-9'-]+: '")" = 16 && ! grep -q 'verás el libro' web/src/app/catalog/curriculum-stack.html`

- **C15** `hecho` — La suite e2e vuelve a estar en verde tras corregir expectativas obsoletas: el
  enlace del temario usa `/tema/1` (C1), `/laboratorio/floci` conserva su redirección histórica frente
  al 404 nuevo (C4), Fundamentos módulo 1 tiene 7 temas, Spring Boot módulo 2 tiene 6 diagramas Mermaid,
  el diagrama Archify de Java está en el tema 3. Además se corrigió un fallo real de la app que el e2e
  destapó: el modo libro no tenía salida visible en móvil ni en tableta (`display:none` en
  `lesson-viewer.book.scss`); ahora el botón «Capítulo completo» envuelve en una segunda fila y sigue
  siendo visible. Se añaden e2e de la paleta y de la 404.
  Verificación: `cd web && npm run e2e`

- **C16** `hecho` — `tsconfig.spec.json` incluye `src/tests/**/*.ts`, de modo que el archivo de
  configuración de Vitest se tipo-comprueba y desaparece el warning «not found in TypeScript
  compilation». Las 42 pruebas unitarias siguen pasando.
  Verificación: `cd web && npm test -- --watch=false 2>&1 | ! grep -q 'not found in TypeScript compilation'`

- **C10** `pendiente` — Los 15 cursos restantes se migran a las 12 secciones de `FORMATO-UNICO.md`
  y los 1608 temas pasan los 12 puntos de la sección 4 (deuda actual: 187 y 10 respectivamente).
  No se cierra en este lote: es la campaña de la spec 024.
  Verificación: `python3 scripts/validate_formato.py --check && python3 scripts/audit_master_prompt_items.py --resumen`

- **C11** `pendiente` — Registro de revisión independiente por tema (`docs/revision/<curso>.tsv`) y
  88 capturas reales en Fundamentos; hoy no existe el directorio y hay 15 SVG.
  No se cierra en este lote.
  Verificación: `python3 scripts/validate_revision.py --curso foundations`

- **C12** `pendiente` — Los temarios aprobados (2385 temas en 379 módulos) se convierten en lecciones
  publicadas; hoy solo 210 IDs están escritos y 110 verificados. No se cierra en este lote.
  Verificación: `python3 scripts/build_estado_temas.py --check`

- **C13** `hecho` — Se retira del repo el AppleDouble versionado `scripts/._audit_course_completeness.py`
  (163 bytes de metadatos de macOS, no código) y se ignora el patrón `._*`; se borran los `.pyc`
  huérfanos de `scripts/tests/__pycache__/` (ya cubiertos por `.gitignore`).
  Verificación: `test -z "$(git ls-files 'scripts/._*')" && grep -q '^\._\*$' .gitignore`

- **C14** `hecho` — Se declaran en `scripts/requirements.txt` las dos únicas dependencias Python fuera
  de la biblioteca estándar (`python-control` y `numpy`, importadas por `render_control1_figures.py`).
  No se instalan ni se ejecuta ese render: `control` no está disponible en esta máquina y las figuras
  publicadas no se regeneran.
  Verificación: `grep -q '^python-control' scripts/requirements.txt && grep -q '^numpy' scripts/requirements.txt && grep -q '^import control' scripts/render_control1_figures.py`

## 2. Reglas de este lote

0. Todo lo aquí afirmado se midió en esta máquina el 2026-11-21; lo que no se pudo verificar se dejó `pendiente`.
1. Un criterio solo pasa a `hecho` cuando su comando se ejecutó en esta máquina el 2026-11-21.
2. Todo cambio de contenido publicado va seguido de `build_web_topic_index.py` y de los informes que
   `validate.sh` comprueba; el lote termina con `validate.sh: ok`.
3. La deuda no aumenta: los contadores de partida de esta spec son el suelo.
4. C2 de la spec 024 (revisión independiente) sigue pendiente: arreglar validadores no sustituye a
   un revisor que no escribió el tema.

## 3. Deuda del informe que este lote no cierra

Queda documentada aquí para que no se pierda; ningún punto se marca `hecho` sin verificación.

- **Contenido (campaña de la spec 024):** 679 de 1421 temas `### Tema N:` siguen sin `· Nivel · NN min`;
  118 declarados fuera de 20–45 min y `validate_formato.py` no comprueba ese rango. Hay 39 temas con
  63 rutas de código que ningún tema crea, 22 con carpeta incoherente, 263 con 359 bloques sin archivo
  y 4 punteros a un laboratorio inexistente (`docs/auditoria/coherencia-codigo.md`). Hay 21 títulos de
  módulo que difieren entre el track y el H1, y en 13 de 15 tracks diverge `concepts[]` de los temas
  publicados. Todo ello exige tocar lecciones publicadas o temarios aprobados, que el dueño debe
  aprobar antes (CLAUDE.md); además hay un hilo migrando Fundamentos en paralelo y no se debe pisar.
- **App:** `lesson-viewer.ts` sigue con ~1835 líneas, campos sin uso (`challenges`, `questions`,
  `services`, `clouds`, `SHARED_ICONS`) y faltan specs dedicados de `content.service`,
  `topic-index.service`, `curriculum-library`, `course-shell`, `lesson-index` y `track-overview`.
  Los errores funcionales (enlace, paleta, skip link, copia, 404, cifras) sí están cerrados en C1–C5.
- **Validadores:** `validate_specs.py --run` tarda más de 180 s en esta máquina (terminó con SIGTERM
  al ejecutarse en este lote; `validate.sh` sin `--run` pasa). Su `shell=True` sigue sin timeout y la
  verificación auto-referencial de la spec 023 C7 y el `git ls-remote` de la spec 011 C3 quedan como
  deuda: cambiar criterios aprobados requiere revisión de esas specs.
- **Operativa:** siguen 6 ramas locales obsoletas y el stash `antes-de-actualizar-20261120-141747`.
  No se borran sin confirmación del dueño (CLAUDE.md las declara «no respaldo de nada», pero borrar
  ramas y un stash es irreversible). Quedan sin seguimiento `.manus/` y dos SVG de Fundamentos
  generados por el hilo paralelo; ese hilo decide si los commitea.
