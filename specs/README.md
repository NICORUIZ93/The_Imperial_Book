# Especificaciones (SDD)

Todo cambio empieza aquí: primero un archivo `specs/NNN-tema.md` con criterios numerados, después la
implementación. Cada criterio tiene un estado (`pendiente` o `hecho`) y un comando `Verificación:` que
lo comprueba. `python3 scripts/validate_specs.py --run` ejecuta las verificaciones de los criterios hechos.

Las specs 001 a 010 y todo lo que se retiró del repositorio están en las ramas `archivo` y
`archivo-2026-11-18` (no se borró nada).

| Spec | Tema | Estado |
|---|---|---|
| [011](011-limpieza-total.md) | Limpieza total del repositorio | hecho |
| [012](012-limpieza-a-fondo.md) | Limpieza a fondo (segunda pasada) | hecho |
| [013](013-programa-de-cursos-y-correcciones.md) | Programa de cursos y correcciones | en curso |
