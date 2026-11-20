# Temario objetivo · Gradle (curso nuevo, de cero a experto)

> **Aprobado por el dueño el 2026-11-20** (versión extendida). Decisiones: 28 módulos y 166 temas (versión extendida); Gradle 9.9.x en el curso y 9.7.x para Android/KMP; Maven sin curso propio.

**Estado:** propuesta para aprobación del dueño (specs/021, Fase 3, criterio Z2). No hay lecciones escritas
y este documento no cambia ningún tema actual.
**Fecha de revisión de fuentes:** 2026-11-20.
**Identificador de ruta previsto:** `gradle`.
**Posición en la academia:** 2.º curso prioritario (Java → **Gradle** → Spring). Regla 7 de specs/021: Gradle
es curso propio y la herramienta por defecto de los laboratorios JVM (Kotlin DSL, wrapper y catálogo de
versiones); Maven queda como alternativa.

## 1. Resumen

### 1.1 Qué hay hoy de Gradle y dónde

No existe un curso de Gradle. `docs/reestructuracion/listado-de-temas.csv` tiene 10 filas con «Gradle» o
«Maven» en el título del tema o del módulo, y 55 archivos de `web/public/content` mencionan Gradle (19 de
Android, 14 de Kotlin Multiplatform, 9 de Java, 6 de Spring Boot, 5 de Flutter y 2 de Microservicios); en la
mayoría es solo el comando `./gradlew` de un laboratorio. Los temas que de verdad enseñan Gradle son estos:

| Curso · módulo · tema actual | Nivel · min · palabras | Qué enseña de Gradle | Destino propuesto |
|---|---|---|---|
| Java M8 T1 · pom.xml vs build.gradle.kts | Básico · 40 · 586 | Un subtema de 10 min declara el mismo proyecto en Gradle | La parte Gradle pasa a M0 T3 y M0 T6; en Java queda la parte Maven y un enlace |
| Java M8 T2 · Ciclo de vida de build y scopes | Intermedio · 40 · 563 | Un subtema de 10 min inspecciona «scopes» en Gradle | M4 T2 y M6 T1; en Java queda el ciclo de vida de Maven |
| Java M8 T3 · Proyectos multi-módulo | Intermedio · 40 · 582 | Multi-módulo con Maven; nada propio de Gradle | Se queda en Java (Maven); M8 T1 lo enseña en Gradle |
| Java M8 T4 · Maven y Gradle lado a lado | Avanzado · 50 · 818 | El mismo proyecto pequeño en las dos herramientas | Se queda en Java como tema puente; M27 T3 hace la migración completa |
| Java M15 T2 · Gradle y builds reproducibles | Avanzado · 45 · 567 | Wrapper, hash del JAR repetible y `--write-verification-metadata` | Se reparte en M1 T1, M17 T1 y M17 T4; en Java queda un enlace |
| Java M15 T3 · Proyectos multi-módulo sin ciclos | Intermedio · 40 | ArchUnit; un subtema comprueba el grafo del build | Se queda en Java (es arquitectura); enlaza a M8 |
| Spring Boot M1 · sección «Alternativa comprobable con Gradle» | sin tema | Equivalencias de comandos Maven → Gradle, con `build.gradle` en Groovy DSL | M11 T1; en Spring queda un enlace |
| Android M0 T3 · AndroidManifest.xml y módulos Gradle | sin nivel · 1.854 | Módulos y `build.gradle.kts` de una app | Se queda en Android; enlaza a M0 T3 y M26 T1 |
| Android M18 T1 · Gradle, version catalogs y resolución de dependencias | sin nivel · 500 | Catálogo y conflictos, en 500 palabras | M4 T4 y M15 T2; en Android queda un enlace y lo propio de AGP |
| Android M18 T3 · Modularización, convenciones y fronteras de arquitectura | sin nivel | Convention plugins para una app modular | M9 T2 y M26 T4; la parte de arquitectura se queda en Android |
| KMP M3 T3 · Gradle multiplataforma y targets disponibles | sin nivel · 966 | Bloque `kotlin {}` y targets | Se queda en KMP; M26 T3 explica el modelo de variantes de debajo |
| KMP M3 T5 · Version catalogs y convention plugins | Avanzado · 45 · 1.010 | El tema de Gradle más completo que existe hoy | Se mueve a M4 T4 y M9 T2, generalizado a JVM; en KMP queda un enlace |
| KMP M10 T1 · Pipeline Gradle multiplataforma en CI | sin nivel · 1.272 | CI con Gradle para KMP | M20 T2 toma lo general; en KMP queda lo de runners macOS e iOS |
| KMP M13 T5 · Publicación en Maven Central | sin nivel · 569 | Publicar una librería KMP | M19 T1 y M19 T4 toman lo general; en KMP queda lo multiplataforma |

Otros temas se quedan en su curso y solo se enlazan: Android M18 T2 (build types y flavors), Android M11
(firma, App Bundle y versionado), Spring Boot M19 T1, T2 y T4 (capas del JAR, native image y Buildpacks) y
Flutter M7, M11 y M15 (Gradle del lado Android).

**Medida de cobertura actual.** De los 166 temas del temario objetivo, **135 faltan**, **31 están pero
básicos** y **ninguno está al nivel objetivo**. Ningún tema actual cumple a la vez las tres condiciones del
énfasis de Gradle en specs/021 §3 (grafo de tareas con `--scan`/`--info`, build roto o lento real, Kotlin DSL y
multi-proyecto), así que ninguno se marca «ya está»: los 31 se mueven como material de partida.

**Hallazgos del repositorio que el temario debe corregir:**

1. 52 de los 53 archivos de build Gradle de `examples/` usan **Groovy DSL** (`build.gradle`); solo
   `examples/java-gradle` usa Kotlin DSL y no tiene wrapper. Ningún laboratorio tiene `gradle/libs.versions.toml`. La regla 7 pide
   Kotlin DSL, wrapper y catálogo.
2. Los 50 wrappers de `examples/` fijan **Gradle 9.8.2** con `distributionSha256Sum`. `docs/VERSIONES.md`
   dice «Gradle 9.x» y, para Android y KMP, 9.7. La versión estable hoy es 9.9.2 (ver 1.3).
3. Java M15 T2 hace ejecutar `gradle wrapper --gradle-version 9.1.0` y fijar a mano
   `isPreserveFileTimestamps = false` e `isReproducibleFileOrder = true`. Desde Gradle 9.0 los archivos son
   reproducibles por defecto (guía de actualización a 9.0), así que el tema enseña un paso que ya no hace falta.
4. Spring Boot M0 cita el inventario `docs/spring-gradle-labs.json`, que no existe en el repositorio.

### 1.2 Tamaño del curso objetivo

| Tramo | Nivel | Módulos | Temas | Duración de los temas |
|---|---|---:|---:|---:|
| 1 · Fundamentos | Básico | 6 | 34 | 16 h 15 min |
| 2 · Aplicación | Intermedio | 6 | 33 | 19 h 30 min |
| 3 · Integración | Avanzado | 9 | 55 | 38 h 50 min |
| 4 · Experto | Experto | 7 | 44 | 32 h 15 min |
| **Total** | | **28** | **166** | **106 h 50 min** |

El 59,6 % de los temas (99 de 166) está en Integración o Experto: cumple la regla 4 de specs/021. Los
módulos tienen entre 4 y 7 temas y ningún tema pasa de 45 minutos. A las 106 h 50 min de temas se suman
unas 14 h de proyecto final (sección 4.3): **≈ 121 h**.

### 1.3 Versiones de referencia (verificadas el 2026-11-20)

