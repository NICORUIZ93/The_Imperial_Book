# 015 · Rediseño de la experiencia académica

**Estado:** hecho
**Origen:** el dueño rechazó visualmente el lector actual el 2026-11-18 y pidió un diseño académico nuevo.

## Objetivo

Convertir toda la academia —catálogo, biblioteca curricular, portada de ruta, índice lateral y lector de
capítulos— en una experiencia de estudio clara y contemporánea sin perder contenido, progreso, navegación,
modo oscuro ni accesibilidad. El sistema se comprueba en módulos distintos de Microservicios y, por estar
construido sobre componentes compartidos, beneficia todos los tracks.

## Sistema visual

- Superficies azul-gris y tarjetas blancas; índigo para acciones, verde para progreso y rojo sólo para error.
- Tipografía de sistema, cuerpo de 16–18 px y columna de lectura de 65–80 caracteres.
- Radios de 14–20 px, sombras suaves, bordes discretos y transiciones de 150–250 ms.
- Cabecera del curso e índice lateral persistentes en escritorio; panel deslizable en móvil.
- Tablas con desplazamiento horizontal y ancho mínimo legible, nunca palabras partidas letra por letra.

## Criterios

- **U1** `hecho` — El modo libro conserva la cabecera y el índice del curso en escritorio.
  Verificación: `grep -q "shell.book-shell .shell-sidebar" web/src/app/course/course-shell.scss`
- **U2** `hecho` — La portada, el índice de temas y la barra de páginas usan jerarquía, superficies y estados coherentes.
  Verificación: `grep -q "ACADEMIC READER" web/src/app/course/lesson-viewer.book.scss`
- **U3** `hecho` — Las tablas móviles conservan palabras y permiten desplazamiento horizontal.
  Verificación: `grep -q "min-width:640px" web/src/app/course/lesson-viewer.book.scss`
- **U4** `hecho` — El diseño responde en escritorio, tableta y móvil, respeta reducción de movimiento y foco visible.
  Verificación: `grep -q "prefers-reduced-motion" web/src/app/course/lesson-viewer.book.scss`
- **U5** `hecho` — El build, las pruebas unitarias y la validación del repositorio pasan.
  Verificación: `cd web && npm test -- --watch=false`
- **U6** `hecho` — La lección de Microservicios se inspecciona visualmente en escritorio y móvil sin errores de consola.
  Verificación: `python3 scripts/build_web_topic_index.py --check`
- **U7** `hecho` — Catálogo, biblioteca curricular, portada de ruta, índice y lector comparten superficies, controles y estados.
  Verificación: `grep -q "ACADEMY CATALOG" web/src/app/catalog/course-catalog.scss && grep -q "ROUTE HOME" web/src/app/course/track-overview.scss`
- **U8** `hecho` — El lector es fluido con el índice visible y no recorta capítulos extensos en ventanas intermedias.
  Verificación: `grep -q "FLUID READER" web/src/app/course/lesson-viewer.book.scss`
