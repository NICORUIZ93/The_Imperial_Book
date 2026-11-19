# 015 · Verificación real en el Mac del dueño y en navegador

**Estado:** en curso
**Origen:** el dueño pidió el 2026-11-18 resolver lo que specs/014 no pudo comprobar («soluciona todo, te
autorizo a lo que necesites»): iOS, Flutter, Android, Maven/Gradle, Floci y el barrido con navegador.

## Decisión

El entorno de trabajo no tiene esas herramientas, pero el Mac del dueño sí (Xcode 27.2 con Swift 6.4,
Flutter, Maven, Docker Desktop, Android Studio, JDK 26/27). Cada grupo de cursos tiene un kit en
`verificacion/<grupo>/`: un extractor que convierte el código de las lecciones en proyectos y un `run.sh`
que los compila o ejecuta en macOS y escribe `resultados.tsv` (`curso`, `archivo:línea`, `PASS|FAIL|SKIP`,
`detalle`). Los fallos se corrigen en la lección y se vuelve a correr hasta que no queden `FAIL`.
El barrido con navegador recorre las 291 páginas de módulo con Playwright.

## Criterios

- **V1** `pendiente` — Los kits existen para iOS, Flutter, Android/KMP, JVM (Java, Spring, laboratorios) y Cloud/DevOps.
  Verificación: `for g in ios flutter android-kmp jvm cloud-devops; do test -x verificacion/$g/run.sh || exit 1; done`
- **V2** `pendiente` — La última corrida en el Mac no tiene `FAIL` (los `SKIP` llevan motivo).
  Verificación: `! grep -h "	FAIL	" verificacion/*/resultados.tsv`
- **V3** `hecho` — El barrido con navegador de las 291 páginas no tiene errores.
  Verificación: `python3 -c "import json,sys;d=json.load(open('verificacion/navegador/flow.json'));s=d['summary'];sys.exit(0 if s['pagesInspected']==291 and s['errors']==0 else 1)"`
