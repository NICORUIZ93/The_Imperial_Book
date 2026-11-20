# The Imperial Book

[![CI](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml/badge.svg)](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue)](LICENSE)
[![Contenido: CC BY 4.0](https://img.shields.io/badge/contenido-CC%20BY%204.0-lightgrey)](web/public/content/LICENCIA-CONTENIDO.md)

Academia en español para aprender programación de cero a experto. Es una aplicación Angular que muestra
lecciones escritas en Markdown, guarda el progreso en el navegador y trae laboratorios que se ejecutan en
tu computador, incluida una **nube local con Floci** (AWS, Azure y GCP sin cuenta ni costo).

**Estado (2026-11-20):** 16 cursos, 324 módulos y 1.421 temas indexados (más las 187 fichas de
Microservicios). La academia está en reestructuración total: un tema en un solo lugar, un formato único y
temarios de cero a experto. El plan y su avance están en
[specs/021](specs/021-reestructuracion-total-de-la-academia.md) y
[docs/reestructuracion/ESTADO.md](docs/reestructuracion/ESTADO.md).

## Empezar

Necesitas Node.js 22 o superior.

```bash
cd web
npm ci
npm start            # abre http://localhost:4200
```

## Nube en local con Floci

[Floci](https://hub.docker.com/r/floci/floci) emula servicios de nube en tu máquina. El archivo
`docker-compose.yml` de la raíz levanta todo el entorno; necesitas Docker Desktop abierto.

```bash
docker compose up -d      # desde la raíz del repositorio
docker compose ps         # los cuatro servicios deben aparecer «running»
docker compose down       # apaga el entorno (los datos de AWS quedan en ./data/aws)
```

| Servicio | Qué emula | Dirección |
|---|---|---|
| `aws-local` | AWS (`floci/floci` 2.2.0) | `http://localhost:4566` |
| `azure-local` | Azure (`floci/floci-az` 0.14.0) | `http://localhost:4577` |
| `gcp-local` | Google Cloud (`floci/floci-gcp` 0.10.0) | `http://localhost:4588` |
| `stackport` | panel web para ver los recursos de AWS local | `http://localhost:8080` |

Para usar AWS local con la CLI o un SDK, apunta el *endpoint* a Floci y usa las credenciales de prueba:

```bash
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1
aws --endpoint-url http://localhost:4566 s3 mb s3://mi-primer-bucket
aws --endpoint-url http://localhost:4566 s3 ls
```

Floci es un emulador para aprender y probar: no reproduce todos los detalles de la nube real (permisos,
límites, costos). Cada laboratorio de nube indica qué cambia al pasar a una cuenta real. Los puertos se
pueden cambiar con `AWS_LOCAL_PORT`, `AZURE_LOCAL_PORT`, `GCP_LOCAL_PORT` y `STACKPORT_PORT`.

## Cursos

Fundamentos · Java · Spring Boot · JavaScript · Node.js · React · Angular · DevOps · Cloud ·
Microservicios · Android · Kotlin Multiplatform · iOS · Flutter · Control · RutaFlow (proyecto integrador).
El listado completo de temas está en
[docs/reestructuracion/listado-de-temas.md](docs/reestructuracion/listado-de-temas.md).

## Estructura

| Ruta | Qué es |
|---|---|
| `web/` | la app Angular |
| `web/public/content/<curso>/modulo-N.md` | las lecciones |
| `web/src/app/tracks/*.track.ts` | módulos de cada curso |
| `examples/` | laboratorios ejecutables (p. ej. `examples/microservicios/modulo-N/`) |
| `docker-compose.yml` | nube local con Floci |
| `docs/METODOLOGIA-DE-APRENDIZAJE.md` | cómo se enseña cada tema |
| `docs/ESTANDAR-DE-CODIGO.md` | cómo se escribe el código de los ejemplos |
| `specs/` | especificaciones: todo cambio empieza aquí |
| `scripts/` | validación y utilidades |
| `verificacion/` | kits para ejecutar el código de los cursos en una máquina real |

## Pruebas y validación

```bash
cd web && npm test -- --watch=false   # pruebas unitarias
cd web && npm run e2e                 # pruebas de navegador
./scripts/validate.sh                 # desde la raíz: contenido, índice, enlaces y specs
```

## Cómo se trabaja

1. Todo cambio empieza con una especificación en `specs/` con criterios verificables.
2. Ningún dato técnico se escribe sin ejecutarlo o verificarlo en una fuente primaria.
3. Los temarios los aprueba el dueño antes de escribir lecciones.

## Licencia

Código bajo MIT ([LICENSE](LICENSE)); contenido bajo CC BY 4.0
([LICENCIA-CONTENIDO.md](web/public/content/LICENCIA-CONTENIDO.md)).
