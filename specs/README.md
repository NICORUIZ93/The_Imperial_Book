# Especificaciones (SDD)

Todo cambio empieza aquí: primero un archivo `specs/NNN-tema.md` con criterios numerados, después la
implementación. Cada criterio tiene un estado (`pendiente` o `hecho`) y un comando `Verificación:` que
lo comprueba. `python3 scripts/validate_specs.py --run` ejecuta las verificaciones de los criterios hechos.

Las specs 001 a 010 y todo lo que se retiró del repositorio están en las etiquetas `retirado/archivo` y
`retirado/archivo-2026-11-18` (no se borró nada; en GitHub solo hay la rama `main` — el repo local conserva
6 ramas viejas sin borrar, enumeradas en la regla 7 de `docs/reestructuracion/CONTINUAR.md`).

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
| [022](022-curso-microservicios-spring-boot-fase-1.md) | Curso Microservicios Spring Boot — Fase 1 | en curso |
| [023](023-fase-2-maven-compose-y-presentacion-spring.md) | Fase 2 Spring, starter Maven/Compose y presentación | en curso |
| [024](024-migracion-al-estandar-12-puntos.md) | Migración de las 16 rutas a los 12 puntos de la sección 4, una ruta por lote | en curso |
| [025](025-correccion-de-fallas-revision.md) | Corrección de fallas detectadas en revisión | hecho |
| [026](026-plan-de-accion-contra-las-fallas.md) | Plan de acción contra las fallas | en curso |
| [027](027-libro-sin-laboratorios.md) | Libro sin laboratorios: del código descargable al libro virtual | en curso |
| [028](028-diseno-3-cursos-independientes.md) | Diseño instruccional de 3 cursos independientes (Java, Spring Boot, Node.js) | en curso |
| [029](029-estandar-editorial-plataforma.md) | Estándar editorial único de plataforma (Capa 1/Capa 2) aplicado a todos los cursos | en curso |
