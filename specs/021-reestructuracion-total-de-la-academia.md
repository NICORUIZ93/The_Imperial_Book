# 021 · Reestructuración total de la academia: un tema, un lugar, una forma

**Estado:** en curso
**Origen:** el 2026-11-20 el dueño pidió revisar todos los cursos, temas y subtemas porque hay duplicidad
de títulos, redundancia, temas dentro de otros módulos, explicaciones y ejemplos desiguales, estructura de
página inconsistente, temas faltantes, falta de imágenes y de código, y falta de linealidad. Pidió un plan
de acción, autorizó reestructurar todo si hace falta y fijó **Floci** como la nube local de la academia
(«tampoco está bien explicado y el README está súper mal»).

**Ampliación del dueño (2026-11-20):** prioridad a **Java, Gradle y Spring** (también para los
laboratorios); hoy «no se explica bien, faltan muchos temas por curso, se está colocando lo más básico y no
sirve, y la explicación y los ejemplos también son básicos». El plan debe subir la profundidad, no solo
ordenar.

## Diagnóstico medido (2026-11-20, 16 cursos, 1.608 temas)

| Problema | Medida |
|---|---|
| El mismo asunto enseñado desde cero en varios cursos | Docker: 31 temas en 6 cursos · Kubernetes: 15 en 5 · CI/CD: 16 en 8 · Observabilidad: 39 en 11 · Terraform/IaC: 20 en 12 · JWT/OAuth: 12 en 4 · Kafka/colas: 18 en 3 · Testing: 85 en 15 |
| Títulos idénticos repetidos | 14 (7 dentro de Microservicios, 7 entre cursos) |
| Forma de explicar distinta en cada tema | Java: 106 estructuras distintas en 134 temas · Spring Boot: 116 en 137 (JavaScript y Flutter: 5 · Microservicios: 1) |
| Temas sin ninguna imagen | 1.556 de 1.608 |
| Temas sin imagen ni diagrama | 665 (Java 96/120, Control 73/88, Spring Boot 76/123) |
| Temas sin nivel ni duración declarados | 1.298 |
| Código verificado en una máquina real | solo Microservicios (37 laboratorios) e iOS |
| Nube local | Floci explicado a trozos en 35 módulos de Cloud y 7 de DevOps; 10 archivos mezclan LocalStack; el README no lo menciona |

La medición es por scripts sobre títulos y contenido. La lectura tema por tema es la Fase 1.

## Decisiones

- **Un concepto, un curso dueño.** Cada concepto se enseña una sola vez, en el curso que le corresponde.
  Los demás cursos lo *usan* y enlazan a esa lección; no lo vuelven a explicar desde cero.
- **Nada se pierde.** Antes de fusionar, mover o retirar un tema, queda escrito su destino. Lo retirado
  va a la rama `archivo` con su referencia, no se borra.
- **Una sola plantilla de tema** para toda la academia (la ficha de Microservicios, adaptada): ubicación y
  prerrequisitos → objetivo → analogía → diagrama con texto alternativo → explicación en tres niveles →
  código completo con versiones → salida esperada real → mini-laboratorio → verificación → error común →
  pregunta con respuesta modelo → anti-patrón.
- **Linealidad obligatoria.** Cada tema declara nivel y minutos; dentro de un capítulo el nivel no baja;
  ningún tema usa algo que no se haya enseñado antes en la ruta (o enlaza al prerrequisito).
- **Floci es la nube local de la academia** (AWS `floci/floci`, Azure `floci-az`, GCP `floci-gcp`, con el
  `docker-compose.yml` de la raíz). LocalStack solo aparece como comparación. Todo laboratorio de nube
  dice qué emula Floci y qué cambia en la nube real.
- **Prioridad: Java → Gradle → Spring.** Son los primeros cursos en pasar por todas las fases y marcan el
  estándar de los demás. **Gradle es la herramienta de construcción por defecto** de los laboratorios JVM
  (Kotlin DSL, wrapper fijado, catálogo de versiones); Maven se enseña como alternativa y para leer
  proyectos existentes.
