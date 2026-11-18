# 010 · Curso Docker de cero a experto (piloto del estándar v3)

**Estado:** vigente
**Origen:** specs/008, fase 2. El dueño pidió un curso de Docker «completo, súper profesional, de cero
a experto, con lo más actual», investigado en documentación oficial, cursos (Udemy), foros y artículos.

## Contexto y límites

- Investigación: `research/docker.md` (fuentes oficiales, tres temarios de referencia, consejos de
  comunidad verificados y huecos que este curso cubre).
- Base interna: los módulos 0–8 de `docs/PLAN-CURSO-DOCKER-KUBERNETES.md`, ampliados con los huecos de
  la investigación. Los temas actuales sobre Docker en DevOps 2 y 15, Cloud 1, Node 11 y Spring 11 se
  enlazan como práctica por tecnología; no se duplican.
- Es una ruta nueva (`docker`). Se publica módulo a módulo: un módulo entra a la web solo cuando todos
  sus temas cumplen el estándar de 12 partes de MASTER-PROMPT v3. No se publican módulos vacíos.
- Entorno: los ejemplos se escriben para Docker Engine 29 y se ejecutan en la Mac del proyecto cuando el
  entorno de generación no tenga el demonio de Docker; esas capturas quedan `pendiente` con motivo.

## Temario propuesto

| Módulo | Título | Temas principales | Nivel |
|---:|---|---|---|
| 0 | Linux que necesitas para entender un contenedor | proceso, PID y señales; usuarios y capacidades; namespaces; cgroups v2; aislar un proceso sin Docker | Básico |
| 1 | Instalar Docker y entender su arquitectura | Engine 29, Desktop y alternativas; CLI, daemon, API, containerd y runc; almacén de imágenes de containerd; primer contenedor y qué pasó | Básico |
| 2 | Contenedores: ciclo de vida y diagnóstico | run, start, stop, kill y rm; modo interactivo y desacoplado; exec y logs; PID 1, init y apagado ordenado; códigos de salida | Básico |
| 3 | Imágenes y Dockerfile desde cero | contexto y `.dockerignore`; instrucciones; capas y caché; CMD y ENTRYPOINT; ARG y ENV; etiquetas y digest | Básico–Intermedio |
| 4 | Builds profesionales | multi-stage y targets; elegir imagen base (slim, distroless, scratch, Hardened Images); BuildKit: cache y secret mounts; buildx multiarquitectura; Bake | Intermedio |
| 5 | Datos y persistencia | capa escribible; volúmenes, bind mounts y tmpfs; permisos y UID; bases de datos en contenedor; respaldo y restauración | Intermedio |
| 6 | Redes | bridge por defecto y redes propias; DNS interno; publicar puertos; host, none y overlay; diagnóstico con netshoot; conflictos de subred | Intermedio |
| 7 | Compose para desarrollo y producción | servicios, redes y volúmenes; healthcheck y `depends_on`; perfiles, `include` y overrides; Compose Watch y `docker init`; contenedores utilitarios; Dev Containers y Testcontainers | Intermedio |
| 8 | Registros y cadena de suministro | tag, manifest y digest; registro privado con TLS; Docker Hub y registros en la nube; SBOM y provenance; firma y verificación con cosign; Docker Scout | Avanzado |
| 9 | Seguridad y operación | root, rootless y user namespaces; capacidades, seccomp y solo lectura; secretos y el socket de Docker; límites de recursos y OOM; logs, events, stats y `docker debug` | Avanzado |
| 10 | CI/CD y despliegue | GitHub Actions con caché, multiplataforma y etiquetas; puerta de vulnerabilidades y pruebas; desplegar en un servidor con Compose; nube; criterio Compose, Swarm o Kubernetes | Avanzado–Experto |
| 11 | Proyecto final y Docker con IA | RutaFlow de proceso local a imagen firmada y desplegada; Model Runner como artefacto OCI; defensa de decisiones | Experto |

## Criterios

- **D1** `hecho` — La investigación del curso está escrita con fuentes oficiales, temarios de referencia,
  consejos de comunidad verificados y huecos.
  Verificación: `grep -q "## 4. Huecos" research/docker.md && grep -q "docs.docker.com" research/docker.md`
- **D2** `pendiente` — El dueño aprueba el temario propuesto (o sus cambios quedan escritos aquí).
  Verificación: `grep -q "Temario aprobado por el dueño" specs/010-curso-docker-de-cero-a-experto.md`

Los criterios por módulo (D3 en adelante) se agregan al aprobar el temario, junto con el auditor del
estándar de 12 partes que los verifica.