| Herramienta | Versión | Fuente |
|---|---|---|
| Gradle | **9.9.2**, estable vigente (compilada el 2026-11-19). Anteriores: 9.9.1 (2026-11-10) y 9.9.0 (2026-11-06). Línea de mantenimiento: 8.14.8 (2026-11-19) | [services.gradle.org/versions/current](https://services.gradle.org/versions/current) · [gradle.org/releases](https://gradle.org/releases/) |
| JVM para ejecutar Gradle 9.9 | de 17 a 27. Java 25 se admite desde Gradle 9.1.0 y Java 27 desde 9.8.0. El wrapper, el cliente, la Tooling API y TestKit siguen siendo compatibles con JVM 8 | [Compatibility Notes](https://docs.gradle.org/current/userguide/compatibility.html) |
| Kotlin en Gradle | versión de lenguaje del Kotlin DSL: 2.2. Kotlin embebido: la última fila de la tabla es 2.4.21 (desde Gradle 9.9.0). Rango probado: 2.0.0 a 2.5.0-Beta1 | Compatibility Notes |
| Groovy embebido | última fila de la tabla: 4.0.33 (desde Gradle 9.8.0) | Compatibility Notes |
| Kotlin Gradle Plugin | 2.4.20–2.4.21 declara Gradle 7.6.3–**9.7.0** y AGP 8.5.2–**9.3.1** | [kotlinlang.org · Configure a Gradle project](https://kotlinlang.org/docs/gradle-configure-project.html) |
| Android Gradle Plugin | 9.5.0 (octubre de 2026; hay parche 9.5.1). Exige Gradle **9.6.0** como mínimo y JDK 17. Gradle 9.9 declara probado AGP 9.0 a 9.5.0-alpha10 | [developer.android.com · AGP 9.5](https://developer.android.com/build/releases/gradle-plugin) · Compatibility Notes |
| Plugin de Gradle de Spring Boot | Spring Boot 4.1.2: requiere Gradle 8.14 o posterior de la línea 8, o Gradle 9.x; admite configuration cache | [docs.spring.io · Gradle Plugin](https://docs.spring.io/spring-boot/gradle-plugin/index.html) |
| Maven (alternativa) | 3.9.16 (2026-05-13) es la estable. Maven 4 sigue en candidata: 4.0.0-rc-7 (2026-09-24), «not yet GA» | [maven.apache.org · historial](https://maven.apache.org/docs/history.html) |
| Develocity | documentación 2026.3; plugin de Develocity para Gradle 4.6 | [docs.develocity.ai](https://docs.develocity.ai/2026.3/) |
| `gradle/actions/setup-gradle` | v6 | [gradle/actions](https://github.com/gradle/actions/blob/main/docs/setup-gradle.md) |

**Tres avisos de versión que condicionan el curso:**

- **Discrepancia entre páginas oficiales.** El servicio de versiones ya publica 9.9.2, pero la página de
  notas de versión y la de compatibilidad seguían mostrando 9.9.1 el 2026-11-20, y la lista de releases aún
  no incluía 9.9.2. Las notas de 9.9.2 no se pudieron leer. Hay que confirmar en el Mac con
  `./gradlew wrapper --gradle-version 9.9.2` antes de fijarla.
- **La matriz móvil no cierra con la última versión de todo.** KGP 2.4.21 declara soporte hasta Gradle 9.7.0
  y AGP 9.3.1; AGP 9.5 exige Gradle 9.6.0 o posterior. El tramo JVM puede ir en 9.9.x, pero M26 (Android y
  KMP) necesita una combinación probada en el Mac (la sonda de specs/019 pasó con JDK 25 + Gradle 9.7.0).
- **Estado de las funciones.** La configuration cache **no** está activada por defecto en 9.9 y no se comparte
  entre máquinas; `maven-publish` e `ivy-publish` la admiten solo en parte. Isolated Projects está en
  incubación. Declarative Gradle es experimental (tercera EAP) y sin compromiso de sintaxis: entra solo como
  panorama (M23 T7).

Novedades de 9.9 que tocan temas del curso (notas de versión): compilación incremental de los scripts de
Kotlin DSL, filtros de pruebas para pruebas de JUnit Platform que no son métodos, la tarea `wrapper` conserva
propiedades personalizadas, grupos predefinidos en la Problems API, sincronización de Eclipse con Isolated
Projects, y promoción a estable del resto de la API del bloque `dependencies` personalizado.

## 2. Temario objetivo completo

**Cómo leer las tablas.** Los tramos y niveles son los de specs/021 §3: Fundamentos = Básico, Aplicación =
Intermedio, Integración = Avanzado, Experto = Experto. El nivel no baja dentro de un módulo ni entre módulos.
«Min» es la duración del tema. En «Estado»: *falta* (no existe), *está pero básico* (existe algo; se indica
dónde y qué le falta). La columna «Fuentes» usa las claves de la sección 6; `UM-…` es una página del User
Manual, `BP-…` una categoría de Best Practices, `L-…` un libro (con capítulo), `DPE-…` un curso de DPE
University, `U-…` un sílabo, `V-…` un curso en vídeo o plataforma (con episodio o sección) y `E-…` una lista
de entrevista, charla o artículo de errores frecuentes.

### Tramo 1 · Fundamentos (nivel Básico)


#### M0 · El problema del build y el primer contacto

**Objetivo:** Entender qué automatiza Gradle y ejecutar, leer y crear un build sin instalar nada global. **Temas:** 6 · **Duración:** 2 h 45 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M0 T1 | Qué resuelve una herramienta de build: de `javac` a mano a un build declarado | Básico | 25 | falta | UM-Core, L-GiA 1, L-BTG 1, U-MIT, U-ODU, V-PS |
| M0 T2 | Ejecutar un build ajeno con el Wrapper (`./gradlew`) sin instalar Gradle | Básico | 25 | está pero básico — Java M15 T2 (subtema 5.1) lo usa con Gradle 9.1.0 pero no lo explica desde cero | UM-Wrapper, V-GH 2, V-PL, E-J67 |
| M0 T3 | Anatomía de un build: `settings.gradle.kts`, `build.gradle.kts`, `gradle/` y `build/` | Básico | 30 | está pero básico — Java M8 T1 (subtema 1.2) declara un proyecto mínimo; Android M0 T1/T3 lo cuenta para Android | UM-Anatomy, V-UG 1–2, U-UW, AND |
| M0 T4 | `gradle init` y la estructura estándar de un proyecto Java | Básico | 25 | falta | UM-BuildInit, UM-Tutorial-B1, V-GH 2, U-UW |
| M0 T5 | La línea de comandos: tareas, abreviaturas, `tasks`, `help --task`, `--console` y códigos de salida | Básico | 30 | falta | UM-CLI, L-GiA ap. A, L-BTG 1, V-GH 2 |
| M0 T6 | Gradle, Maven, Ant y Bazel: modelos distintos y criterio para elegir | Básico | 30 | está pero básico — Java M8 T1 compara `pom.xml` y `build.gradle.kts`; falta el modelo (fases fijas frente a grafo de tareas) y Bazel | L-GiA 1–2, L-BTG 3–4, U-ODU, V-PS, E-J67 |

#### M1 · Wrapper, daemon y entorno de ejecución

**Objetivo:** Controlar con qué Gradle y con qué JVM corre el build en cualquier máquina. **Temas:** 6 · **Duración:** 2 h 50 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M1 T1 | El Wrapper por dentro: archivos, `distributionUrl`, suma SHA-256 y actualización segura | Básico | 30 | está pero básico — Java M15 T2: genera el wrapper; falta la verificación de la distribución y del `gradle-wrapper.jar` | UM-Wrapper, BP-Seg, V-PS 9, E-J67 |
| M1 T2 | El Gradle Daemon: qué mantiene en memoria, `--status`, `--stop` y su JVM | Básico | 30 | falta | UM-Daemon, V-GH 2, E-J67 |
| M1 T3 | `gradle.properties`, propiedades de proyecto, de sistema y variables de entorno: precedencia | Básico | 30 | falta | UM-BuildConfig, BP-Gen, V-GH 5, E-J67 |
| M1 T4 | Directorios de Gradle: `GRADLE_USER_HOME`, `.gradle/` del proyecto y `build/`; qué se puede borrar | Básico | 25 | falta | UM-Dirs, V-PS 5 |
| M1 T5 | Gradle en IntelliJ IDEA y Android Studio: sincronización, ejecución de tareas y errores de sync | Básico | 25 | falta | UM-IDE, L-GiA 10, L-GEI 12, V-GH 2, V-PL |
| M1 T6 | Compatibilidad de versiones: qué JDK ejecuta Gradle y qué JDK compila el proyecto | Básico | 30 | está pero básico — Spring Boot M0 lo advierte en una nota (JDK 25 exige Gradle 9.1+); no hay tema | UM-Compat, REL, KT, AND-AGP |

#### M2 · Kotlin DSL para leer y escribir builds

**Objetivo:** Leer cualquier `*.gradle.kts` sabiendo qué es Kotlin y qué es API de Gradle. **Temas:** 5 · **Duración:** 2 h 30 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M2 T1 | Kotlin mínimo para builds: lambdas con receptor, extensiones y delegados `by` | Básico | 30 | está pero básico — KMP M1 T4 enseña lambdas con receptor y builders tipo DSL, sin aplicarlo a Gradle | UM-KotlinDSL, V-UG 24, V-GH 3, E-KC1 |
| M2 T2 | Bloques de `build.gradle.kts` y accesores con tipos: de dónde salen `java {}`, `tasks.test {}` | Básico | 30 | falta | UM-KotlinDSL, UM-BuildFile, V-UG 2 |
| M2 T3 | `settings.gradle.kts`: `pluginManagement`, `dependencyResolutionManagement`, `rootProject.name` e `include` | Básico | 30 | falta | UM-Settings, BP-Gen, BP-Dep, V-UG 1, E-ALG |
| M2 T4 | Aplicar plugins: bloque `plugins {}`, ids, versiones, plugins núcleo y Plugin Portal | Básico | 30 | falta | UM-PluginsBasics, BP-Gen, V-UG 3, V-PS, E-J67 |
| M2 T5 | Leer Groovy DSL y migrarlo a Kotlin DSL | Básico | 30 | falta | UM-MigrGroovy, UM-GroovyDSL, L-GiA ap. B, AND-KTS, E-KC1, E-ALG, E-J67 |

#### M3 · Un proyecto Java con Gradle

**Objetivo:** Construir, ejecutar y empaquetar una aplicación y una librería Java con las convenciones de los plugins núcleo. **Temas:** 6 · **Duración:** 2 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M3 T1 | Plugins `java`, `java-library` y `application`: qué tareas y convenciones añade cada uno | Básico | 30 | falta | UM-JavaPlugin, UM-JavaLib, UM-App, L-GiA 3, L-GEI 4, V-GH 4, V-UD 2 |
| M3 T2 | Source sets y estructura de directorios; cómo añadir uno | Básico | 30 | falta | UM-JVM, V-UG 16, V-PS 4, V-PL |
| M3 T3 | Compilar: `JavaCompile`, `options.release`, codificación y argumentos del compilador | Básico | 30 | falta | UM-JVM, V-UG 22, BP-Perf |
| M3 T4 | Toolchains de JVM: fijar el JDK del proyecto y descargarlo con un resolver | Básico | 30 | está pero básico — Java M15 T1 (subtema 1.3) bloquea un JDK incompatible en Maven; Microservicios M4 menciona la toolchain; no hay tema de Gradle | UM-Toolchains, UM-ToolchainResolver, KT, V-GH 4 |
| M3 T5 | Empaquetar y ejecutar: `Jar`, manifiesto, `run`, `installDist` y distribuciones | Básico | 30 | falta | UM-App, UM-Distribution, L-GiA 14, L-BTG 2 |
| M3 T6 | Recursos y `processResources`: filtrado, expansión de propiedades y trampas de codificación | Básico | 25 | falta | UM-Files, L-GBB 1, MVN |

#### M4 · Dependencias: lo esencial

**Objetivo:** Declarar dependencias en la configuración correcta, con las versiones en un catálogo, y saber de dónde sale cada JAR. **Temas:** 6 · **Duración:** 2 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M4 T1 | Coordenadas, repositorios y qué descarga Gradle al resolver | Básico | 30 | está pero básico — Java M8 T1 (subtema 1.3) fija una dependencia directa | UM-DepBasics, UM-Repos, L-GBB 4, L-GiA 5, V-PS 5, U-UW, U-MIT |
| M4 T2 | Configuraciones: `implementation`, `api`, `compileOnly`, `runtimeOnly`, `testImplementation`, `annotationProcessor` | Básico | 30 | está pero básico — Java M8 T2 (subtema 2.3) inspecciona scopes en Gradle en 10 min, como traducción de Maven | UM-Configurations, UM-JavaLib, V-UG 8, E-J67, V-PS 5 |
| M4 T3 | Ver el grafo: `dependencies`, `dependencyInsight` y el informe del Build Scan | Básico | 30 | está pero básico — Java M8 T4 (subtema 4.2) compara dependencias resueltas con Maven | UM-ViewDeps, V-GH bonus, E-ALG, E-J67 |
| M4 T4 | Catálogo de versiones: `libs.versions.toml` con `versions`, `libraries`, `bundles` y `plugins` | Básico | 30 | está pero básico — KMP M3 T5 y Android M18 T1 lo enseñan para móvil; se generaliza a JVM y se mueve aquí | UM-Catalogs, BP-Dep, V-UG 9, V-PS 8, V-PL, U-UW, E-AND, E-KC2 |
| M4 T5 | Dependencias entre proyectos, de archivos y de la propia distribución de Gradle | Básico | 25 | falta | UM-DeclDeps, L-GBB 4 |
| M4 T6 | Declarar versiones: exactas, rangos, dinámicas y módulos cambiantes (SNAPSHOT) | Básico | 30 | falta | UM-Versions, L-GBB 4, U-MIT |

#### M5 · Pruebas con Gradle

**Objetivo:** Ejecutar, filtrar y reportar pruebas de un proyecto JVM como lo hace un equipo. **Temas:** 5 · **Duración:** 2 h 20 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M5 T1 | La tarea `Test` y JUnit Platform: `useJUnitPlatform`, descubrimiento y por qué «no encontró pruebas» ahora falla | Básico | 30 | está pero básico — Java M8 T4 (subtema 4.1) ejecuta el mismo test con ambas herramientas | UM-JavaTesting, V-UG 18–19, L-BTG 5, L-GiA 7, V-PS 7, UPG9 |
| M5 T2 | Filtrar, repetir y registrar: `--tests`, `testLogging`, `--rerun`, informes HTML y XML | Básico | 25 | falta | UM-JavaTesting, V-UG 19, V-PS 7, REL |
| M5 T3 | JVM Test Suite: pruebas de integración como suite separada | Básico | 30 | falta | UM-TestSuite, MVN, V-GH 4 |
| M5 T4 | Test fixtures: compartir utilidades de prueba entre proyectos | Básico | 25 | falta | UM-TestFixtures, V-UG 20 |
| M5 T5 | Cobertura con JaCoCo e informes agregados entre proyectos | Básico | 30 | falta | UM-JaCoCo, UM-ReportAgg, V-UG 21, V-GH bonus, L-GiA 12 |

### Tramo 2 · Aplicación (nivel Intermedio)


#### M6 · Ciclo de vida y modelo del build

**Objetivo:** Explicar qué código corre en cada fase y leer el grafo de tareas de cualquier build. **Temas:** 5 · **Duración:** 2 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M6 T1 | Las tres fases: inicialización, configuración y ejecución | Intermedio | 35 | está pero básico — Java M8 T2 explica el ciclo de vida de Maven; el de Gradle no tiene tema | UM-Lifecycle, V-UD 1, V-GH 2, L-GBB 3, E-AND, MVN |
| M6 T2 | Los objetos del modelo: `Gradle`, `Settings`, `Project` y `Task` | Intermedio | 35 | falta | UM-Lifecycle, DSL, L-GiA 4 |
| M6 T3 | El grafo de tareas: `dependsOn`, `mustRunAfter`, `shouldRunAfter`, `finalizedBy` y tareas de ciclo de vida | Intermedio | 35 | falta | UM-TaskControl, V-UG 4–5, BP-Task, L-BTG 2 |
| M6 T4 | Código de configuración frente a código de ejecución: el error que hace lento cualquier build | Intermedio | 35 | falta | UM-Lifecycle, BP-Perf, E-ALG, L-EAB 4 |
| M6 T5 | Leer un build: `--dry-run`, `--info`, `--debug`, `--stacktrace`, `--scan` y la consola | Intermedio | 35 | falta | UM-Logging, UM-BuildScan, DPE-Scan, V-GH bonus, E-J67 |

#### M7 · Tareas

**Objetivo:** Registrar y configurar tareas correctas: perezosas, con entradas y salidas declaradas. **Temas:** 6 · **Duración:** 3 h 20 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M7 T1 | Registrar tareas: `tasks.register` frente a `create` y por qué importa (configuration avoidance) | Intermedio | 35 | falta | UM-TaskAvoid, UM-Tasks, V-UG 4, L-BTG 2, E-ALG |
| M7 T2 | Tipos de tarea incluidos: `Copy`, `Sync`, `Zip`, `Tar`, `Exec`, `JavaExec` y `Delete` | Intermedio | 35 | falta | UM-Files, L-GBB 1, L-BTG 2, REL |
| M7 T3 | Trabajar con archivos: `layout`, `file`, `files`, `fileTree`, `CopySpec` y colecciones perezosas | Intermedio | 35 | falta | UM-Files, L-GBB 1, V-UG 35, BP-Task |
| M7 T4 | Entradas y salidas: build incremental y por qué una tarea vuelve a ejecutarse | Intermedio | 40 | está pero básico — Java M8 T3 (subtema 3.3) «construye solo lo que necesita cambio» sin explicar entradas y salidas | UM-Incremental, UM-Tutorial-B5, DPE-Inc, V-UG 6, V-GH 3 |
| M7 T5 | Organizar tareas: grupo, descripción, `onlyIf`, `enabled`, `doFirst`/`doLast` y cuándo no usarlos | Intermedio | 30 | falta | UM-TaskOrg, BP-Task, L-BTG 2 |
| M7 T6 | Build continuo (`-t`) y vigilancia del sistema de archivos | Intermedio | 25 | falta | UM-Continuous, UM-FSWatch |

#### M8 · Builds multi-proyecto

**Objetivo:** Partir un build en proyectos con fronteras claras y sin configuración cruzada. **Temas:** 6 · **Duración:** 3 h 40 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M8 T1 | De un proyecto a varios: `include`, rutas de proyecto y estructura de carpetas | Intermedio | 35 | está pero básico — Java M8 T3 y M15 T3 tratan multi-módulo con Maven y ArchUnit; en Gradle solo se comprueba el grafo (subtema 2.3) | UM-MultiProject, UM-HowTo-Multi, V-PS 6, L-BTG 6, L-GiA 6, U-UW |
| M8 T2 | `api` frente a `implementation`: ABI, classpath de compilación y recompilación evitada | Intermedio | 40 | falta | UM-JavaLib, V-PS 6, E-J67, E-AND, V-UG 26–27 |
| M8 T3 | Por qué no `allprojects {}` ni `subprojects {}`: acoplamiento entre proyectos | Intermedio | 35 | falta | UM-SharingLogic, BP-Estr, E-ALG, V-UG 15 |
| M8 T4 | Ejecutar en un multi-proyecto: rutas de tarea, `-p`, `--parallel` y configuración bajo demanda | Intermedio | 35 | falta | UM-MultiProject, UM-CoD, UM-Perf |
| M8 T5 | Compartir salidas entre proyectos sin dependencias de tarea cruzadas | Intermedio | 40 | falta | UM-HowTo-Outputs, V-UG 13, BP-Dep |
| M8 T6 | Plataforma propia con `java-platform`: una BOM interna para alinear versiones | Intermedio | 35 | falta | UM-JavaPlatform, UM-Platforms, MVN, E-ALG |

#### M9 · Convention plugins y lógica de build compartida

**Objetivo:** Sacar la configuración repetida a plugins de convención en un build incluido. **Temas:** 5 · **Duración:** 3 h 10 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M9 T1 | `buildSrc` frente a `build-logic` como build incluido: diferencias y elección | Intermedio | 35 | falta | UM-SharingLogic, BP-Estr, V-GH 5, E-AND |
| M9 T2 | Tu primer convention plugin con un script precompilado (`kotlin-dsl`) | Intermedio | 40 | está pero básico — KMP M3 T5 y Android M18 T3 lo muestran para móvil; se generaliza a JVM y se mueve aquí | UM-Precompiled, UM-Convention, BP-Estr, DPE-Shared, V-UG 3, E-KC2, E-AND |
| M9 T3 | Usar el catálogo de versiones dentro de `build-logic` | Intermedio | 35 | falta | UM-Catalogs, UM-HowTo-Catalog, E-AND |
| M9 T4 | Componer convenciones: base, librería, aplicación y pruebas | Intermedio | 40 | falta | UM-Convention, DPE-Shared, V-UG 15 |
| M9 T5 | Plugins de settings y convenciones de repositorios, toolchains y Build Scan | Intermedio | 40 | falta | UM-Settings, V-UG 14, BP-Dep |

#### M10 · Kotlin y calidad de código en el build

**Objetivo:** Añadir Kotlin/JVM y análisis estático sin romper el `check` ni duplicar configuración. **Temas:** 5 · **Duración:** 2 h 45 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M10 T1 | Kotlin/JVM con Gradle: plugin de Kotlin, `compilerOptions` y `jvmToolchain` | Intermedio | 35 | está pero básico — Android M0 y KMP M0 lo configuran sin explicarlo como tema de build | KT, V-PS 4, U-UW |
| M10 T2 | Procesadores de anotaciones: `annotationProcessor`, kapt y la migración a KSP | Intermedio | 35 | falta | UM-JVM, AND, E-KC2, L-EAB 6 |
| M10 T3 | Análisis estático: Checkstyle, PMD y formateo verificado en `check` | Intermedio | 35 | falta | UM-Checkstyle, UM-PMD, L-GiA 12, L-GEI 9, V-GH bonus |
| M10 T4 | El ciclo `check`/`assemble`/`build`: qué colgar de cada uno y cómo fallar con criterio | Intermedio | 30 | falta | UM-Base, V-UG 5, BP-Task |
| M10 T5 | Documentación y artefactos auxiliares: Javadoc, `withSourcesJar` y `withJavadocJar` | Intermedio | 30 | falta | UM-JavaPlugin, UM-Publish, L-GiA 14 |

#### M11 · Gradle para Spring Boot

**Objetivo:** Construir el servicio Spring Boot de RutaFlow con Gradle entendiendo qué hace el plugin de Boot. **Temas:** 6 · **Duración:** 3 h 40 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M11 T1 | El plugin `org.springframework.boot`: `bootJar`, `bootRun` y qué pasa con el `jar` plano | Intermedio | 35 | está pero básico — Spring Boot M1 trae la sección «Alternativa comprobable con Gradle» (equivalencias de comandos, Groovy DSL), sin tema propio | SB 1, SB 3, SB 6, SB 9, V-GH 4, E-J67 |
| M11 T2 | Versiones gestionadas: la BOM de Boot con `platform()` frente a `io.spring.dependency-management` | Intermedio | 40 | falta | SB 2, UM-Platforms, MVN, E-ALG |
| M11 T3 | Configuraciones de Boot: `developmentOnly`, `testAndDevelopmentOnly` y `bootRun` con argumentos y perfiles | Intermedio | 30 | falta | SB 3, SB 6 |
| M11 T4 | Empaquetado para despliegue: capas del JAR, `bootBuildImage` y `buildInfo` para Actuator | Intermedio | 35 | está pero básico — Spring Boot M19 T1 y T4 lo enseñan con Maven; allí se queda la explicación y aquí va la variante Gradle | SB 3, SB 4, SB 8 |
| M11 T5 | Spring en multi-proyecto: librerías sin `bootJar`, convención `rutaflow.spring-service` y pruebas por módulo | Intermedio | 40 | falta | SB 9, UM-Convention, UM-MultiProject |
| M11 T6 | AOT y native image desde Gradle: `processAot` y el plugin de GraalVM | Intermedio | 40 | está pero básico — Spring Boot M19 T2 (GraalVM native image) con Maven | SB 7 |

### Tramo 3 · Integración (nivel Avanzado)


#### M12 · Configuración perezosa: providers y properties

**Objetivo:** Modelar valores que se calculan tarde y cablear tareas sin `dependsOn`. **Temas:** 7 · **Duración:** 4 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M12 T1 | Evaluación ansiosa frente a perezosa: `Provider` y `Property` | Avanzado | 40 | falta | UM-Lazy, UM-Props, V-UG 34, E-ALG, L-EAB 4 |
| M12 T2 | Tipos gestionados: `Property`, `ListProperty`, `SetProperty`, `MapProperty`, `DirectoryProperty`, `RegularFileProperty` y `ConfigurableFileCollection` | Avanzado | 40 | falta | UM-Managed, UM-Collections, BP-Task |
| M12 T3 | `map`, `flatMap`, `zip`, `orElse` y `convention`: cablear salidas con entradas y heredar la dependencia de tarea | Avanzado | 45 | falta | UM-Lazy, BP-Task, V-UG 6, REL |
| M12 T4 | `ProviderFactory`: propiedades de Gradle, entorno, sistema, contenido de archivos, `exec` y `ValueSource` | Avanzado | 45 | falta | UM-Props, UM-CC-Req, UPG9 |
| M12 T5 | Extensiones: un DSL propio con objetos gestionados, `ObjectFactory` y contenedores con nombre | Avanzado | 45 | falta | UM-Managed, UM-Tutorial-A2, V-UG 7, L-GBB 2 |
| M12 T6 | Inyección de servicios: `ProjectLayout`, `ExecOperations`, `FileSystemOperations`, `ArchiveOperations` | Avanzado | 40 | falta | UM-Services, UPG9 |
| M12 T7 | `afterEvaluate` y el orden de aplicación de plugins: por qué evitarlos y con qué sustituirlos | Avanzado | 40 | falta | BP-Gen, UM-Lazy, L-GBB 3, L-EAB 4 |

#### M13 · Tareas propias, incrementales y paralelas

**Objetivo:** Escribir una clase de tarea correcta: cacheable, incremental y segura en paralelo. **Temas:** 7 · **Duración:** 5 h 00 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M13 T1 | Una clase de tarea: `abstract`, `@TaskAction` y propiedades inyectadas | Avanzado | 40 | falta | UM-CustomTasks, UM-Tutorial-A3, V-UG 7, V-UG 36, L-BTG 2, DPE-Intro-BE |
| M13 T2 | Anotaciones de entrada y salida al detalle: `@Input`, `@InputFiles`, `@Classpath`, `@Nested`, `@Internal`, `@OutputDirectory` | Avanzado | 45 | falta | UM-Incremental, DPE-CacheDD 2, V-UG 6 |
| M13 T3 | Sensibilidad a la ruta y normalización: `@PathSensitive`, `@IgnoreEmptyDirectories`, `@NormalizeLineEndings` | Avanzado | 40 | falta | UM-Incremental, BP-Task, DPE-CacheDD 2 |
| M13 T4 | Tareas incrementales con `InputChanges`: procesar solo lo que cambió | Avanzado | 45 | falta | UM-AdvTasks, UM-Incremental |
| M13 T5 | Worker API: paralelismo dentro de una tarea y aislamiento por classloader o por proceso | Avanzado | 45 | falta | UM-Parallel, UM-AdvTasks |
| M13 T6 | Servicios de build compartidos: estado común y límite de concurrencia entre tareas | Avanzado | 45 | falta | UM-BuildServices, UM-CC-Req |
| M13 T7 | Validar tareas: `validatePlugins`, salidas solapadas y los errores de validación más comunes | Avanzado | 40 | falta | UM-Validating, DPE-CacheDD 3, BP-Task, UPG9 |

#### M14 · Build cache

**Objetivo:** Reutilizar salidas entre ramas, máquinas y CI, y diagnosticar por qué una tarea no acierta la caché. **Temas:** 7 · **Duración:** 4 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M14 T1 | Build incremental frente a build cache: qué es la clave de caché y de qué se compone | Avanzado | 40 | falta | UM-BuildCache, UM-CachingBasics, DPE-Inc, V-UG 23, E-J67 |
| M14 T2 | Caché local: activarla, dónde vive, limpieza y qué significan `FROM-CACHE` y `UP-TO-DATE` | Avanzado | 40 | falta | UM-BuildCache, UM-Tutorial-B6, BP-Perf, UPG9 |
| M14 T3 | Tareas cacheables: `@CacheableTask`, `@DisableCachingByDefault` y cuándo no cachear | Avanzado | 40 | falta | UM-BuildCache, BP-Task, DPE-CacheDD 2 |
| M14 T4 | Reubicabilidad: rutas absolutas, orden de archivos, marcas de tiempo y normalización del classpath de ejecución | Avanzado | 45 | falta | UM-CacheConcepts, DPE-CacheDD 3, BP-Seg |
| M14 T5 | Depurar fallos de caché: comparar entradas, `-Dorg.gradle.caching.debug` y comparación de Build Scan | Avanzado | 45 | falta | UM-CacheDebug, UM-CacheTroubleshoot, DPE-CacheDD 3, DPE-CacheMaint, DV |
| M14 T6 | Caché remota: nodo HTTP, credenciales y política «solo CI escribe» | Avanzado | 45 | falta | UM-BuildCache, DPE-IncDV, DV, E-AND, E-KC2 |
| M14 T7 | Medir el impacto de la caché en proyectos Java y Kotlin: qué tareas conviene cachear | Avanzado | 40 | falta | UM-CacheImpact, UM-CacheJava, DPE-CacheMaint |

#### M15 · Resolución de dependencias y conflictos

**Objetivo:** Predecir y controlar qué versión gana y por qué, con herramientas declarativas antes que con fuerza bruta. **Temas:** 7 · **Duración:** 5 h 05 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M15 T1 | Cómo resuelve Gradle: grafo, selección de variante y artefactos | Avanzado | 45 | falta | UM-Resolution, UM-Graph, UM-VariantSel, V-UG 10 |
| M15 T2 | Conflictos de versión: la más alta gana, y versiones ricas (`strictly`, `require`, `prefer`, `reject`) | Avanzado | 45 | está pero básico — Java M15 T1 (subtema 1.2) detecta versiones divergentes en Maven; Android M18 T1 lo nombra en 500 palabras | UM-Versions, UM-Constraints, V-UG 10, L-GBB 4, E-J67 |
| M15 T3 | Constraints y plataformas: alinear versiones e importar BOM con `platform` y `enforcedPlatform` | Avanzado | 45 | falta | UM-Constraints, UM-Platforms, UM-HowTo-Align, UM-CatPlat, E-ALG |
| M15 T4 | Subir, bajar y excluir transitivas con el menor alcance posible | Avanzado | 40 | falta | UM-HowTo-Up, UM-HowTo-Down, UM-HowTo-Excl, BP-Dep |
| M15 T5 | Reglas de resolución, sustitución de módulos y reglas de metadatos de componentes | Avanzado | 45 | falta | UM-ResRules, UM-Metadata, L-GBB 4 |
| M15 T6 | Capabilities: dos módulos que proporcionan lo mismo y cómo resolver el conflicto | Avanzado | 45 | falta | UM-Capabilities, V-UG 11, V-UG 29 |
| M15 T7 | Bloqueo de dependencias y resolución consistente entre classpaths | Avanzado | 40 | falta | UM-Locking, UM-Consistent, UM-HowTo-Prevent, U-MIT |

#### M16 · Repositorios y caché de dependencias

**Objetivo:** Controlar de dónde viene cada artefacto y cuándo se vuelve a descargar. **Temas:** 4 · **Duración:** 2 h 45 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M16 T1 | Repositorios declarados en settings: tipos, orden y `repositoriesMode` | Avanzado | 40 | falta | UM-Repos, UM-CentralRepos, BP-Dep, E-ALG |
| M16 T2 | Filtrado de contenido y `exclusiveContent`: confusión de dependencias y cómo evitarla | Avanzado | 45 | falta | UM-RepoFilter, UM-SecRepos, BP-Dep, DPE-Sec |
| M16 T3 | Repositorios privados y credenciales: Nexus, Artifactory, GitHub Packages y dónde guardar secretos | Avanzado | 40 | falta | UM-Repos, UM-SecRepos, L-GBB 4, UM-CC-Status |
| M16 T4 | La caché de dependencias: `--refresh-dependencies`, `--offline`, TTL de módulos cambiantes y caché de solo lectura | Avanzado | 40 | falta | UM-DepCache, L-GBB 4, V-PS 5 |

#### M17 · Seguridad de la cadena de suministro

**Objetivo:** Verificar que cada artefacto y la propia herramienta son los que se esperaban. **Temas:** 4 · **Duración:** 2 h 50 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M17 T1 | Verificación de dependencias: checksums, firmas PGP y mantenimiento de `verification-metadata.xml` | Avanzado | 45 | está pero básico — Java M15 T2 (subtema 5.3) genera el archivo con `--write-verification-metadata sha256`; falta firmas, claves de confianza y mantenimiento | UM-SecDeps, UM-SupplyChain, DPE-Sec, GHA |
| M17 T2 | Proteger la herramienta: validar el Wrapper, la distribución y no ejecutar builds no confiables | Avanzado | 40 | falta | UM-SecTool, BP-Seg, GHA, REL |
| M17 T3 | Vulnerabilidades, SBOM y actualización automática de dependencias con catálogos | Avanzado | 45 | falta | V-UG 30, GHA, V-PS 8, DPE-Sec |
| M17 T4 | Builds reproducibles byte a byte: qué garantiza Gradle 9 por defecto y qué sigue dependiendo de ti | Avanzado | 40 | está pero básico — Java M15 T2 (subtema 5.2) fija a mano `isPreserveFileTimestamps`/`isReproducibleFileOrder`; desde Gradle 9 los archivos son reproducibles por defecto y el tema debe actualizarse | BP-Seg, UPG9, UM-CacheConcepts |

#### M18 · Composite builds y estructura de builds grandes

**Objetivo:** Combinar builds independientes y decidir entre monorepo y varios repositorios. **Temas:** 5 · **Duración:** 3 h 30 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M18 T1 | `includeBuild`: sustitución automática de dependencias binarias por proyectos | Avanzado | 40 | falta | UM-Composite, UM-HowTo-Fork |
| M18 T2 | `build-logic` y plugins en desarrollo como builds incluidos (`pluginManagement.includeBuild`) | Avanzado | 40 | falta | UM-Composite, BP-Estr, UM-Tutorial-A7 |
| M18 T3 | Trabajar con un fork local de una dependencia y volver a la versión publicada | Avanzado | 40 | falta | UM-HowTo-Fork, UM-Composite |
| M18 T4 | Estructurar builds grandes: modularizar, evitar proyectos vacíos y separar frontend de backend | Avanzado | 45 | falta | UM-Organizing, BP-Estr, E-ALG, E-KC2, L-GiA 11 |
| M18 T5 | Monorepo frente a varios repositorios: qué cambia en caché, versiones y CI | Avanzado | 45 | falta | UM-Composite, UM-Organizing, L-GEI 11 |

#### M19 · Publicación de librerías

**Objetivo:** Publicar una librería consumible desde Gradle y Maven, firmada y con metadatos correctos. **Temas:** 7 · **Duración:** 4 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M19 T1 | `maven-publish`: componentes, publicaciones y repositorios de destino | Avanzado | 40 | está pero básico — KMP M13 T5 «Publicación en Maven Central» (569 palabras, específico de KMP) | UM-Publish, UM-MavenPublish, V-UG 12, L-GiA 14, L-BTG 4, V-GH 4 |
| M19 T2 | El POM generado y Gradle Module Metadata: qué ve un consumidor Maven y qué uno Gradle | Avanzado | 45 | falta | UM-GMM, UM-PubCustom, UM-Metadata |
| M19 T3 | Firma de artefactos con `signing` y gestión de claves | Avanzado | 40 | falta | UM-Signing, UPG9 |
| M19 T4 | Publicar en Maven Central: requisitos de coordenadas, POM, fuentes, Javadoc y firma | Avanzado | 45 | está pero básico — KMP M13 T5; el flujo vigente del portal de Central se verifica en fuente primaria al escribir | UM-Publish, BP-Seg, KT |
| M19 T5 | Versionado y releases: SemVer, SNAPSHOT, compatibilidad binaria y automatización de la versión | Avanzado | 40 | falta | L-GiA 14, U-MIT, E-ALG |
| M19 T6 | Publicar una plataforma (BOM) y un catálogo de versiones para otros equipos | Avanzado | 40 | falta | UM-JavaPlatform, UM-VersionCatalogPlugin, UM-CatPlat |
| M19 T7 | Variantes de característica y fixtures publicados: dependencias opcionales bien hechas | Avanzado | 45 | falta | UM-HowTo-Feature, V-UG 17, MVN |

#### M20 · Gradle en integración continua

**Objetivo:** Llevar el build a CI rápido, seguro y diagnosticable. **Temas:** 7 · **Duración:** 4 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M20 T1 | Principios de un build en CI: wrapper, propiedades, daemon, logs y reproducibilidad | Avanzado | 40 | falta | UM-CI, L-GiA 13, U-ODU, U-MIT |
| M20 T2 | GitHub Actions con `setup-gradle`: caché, validación del wrapper y grafo de dependencias | Avanzado | 45 | está pero básico — KMP M10 T1 «Pipeline Gradle multiplataforma en CI» (allí queda lo específico de runners macOS e iOS) | GHA, UM-GHA, V-UG 37 |
| M20 T3 | Las mismas ideas en GitLab CI y Jenkins | Avanzado | 35 | falta | UM-GitLab, UM-Jenkins, L-GiA 13, DV |
| M20 T4 | Caché de build y de dependencias en CI: qué guardar, qué no y quién escribe | Avanzado | 45 | falta | GHA, UM-BuildCache, DPE-IncDV, E-KC2 |
| M20 T5 | Pruebas en CI: `maxParallelForks`, `forkEvery`, reintentos y partición de suites | Avanzado | 45 | falta | UM-JavaTesting, UM-Perf, DV |
| M20 T6 | Build Scan y reportes en CI: enlazar el fallo con su diagnóstico | Avanzado | 40 | falta | UM-BuildScan, DPE-Scan, DV, GHA |
| M20 T7 | Publicar desde CI: secretos, entornos protegidos y build de release separado | Avanzado | 45 | falta | BP-Seg, UM-Publish, GHA |

### Tramo 4 · Experto (nivel Experto)


#### M21 · Plugins binarios

**Objetivo:** Diseñar un plugin real: con extensión, tareas, convenciones y compatibilidad declarada. **Temas:** 7 · **Duración:** 5 h 10 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M21 T1 | De script precompilado a plugin binario: `java-gradle-plugin`, `Plugin<Project>` e ids | Experto | 45 | falta | UM-BinaryPlugins, UM-DevBinary, UM-JavaGradlePlugin, DPE-Plugins, L-GBB 2, L-GiA 8, V-GH 5 |
| M21 T2 | Arquitectura de un plugin: capacidad frente a convención, extensión, tareas y valores por defecto | Experto | 45 | falta | UM-DevBinary, UM-Tutorial-A2, L-GBB 2, L-EAB 2 |
| M21 T3 | Reaccionar a otros plugins: `pluginManager.withPlugin` y no suponer el orden de aplicación | Experto | 45 | falta | BP-Gen, UM-DevBinary, SB 9, L-EAB 8 |
| M21 T4 | Plugins de settings, init scripts e init plugins: lógica para toda una organización | Experto | 45 | falta | UM-Init, V-UG 14, L-GBB 3 |
| M21 T5 | Compatibilidad: API pública frente a interna, `@Incubating`, versión mínima de Gradle y variantes del plugin | Experto | 45 | falta | UM-FeatureLifecycle, BP-Gen, UPG9, KT |
| M21 T6 | Problems API: informar errores del plugin de forma estructurada | Experto | 40 | falta | UM-ReportProblems, REL |
| M21 T7 | Dataflow actions (`FlowScope`): reaccionar al resultado del build sin listeners | Experto | 45 | falta | UM-Dataflow, UM-Tutorial-A5, UM-CC-Req, L-GBB 3 |

#### M22 · Probar y publicar plugins

**Objetivo:** Probar un plugin contra varias versiones de Gradle y publicarlo. **Temas:** 5 · **Duración:** 3 h 40 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M22 T1 | Pruebas unitarias de un plugin con `ProjectBuilder`: qué se puede probar y qué no | Experto | 40 | falta | UM-TestingPlugins, UM-Tutorial-A4 |
| M22 T2 | Pruebas funcionales con TestKit: `GradleRunner`, `withPluginClasspath` y resultados de tarea | Experto | 45 | falta | UM-TestKit, UM-Tutorial-A6, BP-Test, V-GH 5, DPE-Plugins |
| M22 T3 | Probar caché, incrementalidad y configuration cache con TestKit | Experto | 45 | falta | UM-TestKit, UM-CC-Debug |
| M22 T4 | Matriz de versiones: ejecutar las pruebas contra varios Gradle y varios JDK | Experto | 45 | falta | UM-TestKit, UM-Compat, UM-Toolchains |
| M22 T5 | Publicar el plugin: artefactos marcadores, repositorio privado y Plugin Portal | Experto | 45 | falta | UM-PubPlugins, UM-PrepPublish, UM-Tutorial-A8, L-GBB 2 |

#### M23 · Configuration cache e Isolated Projects

**Objetivo:** Adoptar la configuration cache en un build real y saber qué exige al código de build. **Temas:** 7 · **Duración:** 4 h 55 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M23 T1 | Cómo funciona: qué se serializa, entradas del build e invalidación | Experto | 45 | falta | UM-CC-How, E-J67, E-AND, E-KC2 |
| M23 T2 | Activarla y leer el informe de problemas | Experto | 40 | falta | UM-CC-Enable, UM-CC-Debug, BP-Perf |
| M23 T3 | Requisitos del código de build: sin `Project` en ejecución, sin listeners, tipos serializables | Experto | 45 | falta | UM-CC-Req, BP-Task, UPG9 |
| M23 T4 | Adopción paso a paso en un build grande: tareas incompatibles y plugins de terceros | Experto | 45 | falta | UM-CC-Adopt, UM-CC-Status, SB 1, E-ALG |
| M23 T5 | Límites actuales: no se comparte entre máquinas, secretos y publicación | Experto | 40 | falta | UM-CC-Status |
| M23 T6 | Isolated Projects: configuración en paralelo y qué prohíbe (en incubación) | Experto | 45 | falta | UM-Isolated, REL |
| M23 T7 | Declarative Gradle: archivos `.dcl` y tipos de software (experimental, solo panorama) | Experto | 35 | falta | DCL, E-KC1, E-KC3 |

#### M24 · Rendimiento y diagnóstico de builds

**Objetivo:** Medir un build lento, localizar la causa y demostrar la mejora con números. **Temas:** 7 · **Duración:** 5 h 15 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M24 T1 | Medir antes de tocar: `--profile`, Build Scan y gradle-profiler con escenarios | Experto | 45 | falta | UM-Perf, DPE-ScanOpt, L-EAB 8, L-GRA 6 |
| M24 T2 | El daemon y la JVM: memoria, recolector, `org.gradle.workers.max`, `--parallel` y caché de configuración | Experto | 45 | falta | UM-Perf, UM-BuildConfig, UM-Daemon, BP-Perf |
| M24 T3 | Configuración lenta: plugins caros, resolución en configuración y tareas creadas ansiosamente | Experto | 45 | falta | UM-Perf, BP-Perf, BP-Task, E-ALG |
| M24 T4 | Resolución de dependencias lenta: versiones dinámicas, repositorios de más y orden de repositorios | Experto | 45 | falta | UM-Perf, UM-RepoFilter, DPE-ScanOpt |
| M24 T5 | Compilación: incremental en Java y Kotlin, compilation avoidance, procesadores incrementales y modularización | Experto | 45 | falta | UM-Perf, UM-JVM, KT, REL, E-KC2 |
| M24 T6 | Pruebas lentas: paralelismo, forks, reutilización de salidas y selección de pruebas | Experto | 45 | falta | UM-Perf, UM-JavaTesting, DV |
| M24 T7 | Depurar el build: depurar scripts y tareas, fugas del daemon, bloqueos y `--debug-jvm` | Experto | 45 | falta | UM-Troubleshoot, UM-Daemon, UM-JavaTesting |

#### M25 · Variantes, atributos y transformaciones de artefactos

**Objetivo:** Usar el modelo de variantes de Gradle para problemas que las configuraciones básicas no resuelven. **Temas:** 6 · **Duración:** 4 h 30 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M25 T1 | Configuraciones declarables, resolvibles y consumibles; atributos propios | Experto | 45 | falta | UM-CreateConf, UM-Variants, BP-Dep, UPG9 |
| M25 T2 | Selección de variantes con atributos, reglas de compatibilidad y desambiguación | Experto | 45 | falta | UM-VariantSel, UM-Variants, KT |
| M25 T3 | Artifact views y resolución de artefactos concretos | Experto | 45 | falta | UM-ArtifactViews, UM-HowTo-Artifacts, UM-ArtRes |
| M25 T4 | Artifact transforms: transformar dependencias de forma cacheable | Experto | 45 | falta | UM-Transforms, V-UG 32 |
| M25 T5 | Agregar artefactos propios entre proyectos (informes, documentación) | Experto | 45 | falta | V-UG 13, UM-ReportAgg, UM-HowTo-Outputs |
| M25 T6 | Classpath y module path: JPMS con Gradle, colisiones y limpieza con análisis de dependencias | Experto | 45 | falta | V-UG 26–29, V-UG 31, V-UG 33, UM-JVM, KT |

#### M26 · Gradle para Android y Kotlin Multiplatform

**Objetivo:** Aplicar todo lo anterior a builds móviles sin repetir lo que enseñan los cursos de Android y KMP. **Temas:** 5 · **Duración:** 3 h 45 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M26 T1 | AGP sobre Gradle: variantes, `androidComponents`, Variant API y Artifacts API | Experto | 45 | está pero básico — Android M18 T2 enseña build types y flavors como usuario; falta la API de variantes para lógica de build | AND, L-EAB 3, L-EAB 5–7, V-UD 3–4, L-GRA 3 |
| M26 T2 | La matriz AGP–Gradle–Kotlin–JDK: leerla y actualizar sin romper el build | Experto | 45 | está pero básico — docs/VERSIONES.md y la sonda de specs/019 lo documentan; no hay tema | AND-AGP, KT, UM-Compat |
| M26 T3 | KMP en Gradle: targets, source sets, compilaciones y variantes publicadas | Experto | 45 | está pero básico — KMP M3 T3–T4 lo enseñan como usuario; allí se quedan y este tema explica el modelo de variantes que hay debajo | KMP, KT, U-UW |
| M26 T4 | Convention plugins para Android y KMP en `build-logic` | Experto | 45 | está pero básico — Android M18 T3 «Modularización, convenciones y fronteras de arquitectura» | AND, E-AND, E-KC2, L-EAB 2 |
| M26 T5 | Caché y configuration cache en builds móviles; diagnóstico de builds lentos | Experto | 45 | falta | UM-CacheAndroid, AND, E-KC2, L-EAB 8, L-GRA 6 |

#### M27 · Migración, actualización y gobierno del build

**Objetivo:** Mantener un build vivo durante años: actualizar Gradle, migrar desde Maven y decidir con criterio. **Temas:** 7 · **Duración:** 5 h 00 min.

| # | Tema | Nivel | Min | Estado | Fuentes |
|---|---|---|---:|---|---|
| M27 T1 | Actualizar Gradle: deprecaciones, `--warning-mode all`, guías de actualización y ciclo de versiones | Experto | 45 | falta | UM-Upgrade, UM-FeatureLifecycle, BP-Gen, REL |
| M27 T2 | De Gradle 8 a Gradle 9: cambios que rompen builds reales | Experto | 45 | falta | UPG9, UM-Compat |
| M27 T3 | Migrar de Maven a Gradle: conversión automática, perfiles, BOM, plugins y paridad de resultados | Experto | 45 | está pero básico — Java M8 T4 «Maven y Gradle lado a lado» compara un proyecto pequeño; falta la migración de un multi-módulo con perfiles | MVN, L-BTG 4, L-GiA 9 |
| M27 T4 | Modernizar un build heredado: de Groovy DSL, `buildSrc` y `allprojects` a Kotlin DSL y convenciones | Experto | 45 | falta | UM-MigrGroovy, UM-SharingLogic, E-ALG, E-KC1, L-GiA 9 |
| M27 T5 | Integración con otras herramientas: Tooling API, Ant y builds políglotas | Experto | 40 | falta | UM-ToolingAPI, UM-Ant, L-BTG 3, L-GiA 11, L-GEI 8 |
| M27 T6 | Develocity y Build Scan a escala: tendencias, comparación de builds, selección predictiva y pruebas inestables (panorama; producto comercial) | Experto | 40 | falta | DV, DPE-DV, DPE-Scan |
| M27 T7 | Gobierno del build: política de plugins, APIs en incubación, mejores prácticas como lista de revisión | Experto | 40 | falta | BP-Idx, UM-FeatureLifecycle, E-KC2 |

## 3. Relación con otros cursos

Regla 1 de specs/021: un concepto, un curso dueño. Gradle es dueño del **build**; los demás cursos usan
Gradle y enlazan.

### 3.1 Qué se queda en cada curso y solo enlaza a Gradle

| Curso | Se queda allí | Pasa a Gradle (el curso de origen deja un enlace) | Qué necesita de Gradle antes |
|---|---|---|---|
| **Java** | El lenguaje, la JVM y las pruebas (JUnit, Mockito, Testcontainers). Java M8 completo como «build en la JVM en 2 h»: qué es un build, Maven esencial y el tema puente T4. Java M15 T1 (Maven avanzado) y T3 (ArchUnit) | Java M15 T2 (wrapper, reproducibilidad y verificación) → M1 T1, M17 T1 y M17 T4. Subtemas de Gradle de Java M8 T1–T2 → M0 y M4 | Los laboratorios de Java desde M8 usan el wrapper y Kotlin DSL: bastan M0–M5 (tramo 1), que se puede cursar en paralelo con Java M8 |
| **Spring** | Todo Spring. Spring Boot M19 T1, T2 y T4 conservan la explicación de capas, native image y Buildpacks | La sección «Alternativa comprobable con Gradle» de Spring Boot M1 → M11 T1. Las variantes Gradle de M19 → M11 T4 y M11 T6 | M0–M11. Spring pasa a usar Gradle (Kotlin DSL) como camino principal y Maven como alternativa |
| **Android** | AGP como usuario: manifiesto, recursos, build types y flavors (M18 T2), firma y App Bundle (M11), R8 y Baseline Profiles (M18 T4), Macrobenchmark | Android M18 T1 (catálogo y resolución) → M4 T4 y M15 T2. La parte de convention plugins de M18 T3 → M9 T2 y M26 T4 | M0–M4 antes de Android M0; M8–M9 antes de Android M18 |
| **Kotlin Multiplatform** | El bloque `kotlin {}`: targets, source sets, `expect/actual`, jerarquía (M3 T1–T4 y T6), XCFramework, Swift Export y Fastlane | KMP M3 T5 (catálogo y convention plugins) → M4 T4 y M9 T2. Lo general de M10 T1 (CI) → M20 T2. Lo general de M13 T5 (publicación) → M19 | M0–M4 antes de KMP M3; M19 antes de KMP M13 T5 |
| **Flutter** | Todo: Gradle aparece solo en `android/` (flavors y firma) | Nada | Enlace a M0 T2 y M1 T1 |
| **Docker / DevOps** | Dockerfile, registros y pipelines | Nada. M11 T4 enlaza a Docker para la imagen y M20 enlaza a DevOps para el pipeline completo | — |
| **Microservicios** | Todo. Hoy `examples/microservicios` tiene 85 `pom.xml` y ningún build de Gradle | Nada | Se decide en la sección 5 si se añade la variante Gradle |

### 3.2 Maven como alternativa

Maven no desaparece: la mayoría de las listas de entrevista y de los libros consultados lo comparan con Gradle,
y el propio manual dedica una guía a migrar desde Maven. Propuesta: **Maven no tiene curso propio**; vive en
Java y en un módulo de este curso.

| Tema de Maven que hace falta | Dónde | Estado hoy |
|---|---|---|
| `pom.xml`, coordenadas, repositorio local y `mvnw` | Java M8 T1 | existe (básico) |
| Ciclo de vida, fases, goals y scopes | Java M8 T2 | existe (básico) |
| Multi-módulo: reactor, `-pl`/`-am`, herencia y agregación | Java M8 T3 | existe (básico) |
| `dependencyManagement`, BOM, `dependency:tree`, exclusiones y Enforcer | Java M15 T1 | existe (básico) |
| Plugins habituales: Surefire, Failsafe, Compiler, Jar, Shade | Java M15 T1 | **falta**: se propone como tema nuevo en Java M15 |
| Perfiles, propiedades y filtrado de recursos | Java M15 | **falta**: tema nuevo en Java M15; lo necesita M27 T3 |
| Toolchains y versión de Java en Maven | Java M15 T1 (subtema 1.3) | existe (básico) |
| El mismo proyecto en las dos herramientas | Java M8 T4 | existe; se queda como tema puente |
| Migrar un multi-módulo de Maven a Gradle con paridad comprobada | **Gradle M27 T3** | falta |
| Leer un POM publicado y qué ve Maven de una librería publicada con Gradle | **Gradle M19 T2** | falta |
| Build cache y extensiones de Maven (Develocity), Maven 4 | panorama de 10 min dentro de Gradle M27 T6 | falta. Maven 4 sigue sin versión final (4.0.0-rc-7): no se enseña como estable |

Cada laboratorio JVM de la academia trae Gradle como camino principal. El `pom.xml` equivalente se mantiene solo
donde ya existe y está verificado (Spring y Microservicios), marcado como «alternativa Maven».

### 3.3 Prerrequisitos y orden

- **Antes de Gradle M0:** Fundamentos (terminal, Git) y Java M0–M7 (lenguaje, paquetes y `javac`/`jar` a mano).
- **Tramo 1 (M0–M5)** se cursa junto a Java M8; **tramo 2 (M6–M11)** antes de Spring; **tramos 3 y 4** después
  de Spring Boot M0–M7 (el servicio de RutaFlow ya existe) y pueden alternarse con el resto de Spring.
- Kotlin: M2 T1 enseña el Kotlin mínimo para leer builds; no exige el curso de Kotlin.

## 4. Proyecto guía y laboratorios

### 4.1 Proyecto guía: el build de RutaFlow

Un solo build multi-proyecto real que crece módulo a módulo (sin builds de juguete). Parte del backend de
RutaFlow que ya usan Java y Spring:

```text
rutaflow/
├── settings.gradle.kts            M0  → M2 (pluginManagement, repositorios) → M9 (plugins de settings)
├── gradle/libs.versions.toml      M4
├── gradle/verification-metadata.xml   M17
├── build-logic/                   M9  convention plugins: rutaflow.java-conventions, .library, .application,
│                                       .spring-service (M11), .kotlin (M10), .publicado (M19)
├── plataforma/                    M8  java-platform (BOM interna) → M19 se publica
├── dominio/                       M3  java-library → M5 pruebas y fixtures → M19 se publica
├── tarifas/                       M8  java-library con tarea generadora propia (M7 → M13)
├── cliente/                       M10 librería Kotlin/JVM
├── api/                           M11 servicio Spring Boot
├── cli/                           M3  application
├── rutaflow-openapi-plugin/       M21 plugin binario como build incluido → M22 TestKit
└── movil-compartido/ y app/       M26 KMP y Android (opcional, ver decisión 6)
```

Cada módulo parte del estado anterior y de **un build roto o lento sembrado a propósito** (énfasis de Gradle en
specs/021 §3). El tema muestra el grafo de tareas, la salida de `--info` o el Build Scan, el diagnóstico y el
arreglo.

### 4.2 Laboratorio por módulo

| Módulo | Título | Laboratorio (`examples/gradle/modulo-N/`, con `verificar.sh` → «RESULTADO: OK») |
|---|---|---|
| M0 | El problema del build y el primer contacto | Compilar RutaFlow `dominio` a mano con `javac`/`jar`, y luego con `gradle init` + `./gradlew build`; comparar pasos y salida. |
| M1 | Wrapper, daemon y entorno de ejecución | Actualizar el wrapper de RutaFlow con suma SHA-256, provocar un daemon incompatible y diagnosticarlo con `--status`. |
| M2 | Kotlin DSL para leer y escribir builds | Traducir a Kotlin DSL un `build.gradle` Groovy real de los laboratorios Spring actuales y verificar que el grafo de tareas no cambia. |
| M3 | Un proyecto Java con Gradle | RutaFlow `dominio` (librería) y `cli` (aplicación): compilar con toolchain JDK 25, ejecutar con `run` y generar la distribución. |
| M4 | Dependencias: lo esencial | Añadir a RutaFlow un `libs.versions.toml`, provocar un `ClassNotFoundException` por usar `compileOnly` y encontrarlo con `dependencyInsight`. |
| M5 | Pruebas con Gradle | RutaFlow: suite de integración separada con JVM Test Suite, fixtures compartidos entre `dominio` y `tarifas`, e informe de cobertura agregado. |
| M6 | Ciclo de vida y modelo del build | Partir de un build de RutaFlow que tarda 8 s en `help` porque hace E/S en configuración; localizarlo con `--scan` y corregirlo. |
| M7 | Tareas | RutaFlow: tarea que empaqueta las tarifas en un ZIP versionado; hacer que sea UP-TO-DATE y explicar con `--info` cada vez que no lo es. |
| M8 | Builds multi-proyecto | Convertir RutaFlow de un proyecto a `dominio`, `tarifas`, `api` y `cli`; medir qué se recompila al cambiar `dominio` con `api` y con `implementation`. |
| M9 | Convention plugins y lógica de build compartida | RutaFlow: crear `build-logic` con `rutaflow.java-conventions`, `rutaflow.library` y `rutaflow.application`; los `build.gradle.kts` quedan en menos de 15 líneas. |
| M10 | Kotlin y calidad de código en el build | RutaFlow: módulo `cliente` en Kotlin, migración de un procesador de kapt a KSP y `check` que falla por una regla de estilo, todo desde convention plugins. |
| M11 | Gradle para Spring Boot | RutaFlow `api`: `bootJar` por capas, `bootRun` con perfil, librerías internas sin `bootJar` y `bootBuildImage`; comparar el árbol con el del `pom.xml` equivalente. |
| M12 | Configuración perezosa: providers y properties | RutaFlow: reescribir la tarea de versión (que ejecutaba `git` en configuración) con `ValueSource` y `Property`; comprobar que `help` ya no lanza procesos. |
| M13 | Tareas propias, incrementales y paralelas | RutaFlow: tarea `GenerarCatalogoRutas` que transforma CSV en código Java; hacerla incremental archivo a archivo y moverla a Worker API. |
| M14 | Build cache | RutaFlow: activar la caché, provocar un fallo de caché con una ruta absoluta como entrada, encontrarlo comparando dos Build Scan y levantar un nodo de caché remota en Docker. |
| M15 | Resolución de dependencias y conflictos | RutaFlow: reproducir un `NoSuchMethodError` por dos versiones de Jackson, explicarlo con `dependencyInsight` y resolverlo con constraints y plataforma. |
| M16 | Repositorios y caché de dependencias | RutaFlow: repositorio interno (Nexus en Docker) con filtrado de contenido y credenciales; demostrar una confusión de dependencias y cerrarla con `exclusiveContent`. |
| M17 | Seguridad de la cadena de suministro | RutaFlow: `verification-metadata.xml` con checksums y firmas, un build que falla al alterar un JAR del repositorio interno, SBOM generado y dos builds con el mismo hash. |
| M18 | Composite builds y estructura de builds grandes | RutaFlow: desarrollar en local un arreglo sobre una librería externa con `includeBuild` y separar `plataforma` como build propio. |
| M19 | Publicación de librerías | RutaFlow `dominio` y `plataforma`: publicar en un Nexus local, firmar, y consumirlas desde un proyecto Maven y otro Gradle; comprobar qué ve cada uno. |
| M20 | Gradle en integración continua | RutaFlow: flujo de GitHub Actions con `setup-gradle`, validación del wrapper, caché, pruebas en paralelo y Build Scan; variante local reproducible con `act` o contenedor. |
| M21 | Plugins binarios | RutaFlow: `rutaflow-openapi-plugin`, que valida y genera clientes desde el contrato OpenAPI del servicio; se aplica al build desde un build incluido. |
| M22 | Probar y publicar plugins | RutaFlow: pruebas funcionales del plugin con TestKit que verifican `SUCCESS`, `UP_TO_DATE`, `FROM_CACHE` y reutilización de la configuration cache; publicación en repositorio interno. |
| M23 | Configuration cache e Isolated Projects | RutaFlow: activar la configuration cache, leer el informe de problemas, corregir tres incompatibilidades sembradas (acceso a `Project` en ejecución, listener y lectura de entorno sin provider) y medir la diferencia. |
| M24 | Rendimiento y diagnóstico de builds | RutaFlow «lento»: una rama con seis problemas sembrados (versión dinámica, E/S en configuración, tarea no cacheable, procesador no incremental, pruebas en serie, heap corto); cada uno se mide con gradle-profiler antes y después. |
| M25 | Variantes, atributos y transformaciones de artefactos | RutaFlow: agregar informes de todos los proyectos con una configuración consumible propia y aplicar un artifact transform que minimiza un JAR antes de empaquetar. |
| M26 | Gradle para Android y Kotlin Multiplatform | Añadir a RutaFlow un módulo `movil-compartido` (KMP) y una app Android mínima que usan las mismas convenciones, catálogo y caché que el backend. |
| M27 | Migración, actualización y gobierno del build | Migrar el `pom.xml` multi-módulo de `examples/java-maven` a Gradle con paridad comprobada de artefactos y dependencias, y subir un build 8.14 a la versión estable del curso. |

Infraestructura local de los laboratorios: Nexus (repositorio) y el nodo de caché remota en Docker, con el
`docker-compose.yml` de cada laboratorio. Ningún laboratorio exige una cuenta de pago. Los laboratorios que
publican un Build Scan en el servicio público (`--scan`) envían datos del build a un servidor externo: cada uno
lo avisa y ofrece la alternativa local (`--profile`, `--info` e informe de la configuration cache).

### 4.3 Proyecto final (≈ 14 h, con rúbrica)

Entregar el repositorio de RutaFlow con estas evidencias medibles:

1. Build multi-proyecto en Kotlin DSL, con catálogo, toolchain JDK 25 y `build-logic`; ningún
   `build.gradle.kts` de proyecto supera las 20 líneas.
2. `./gradlew build` dos veces seguidas: todas las tareas `UP-TO-DATE` la segunda vez; tras `clean`, al menos
   el 90 % de las tareas cacheables `FROM-CACHE`.
3. Configuration cache activada y reutilizada, con cero problemas en el informe.
4. Verificación de dependencias con checksums y firmas; wrapper validado en CI.
5. `dominio` y `plataforma` publicados y firmados en el repositorio local; consumidos desde un proyecto Maven.
6. `rutaflow-openapi-plugin` con pruebas de TestKit contra dos versiones de Gradle.
7. Pipeline de CI con caché, pruebas en paralelo y publicación desde una rama protegida.
8. Informe de rendimiento: seis problemas sembrados, cada uno con su medida antes y después (gradle-profiler).
9. Un ADR «Gradle o Maven para este servicio» con datos del propio build.

## 5. Decisiones para el dueño

1. **Aprobar el temario**: 28 módulos, 166 temas, ≈ 121 h, con 59,6 % en Integración o Experto. Alternativa
   reducida: dejar M25 (variantes y transformaciones) y M26 (Android y KMP) como optativos, lo que baja el
   curso a 26 módulos y 155 temas (57 % en Integración o Experto).
2. **Versión del curso.** Opciones: (a) fijar **9.9.2** (estable vigente; hay que subir los 50 wrappers de
   `examples/`, hoy en 9.8.2); (b) mantener 9.8.2 hasta cerrar Java y subir una sola vez al empezar Gradle.
   Recomendación: (b) para el contenido ya escrito y 9.9.x para el curso nuevo, con la versión exacta fijada
   en `docs/VERSIONES.md` el día que se verifique en el Mac. La política de Gradle es una versión menor cada
   seis semanas aproximadamente: conviene decidir también cada cuánto se revisa.
3. **Versión para Android y KMP (M26).** KGP 2.4.21 declara Gradle hasta 9.7.0 y AGP hasta 9.3.1; AGP 9.5
   exige Gradle 9.6.0 o posterior. Opciones: fijar M26 en la combinación ya sondeada (JDK 25 + Gradle 9.7.0)
   o esperar a que KGP declare 9.9. Recomendación: 9.7.x en M26 y explicar la matriz como tema (M26 T2).
4. **Migrar los laboratorios existentes a Kotlin DSL con catálogo.** 52 archivos de build en Groovy DSL y ninguno con
   `libs.versions.toml`. La regla 7 lo pide. ¿Se migran al reescribir cada curso (Fase 5) o en un cambio único
   antes de empezar Gradle? Recomendación: con cada curso, usando la convención que salga de Gradle M9.
5. **Maven.** Confirmar que no tiene curso propio: se queda en Java M8 y M15 (con dos temas nuevos: plugins
   habituales, y perfiles y filtrado) y Gradle M27 T3 enseña la migración. Confirmar también que Spring pasa a
   Gradle como camino principal y Maven como alternativa.
6. **Móvil dentro del proyecto guía.** ¿El build de RutaFlow incluye `movil-compartido` y `app` (M26) o M26
   usa los proyectos de los cursos Android y KMP? Lo primero exige Android SDK y Xcode para cerrar Gradle.
7. **Destino de los cuatro temas que se trocean** (sección 1.1): Java M15 T2, KMP M3 T5, Android M18 T1 y la
   sección Gradle de Spring Boot M1. Mover deja un hueco numerado en el curso de origen; hay que aprobar que
   allí quede un tema corto de enlace o que se renumere.
8. **Build Scan y Develocity.** `--scan` publica datos en un servicio externo y Develocity es comercial.
   Propuesta: Build Scan público como opción avisada en cada laboratorio y Develocity solo como panorama
   (M27 T6), sin laboratorio.
9. **Funciones no estables.** Isolated Projects (incubación) queda como un tema; Declarative Gradle
   (experimental) como panorama de 35 min. ¿Se aceptan o se dejan fuera hasta que sean estables?
10. **Certificación.** No se encontró una certificación oficial de Gradle con examen. DPE University entrega
    un certificado por curso terminado. Se propone citar esos cursos como formación complementaria, no como
    objetivo de certificación.
11. **Corregir ya dos datos del contenido actual** (fuera de este documento): el paso manual de
    reproducibilidad de Java M15 T2 y la cita de Spring Boot M0 a `docs/spring-gradle-labs.json`, que no existe.

## 6. Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas.

### 6.1 Documentación oficial (claves `UM-`, `BP-`, `REL`, `UPG9`, `DSL`, `DCL`, `SB`, `AND`, `KT`, `KMP`, `MVN`, `DV`, `GHA`)

| Clave | Fuente | Qué se tomó |
|---|---|---|
| `UM-…` | [Gradle User Manual](https://docs.gradle.org/current/userguide/userguide.html) | Índice completo de navegación: Releases, Fundamentals (Basics, Writing Build Scripts, Creating Plugins), tres tutoriales, Best Practices, DSLs and APIs, Reference (Runtime, Core Plugins, Tasks, Plugins, Dependencies, Managed Types, Platforms), Gradle on CI, Structuring, Optimizing (Build Cache, Configuration Cache, Isolated Projects), Securing, IDE & Tool Integration y How-To Guides. El sufijo de la clave nombra la página (por ejemplo `UM-CC-Req` = Configuration Cache · Requirements; `UM-HowTo-…` = guías prácticas; `UM-Tutorial-A4` = tutorial avanzado, paso 4) |
| `UM-…` | [Rutas de aprendizaje del manual](https://docs.gradle.org/current/userguide/getting_started.html) | Orden oficial: ingenieros de software (principiante), ingenieros de build (intermedio) y autores de plugins (avanzado) |
| `BP-…` | [Best Practices Index](https://docs.gradle.org/current/userguide/best_practices_index.html) | 48 prácticas: General (`BP-Gen`), Estructura (`BP-Estr`), Dependencias (`BP-Dep`), Tareas (`BP-Task`), Rendimiento (`BP-Perf`), Seguridad (`BP-Seg`) y Pruebas (`BP-Test`); `BP-Idx` es el índice entero |
| `REL` | [Notas de versión vigentes](https://docs.gradle.org/current/release-notes.html) (mostraba 9.9.1) · [Releases](https://gradle.org/releases/) · [servicio de versiones](https://services.gradle.org/versions/current) | Versión vigente, fechas y novedades de 9.9 |
| `UM-Compat` | [Compatibility Notes](https://docs.gradle.org/current/userguide/compatibility.html) | Matriz de Java, Kotlin, Groovy y AGP |
| `UM-FeatureLifecycle` | [Gradle's Feature Lifecycle](https://docs.gradle.org/current/userguide/feature_lifecycle.html) | Estados de una función y política de versiones |
| `UPG9` | [Upgrading to Gradle 9.0](https://docs.gradle.org/current/userguide/upgrading_major_version_9.html) | Lista de cambios incompatibles y eliminaciones |
| `UM-CC-Status` | [Configuration Cache · Status](https://docs.gradle.org/current/userguide/configuration_cache_status.html) | Plugins núcleo admitidos y límites |
| `MVN` | [Migrating Builds From Apache Maven](https://docs.gradle.org/current/userguide/migrating_from_maven.html) | Apartados de la guía de migración |
| `DSL` | Groovy DSL Reference, Kotlin DSL Reference y Javadoc, enlazados desde el manual | Solo como referencia de tipos; no se recorrió tipo por tipo |
| `DCL` | [Declarative Gradle](https://declarative.gradle.org/) | Estado (EAP3, experimental) y conceptos |
| `SB n` | [Spring Boot 4.1.2 · Gradle Plugin](https://docs.spring.io/spring-boot/gradle-plugin/index.html) | Nueve secciones (n = número de sección) y requisitos de Gradle |
| `AND` | [developer.android.com · Build](https://developer.android.com/build) · [Descripción general de la compilación de Gradle](https://developer.android.com/build/gradle-build-overview?hl=es) | Navegación de «Configure your build» |
| `AND-AGP` | [Notas de AGP 9.5](https://developer.android.com/build/releases/gradle-plugin) | Versión y tabla de compatibilidad |
| `AND-KTS` | [Migrar de Groovy a Kotlin DSL](https://developer.android.com/build/migrate-to-kotlin-dsl?hl=es) | Solo el título, desde los resultados de búsqueda |
| `KT` | [kotlinlang.org · Configure a Gradle project](https://kotlinlang.org/docs/gradle-configure-project.html) · [Gradle](https://kotlinlang.org/docs/gradle.html) | Apartados y tabla KGP–Gradle–AGP |
| `KMP` | [Multiplatform Gradle DSL reference](https://kotlinlang.org/docs/multiplatform/multiplatform-dsl-reference.html) | Apartados |
| `DV` | [Develocity 2026.3](https://docs.develocity.ai/2026.3/) | Secciones de la documentación |
| `GHA` | [gradle/actions · setup-gradle](https://github.com/gradle/actions/blob/main/docs/setup-gradle.md) | Apartados y versión mayor |
| — | [Maven · historial de versiones](https://maven.apache.org/docs/history.html) | Versiones vigentes de Maven 3 y 4 |

### 6.2 Libros (claves `L-`)

| Clave | Libro | Índice tomado de |
|---|---|---|
| `L-GiA n` | *Gradle in Action*, Benjamin Muschko, Manning, 2014 (15 capítulos, 2 apéndices) | [O'Reilly](https://www.oreilly.com/library/view/gradle-in-action/9781617291302/) (solo partes y capítulos; la [página de Manning](https://www.manning.com/books/gradle-in-action) no muestra el índice) |
| `L-GBB n` | *Gradle Beyond the Basics*, Tim Berglund, O'Reilly, 2013 (4 capítulos: archivos, plugins, hooks y dependencias) | [O'Reilly](https://www.oreilly.com/library/view/gradle-beyond-the/9781449373801/) |
| `L-BTG n` | *Building and Testing with Gradle*, Tim Berglund y Matthew McCullough, O'Reilly, 2011 (6 capítulos) | [O'Reilly](https://www.oreilly.com/library/view/building-and-testing/9781449306816/) |
| `L-GEI n` | *Gradle Effective Implementations Guide*, 2.ª ed., Hubert Klein Ikkink, Packt, 2016 (12 capítulos) | [O'Reilly](https://www.oreilly.com/library/view/gradle-effective-implementations/9781784394974/) |
| `L-GRA n` | *Gradle Recipes for Android*, Ken Kousen, O'Reilly, 2016 (6 capítulos) | [O'Reilly](https://www.oreilly.com/library/view/gradle-recipes-for/9781491947272/) |
| `L-EAB n` | *Extending Android Builds: Pragmatic Gradle and AGP Skills with Kotlin*, El Zhang (2BAB), 2024 (8 capítulos). Es el libro más reciente encontrado | [Anuncio en el foro de Gradle](https://discuss.gradle.org/t/the-book-extending-android-builds-pragmatic-gradle-and-agp-skills-with-kotlin-is-now-available/48180) |

**Aviso sobre los libros.** Los tres libros pedidos son de 2011 a 2014 y usan Groovy DSL y APIs que ya no
existen (convenciones, `jcenter()`, el plugin `maven`, hooks como `buildFinished`). Sirven para comprobar que
no falta ningún **asunto** clásico (archivos, hooks, Ant, políglota, calidad, CI y despliegue), pero no cubren
providers, build cache, configuration cache, catálogos, toolchains, convention plugins ni TestKit moderno. Esos
temas salen del manual oficial, de DPE University y de la serie *Understanding Gradle*. No se encontró un
libro general de Gradle posterior a 2016; *Idiomatic Gradle Plugins Vol. 2* (Leanpub, 2017) se descartó
porque trata el «software model» nativo, ya retirado.

### 6.3 Formación oficial (claves `DPE-`)

| Clave | Curso de [DPE University](https://dpeuniversity.gradle.com/app/catalog) | Qué se pudo leer |
|---|---|---|
| `DPE-Intro-BE` | Introduction to Gradle for Developers (120 min) · Introduction to Gradle for Build Engineers (60 min) | Título y descripción del catálogo |
| `DPE-Plugins` | Authoring Gradle Plugins (90 min) | Título y descripción |
| `DPE-Shared` | Gradle Shared Build Logic (50 min) | Título y descripción |
| `DPE-Sec` | Securing Gradle Builds (65 min) | Título y descripción |
| `DPE-Inc` · `DPE-IncDV` | Incremental Builds and Build Caching with Gradle (45 min) · la variante con Develocity (45 min) | Título y descripción |
| `DPE-CacheDD n` | [Gradle Build Cache Deep Dive](https://dpeuniversity.gradle.com/app/courses/54469478-55ba-416d-9cef-3b5aa33dd2a5) (120 min) | **Temario completo**: fundamentos (entradas, salidas y normalización), diagnóstico (entradas inestables, salidas en ubicaciones de entrada, salidas solapadas) y API en ejecución |
| `DPE-CacheMaint` | Maintaining Optimal Gradle Build Cache Performance (30 min) | Título y descripción |
| `DPE-Scan` · `DPE-ScanOpt` | How to use a Build Scan · Navigating a Build Scan · Build Scan: Analyzing Builds · Build Scan: Optimizing Builds | Títulos y descripciones |
| `DPE-DV` | Introduction to Develocity y los cursos de Develocity (datos y analítica, selección predictiva de pruebas, diagnóstico) | Títulos y descripciones |
| — | [Rutas de aprendizaje](https://dpeuniversity.gradle.com/app/learning_paths): Introduction to Gradle, Gradle Build Caching, Build Scan Essentials y otras | Solo títulos y número de cursos |
| — | [Anuncio de los cursos](https://blog.gradle.org/dpe-university-and-gradle-courses) | Lista de cursos |

### 6.4 Sílabos de universidades y bootcamps (claves `U-`)

| Clave | Fuente | Temas |
|---|---|---|
| `U-UW` | [University of Waterloo · CS 346 Application Development · Gradle](https://student.cs.uwaterloo.ca/~cs346/1261/slides/03-04-Gradle.pdf) | Sistemas de build, estructura, tareas, wrapper, plugins, settings y build scripts, dependencias, catálogos, y proyectos simple, multi-proyecto y KMP |
| `U-ODU` | [Old Dominion University · CS 350 · Outline](https://www.cs.odu.edu/~zeil/cs350/f20/Directory/outline/outline__scroll.html) | make, Ant, Maven y Gradle; gestión de librerías de terceros y de variantes; integración continua |
| `U-MIT` | [MIT · The Missing Semester · Metaprogramming](https://missing.csail.mit.edu/2020/metaprogramming/) | Sistemas de build, dependencias, versionado semántico, lock files e integración continua |
| `V-UD n` | [Udacity · Gradle for Android and Java](https://classcentral.com/mooc/3584/udacity-gradle-for-android-and-java) (temario vía Class Central) | Cuatro lecciones: fundamentos, Java, Android y builds avanzados de Android |
| `E-AND` | [Android Engineering Curriculum · Gradle & Build Systems](https://sitharaj88.github.io/android-engineering-curriculum/docs/gradle-build/overview) | Ciclo de vida, catálogos, convention plugins y rendimiento |

### 6.5 Cursos largos en vídeo y plataformas (claves `V-`)

| Clave | Fuente | Temas |
|---|---|---|
| `V-UG n` | [*Understanding Gradle*, Jendrik Johannes (YouTube), índice en GitHub](https://github.com/jjohannes/understanding-gradle/blob/main/README.MD) | 37 episodios (n = número): settings, build files, plugins, tareas, dependencias, conflictos, capabilities, publicación, source sets, variantes de característica, pruebas, caché, classpath y module path, artifact transforms, providers, archivos y CI |
| `V-GH n` | [*Gradle Hero*, Tom Gregory](https://tomgregory.com/courses/gradle-hero/) | Cinco capítulos (n = capítulo) y dos bonus: fundamentos, trabajo diario, build scripts, proyectos Java y organización |
| `V-PS n` | [Pluralsight · *Gradle Fundamentals*, Kevin Jones (actualizado 2025-01-10, 2 h 45 min)](https://www.pluralsight.com/courses/gradle-build-tool-fundamentals) | Nueve módulos (n = módulo): entorno, proyectos y tareas, Java y Kotlin, dependencias, multi-proyecto, pruebas, catálogos y wrapper |
| `V-PL` | [Philipp Lackner · *The Ultimate Gradle Kotlin Beginner's Crash Course*](https://classcentral.com/course/youtube-the-ultimate-gradle-kotlin-beginner-s-crash-course-for-2025-382754) (42 min, vía Class Central) | Wrapper, build scripts, plugins, catálogos, módulos, build types, flavors y source sets |
| — | [Udemy · *Fundamentos de Gradle para aplicaciones Java*, Domingo Sebastian (español, 3 h 12 min)](https://comidoc.com/udemy/gradle-fundamentos) | Solo título y duración; la ficha no muestra el temario |

**Español.** No se encontró un curso largo de Gradle en español con temario público. Lo único hallado es el
curso de Udemy anterior (sin temario visible) y la documentación de Android traducida. Este curso cubriría
ese hueco.

### 6.6 Rutas, entrevistas y errores frecuentes (claves `E-`)

| Clave | Fuente | Temas |
|---|---|---|
| `E-J67` | [Java67 · Gradle Interview Questions for Experienced Java Developers](https://www.java67.com/2022/08/gradle-interview-questions-with-answers.html) | 28 asuntos: tipos de plugin, configuraciones, wrapper, daemon, Build Scan, caché, repositorios, `api` frente a `implementation`, `settings` frente a `gradle.properties` y Maven frente a Gradle |
| `E-ALG` | [Allegro Tech · Popular Gradle mistakes, part 2](https://blog.allegro.tech/2025/05/popular-gradle-mistakes-and-how-to-avoid-them-part2.html) | Nueve errores: no usar lazy configuration, `allprojects`/`subprojects`, no usar `dependencyResolutionManagement`, versiones sin alinear, depurar solo con `dependencies`, no usar las cachés, Groovy DSL y acoplar frontend y backend |
| `E-KC1` · `E-KC2` · `E-KC3` | [Gradle en KotlinConf 2026](https://blog.gradle.org/gradle-at-kotlinconf-2026) | Tres charlas: los DSL de Gradle (Groovy, Kotlin y Declarative); diez mejores prácticas (Kotlin DSL, catálogos, convention plugins, cachés local y remota, configuration cache, de kapt a KSP, modularización y caché en CI); plugin de Kotlin para Declarative Gradle |

### 6.7 Fuentes que no se pudieron abrir o que se abrieron a medias

| Fuente | Qué pasó |
|---|---|
| [gradle.org/roadmap](https://gradle.org/roadmap/) | Error del sitio. El estado de Isolated Projects y de Declarative Gradle se tomó del manual y de declarative.gradle.org |
| [gradle.org/courses](https://gradle.org/courses/) | Devuelve una redirección a un canal de YouTube, sin contenido |
| Notas de versión de **9.9.2** | La página «current» mostraba 9.9.1 |
| DPE University · ficha de «Introduction to Gradle for Developers» y fichas de los demás cursos | Error del sitio en la ficha probada; de los demás cursos solo se leyó el catálogo. El catálogo termina en «Load More»: puede haber más cursos |
| [roadmap.sh/java](https://roadmap.sh/java) | La página se carga sin los nodos de la ruta: no se pudo leer la lista de temas. roadmap.sh no tiene una ruta propia de Gradle |
| Udemy · *The Complete Gradle Course* y *Modern Gradle Fundamentals* | Error del sitio |
| [kotlinlang.org/docs/gradle.html](https://kotlinlang.org/docs/gradle.html) | Sin el árbol de navegación; se usó la página «Configure a Gradle project» |
| *Gradle in Action* | Solo capítulos, no secciones |
| Listas de entrevista sénior de Android (levelup.gitconnected.com) y otras de la búsqueda (javainuse, javaguides, mindmajix) | No se abrieron: muro de pago o listas de nivel básico; se usó `E-J67` y `E-AND` |
| Diapositivas de CSE 403 (University of Washington), Inf2-SEPP (Edinburgh) y SWEA (Aarhus) | Aparecieron en la búsqueda y no se abrieron |

**Límites de este contraste.** Las listas de entrevista públicas son de nivel básico o intermedio; las
preguntas sénior (configuration cache, variantes y diagnóstico) se cubren con el manual, Best Practices y las
charlas. La referencia de DSL y el Javadoc no se recorrieron tipo por tipo. Los datos marcados para verificar
al escribir (flujo vigente de publicación en Maven Central, herramientas de SBOM y de actualización
automática, nodo de caché remota) no se comprobaron aquí en fuente primaria y no deben escribirse como hechos
hasta ejecutarlos.