- **Profundidad obligatoria (de cero a maestro de verdad).** Lo básico es el punto de partida, no el
  techo. Cada curso cubre cuatro niveles —Fundamentos, Aplicación, Integración, Experto— y al menos la
  **mitad de sus temas** son de Integración o Experto. Cada tema:
  - explica **cómo funciona por dentro** y por qué, no solo cómo se usa (nivel maestro con internals,
    límites, rendimiento y decisiones de diseño);
  - trae **un ejemplo realista** además del mínimo: un caso de producción con varias piezas, datos y
    errores reales (nada de `Foo`/`Hola mundo` como único ejemplo);
  - incluye **lo que sale mal**: el error real con su mensaje, cómo se diagnostica y cómo se arregla;
  - cierra con **criterio**: cuándo usarlo, cuándo no, alternativas y costo.
- **Cobertura contra referencia.** «Faltan temas» se mide: el temario de cada curso se contrasta con la
  documentación oficial completa de la tecnología y con lo que se pide a un perfil sénior; todo hueco
  queda listado con su decisión (se añade, o no y por qué).
- **Exactitud.** Ningún dato técnico sin ejecutarlo o verificarlo en fuente primaria (CLAUDE.md). El
  código de cada curso se ejecuta en el Mac del dueño antes de darlo por terminado.
- **El dueño aprueba** el mapa de conceptos (Fase 1) y cada temario (Fase 2) antes de reescribir temas.
- Se trabaja **un curso a la vez**, en `main`, sin ramas paralelas largas (la causa del choque del
  2026-11-20 entre dos líneas de trabajo sobre los mismos cursos).

## Plan por fases

### Fase 0 · Cerrar lo abierto
Fusionar sin pérdida el trabajo local del dueño (etiquetas y orden) con la rama de Microservicios y dejar
todo en `main`. Reescribir el README con el arranque real de la app y de Floci.

### Fase 1 · Mapa único de conceptos (documento, no toca lecciones)
`docs/reestructuracion/mapa-de-conceptos.md`: los 1.608 temas clasificados por concepto, con su curso
dueño propuesto y la acción de cada tema: **queda**, **se fusiona con X**, **se mueve a Y**, **se
convierte en enlace**, **se retira (archivo)**. Incluye la lista de duplicados reales (leídos, no solo por
título) y los temas que están en el curso equivocado.

Reparto inicial propuesto de conceptos transversales:

| Concepto | Curso dueño | Los demás cursos |
|---|---|---|
| Docker y contenedores | Docker (nuevo, specs/017) | usan una imagen ya hecha y enlazan |
| Kubernetes, Helm, GitOps | Kubernetes (nuevo, specs/017) | despliegan con manifiestos dados |
| CI/CD, IaC, observabilidad de plataforma | DevOps | cada stack añade solo lo propio (p. ej. Micrometer en Spring) |
| Nube (AWS/Azure/GCP) y Floci | Cloud | usan Floci con la lección de entrada |
| HTTP, Git, terminal, SQL básico, pruebas básicas | Fundamentos | no lo repiten |
| Seguridad web (OWASP, JWT, OAuth) | Fundamentos (concepto) + cada stack (implementación) | — |
| Sistemas distribuidos, mensajería, sagas | Microservicios | — |

### Fase 2 · Temario objetivo por curso (documento, lo aprueba el dueño)
Por curso: comparar con la documentación oficial completa de la tecnología, con rutas públicas tipo
roadmap.sh y con lo que se exige a un perfil sénior; listar los **temas que faltan** (sobre todo los
intermedios y avanzados), marcar los temas actuales que se quedan en lo básico y deben profundizarse, fijar el **orden lineal** (prerrequisitos, nivel, minutos) y el número de
módulos. Sale un `docs/temarios/<curso>.md` por curso con el antes y el después.

