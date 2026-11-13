# Módulo 15: Java Master — builds, pruebas y observabilidad

Este capítulo endurece el proyecto multi-módulo del Módulo 14 como producto mantenible. Trabaja sobre ese mismo repositorio; no crea seis demostraciones aisladas.

## Aprende construyendo

### Tema 1: Maven avanzado

**¿Por qué es importante?** el reactor y el control de versiones permiten fallar el build antes de que un módulo publique dependencias incompatibles.

#### Subtema 1.1: Construye el reactor Maven · 10 min

**1. Contexto**

`app` y `domain` deben compilarse en un orden que Maven pueda resolver.

**2. Hazlo tú**

Desde la raíz del repositorio copia el ejemplo completo, incluida `examples/java-maven/pom.xml`: `cp -R examples/java-maven ejemplo-maven-avanzado`, entra con `cd ejemplo-maven-avanzado` y ejecuta `mvn -pl app -am clean verify`.

**Resultado esperado:** los módulos se construyen en orden y `app` puede usar `domain`.

**Fallo deliberado:** ejecuta `mvn -pl app verify` sin instalar `domain`. **Diagnóstico:** usa `-am` para incluir dependencias internas del reactor.

**3. Entiende**

`-pl` selecciona módulos; `-am` añade los proyectos que necesitan para compilar.

**4. Cierra**

Guarda el resumen del reactor.

#### Subtema 1.2: Detecta versiones divergentes · 10 min

**1. Contexto**

Un módulo puede recibir Jackson por dependencia directa y transitiva en versiones distintas.

**2. Hazlo tú**

En `ejemplo-maven-avanzado/domain/pom.xml` y `ejemplo-maven-avanzado/app/pom.xml`, revisa la propiedad Jackson; en la copia ejecuta `mvn -pl app -am verify -Ddomain.jackson=2.18.3`. Después restaura la propiedad compartida y corre `mvn -pl app -am clean verify`.

**Resultado esperado:** Enforcer rechaza la convergencia con el override y el build pasa al restaurar la versión administrada.

**Fallo deliberado:** excluye la regla de convergencia para “arreglar” el build. **Diagnóstico:** revisa qué versión carga cada módulo; no ocultes la divergencia.

**3. Entiende**

`dependencyManagement` administra versiones, pero no agrega la dependencia por sí solo. Enforcer aplica la regla a cada build.

**4. Cierra**

