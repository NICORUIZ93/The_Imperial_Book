# Especificaciones (SDD)

Todo cambio empieza aquí: primero un archivo `specs/NNN-tema.md` con criterios numerados, después la
implementación. Cada criterio tiene un estado (`pendiente` o `hecho`) y un comando `Verificación:` que
lo comprueba. `python3 scripts/validate_specs.py --run` ejecuta las verificaciones de los criterios hechos.

Las specs 001 a 010 y todo lo que se retiró del repositorio están en las etiquetas `retirado/archivo` y
`retirado/archivo-2026-11-18` (no se borró nada; el repositorio solo tiene la rama `main`).

| Spec | Tema | Estado |
|---|---|---|
| [011](011-limpieza-total.md) | Limpieza total del repositorio | hecho |
| [012](012-limpieza-a-fondo.md) | Limpieza a fondo (segunda pasada) | hecho |
| [013](013-programa-de-cursos-y-correcciones.md) | Programa de cursos y correcciones | en curso |
| [014](014-correccion-de-bloqueantes.md) | Corrección de bloqueantes y errores técnicos verificados | hecho |
| [015](015-redisenio-experiencia-academica.md) | Rediseño de la experiencia académica | hecho |
| [016](016-arquitectura-curricular-y-redisenio-total.md) | Arquitectura curricular y rediseño total | hecho |
| [017](017-cursos-nuevos.md) | Cursos nuevos: Docker, Kubernetes, Diseño de sistemas y Microservicios completo | en curso |
| [018](018-microservicios-de-cero-a-maestro.md) | Microservicios de Cero a Maestro (prompt del dueño) | hecho |
| [019](019-verificacion-en-mac-y-navegador.md) | Verificación real en el Mac del dueño y en navegador | en curso |
| [020](020-reestructuracion-de-temarios.md) | Reestructuración de temarios aprobada por el dueño | en curso |
| [021](021-reestructuracion-total-de-la-academia.md) | Reestructuración total: un tema, un lugar, una forma (incluye Floci) | en curso |
