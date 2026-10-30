# The_Imperial_Book

Academia en español para estudiar desarrollo profesional y cloud local. La
experiencia oficial es una aplicación Angular con lecciones Markdown.

La academia reúne 14 tracks, 245 módulos y 1098 temas editoriales en formato de
libro. Esos 14 tracks son Fundamentos + RutaFlow + 12 rutas de especialización.
La presencia de criterios editoriales y la completitud de los siete pasos
se reportan por separado; ninguna métrica automática sustituye la revisión técnica
ni demuestra por sí sola que un ejemplo se ejecutó.

- [Material solicitado de Proyecto-RutaFlow y destinos](docs/rutaflow-source-index.md)
- [Revisión de profundidad de todos los temas](docs/course-depth-review.md)
- [Plan total de cambio y estado](docs/PLAN-TOTAL-DE-CAMBIO.md)
- [Sustancia de las lecciones: repetición, cola y andamiaje](docs/lesson-substance.md)
- [Continuación de la metodología de siete pasos](docs/CONTINUAR-7-PASOS.md)
- [Guia web](web/README.md)
- [Mapa compacto del repo](docs/repo-graph.md)
- [Índice de las 69 páginas e integración de merged.pdf](docs/merged-pdf-review.md)
- [Prompts de formación profesional disponibles en cada tema](docs/PROMPTS-FORMACION.md)
- [Skills de visuales y revisión del estudio desde cero](docs/SKILLS-VISUALES-Y-ESTUDIO.md)
- [Metodología de aprendizaje](docs/METODOLOGIA-DE-APRENDIZAJE.md)
- [Matriz curricular](docs/MATRIZ-CURRICULAR.md)
- [Fuentes oficiales y versiones revisadas](docs/official-sources.json)
- [Estándar de código, Clean Code y SOLID](docs/ESTANDAR-DE-CODIGO.md)
- [Proyecto transversal de logística RutaFlow](examples/rutaflow/README.md)

## Como empezar

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

- AWS local: `http://localhost:4566`
- StackPort (explorador AWS ligero incluido en este compose): `http://localhost:8080`
- Azure local: `http://localhost:4577`
- GCP local: `http://localhost:4588`

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

Ejemplos:

```bash
node examples/node/floci-example.js
python3 examples/python/floci-example.py
```

Tambien hay ejemplos base en Java, Go y Rust dentro de `examples/`.

## Metodologia

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
módulos y 1098 temas editoriales visibles. Cada módulo prioriza una secuencia de
temas prácticos. El sílabo y el estándar de calidad viven en documentos
centrales; las fuentes específicas permanecen junto al tema que sustentan. No
existen rutas separadas de cuestionarios, rúbricas o laboratorios repetidos.

Los conteos se verifican contra los tracks y el Markdown desde
`scripts/validate_learning_priorities.py`; la validación falla si README vuelve
a quedar desincronizado. La auditoría de criterios editoriales informa presencia
estructural detectada por heurísticas, no calidad ni ejecución: al corte actual
registra 1092/1098 temas practicables (cada tema tiene demostración ejecutable con
comando y resultado, verificado por el auditor endurecido). La auditoría independiente
de metodología de siete pasos registra 1098/1098 temas completos según sus marcadores
(el auditor reconoce el andamiaje real de cada ecosistema: `npm create vite`, `create-next-app`,
«Nuevo proyecto» de Xcode y `xcodebuild`, las CLIs de nube `aws`/`az`/`gcloud` que crean el
recurso base del tema, y la evidencia concreta que entrega el artefacto de un paso, además de
`mkdir`, `ng new` o `flutter create`). Los temas aún incompletos permanecen como deuda editorial
real —no detectable como falso negativo— y requieren reescritura específica. La
diferencia y los
criterios faltantes por tema permanecen visibles en
[`docs/seven-step-methodology.md`](docs/seven-step-methodology.md) y
[`docs/editorial-backlog.md`](docs/editorial-backlog.md).

## Licencias

El código fuente y las herramientas se distribuyen bajo MIT. Las lecciones
originales y la documentación editorial se ofrecen bajo Creative Commons
Atribución 4.0 Internacional (CC BY 4.0). Material de terceros, capturas,
marcas y recursos con licencia propia quedan excluidos; consulta los avisos de
atribución junto al material. Ver [`LICENSE`](LICENSE) y
[`web/public/content/LICENCIA-CONTENIDO.md`](web/public/content/LICENCIA-CONTENIDO.md).

La preparación completa se muestra únicamente en el módulo inicial. La ruta
oficial permanece disponible de forma plegable en el índice y el proyecto
integrador aparece en el capítulo final. WebFlux es uno de los temas que ya alcanza el recorrido manual
esperado; no se usa para ocultar la deuda editorial de los demás.
La auditoría editorial de `docs/topic-learning-quality.md` sigue midiendo el
Markdown real por separado: una ayuda generada en la interfaz no convierte una
explicación superficial en contenido editorial completo.

`docs/code-visual-quality.md` mide además, sin contar las guías generadas, qué
temas tienen código, comentarios didácticos, ubicación, comando, Mermaid y
fuente oficial. Los bloques ejecutables ya no se presentan falsamente como
“Diagrama”: código, terminal y configuración tienen etiquetas propias; los
diagramas Mermaid se renderizan como figuras accesibles con contexto y guía de
lectura. Los visuales ASCII restantes se conservan como deuda explícita hasta
que puedan redibujarse sin alterar su significado.

`docs/editorial-backlog.md` convierte esas mediciones en una lista accionable
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

`scripts/validate.sh` valida automaticamente que el numero de archivos
Markdown de cada track coincida con los modulos declarados en su fuente
TypeScript, que el índice web corresponda a esos 14 tracks y que los reportes de
calidad permanezcan sincronizados con el Markdown real.

## Actualización tecnológica

Cada ruta se contrasta con especificaciones, documentación, notas de versión,
seguridad y migración publicadas por los proyectos oficiales. El registro
`docs/official-sources.json` indica la línea estable o LTS utilizada, la fecha
de revisión y qué términos deben estar incorporados en el contenido.

```bash
python3 scripts/validate_official_sources.py
```

La comprobación vence a los 120 días. El CI se ejecuta además cada mes para
detectar una revisión pendiente aunque el repositorio no reciba cambios. Las
funciones preview o experimentales se presentan como tales y nunca como base
obligatoria de producción.

## Seguridad

Los temas de seguridad se tratan desde una practica defensiva y autorizada:
entender riesgos, proteger sistemas propios, validar configuraciones y construir
software mas robusto. No incluye instrucciones para atacar sistemas de terceros.

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
Markdown, las auditorías educativas,
los 12 proyectos, el progreso académico y el mapa actualizado del repositorio.
También exige los nueve criterios editoriales en cada tema y prueba la
restauración de backups en un PostgreSQL temporal cuando sus herramientas
están disponibles; CI las instala.

El CI tambien ejecuta build y tests de Angular:

```bash
cd web
npm run build --silent
npm test -- --watch=false
npm run e2e
```

## Mapa compacto para asistentes de IA

Para reducir exploracion repetida del repositorio, este proyecto incluye:

- `docs/repo-graph.md`: snapshot legible para asistentes.
- `docs/repo-graph.json`: indice estructurado para herramientas.

Actualizalo cuando cambie la estructura:

```bash
python3 scripts/build_repo_graph.py
```

Comprueba sincronizacion:

```bash
python3 scripts/build_repo_graph.py --check
```
