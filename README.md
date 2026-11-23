# The Imperial Book

[![CI](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml/badge.svg)](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue)](LICENSE)
[![Contenido: CC BY 4.0](https://img.shields.io/badge/contenido-CC%20BY%204.0-lightgrey)](web/public/content/LICENCIA-CONTENIDO.md)

Academia en español para aprender programación de cero a experto. Es una aplicación Angular que muestra
lecciones escritas en Markdown, guarda el progreso en el navegador y trae laboratorios que se ejecutan en
tu computador, incluida una **nube local con Floci** (AWS, Azure y GCP sin cuenta ni costo).

**Estado:** 17 cursos, 319 módulos y 1776 temas indexados.

## Empezar

Necesitas Node.js 22 o superior.

```bash
cd web
npm ci
npm start            # abre http://localhost:4200
```

## Desarrollo

```bash
cd web
npm ci
npm start            # http://localhost:4200
npm test -- --watch=false
npm run e2e
```

Validación del repositorio desde la raíz:

```bash
./scripts/validate.sh
```
## Estructura

| Ruta | Qué es |
|---|---|
| `web/` | aplicación Angular |
| `web/public/content/<curso>/modulo-N.md` | lecciones en Markdown |
| `web/src/app/tracks/*.track.ts` | definición de módulos por curso |
| `scripts/` | validación de contenido e índice |

## Licencia

Código bajo MIT ([LICENSE](LICENSE)); contenido bajo CC BY 4.0
([LICENCIA-CONTENIDO.md](web/public/content/LICENCIA-CONTENIDO.md)).