**Fuentes obligatorias del temario objetivo (pedido del dueño, 2026-11-20).** Cada curso se contrasta con
todas estas, y el documento del temario las cita con enlace:

1. Documentación y especificación oficiales completas (p. ej. dev.java y la JLS, docs.gradle.org, la
   referencia de Spring Framework/Boot/Data/Security).
2. **Índices de libros de referencia** del tema (al menos tres por curso; p. ej. Core Java I y II, Effective
   Java, Java Concurrency in Practice; Spring in Action, Pro Spring; Gradle in Action).
3. **Objetivos de certificaciones** vigentes (p. ej. OCP Java SE 21, Spring Certified Professional, CKA/CKAD,
   AWS/Azure/GCP).
4. **Sílabos universitarios y de bootcamps** publicados.
5. **Cursos largos de YouTube y plataformas** (temarios y marcas de tiempo de cursos «de cero a experto»).
6. Rutas públicas (roadmap.sh) y preguntas de entrevista de nivel sénior.

De cada fuente se toma la **lista de temas** (hechos), no su texto. El temario objetivo es la unión
deduplicada, ordenada de básico a experto, con una marca por tema: «ya está», «está pero básico» o «falta»,
y de qué fuentes sale. El curso no se cierra hasta que no queda ningún «falta» sin decisión.

**Alcance: todos los cursos.** El contraste con fuentes se hace para los 16 cursos actuales y los nuevos
(Gradle, Docker, Kubernetes, Diseño de sistemas), no solo para los prioritarios. Orden de entrega de los
temarios objetivo: Java, Gradle, Spring; luego Fundamentos, JavaScript, Node, React, Angular, Docker,
Kubernetes, DevOps, Cloud, Microservicios (solo huecos), Android, Kotlin Multiplatform, iOS, Flutter,
Control, Diseño de sistemas y RutaFlow (proyecto integrador: se rediseña al final sobre los cursos ya
cerrados).

### Fase 3 · Plantilla y validador únicos
Generalizar `scripts/validate_fichas.py` a todos los cursos: secciones obligatorias, diagrama con texto
alternativo, código con versiones, salida esperada, práctica, nivel y minutos, y título único en toda la
academia. Actualizar `docs/METODOLOGIA-DE-APRENDIZAJE.md` con la plantilla.

#### Formato educativo único (toda la página y todos los cursos)

El formato se define **una vez**, en `docs/METODOLOGIA-DE-APRENDIZAJE.md`, y la app lo dibuja siempre
igual: ningún curso tiene estructura, nombres de sección ni componentes propios.

| Nivel | Formato fijo |
|---|---|
| **Curso** | portada con: para quién es, prerrequisitos, qué sabrás hacer, mapa del curso (diagrama), proyecto guía, duración total, versiones y cómo preparar el entorno. Cuatro tramos siempre con el mismo nombre: Fundamentos, Aplicación, Integración, Experto. Cierre con proyecto final y rúbrica |
| **Módulo** | cabecera con: objetivo, prerrequisitos, duración, versiones, laboratorio del módulo y mapa del módulo (diagrama). 3 a 7 temas. Cierre con resumen, autoevaluación y «siguiente módulo» |
| **Tema** | las mismas 12 secciones, con el mismo nombre y orden: 1 Ubicación y prerrequisitos · 2 Objetivo · 3 Por qué importa (problema real) · 4 Analogía · 5 Diagrama · 6 Explicación (nivel 0, intermedio, maestro) · 7 Código ejecutable y salida real · 8 Mini-laboratorio · 9 Verificación · 10 Error común y diagnóstico · 11 Pregunta con respuesta modelo · 12 Cuándo usarlo y cuándo no. Encabezado «Tema N: título · nivel · minutos» |
| **Laboratorio** | carpeta `examples/<curso>/modulo-N/` con README, versiones fijadas y `verificar.sh` que termina en «RESULTADO: OK» |
| **Página (app)** | los mismos componentes en todos los cursos: ficha de tema, bloque de código con nombre de archivo y botón de copiar, bloque de salida esperada, avisos (nota, cuidado, error común), diagrama ampliable, índice del tema, progreso y navegación anterior/siguiente |