Guarda ambos resultados y el árbol de dependencia. Fuente: [Maven Enforcer](https://maven.apache.org/enforcer/maven-enforcer-plugin/).

#### Subtema 1.3: Bloquea un JDK incompatible · 10 min

**1. Contexto**

CI debe rechazar una versión de Java fuera del rango soportado antes de crear un artefacto.

**2. Hazlo tú**

En `ejemplo-maven-avanzado/pom.xml` revisa la regla `requireJavaVersion`; ejecuta `mvn validate '-Drequired.java=[99,)'` y luego `mvn validate` con el rango normal.

**Resultado esperado:** falla el requisito artificial y vuelve a pasar al restaurarlo.

**Fallo deliberado:** usa `[22,)` esperando fallar con Java 25. **Diagnóstico:** ese rango sí incluye Java 25; utiliza un rango que excluya el JDK activo.

**3. Entiende**

El requisito del runtime de Maven y `maven.compiler.release` cumplen funciones distintas: ejecutar Maven y compilar el código.

**4. Cierra**

Conserva la salida de ambas validaciones y anota el rango admitido.

**Prueba el lifecycle:** compara `./mvnw test` con `./mvnw clean verify` y observa qué pasos adicionales corren. Instalar un plugin no ejecuta automáticamente sus objetivos: enlaza cada uno a una fase y guarda la decisión en `pom.xml`. Comprueba desde una copia limpia que pruebas, chequeos y empaquetado corren en el orden esperado. Así puedes explicar qué artefacto produces y evitas depender de comandos locales que CI desconoce. Fuente: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html.

#### Fragmento real

```bash
cp -R examples/java-maven ejemplo-maven-avanzado
cd ejemplo-maven-avanzado
mvn -pl app -am clean verify
```

**Conexión con el proyecto integrador:** el proyecto integrador (módulo 13) necesita este mismo reactor Maven (`domain`/`app` separados, `-pl -am`) si lo construyes con Maven en vez de Gradle; Enforcer evita que `app` y `domain` resuelvan versiones distintas de la misma librería.

**Límite:** `-pl app -am` solo construye lo que falta en el reactor actual; sin un `install` previo de `domain` en el repositorio local, un comando que omita `-am` fallará aunque el código sea correcto.

#### Practica

Modifica `ejemplo-maven-avanzado/pom.xml` para usar el rango `[99,)` en `requireJavaVersion` y ejecuta `mvn validate`; confirma que Enforcer rechaza el build antes de intentar compilar nada.

### Tema 2: Gradle y builds reproducibles

**¿Por qué es importante?** un mismo commit debe producir el mismo artefacto y usar dependencias verificables en una laptop y en CI.

#### Subtema 2.1: Genera y usa el Gradle Wrapper · 10 min

**1. Contexto**

El build no debe depender de la versión Gradle que cada persona instaló globalmente.

**2. Hazlo tú**

Desde la raíz copia `examples/java-gradle/build.gradle.kts` y los otros archivos de `examples/java-gradle` a `ejemplo-gradle-reproducible`, entra a la carpeta y corre `gradle wrapper --gradle-version 9.1.0`, `./gradlew --version` y `./gradlew clean build`.

**Resultado esperado:** el wrapper informa Gradle 9.1.0 y el build ejecuta con esa versión.

**Fallo deliberado:** ejecuta `gradle build` después de cambiar la versión global. **Diagnóstico:** usa `./gradlew` para el proyecto y evita depender de la instalación personal.

**3. Entiende**

El wrapper fija Gradle; la toolchain define el JDK usado para compilar. El JDK que ejecuta Gradle también debe ser compatible.

**4. Cierra**

Guarda salida del wrapper y resultado del build.

#### Subtema 2.2: Repite el build y compara artefactos · 10 min

**1. Contexto**

Timestamps o contenido variable en el JAR hacen difícil verificar qué artefacto se desplegó.

**2. Hazlo tú**

En `ejemplo-gradle-reproducible/build.gradle.kts` comprueba que `isPreserveFileTimestamps = false` y `isReproducibleFileOrder = true`. Ejecuta dos veces `./gradlew clean build`; compara `shasum -a 256 build/libs/*.jar` en macOS o `sha256sum build/libs/*.jar` en Linux.

**Resultado esperado:** ambos hashes coinciden para la misma fuente y configuración.

**Fallo deliberado:** añade la hora actual al manifest y repite. **Diagnóstico:** elimina el timestamp o sustitúyelo por un valor estable.

**3. Entiende**

Reproducibilidad depende de entradas declaradas y pasos deterministas, no solo de activar la caché.

**4. Cierra**

Guarda hashes antes y después de quitar el dato variable.

#### Subtema 2.3: Verifica dependencias descargadas · 10 min

**1. Contexto**

Una coordenada fija no detecta por sí sola que el archivo descargado cambió.

**2. Hazlo tú**

En `ejemplo-gradle-reproducible`, ejecuta `./gradlew --write-verification-metadata sha256 help`, conserva `gradle/verification-metadata.xml` y luego corre `./gradlew clean build`.

**Resultado esperado:** el build compara checksums declarados con los artefactos resueltos.

**Fallo deliberado:** edita un checksum en `gradle/verification-metadata.xml`. **Diagnóstico:** la verificación falla; restaura el valor obtenido de una fuente confiable.

**3. Entiende**

Dependency locking registra versiones; verification metadata controla integridad de los bytes. No subas credenciales al repositorio.

**4. Cierra**

Guarda el archivo generado y explica qué riesgo cubre cada mecanismo. Fuente: [Gradle dependency verification](https://docs.gradle.org/current/userguide/dependency_verification.html).

**Prueba dos entornos:** usa el Gradle Wrapper y ejecuta `./gradlew clean build` en un checkout limpio. Si difiere la salida, compara JDK, wrapper y `./gradlew dependencies --configuration runtimeClasspath`. El caché acelera descargas, pero no fija la versión resuelta. Declara versiones en catálogo o plataforma y comparte convenciones cuando los módulos repiten configuración. Guarda la tarea que produce el artefacto desplegado. Fuente: https://docs.gradle.org/current/userguide/declaring_configurations.html.

#### Fragmento real

```bash
cp -R examples/java-gradle ejemplo-gradle-reproducible
cd ejemplo-gradle-reproducible
gradle wrapper --gradle-version 9.1.0
./gradlew clean build
```

**Conexión con el proyecto integrador:** si distribuyes el proyecto integrador con Gradle, el wrapper versionado (y `isReproducibleFileOrder`/sin timestamps) es lo que garantiza que el JAR que construye tu compañero sea bit a bit igual al tuyo para el mismo commit.

**Límite:** la reproducibilidad del artefacto (mismo hash) no certifica que el build sea correcto ni rápido; solo dice que, dado el mismo código y configuración, el resultado no varía por azar (timestamps, orden de archivos).

#### Practica

Modifica `build.gradle.kts` para incluir la hora actual (`System.currentTimeMillis()`) en el manifest del JAR, ejecuta `./gradlew clean build` dos veces y compara los hashes SHA-256 antes y después de revertir el cambio.

### Tema 3: Proyectos multi-módulo sin ciclos

**¿Por qué es importante?** límites protegidos evitan que reglas de negocio dependan directamente de bases de datos y frameworks.

#### Subtema 3.1: Escribe una regla de dependencias con ArchUnit · 10 min

**1. Contexto**

`domain` no debe importar clases de `infrastructure`.

**2. Hazlo tú**

En `build.gradle.kts` añade `testImplementation("com.tngtech.archunit:archunit-junit6:1.5.1")` a `build.gradle.kts`. Crea `src/test/java/architecture/DependencyRulesTest.java` con un test JUnit 6 que importe `new ClassFileImporter().importPackages("com.academia")` y aplique `noClasses().that().resideInAPackage("..domain..").should().dependOnClassesThat().resideInAPackage("..infrastructure..").check(clases)`. Ejecuta `./gradlew test`.

**Resultado esperado:** la regla pasa mientras el dominio no importe infraestructura.

**Fallo deliberado:** añade `import com.academia.infrastructure.HttpClient` a una clase en domain. **Diagnóstico:** el test señala origen y destino de la dependencia prohibida.

**3. Entiende**

ArchUnit importa bytecode compilado y prueba reglas arquitectónicas con la misma suite Java.

**4. Cierra**

Guarda el fallo y el test de arquitectura. Fuente: [ArchUnit](https://www.archunit.org/getting-started).

#### Subtema 3.2: Detecta ciclos entre paquetes · 10 min

**1. Contexto**

`application` e `infrastructure` pueden empezar a depender uno del otro con cambios pequeños.

**2. Hazlo tú**

En `src/test/java/architecture/DependencyRulesTest.java` importa `slices()` de ArchUnit y añade `slices().matching("com.academia.(*)..").should().beFreeOfCycles()`. Ejecuta `./gradlew test`.

**Resultado esperado:** el grafo sin ciclos mantiene la prueba en verde.

**Fallo deliberado:** añade una dependencia inversa de prueba y vuelve a correr. **Diagnóstico:** extrae el contrato común a una capa interior; no “arregles” el ciclo ignorándolo.

**3. Entiende**

Un ciclo elimina un orden claro para compilar y cambiar módulos de forma independiente.

**4. Cierra**

Guarda el grafo antes y después de romper el ciclo.

#### Subtema 3.3: Comprueba el grafo del build · 10 min

**1. Contexto**

El grafo de dependencias del build debe coincidir con el límite que documenta el equipo.

**2. Hazlo tú**

En `src/main/java/com/academia/Main.java` y la raíz del proyecto ejecuta `./gradlew projects` y `./gradlew dependencies --configuration runtimeClasspath`; compara la salida con el árbol `api → application → domain` y adaptadores que implementan contratos interiores.

**Resultado esperado:** cada dependencia puede explicarse desde el grafo, y no aparece un ciclo.

**Fallo deliberado:** agrega una dependencia runtime a domain solo porque el IDE la resuelve desde otro módulo. **Diagnóstico:** revisa la configuración del módulo; no confundas classpath del IDE con API permitida.

**3. Entiende**

`api` expone tipos a consumidores; `implementation` conserva dependencias internas.

**4. Cierra**

Guarda `projects` y una decisión de arquitectura. Fuente: [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html).

**Revisa el grafo:** dibuja una flecha por dependencia, como `app → dominio → contratos`. Una flecha de regreso forma un ciclo y suele indicar que el contrato quedó en una capa equivocada. Maven construye dependencias con `./mvnw -pl app -am test`; Gradle declara `implementation(project(":dominio"))`. Mantén la raíz como agregadora y evita que un módulo bajo importe la aplicación. Fuentes: https://maven.apache.org/guides/mini/guide-multiple-modules.html y https://docs.gradle.org/current/userguide/multi_project_builds.html.

#### Fragmento real

```java
// src/test/java/architecture/DependencyRulesTest.java
@Test
void dominioNoDependeDeInfraestructura() {
    var clases = new ClassFileImporter().importPackages("com.academia");
    noClasses().that().resideInAPackage("..domain..")
        .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
        .check(clases);
}
```

Ejecuta:

```bash
./gradlew test
```

**Conexión con el proyecto integrador:** el proyecto integrador separa dominio de infraestructura (módulo 13); esta misma regla ArchUnit es la que evita que, con el tiempo, alguien importe JDBC o Spring directamente dentro de la lógica de asignación de guías.

**Límite:** ArchUnit prueba la estructura de dependencias entre paquetes compilados; no prueba que la lógica de negocio sea correcta, solo que no cruza el límite arquitectónico que declaraste.

#### Practica

Modifica una clase de `domain` para que importe algo de `infrastructure` a propósito, ejecuta `./gradlew test` y confirma que el mensaje de fallo señala exactamente el origen y destino de la dependencia prohibida.

### Tema 4: JUnit 5, Mockito y assertions expresivas

**¿Por qué es importante?** las pruebas detectan regresiones del comportamiento sin acoplar la suite a cada llamada interna.

**Preparación:** usa JUnit `6.0.2` y Surefire/Gradle JUnit Platform como en el Módulo 9; para Mockito usa `mockito-junit-jupiter:5.24.0`. Consulta las [versiones de Mockito](https://github.com/mockito/mockito/releases).

#### Subtema 4.1: Prueba un caso de uso real · 10 min

**1. Contexto**

`ConfirmarEntrega` guarda el nuevo estado y publica una notificación.

**2. Hazlo tú**

Crea `src/test/java/ConfirmarEntregaTest.java` con un fake de `RepositorioGuias` en memoria y un mock `PuertoNotificacion`. Ejecuta el caso `confirmar("RT-1")`; comprueba estado `ENTREGADA` y `verify(notificacion).enviar(any(EventoEntrega.class))`. Ejecuta `./gradlew test`.

**Resultado esperado:** la regla y la colaboración importante se prueban sin base real ni HTTP.

**Fallo deliberado:** mockea también el caso de uso. **Diagnóstico:** ya no se ejecuta la lógica que la prueba debía proteger; conserva real la clase bajo prueba.

**3. Entiende**

Un fake sencillo es útil para datos; un mock demuestra una interacción solo si esta es parte del contrato.

**4. Cierra**

Conserva test, fallo y salida de Gradle.

#### Subtema 4.2: Expresa el resultado sin atarte a llamadas internas · 10 min

**1. Contexto**

`verifyNoMoreInteractions` puede hacer fallar una prueba aunque el comportamiento visible no haya cambiado.

**2. Hazlo tú**

En `src/test/java/ConfirmarEntregaTest.java`, añade `verifyNoMoreInteractions(notificacion)`, ejecuta `./gradlew test`, agrega una segunda llamada legítima a `notificacion` y vuelve a correr.

**Resultado esperado:** observas que una regla excesivamente estricta acopla el test a la implementación.

**Fallo deliberado:** elimina toda verificación de estado y deja solo el mock. **Diagnóstico:** prueba también el resultado de dominio para detectar una regresión real.

**3. Entiende**

Assertions de dominio suelen sobrevivir a refactors mejor que verificar cada interacción.

**4. Cierra**

Anota cuándo una llamada extra sería un error observable para el usuario.

#### Subtema 4.3: Aísla una excepción del colaborador · 10 min

**1. Contexto**

La notificación puede fallar después de guardar la entrega; el sistema necesita una política explícita.

**2. Hazlo tú**

En `src/test/java/ConfirmarEntregaTest.java`, configura `doThrow(new IllegalStateException("sin conexión")).when(notificacion).enviar(any())`; ejecuta el caso y comprueba si la operación devuelve error, reintenta o deja un evento pendiente según el contrato elegido. Ejecuta `./gradlew test`.

**Resultado esperado:** el test fija qué ocurre si el servicio de avisos falla.

**Fallo deliberado:** atrapa cualquier excepción y reporta éxito. **Diagnóstico:** decide si la entrega quedó confirmada y preserva el fallo de notificación de forma observable.

**3. Entiende**

Mocks ayudan a reproducir fallos; no prueban transporte real ni persistencia atómica.

**4. Cierra**

Guarda el contrato y la prueba de error. Fuente: [JUnit User Guide](https://docs.junit.org/current/user-guide/).

#### Fragmento real

```java
// src/test/java/ConfirmarEntregaTest.java
@Test
void confirmarEnviaNotificacionYActualizaEstado() {
    var repo = new RepositorioGuiasFake();
    var notificacion = mock(PuertoNotificacion.class);
    var caso = new ConfirmarEntrega(repo, notificacion);

    caso.confirmar("RT-1");

    assertEquals("ENTREGADA", repo.estadoDe("RT-1"));
    verify(notificacion).enviar(any(EventoEntrega.class));
}
```

Ejecuta:

```bash
./gradlew test
```

**Conexión con el proyecto integrador:** `ConfirmarEntrega` es el tipo de caso de uso que tendrás en el proyecto integrador; probarlo con un fake de repositorio y un mock de notificación (no una base real) es lo que te permite correr esta suite en segundos, no minutos.

**Límite:** mockear `PuertoNotificacion` prueba que tu caso de uso llama al puerto correctamente; no prueba que el adaptador real (SMS, email) funcione — eso exige una prueba de integración aparte (Tema 5) contra el servicio real o un doble fiel a su contrato.

#### Practica

Modifica el mock para que `notificacion.enviar(...)` también se llame una segunda vez dentro del caso de uso, y confirma con `verifyNoMoreInteractions` si tu prueba empieza a fallar aunque el comportamiento visible para el usuario no cambió.

### Tema 5: Pruebas de integración reproducibles

**¿Por qué es importante?** la base real puede interpretar tipos, SQL y transacciones distinto a un mock.

**Preparación:** Testcontainers `2.0.5`; añade `testcontainers-junit-jupiter`, `testcontainers-postgresql`, pgJDBC `42.7.14` y JUnit a la configuración de test. Imagen fijada: `postgres:17.11-alpine3.24`. En `build.gradle.kts` crea el source set `integrationTest`, extiende su configuración desde `testImplementation` y registra su tarea:

```kotlin
val integrationTest by sourceSets.creating {
    java.srcDir("src/integrationTest/java")
    resources.srcDir("src/integrationTest/resources")
    compileClasspath += sourceSets.main.get().output
    runtimeClasspath += output + compileClasspath
}
configurations[integrationTest.implementationConfigurationName]
    .extendsFrom(configurations.testImplementation.get())

tasks.register<Test>("integrationTest") {
    testClassesDirs = integrationTest.output.classesDirs
    classpath = integrationTest.runtimeClasspath
    useJUnitPlatform()
}
```

Fuentes: [Testcontainers PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/) y [Jupiter](https://java.testcontainers.org/test_framework_integration/junit_5/).

#### Subtema 5.1: Levanta PostgreSQL al ejecutar el test · 10 min

**1. Contexto**

El test debe iniciar una base conocida y cerrarla al finalizar.

**2. Hazlo tú**

Crea `src/integrationTest/java/RepositorioPostgresIT.java` con `@Testcontainers`, `@Container static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:17.11-alpine3.24")` y un test que compruebe `db.isRunning()`. Ejecuta `./gradlew integrationTest` con Docker activo.

**Resultado esperado:** Testcontainers inicia la imagen exacta durante el test y luego la elimina.

**Fallo deliberado:** ejecuta el test con Docker apagado. **Diagnóstico:** comprueba el runtime de contenedores antes de interpretar el fallo como error de SQL.

**3. Entiende**

La prueba usa un servicio real en contenedor aislado, no un mock del driver.

**4. Cierra**

Guarda log de la versión de imagen y cierre del contenedor.

#### Subtema 5.2: Prueba el SQL y la migración reales · 10 min

**1. Contexto**

Una columna decimal y una fecha deben conservar sus valores con PostgreSQL real.

**2. Hazlo tú**

En `src/integrationTest/resources/db/migration/V1__guias.sql` crea tabla `guias` con `monto NUMERIC(10,2)` y `fecha DATE`; en `src/integrationTest/java/RepositorioPostgresIT.java`, inserta y recupera `123.45` y una fecha fija mediante JDBC. Ejecuta `./gradlew integrationTest`.

**Resultado esperado:** el monto y la fecha recuperados coinciden exactamente.

**Fallo deliberado:** cambia `monto` por `montoo` en la consulta. **Diagnóstico:** el motor real informa la columna inexistente; corrige la consulta y conserva la migración.

**3. Entiende**

Una base real detecta diferencias de dialecto y tipos que no aparecen con una implementación simulada.

**4. Cierra**

Guarda el resultado antes y después de reparar el nombre de columna.

#### Subtema 5.3: Repite la prueba sin compartir estado · 10 min

**1. Contexto**

Una prueba debe poder repetirse en CI sin depender de una base que quedó de la ejecución anterior.

**2. Hazlo tú**

En `src/integrationTest/java/RepositorioPostgresIT.java`, ejecuta dos veces `./gradlew clean integrationTest`; configura esquema y datos dentro del ciclo de test y no uses una base local persistente.

**Resultado esperado:** ambas ejecuciones parten de PostgreSQL limpio y terminan con los mismos assertions.

**Fallo deliberado:** deja una fila fija y ejecuta dos veces un test que asume tabla vacía. **Diagnóstico:** crea/reset el esquema por ejecución o diseña fixture aislado.

**3. Entiende**

Contenedores desechables y datos controlados eliminan dependencia del orden; en CI sigue siendo necesario Docker.

**4. Cierra**

Conserva los dos resultados y el comando usado.

Ejecuta:

```bash
./gradlew integrationTest
```

**Conexión con el proyecto integrador:** si el proyecto integrador persiste en PostgreSQL (módulo 16), esta es la prueba que confirma que tus migraciones y consultas funcionan contra el motor real, no solo contra el fake en memoria del Tema 4.

**Límite:** Testcontainers exige Docker disponible; en un entorno sin Docker (algunos runners de CI gratuitos) esta suite no puede correr y debe separarse de las pruebas unitarias rápidas, como ya hace el source set `integrationTest` distinto de `test`.

#### Practica

Modifica el nombre de la columna `monto` a `montoo` en la consulta JDBC del Subtema 5.2, ejecuta `./gradlew integrationTest` y confirma que PostgreSQL real reporta la columna inexistente con un mensaje distinto al que daría un mock.

### Tema 6: SLF4J, Logback, MDC y logging estructurado

**¿Por qué es importante?** logs correlacionados ayudan a seguir una solicitud sin registrar secretos ni mezclar operaciones en hilos reutilizados.

**Preparación:** añade `implementation("org.slf4j:slf4j-api:2.0.18")` y `runtimeOnly("ch.qos.logback:logback-classic:1.6.6")`. El ejemplo emite pares key-value con `%kvp`; no necesita un encoder JSON adicional. La versión de Logback contiene correcciones de seguridad recientes; revisa sus [notas oficiales](https://github.com/qos-ch/logback/releases).

#### Subtema 6.1: Emite campos estructurados · 10 min

**1. Contexto**

Un incidente requiere buscar guía y estado sin procesar texto ambiguo.

**2. Hazlo tú**

Crea `src/main/resources/logback.xml` con encoder `<encoder><pattern>%d %-5level %logger{36} %kvp - %msg%n</pattern></encoder>` y `src/main/java/ProcesarEntrega.java` con `LoggerFactory.getLogger(...)`; escribe `log.atInfo().addKeyValue("guia", guia).addKeyValue("estado", estado).log("delivery processed")`. Ejecuta `./gradlew run` y confirma campos `level`, `message` y pares `key=value` de guía.

**Resultado esperado:** el evento se puede consultar por guía sin concatenar valores al mensaje.

**Fallo deliberado:** registra dirección completa y token. **Diagnóstico:** elimina datos sensibles y deja solo identificadores necesarios para investigar.

**3. Entiende**

SLF4J es la fachada; Logback produce los eventos y define su formato.

**4. Cierra**

Guarda una línea JSON de ejemplo sin secretos.

#### Subtema 6.2: Correlaciona solicitudes con MDC · 10 min

**1. Contexto**

Una solicitud pasa por varias capas y todas sus líneas deben compartir `traceId`.

**2. Hazlo tú**

En `src/main/java/ProcesarEntrega.java`, envuelve el manejo con `try (var ignored = MDC.putCloseable("traceId", traceId)) { ... }`. Ejecuta `./gradlew run` con dos IDs distintos y comprueba que aparecen en sus eventos.

**Resultado esperado:** cada operación lleva su propio `traceId`.

**Fallo deliberado:** llama `MDC.put` sin quitar el valor. **Diagnóstico:** un pool reutiliza hilos; cierra el contexto para no contaminar la solicitud siguiente.

**3. Entiende**

MDC normalmente asocia contexto al hilo. Para trabajo asíncrono hay que propagarlo explícitamente con la integración usada.

**4. Cierra**

Guarda dos eventos y confirma que no comparten el ID.

#### Subtema 6.3: Evita registrar el mismo error en todas las capas · 10 min

**1. Contexto**

Un error que se loguea en cada nivel genera varias copias del mismo stack trace.

**2. Hazlo tú**

En `src/main/java/ProcesarEntrega.java`, propaga una excepción de repositorio hasta el límite de la solicitud y registra una vez allí con `log.error("No se pudo procesar guia={}", guia, error)`. Ejecuta `./gradlew run` con el fallo preparado.

**Resultado esperado:** aparece un stack trace con contexto de guía una sola vez.

**Fallo deliberado:** añade `log.error` y relanza en cada capa. **Diagnóstico:** registra en el límite que puede resolver o reportar el error, y propaga entre capas internas.

**3. Entiende**

Logs complementan métricas y trazas; un ID de alta cardinalidad puede ser útil en logs y costoso como etiqueta de métrica.

**4. Cierra**

Conserva la salida y una regla de datos que nunca registrarás.

#### Fragmento real

```java
// src/main/java/ProcesarEntrega.java
try (var ignored = MDC.putCloseable("traceId", traceId)) {
    log.atInfo().addKeyValue("guia", guia).addKeyValue("estado", estado)
       .log("delivery processed");
}
```

Ejecuta:

```bash
./gradlew run
```

**Conexión con el proyecto integrador:** cuando el proyecto integrador reciba varias peticiones concurrentes para asignar guías, `traceId` por `MDC` es lo que te permite separar en los logs qué línea pertenece a cada petición, en vez de un bloque de texto mezclado.

**Límite:** `MDC` asocia contexto al hilo actual; si el proyecto integrador usa `ExecutorService` o hilos virtuales para procesar en paralelo (módulo 13), el `traceId` no se propaga automáticamente al hilo hijo — hay que copiarlo explícitamente al crear cada tarea.

#### Practica

Modifica `ProcesarEntrega.java` para llamar `MDC.put("traceId", traceId)` sin el `try-with-resources` de `putCloseable`, procesa dos solicitudes con IDs distintos en el mismo hilo reutilizado y observa si el segundo evento conserva el `traceId` del primero.

---


## Construcción guiada del capítulo

Ejecuta `./gradlew clean check integrationTest`, inspecciona dependencias y artefactos, y arranca el proyecto con logging key-value. La entrega incluye hashes reproducibles, grafo de módulos, reportes unitarios/integración y dos logs correlacionados. Si otra persona necesita una configuración manual no documentada, el capítulo aún no está completo.

## Trazabilidad de la auditoría original

- **Maven/Gradle:** los temas 1 y 2 comparan ambos modelos y dejan Gradle como única fuente productiva.
- **Testing:** los temas 4 y 5 separan pruebas unitarias, dobles e integración real.
- **Logging:** el tema 6 implementa SLF4J, Logback, MDC y salida estructurada sin datos sensibles.
