# Spec 029 — Estándar editorial de plataforma (Capa 1 Lectura / Capa 2 Construcción)

## Objetivo

Aplicar el estándar editorial único definido por el dueño a toda la plataforma: todos los cursos/tracks existentes y futuros, en contenido y en la página web.

## Criterios

- **C1** `hecho` — Existe definición canónica del estándar editorial en `docs/editorial/estandar-editorial.md` y guía breve en `docs/editorial/guia-redaccion-1-pagina.md`, con las dos capas, estructura obligatoria Capa 1, reglas Capa 2 y reglas transversales.
  Verificación: `test -f docs/editorial/estandar-editorial.md && test -f docs/editorial/guia-redaccion-1-pagina.md && grep -n "CAPA 1" docs/editorial/estandar-editorial.md && grep -n "CAPA 2" docs/editorial/estandar-editorial.md`

- **C2** `hecho` — El renderizador web (`web/src/app/course/lesson-viewer.*`) reconoce y presenta el nuevo formato: Capa 1 visible, Capa 2 colapsable, estilos de tablas/diagramas/callouts coherentes con el estándar.
  Verificación: `cd web && npm test -- --watch=false --reporter=verbose 2>&1 | tail -20`

- **C3** `hecho` — El validador de formato acepta el estándar editorial nuevo (y mantiene compatibilidad transitoria solo donde se declare), reportando cumplimiento por curso.
  Verificación: `python3 scripts/validate_formato.py --editorial 2>&1 | tail -20`

- **C4** `hecho` — Todos los temas publicados en `web/public/content/**/*.md` cumplen la estructura Capa 1 obligatoria; Capa 2 presente donde el tema tenga construcción/código.
  Verificación: `python3 scripts/validate_formato.py --editorial --check 2>&1 | tail -20`

- **C5** `pendiente` — La página muestra el estándar aplicado en todos los cursos (navegación/render sin regresión) y la verificación de app pasa.
  Verificación: `cd web && npm test -- --watch=false && npm run e2e 2>&1 | tail -20`

## Notas

- Migración de 1608 temas es trabajo por lotes; no marcar C4/C5 sin evidencia.
- Preservar exactitud técnica: no inventar datos; transformar estructura y marcar huecos que requieran revisión editorial humana cuando la fuente no alcance.