Pasos:

1. **Definir** el formato (documento de metodología + una lección de ejemplo completa) y aprobarlo el
   dueño antes de migrar nada.
2. **Validador único** (`scripts/validate_formato.py`): falla si un curso, módulo o tema no tiene las
   secciones con el nombre y orden exactos, o si le falta nivel, minutos, diagrama, código o salida.
   Entra en `./scripts/validate.sh` y en la integración continua: nada fuera de formato llega a `main`.
3. **La app dibuja el formato**: `lesson-viewer` reconoce las 12 secciones y las muestra con los mismos
   componentes; se retiran los estilos y estructuras especiales por curso. Prueba de navegador que
   recorre un tema de cada curso y comprueba que aparecen las 12 secciones.
4. **Migración** curso por curso (orden de la Fase 4), en dos pasadas: primero estructura (mover lo que ya
   existe a las 12 secciones y marcar las que queden vacías), después contenido (llenar lo vacío con la
   profundidad exigida). Un curso se publica como «en formato» solo cuando el validador da 100 %.
5. **Tablero de avance** en `docs/reestructuracion/ESTADO.md`: por curso, porcentaje de temas en formato y
   secciones pendientes, generado por el validador.

### Fase 4 · Reescritura curso por curso
Orden: **1.º Java · 2.º Gradle · 3.º Spring** (prioridad del dueño), después Fundamentos → JavaScript →
Node → React → Angular → Docker → Kubernetes → DevOps → Cloud (con Floci) → Android → Kotlin
Multiplatform → iOS → Flutter → Control.

Alcance mínimo de los tres prioritarios (se detalla y aprueba en la Fase 2):

| Curso | Debe llegar hasta |
|---|---|
| Java (JDK 25) | lenguaje completo y moderno (records, sealed, pattern matching, genéricos a fondo), colecciones y streams por dentro, concurrencia (hilos virtuales, structured concurrency, `java.util.concurrent`), JVM (memoria, GC, JIT, class loading), módulos, E/S y NIO, pruebas, rendimiento y diagnóstico (JFR, jcmd, heap dumps) |
| Gradle | curso propio (hoy son temas sueltos dentro de Java): modelo de construcción y ciclo de vida, Kotlin DSL, tareas y caché incremental, catálogos de versiones, multi-proyecto, convention plugins, plugins propios, build cache y configuration cache, pruebas y publicación, Gradle para Spring Boot y para Android/KMP, diagnóstico de builds lentos |
| Spring (Boot 4, Framework 7) | contenedor por dentro (beans, ciclo de vida, proxies, AOP, autoconfiguración), Web MVC y WebFlux, Data (JPA a fondo, transacciones, N+1), Security (cadena de filtros, OAuth2/OIDC), pruebas (slices, Testcontainers), mensajería, observabilidad, rendimiento y arranque (AOT, native, CDS), despliegue |

Los laboratorios de estos tres cursos se construyen con Gradle y se ejecutan en el Mac del dueño.
Microservicios ya cumple la plantilla: solo se le quitan las repeticiones que el mapa señale.
En cada curso: aplicar mapa y temario, pasar cada tema a la plantilla, añadir el diagrama o la imagen,
ejecutar el código, dejar un laboratorio por módulo y la redirección de progreso
(`web/src/app/module-renumbering.ts`) para que nadie pierda lo que ya leyó.

#### Cómo mejora la explicación

**En todos los cursos** (lo comprueba el validador de la Fase 3 y la revisión de la Fase 6):

1. **Del porqué al cómo:** cada tema abre con el problema real que resuelve y qué pasa si no lo usas.
2. **Tres niveles en el mismo tema:** nivel 0 (analogía y un ejemplo mínimo), intermedio (uso real con
   varias piezas) y maestro (cómo funciona por dentro, límites, rendimiento, decisiones de diseño).
