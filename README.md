# The_Imperial_Book

[![CI](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml/badge.svg)](https://github.com/NICORUIZ93/The_Imperial_Book/actions/workflows/ci.yml)
[![Código: MIT](https://img.shields.io/badge/c%C3%B3digo-MIT-blue)](LICENSE)
[![Contenido: CC BY 4.0](https://img.shields.io/badge/contenido-CC%20BY%204.0-lightgrey)](web/public/content/LICENCIA-CONTENIDO.md)
[![Angular 21.2](https://img.shields.io/badge/Angular-21.2-dd0031)](web/package.json)
[![Node.js 24 LTS](https://img.shields.io/badge/Node.js-24%20LTS-339933)](.github/workflows/ci.yml)

Academia en español para estudiar programación, desarrollo de software y cloud local. La
experiencia oficial es una aplicación Angular con lecciones Markdown.

La academia reúne 14 tracks, 245 módulos y 1100 temas editoriales en formato de
libro. Esos 14 tracks son Fundamentos + RutaFlow + 12 rutas de especialización.
La presencia de criterios editoriales y la completitud de los siete pasos
se reportan por separado; ninguna métrica automática sustituye la revisión técnica
ni demuestra por sí sola que un ejemplo se ejecutó.

- [Material solicitado de Proyecto-RutaFlow y destinos](docs/rutaflow-source-index.md)
- [Revisión de profundidad de todos los temas](docs/course-depth-review.md)
- [Revisión integral: cobertura y pendientes](docs/full-review.md)
- [Registro de revisión pedagógica humana](docs/manual-review-log.md)
- [Plan total de cambio y estado](docs/PLAN-TOTAL-DE-CAMBIO.md)
- [Sustancia de las lecciones: repetición, cola y andamiaje](docs/lesson-substance.md)
- [Continuación de la metodología de siete pasos](docs/CONTINUAR-7-PASOS.md)
- [Guía web](web/README.md)
- [Mapa compacto del repo](docs/repo-graph.md)
- [Índice de las 69 páginas e integración de merged.pdf](docs/merged-pdf-review.md)
- [Prompts de formación profesional disponibles en cada tema](docs/PROMPTS-FORMACION.md)
- [Skills de visuales y revisión del estudio desde cero](docs/SKILLS-VISUALES-Y-ESTUDIO.md)
- [Metodología de aprendizaje](docs/METODOLOGIA-DE-APRENDIZAJE.md)
- [Matriz curricular](docs/MATRIZ-CURRICULAR.md)
- [Fuentes oficiales y versiones revisadas](docs/official-sources.json)
- [Estándar de código, Clean Code y SOLID](docs/ESTANDAR-DE-CODIGO.md)
- [Proyecto transversal de logística RutaFlow](examples/rutaflow/README.md)

## Cómo empezar

1. Instala Node.js LTS y clona el repositorio.
2. Ejecuta `cd web && npm ci && npm start`.
3. Abre `http://localhost:4200`.
4. Elige un track y avanza tema por tema ejecutando sus ejemplos.

El progreso se guarda localmente en tu navegador con `localStorage`. Desde el
catálogo puedes exportarlo a un archivo JSON y restaurarlo en otro navegador.

No hay quizzes generados, XP, insignias, rachas ni recompensas artificiales:
el progreso representa exclusivamente actividades y capítulos terminados. Las
12 rutas de especialización tienen un proyecto integrador propio; Fundamentos
prepara las bases, incluye un capítulo introductorio de electrónica e IoT con 17 modelos Python ejecutables, y RutaFlow conecta los proyectos en una plataforma logística transversal.

```bash
cd web
npm ci
npm start
```

Luego abre `http://localhost:4200`.

Si algo falla, consulta la [guía de solución de problemas](docs/troubleshooting.md).

## Requisitos del sistema

- **Node.js 24 LTS y npm.** Es la versión con la que se ejecutan CI, build y pruebas; comprueba con `node -v`.
- **Angular 21.2.** La aplicación usa `@angular/core` `^21.2.0` y se instala con `npm ci`; no requiere instalación global.
- **Docker Engine con Compose v2.** Necesario para el stack `docker-compose.yml` y para Floci por contenedores.
- **Python 3.11 o superior.** Lo usan los auditores, la validación y varios ejemplos (`python3 --version`).
- **JDK 17 o superior.** Los ejemplos Java y Spring Boot se verificaron con JDK 25; el JDK solo es necesario para esos tracks.
- **Floci.** El Compose fija el emulador `2.2.0`; la CLI `0.4.0` es la release observada y su versión mínima compatible sigue sin verificarse ([detalle](docs/floci.md)).
- **Go y Rust (opcional).** Solo para los ejemplos de `examples/go` y `examples/rust`; el repositorio no fija versión en `go.mod` ni `Cargo.toml`, así que anota la toolchain que uses al ejecutarlos.
- **Toolchains móviles (opcional).** Android, iOS, Flutter y Kotlin Multiplatform requieren su SDK y emulador o simulador propios; no son necesarios para la aplicación web.

## Levantar Floci

Opción recomendada — `floci-cli` (la herramienta oficial del proyecto, que usa el track Cloud del curso a partir del Módulo 1). Descarga el instalador, inspecciónalo y ejecútalo en un paso separado; no canalices código remoto directamente a un shell:

```bash
curl --fail --location --show-error --output floci-install.sh https://floci.io/install.sh
printf '%s  %s\n' 'd2564a85bf07d389691987807e58d32a9904105e07dd20ede3ffb7bce9de056d' floci-install.sh | shasum -a 256 -c -
less floci-install.sh                          # inspecciona el contenido descargado
sh floci-install.sh                             # ejecuta solo después de revisarlo
floci start                                     # levanta Floci AWS
floci doctor                                    # diagnostica el entorno
aws s3 ls --endpoint-url=http://localhost:4566  # usa el endpoint explícito
floci stop                                      # detén Floci al terminar
```

La inspección no sustituye una firma o checksum publicado por el mantenedor. Si
el proyecto publica binarios firmados en sus releases oficiales, prefiere esa vía
y verifica la firma antes de instalarlos.
El hash de arriba identifica la copia del instalador oficial revisada el
2026-10-30; si no coincide, no la ejecutes y consulta [la guía de Floci](docs/floci.md).

El [`install.sh`](install.sh) de la raíz es una copia vendorizada del instalador
oficial de Floci CLI conservada como referencia; no es la copia verificada con el
hash anterior y queda fuera del flujo recomendado. Si lo ejecutas, hazlo solo tras
leerlo y comprobar su procedencia.

Opción alternativa — Docker Compose (útil para correr AWS, Azure y GCP local a la vez):

```bash
# 1. Levantar todos los servicios
docker compose up -d

# 2. Verificar Floci AWS
curl http://localhost:4566/_localstack/health

# 3. Verificar Azure
curl http://localhost:4577

# 4. Verificar GCP
curl http://localhost:4588

# 5. Validar todo el entorno
./scripts/validate-floci.sh
```

Servicios locales:

| Servicio | Puerto predeterminado | Variable de entorno |
|---|---:|---|
| AWS local (Floci) | 4566 | `AWS_LOCAL_PORT` |
| StackPort (explorador AWS del Compose) | 8080 | `STACKPORT_PORT` |
| Azure local | 4577 | `AZURE_LOCAL_PORT` |
| GCP local | 4588 | `GCP_LOCAL_PORT` |
| Floci UI (proyecto externo) | 4500 | `FLOCI_UI_PORT`* |

Ejemplo: si `8080` está ocupado, configura `STACKPORT_PORT=8081` en `.env` o
ejecuta `export STACKPORT_PORT=8081` antes de `docker compose up -d`. El puerto
del contenedor sigue siendo `8080`; solo cambia el puerto publicado en tu host.
Para cargar los valores del repositorio, copia `.env.example` a `.env`. Si una
aplicación de ejemplo consume StackPort, configura también
`STACKPORT_URL=http://localhost:8081` en su entorno.

*Floci UI vive en otro repositorio y su Compose oficial publica actualmente
`4500:4500` de forma literal. Para remapearlo, cambia el puerto del host en su
archivo Compose a `"${FLOCI_UI_PORT:-4500}:4500"` antes de ejecutar su `docker
compose up`; `.env` de este repositorio no configura automáticamente ese
proyecto externo.

Las imágenes de este Compose están fijadas por versión y digest; actualízalas de
forma deliberada después de revisar sus cambios.

Panel visual oficial recomendado (proyecto aparte — no está en este `docker-compose.yml`):

```bash
git clone https://github.com/floci-io/floci-ui
cd floci-ui
docker compose up                      # solo AWS
# docker compose --profile multicloud up   # AWS + Azure + GCP
```

Ábrelo en `http://localhost:4500`.

La metodología recomendada del curso es crear y modificar recursos con CLI,
SDK o Terraform y comprobar después el resultado visualmente. Puedes usar
**StackPort** para una exploración AWS rápida dentro del Compose de la academia,
**Floci UI** para la consola oficial y su visión multi-cloud, o ambos a lo largo
del curso. Los stacks predeterminados comparten el puerto `4566`: para abrirlos
simultáneamente debes apuntar ambas interfaces al mismo runtime y evitar levantar
un segundo Floci. Cuando una categoría de Floci UI aparece como `placeholder`, usa
StackPort si soporta ese recurso y conserva CLI/SDK como fuente de verdad.

Credenciales locales para AWS CLI y SDKs:

```bash
aws configure set region us-east-1
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
```

`test` y `000000000000` son valores ficticios para el emulador local, no
credenciales de una cuenta cloud. No guardes claves reales en `.env` ni las
envíes al endpoint local.

Ejemplos:

```bash
node examples/node/floci-example.js
python3 examples/python/floci-example.py
```

También hay ejemplos base en Java, Go y Rust dentro de `examples/`.

## Metodología

El contrato editorial que debe alcanzar cada tema es:

- Resultado concreto y motivo para construirlo.
- Prerrequisitos, carpeta y archivo exactos.
- Código específico comentado y explicación por bloques.
- Comando de ejecución y salida comprobable.
- Un fallo intencional con su diagnóstico.
- Una modificación breve que el estudiante resuelve.
- Incremento correspondiente del proyecto RutaFlow.

## Tracks de la academia

La versión Angular tiene su propio contenido, más amplio, en formato Markdown
(`web/public/content/<track>/modulo-N.md`), organizado en 14 tracks, 245
módulos y 1100 temas editoriales visibles. Cada módulo prioriza una secuencia de
temas prácticos. El sílabo y el estándar de calidad viven en documentos
centrales; las fuentes específicas permanecen junto al tema que sustentan. No
existen rutas separadas de cuestionarios, rúbricas o laboratorios repetidos.

Los conteos se verifican contra los tracks y el Markdown desde
`scripts/validate_learning_priorities.py`; la validación falla si README vuelve
a quedar desincronizado. La auditoría de criterios editoriales informa presencia
estructural detectada por heurísticas, no calidad ni ejecución: el corte
versionado registra 1100/1100 temas con los nueve criterios detectados. La
auditoría independiente de metodología registra 1100/1100 con sus marcadores de
siete pasos. Ninguno de esos resultados demuestra que las instrucciones sean
correctas, que los ejemplos se ejecuten o que el tema enseñe de forma efectiva.
El estado por tema y las señales adicionales están en
[`docs/seven-step-methodology.md`](docs/seven-step-methodology.md),
[`docs/editorial-backlog.md`](docs/editorial-backlog.md) y
[`docs/full-review.md`](docs/full-review.md).

## Licencias

El código fuente y las herramientas se distribuyen bajo MIT. Las lecciones
originales y la documentación editorial se ofrecen bajo Creative Commons
Atribución 4.0 Internacional (CC BY 4.0). Material de terceros, capturas,
marcas y recursos con licencia propia quedan excluidos; consulta los avisos de
atribución junto al material. Ver [`LICENSE`](LICENSE) y
[`web/public/content/LICENCIA-CONTENIDO.md`](web/public/content/LICENCIA-CONTENIDO.md).

La preparación de entorno se muestra en el módulo inicial; la ruta oficial está
disponible en el índice y el proyecto integrador en el capítulo final. Estas
características de navegación no acreditan una revisión pedagógica tema por
tema: el estado manual queda explícito en el informe integral.

[`docs/code-visual-quality.md`](docs/code-visual-quality.md) mide además, sin contar las guías generadas, qué
temas tienen código, comentarios didácticos, ubicación, comando, Mermaid y
fuente oficial. Los bloques ejecutables ya no se presentan falsamente como
“Diagrama”: código, terminal y configuración tienen etiquetas propias; los
diagramas Mermaid se renderizan como figuras accesibles con contexto y guía de
lectura. Los visuales ASCII restantes se conservan como deuda explícita hasta
que puedan redibujarse sin alterar su significado.

[`docs/editorial-backlog.md`](docs/editorial-backlog.md) convierte esas mediciones en una lista accionable
por track y módulo. El lector ofrece navegación anterior/siguiente entre temas
y un glosario contextual accesible para términos técnicos; estas ayudas no se
contabilizan como sustituto del contenido editorial específico.

Las cifras de presencia editorial no equivalen a la completitud del contrato:
la auditoría de siete pasos usa otra rúbrica y marcadores heurísticos, y no
afirma que los ejemplos estén ejecutados ni que los temas sean pedagógicamente
eficaces. Ambos reportes se deben leer como señales de trabajo editorial, no
como certificaciones.

| Track | Módulos | Enfoque |
|---|---|---|
| Fundamentos | 16 | Computador, programación, algoritmos, web, datos e ingeniería de software |
| Cloud Local | 35 | AWS, Azure y GCP en local con Floci |
| DevOps | 19 | Linux, Git, Docker, CI/CD, Kubernetes, IaC, QA Automation, sistemas distribuidos, servidor propio |
| JavaScript | 15 | Lenguaje, DOM, asincronía, rendimiento |
| Node.js | 15 | Backend, APIs, bases de datos, producción |
| Angular | 17 | Componentes, Signals, routing, SSR, zoneless |
| React | 15 | Hooks, estado, data fetching, Next.js |
| Java | 21 | POO, colecciones, concurrencia, JVM moderna, JDBC, JPA, HTTP y Java funcional |
| Spring Boot | 23 | REST, JPA, seguridad, Batch, Kafka, microservicios y arquitectura (hexagonal, C4, ADR) |
| Kotlin Multiplatform | 14 | Lógica compartida entre Android e iOS |
| Android | 16 | Jetpack Compose, ciclo de vida, Room, Hilt |
| iOS | 15 | SwiftUI, concurrencia moderna, SwiftData |
| Flutter | 16 | Widgets, gestión de estado, plataformas nativas |
| RutaFlow | 8 | Proyecto integrador de entregas, GPS, datos y operación |

### Ruta recomendada para principiantes

1. [Fundamentos](web/public/content/foundations/modulo-0.md): enseña terminal, programación, HTML, CSS, redes y SQL partiendo de cero.
2. [JavaScript](web/public/content/javascript/modulo-0.md): requiere lo anterior para el DOM y el navegador; añade asincronía y pruebas.
3. [Node.js](web/public/content/node/modulo-0.md): reutiliza JavaScript y elimina el DOM; introduce HTTP, persistencia y operación.
4. [Cloud Local](web/public/content/cloud/modulo-0.md): asume terminal, HTTP, JSON y Docker, y añade AWS, Azure y GCP contra Floci.
5. [RutaFlow](web/public/content/rutaflow/modulo-0.md): integra frontend o móvil, backend, HTTP, SQL y Git en un proyecto de entregas.

Cada guía de track declara su entrada real en [track-guides.ts](web/src/app/track-guides.ts);
las rutas de especialización no presuponen los tracks que no necesitan.

`scripts/validate.sh` valida automáticamente que el número de archivos
Markdown de cada track coincida con los módulos declarados en su fuente
TypeScript, que el índice web corresponda a esos 14 tracks y que los reportes de
calidad permanezcan sincronizados con el Markdown real.

## Actualización tecnológica

Cada ruta se contrasta con especificaciones, documentación, notas de versión,
seguridad y migración publicadas por los proyectos oficiales. El registro
[`docs/official-sources.json`](docs/official-sources.json) indica la línea estable o LTS utilizada, la fecha
de revisión y qué términos deben estar incorporados en el contenido.

```bash
python3 scripts/validate_official_sources.py
```

La comprobación vence a los 120 días. El CI se ejecuta además cada mes para
detectar una revisión pendiente aunque el repositorio no reciba cambios. Las
funciones preview o experimentales se presentan como tales y nunca como base
obligatoria de producción.

## Seguridad

Los temas de seguridad se tratan desde una práctica defensiva y autorizada:
entender riesgos, proteger sistemas propios, validar configuraciones y construir
software más robusto. No incluye instrucciones para atacar sistemas de terceros.

## Estructura

```text
The_Imperial_Book/
├── README.md
├── docker-compose.yml
├── .env.example
├── docs/
├── examples/
├── scripts/
└── web/
    ├── src/
    ├── README.md
    └── public/content/
```

## Validar el repositorio

Antes de subir cambios, ejecuta:

```bash
./scripts/validate.sh
```

La validación comprueba la aplicación Angular, la relación entre tracks y
Markdown, las auditorías educativas, los 12 proyectos, el progreso académico y
que el mapa del repositorio versionado esté actualizado. Aplica un umbral de
presencia editorial detectada por heurísticas; no exige falsamente que todos los
criterios estén completos en cada tema. También prueba la restauración de backups
en un PostgreSQL temporal; CI instala las herramientas necesarias.

El CI también ejecuta build y tests de Angular:

```bash
cd web
npm run build --silent
npm test -- --watch=false --coverage
npm run e2e
```

## Mapa compacto para asistentes de IA

Para reducir exploración repetida del repositorio, este proyecto incluye:

- [`docs/repo-graph.md`](docs/repo-graph.md): snapshot legible para asistentes.
- [`docs/repo-graph.json`](docs/repo-graph.json): índice estructurado para herramientas.

Actualízalo cuando cambie la estructura:

```bash
python3 scripts/build_repo_graph.py
```

Comprueba sincronización:

```bash
python3 scripts/build_repo_graph.py --check
```
