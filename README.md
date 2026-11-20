# The_Imperial_Book

[![CI](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml/badge.svg)](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue)](LICENSE)
[![Contenido: CC BY 4.0](https://img.shields.io/badge/contenido-CC%20BY%204.0-lightgrey)](web/public/content/LICENCIA-CONTENIDO.md)

Academia en español de programación, desarrollo de software y DevOps. Es una aplicación Angular que
muestra lecciones escritas en Markdown y guarda el progreso en el navegador.

**Estado (2026-11-18):** el repositorio se acaba de limpiar ([specs/011](specs/011-limpieza-total.md)).
Hoy hay 16 cursos, 289 módulos y 1420 temas, pendientes de revisión: el siguiente paso es definir qué
cursos se implementan y con qué proceso. Lo retirado está en la rama `archivo-2026-11-18`.

## Estructura

| Ruta | Qué es |
|---|---|
| `web/` | la app Angular |
| `web/src/app/tracks/*.track.ts` | módulos de cada curso |
| `web/public/content/<curso>/modulo-N.md` | las lecciones |
| `docs/METODOLOGIA-DE-APRENDIZAJE.md` | cómo se enseña cada tema |
| `docs/ESTANDAR-DE-CODIGO.md` | cómo se escribe el código de los ejemplos |
| `specs/` | especificaciones (SDD): todo cambio empieza aquí |
| `scripts/` | validación mínima y utilidades |

## Uso

```bash
cd web
npm ci
npm start            # http://localhost:4200
npm test -- --watch=false
npm run e2e
```

Desde la raíz: `./scripts/validate.sh`.

## Licencia

Código bajo MIT ([LICENSE](LICENSE)); contenido bajo CC BY 4.0
([LICENCIA-CONTENIDO.md](web/public/content/LICENCIA-CONTENIDO.md)).