3. **Un caso que crece:** cada curso tiene un proyecto guía que avanza módulo a módulo; los ejemplos
   dejan de ser sueltos (`Foo`, «Hola mundo») y pasan a ser partes de ese sistema.
4. **Código completo y ejecutado:** archivo con nombre y ruta, versiones, comando para correrlo y la
   salida real pegada; explicación por bloques de lo que no es obvio.
5. **Ver para entender:** un diagrama por tema (flujo, memoria, secuencia o arquitectura) con texto
   alternativo; capturas reales de terminal o de la herramienta cuando el tema es de uso.
6. **Lo que sale mal:** el error real con su mensaje, cómo se diagnostica paso a paso y cómo se corrige.
7. **Practicar y comprobar:** mini-laboratorio con criterio de éxito verificable, y preguntas con
   respuesta modelo (incluida una de entrevista).
8. **Criterio:** cuándo usarlo, cuándo no, alternativas y costo.
9. **Hilo entre temas:** cada tema dice de dónde viene y a dónde lleva, sin repetir lo ya enseñado.

**Énfasis propio de cada curso:**

| Curso | Cómo se explica mejor |
|---|---|
| Fundamentos | del problema cotidiano a la abstracción; todo se prueba en la terminal del estudiante; cada concepto (HTTP, Git, SQL, redes) con una traza real que se pueda leer línea a línea |
| Java | modelo de memoria dibujado (pila, heap, referencias) en cada tema de lenguaje; bytecode con `javap` y JFR para mostrar qué hace la JVM; evolución del mismo ejemplo de Java 8 a 25; concurrencia con fallos reproducibles (carreras, bloqueos) |
| Gradle | cada build se explica con su grafo de tareas y `--scan`/`--info`; se parte de un build roto o lento real y se arregla; siempre Kotlin DSL y multi-proyecto, no builds de juguete |
| Spring | «la magia» abierta: qué beans crea la autoconfiguración y por qué (informe de condiciones, depurador), proxies y transacciones con traza; cada tema sobre el mismo servicio que crece hasta producción; pruebas en cada tema |
| JavaScript | el motor a la vista: pila de llamadas, cola de tareas y microtareas dibujadas; cada rareza del lenguaje con su regla de la especificación; ejercicios en el navegador y en Node |
| Node | el bucle de eventos y los streams medidos (no contados): perfiles, fugas y contrapresión reproducidas; un mismo servicio de la API mínima a producción |
| React | modelo mental de render y reconciliación con el Profiler; cada hook con el fallo que causa usarlo mal; una app que crece (estado, datos, rutas, pruebas, rendimiento) |
| Angular | detección de cambios y signals visualizados; inyección de dependencias con su árbol; la misma app que crece con pruebas y SSR |
| Docker | qué es de verdad un contenedor (namespaces, cgroups, capas) inspeccionando imágenes reales; cada Dockerfile se mide (tamaño, tiempo, vulnerabilidades) antes y después |
| Kubernetes | cada objeto se observa reconciliándose (`kubectl get -w`, eventos); fallos provocados (pod que no arranca, sonda mal puesta) y su diagnóstico; todo en kind |
| DevOps | un mismo servicio recorre el pipeline completo; cada práctica con su métrica (DORA) y su incidente de ejemplo; herramientas reales, no descripciones |
| Cloud | cada servicio primero en **Floci** (local, repetible) y luego «qué cambia en la nube real»: permisos, costo y límites; arquitecturas dibujadas y cotizadas |
| Microservicios | ya cumple la plantilla; se mantiene Spring y Node por separado y se enlazan los temas espejo |
| Android / Kotlin Multiplatform | ciclo de vida y recomposición visualizados; la misma app crece por capas; cada tema corre en emulador con captura real |
| iOS | SwiftUI y concurrencia de Swift con diagramas de estado y de actores; la misma app crece; capturas reales del simulador |
| Flutter | árbol de widgets, elementos y render objects dibujado; rendimiento medido con DevTools; la misma app crece |
| Control | de la intuición física a la ecuación y a la simulación: cada concepto con su gráfica generada por código ejecutable y un sistema real (tanque, motor) |
| Diseño de sistemas | cada diseño parte de requisitos y números (carga, latencia, costo), compara al menos dos alternativas y termina en un ADR |

