# Plan curricular verificable: Build Tools — Maven y Gradle de cero a experto

Estado: diseño curricular aprobado para implementación progresiva. **No es todavía
un track publicado ni acredita lecciones terminadas.** Cada módulo se publicará
cuando sus temas cumplan el contrato de profundidad, ejecución y revisión humana
(mapa de subtemas, explicación individual, evidencia ejecutada en JDK 27).

## Motivo del curso separado

En el track Java, Maven y Gradle aparecen repartidos y por encima: Módulo 8
(`pom.xml` vs `build.gradle.kts`, ciclo de vida, multi-módulo, lado a lado) y
Módulo 15 (Maven/Gradle avanzado, multi-módulo sin ciclos). Es suficiente para
**usar** una herramienta de build, no para **dominarla**: resolución de
dependencias transitivas y conflictos, BOM y gestión centralizada de versiones,
repositorios y mirrors, caché y builds incrementales, toolchains, publicación de
artefactos, plugins propios, y build en CI reproducible son capítulos propios en
la documentación oficial que el track no desarrolla.

Este curso enseña **el sistema de build como disciplina**: qué es construir
software, por qué una herramienta declarativa es mejor que un script, y cómo
Maven y Gradle resuelven el mismo problema con filosofías distintas. Java es el
lenguaje de los ejemplos, pero las ideas (grafo de dependencias, fases, caché,
reproducibilidad) aplican a cualquier ecosistema.

## Frontera con el track Java

- El track Java conserva el uso **básico** de Maven/Gradle para compilar y probar
  sus ejemplos (M8 introductorio, M15 intermedio).
- Este curso desarrolla el build **de cero a experto** como herramienta propia:
  modelo, resolución de dependencias, caché, publicación, plugins y operación.
- Quien no tenga Java básico vuelve al tema exacto del track Java, no recibe un
  resumen superficial aquí.

**Prerrequisitos del curso:** Java hasta clases, paquetes y JAR (Java M0–M1); una
terminal funcional; nociones de control de versiones (Git). JDK 27 instalado.

**Proyecto progresivo:** `rutaflow-build`, una aplicación multi-módulo (dominio,
aplicación, infraestructura, app) que evoluciona de un único archivo compilado a
mano hasta un build multi-módulo reproducible, con dependencias gestionadas por
BOM, publicado a un repositorio local y construido en CI con caché.

## Secuencia completa

### Módulo 0 · Qué es construir software (sin herramienta)
- del `.java` al `.class` al JAR: `javac`, `jar`, `java -jar` y el manifiesto;
- classpath, dependencias y por qué compilar a mano no escala;
- el grafo de compilación y por qué el orden importa;
- qué problema resuelve una herramienta de build frente a un script shell;
- evidencia: compilar, empaquetar y ejecutar un JAR con una dependencia, todo a mano, y sentir el dolor.

### Módulo 1 · Maven: modelo de proyecto y `pom.xml`
- POM, coordenadas (groupId, artifactId, version), `packaging`;
- convención sobre configuración: estructura estándar de directorios;
- herencia de POM, `parent` y el super-POM;
- propiedades y perfiles (`profiles`);
- evidencia: un `pom.xml` mínimo que compila y empaqueta el proyecto.

### Módulo 2 · Maven: ciclo de vida, fases, goals y plugins
- lifecycle (default, clean, site), fases y su orden;
- goals y el binding fase→goal;
- plugins del core (compiler, surefire, jar, shade/assembly);
- `mvn help:describe` y cómo leer qué hace cada plugin;
- evidencia: ejecutar `clean package`, observar qué fase dispara qué goal, y empaquetar un fat-JAR.

### Módulo 3 · Maven: dependencias, scopes y resolución transitiva
- coordenadas de dependencia y repositorios (central, local, remotos);
- scopes (compile, provided, runtime, test, import) y su efecto en el classpath;
- dependencias transitivas, el árbol (`dependency:tree`) y mediación de conflictos;
- exclusiones, `dependencyManagement` y BOM;
- evidencia: reproducir un conflicto de versión transitiva y resolverlo con un BOM.

### Módulo 4 · Maven: multi-módulo y reactor
- proyecto agregador (`packaging pom`) y módulos;
- el reactor: orden topológico y build parcial (`-pl`, `-am`);
- compartir versiones y plugins desde el POM padre;
- ciclos entre módulos y cómo evitarlos;
- evidencia: `rutaflow-build` con 4 módulos, dependencia interna y un ciclo reproducido y corregido.

### Módulo 5 · Gradle: modelo, tareas y el grafo de tareas
- build script Kotlin DSL, proyecto y tareas;
- el DAG de tareas, `dependsOn`, inputs/outputs;
- `gradle tasks`, `--console` y leer el build;
- el wrapper (`gradlew`) y por qué fija la versión de Gradle;
- evidencia: una tarea propia con inputs/outputs y su ejecución incremental.