### Fase 5 · Floci: una entrada, bien explicada
Una lección de entrada «Nube en local con Floci» (qué es, cómo se levanta, cómo se comprueba, qué no
emula, cómo pasar a la nube real), el README con ese arranque, y todos los laboratorios de nube
verificados contra Floci en el Mac del dueño. Se hace junto con el curso de Cloud.

### Fase 6 · Verificación y cierre por curso
Cada curso se cierra cuando pasa el validador, sus laboratorios pasan en el Mac y la revisión de la página
real en el navegador (skill `academy-flow-inspector`) no deja hallazgos.

## Criterios

Cada fase deja en `docs/reestructuracion/` el informe que prueba su criterio (con el comando del validador
que se cree en la Fase 3); la verificación de abajo comprueba que ese informe existe.

- **Z0** `pendiente` — `main` contiene Microservicios completo y el trabajo local del dueño, sin temas
  perdidos, y el README explica cómo arrancar la app y Floci.
  Verificación: `grep -q "^- \[x\] Z0 " docs/reestructuracion/ESTADO.md`
- **Z1** `pendiente` — Existe el mapa de conceptos con la acción de cada tema y el dueño lo aprobó.
  Verificación: `grep -q "^- \[x\] Z1 " docs/reestructuracion/ESTADO.md`
- **Z2** `pendiente` — Cada curso tiene su temario objetivo (temas faltantes y orden lineal) aprobado.
  Verificación: `grep -q "^- \[x\] Z2 " docs/reestructuracion/ESTADO.md`
- **Z3** `pendiente` — Un validador único comprueba la plantilla en todos los cursos y los títulos no se
  repiten en toda la academia.
  Verificación: `grep -q "^- \[x\] Z3 " docs/reestructuracion/ESTADO.md`
- **Z4** `pendiente` — Todos los temas declaran nivel y minutos, y ningún capítulo incumple el orden.
  Verificación: `grep -q "^- \[x\] Z4 " docs/reestructuracion/ESTADO.md`
- **Z5** `pendiente` — Todo tema tiene diagrama o imagen con texto alternativo.
  Verificación: `grep -q "^- \[x\] Z5 " docs/reestructuracion/ESTADO.md`
- **Z6** `pendiente` — Floci tiene una lección de entrada, LocalStack no aparece fuera de comparaciones y
  los laboratorios de nube pasan contra Floci en el Mac.
  Verificación: `grep -q "^- \[x\] Z6 " docs/reestructuracion/ESTADO.md`
- **Z7** `pendiente` — Los laboratorios de todos los cursos pasan en el Mac del dueño.
  Verificación: `grep -q "^- \[x\] Z7 " docs/reestructuracion/ESTADO.md`
- **Z8** `pendiente` — Java, Gradle (curso propio) y Spring pasaron por todas las fases antes que el
  resto, con sus laboratorios en Gradle verificados en el Mac.
  Verificación: `grep -q "^- \[x\] Z8 " docs/reestructuracion/ESTADO.md`
- **Z9** `pendiente` — Profundidad: en cada curso al menos la mitad de los temas son de nivel Integración
  o Experto, y todo tema tiene ejemplo realista, error real diagnosticado y criterio de uso.
  Verificación: `grep -q "^- \[x\] Z9 " docs/reestructuracion/ESTADO.md`
- **Z10** `pendiente` — Formato único: metodología aprobada, validador de formato dentro de `validate.sh`,
  la app dibuja las 12 secciones con los mismos componentes y todos los cursos están al 100 %.
  Verificación: `grep -q "^- \[x\] Z10 " docs/reestructuracion/ESTADO.md`