### Módulo 6 · Gradle: dependencias, configuraciones y catálogos de versiones
- configuraciones (implementation, api, compileOnly, runtimeOnly, testImplementation);
- resolución, `dependencies`/`dependencyInsight` y estrategias de conflicto;
- version catalogs (`libs.versions.toml`) y platforms (BOM en Gradle);
- repositorios y dependencias de proyecto;
- evidencia: migrar las dependencias del proyecto a un version catalog y resolver un conflicto con una estrategia explícita.

### Módulo 7 · Gradle: multi-proyecto y convenciones
- `settings.gradle.kts`, subproyectos y `project(...)`;
- convention plugins (`buildSrc` / composite builds) para no repetir configuración;
- compartir dependencias y toolchain entre subproyectos;
- build parcial y tareas agregadas;
- evidencia: `rutaflow-build` en Gradle multi-proyecto con un convention plugin propio.

### Módulo 8 · Caché, incrementalidad y builds reproducibles
- build incremental: inputs/outputs y por qué Gradle evita tareas up-to-date;
- caché local y remota de Gradle; caché de Maven;
- determinismo: fijar versiones, orden de entradas, timestamps del JAR;
- `--offline`, lockfiles de dependencias;
- evidencia: medir una segunda build que no rehace trabajo y verificar que dos builds producen el mismo artefacto byte a byte (o explicar por qué no).

### Módulo 9 · Toolchains, multi-JDK y multiplataforma
- toolchains de Java en Maven y Gradle: fijar el JDK de compilación/ejecución;
- compilar para un objetivo anterior (`--release`) de forma reproducible;
- separar el JDK que construye del que ejecuta;
- evidencia: construir con JDK 27 un artefacto dirigido a Java 21 y verificar la major version del `.class`.

### Módulo 10 · Pruebas en el build
- integrar JUnit 5 y cobertura (JaCoCo) en Maven y Gradle;
- separar pruebas unitarias de integración (surefire/failsafe; source sets);
- fallar el build ante umbrales; pruebas deterministas;
- evidencia: un build que corre pruebas, mide cobertura y falla si baja de un umbral.

### Módulo 11 · Publicar artefactos
- instalar en el repositorio local; publicar a uno remoto;
- metadatos de publicación (POM generado, `maven-publish`);
- versionado semántico, SNAPSHOT frente a release;
- firmar artefactos (GPG) y generar sources/javadoc;
- evidencia: publicar `rutaflow-build` a un repositorio local y consumirlo desde otro proyecto.

### Módulo 12 · Extender el build: plugins propios
- escribir un plugin/goal propio (Maven mojo) y un plugin de Gradle;
- tareas personalizadas con inputs/outputs cacheables;
- cuándo un plugin propio frente a un script;
- evidencia: un plugin que genera un archivo de versión y participa en el build incremental.

### Módulo 13 · Seguridad de la cadena de suministro del build
- integridad de dependencias: checksums, lockfiles, verificación de firmas;
- SBOM (CycloneDX) y escaneo de vulnerabilidades (dependency-check);
- mirrors y repositorios internos; riesgo de typosquatting y dependencia confusa;
- evidencia: generar un SBOM, detectar una dependencia con CVE conocida y fijarla.

### Módulo 14 · Build en CI reproducible
- build en CI (GitHub Actions) con caché de dependencias y de Gradle;
- matrices de JDK; artefactos de build;
- builds efímeros y determinismo entre local y CI;
- evidencia: un pipeline que construye, prueba, publica y reutiliza caché, idéntico a la build local.

### Módulo 15 · Rendimiento y diagnóstico del build
- build scan / `--profile`; identificar tareas lentas;
- paralelismo y daemon de Gradle; `-T` en Maven;
- diagnóstico de resolución de dependencias lenta;
- evidencia: perfilar una build, acelerarla con paralelismo y justificar el cambio con datos.

### Módulo 16 · Proyecto integrador: build profesional de RutaFlow
- `rutaflow-build` completo multi-módulo con version catalog/BOM, convention plugins, toolchain, pruebas con cobertura, SBOM, publicación y CI con caché, construido de forma reproducible en Maven **y** en Gradle.

## Método y puerta de calidad

Cada tema se construye desde carpeta vacía con archivos, comandos, salida real
ejecutada (Maven 3.9+/Gradle 9+, JDK 27), un fallo deliberado con diagnóstico y
una práctica de transferencia al proyecto. Las versiones y el comportamiento se
contrastan con la documentación oficial de Apache Maven y Gradle. Ningún tema se
declara completo sin mapa de subtemas, explicación individual y revisión humana
registrada; la deuda del trinquete no puede aumentar.
