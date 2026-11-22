# Módulo 15: Build, testing y observabilidad

Un proyecto profesional no se define solo por compilar: debe construirse de forma reproducible, probarse en varios niveles y dejar evidencia observable cuando falla. Este módulo cubre Maven/Gradle avanzado, estructura multi-módulo, tests con JUnit/Mockito, integración reproducible y logging estructurado.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Configurar Maven con ciclo de vida, scopes y perfiles |
| 2 | Usar Gradle con tareas, configuraciones y reproducibilidad |
| 3 | Diseñar multi-módulo sin ciclos y con límites claros |
| 4 | Escribir tests unitarios expresivos con JUnit/Mockito |
| 5 | Diseñar pruebas de integración reproducibles |
| 6 | Implementar logging estructurado con SLF4J/Logback/MDC |

## Aprende construyendo

### Tema 1: Maven avanzado · Intermedio · 40 min

**Caso guía**: CI falla por plugin sin versión, scope mal puesto o perfil oculto.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Maven/POM | Modelo declarativo de build (coordenadas, deps, plugins). | Build reproducible | Fijar versiones/plugins | Versiones flotantes |
| Ciclo de vida | Fases `validate..deploy` donde se atan goals. | Flujo estándar | `mvn clean verify` en CI | Confundir fase y goal |
| Scopes | `compile/provided/runtime/test` controlan classpath. | Separar dependencias | JUnit en `test` | Todo en compile |
| Perfiles | Variantes activables por condición. | Diferencias controladas de build | Documentar y evitar magia | Perfil oculto cambia output |

**Implementación desde cero** (`mkdir -p ~/academia-java/modulo-15-maven/src/main/java && cd ...`): usa POM con `maven.compiler.release`, JUnit `test`, `maven-surefire-plugin` versionado. **Ejecución**: `mvn -q clean verify` → `BUILD SUCCESS`. **Verificación**: `mvn help:effective-pom`.

### Tema 2: Gradle y builds reproducibles · Avanzado · 45 min

**Caso guía**: tarea Gradle cachea mal por no declarar inputs/outputs.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Gradle DAG de tareas | Tareas con dependencias forman grafo. | Declarar dependencias entre tareas | Side effects ocultos |
| Inputs/outputs | Metadata para up-to-date/cache. | Declarar entradas/salidas | Cache incorrecto |
| Reproducibilidad | Wrapper, toolchain, versiones fijadas. | `gradlew` commiteado | Depender de Gradle local |
| Configuraciones | `implementation`, `testImplementation`. | Mapear scopes correctamente | Dependencia en config equivocada |

**Implementación desde cero**: `build.gradle.kts` con `java`, toolchain 21, `mavenCentral`, JUnit, `useJUnitPlatform()`. **Ejecución**: `gradle -q test` o `./gradlew build`. **Verificación**: `./gradlew --version`.

### Tema 3: Proyectos multi-módulo sin ciclos · Avanzado · 40 min

**Caso guía**: `domain` termina dependiendo de `infrastructure`.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Multi-módulo | Varios módulos con límites/build coordinado. | Un comando en raíz | Módulos sin frontera real |
| Sin ciclos | Grafo de dependencias acíclico. | Depender hacia abstracciones | Ciclo domain↔infra |
| Límites/puertos | Interfaces en dominio, impl en infra. | DIP | SQL en dominio |
| Agregador | Root POM/settings incluye módulos. | `-am/-pl` o includes | Olvidar módulo en root |

**Implementación desde cero**: `GuiaRepository` en domain, impl en infra, service en app. **Ejecución**: compilar con `javac -d out $(find src -name "*.java") && java -cp out com.academia.app.Main` → `[G-1]`. **Verificación**: sustituir repo sin tocar service.

### Tema 4: JUnit 6, Mockito y assertions expresivas · Avanzado · 35 min

**Caso guía**: bug de negocio detectable con test unitario aislado.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| JUnit Jupiter | Framework de tests/anotaciones/assertions. | Tests deterministas/aislados | Estado compartido |
| Mockito | Dobles para dependencias. | Mockear externos, no SUT | Sobre-mockear |
| Assertions expresivas | Verifican comportamiento observable. | Mensaje/comportamiento claro | Aserción débil |
| Arrange-Act-Assert | Estructura legible de test. | Un comportamiento por test | Tests gigantes |

**Implementación desde cero** (proyecto Maven M9 setup): `Notifier` + `EmailClient` mock, `verify`, `assertThrows`. **Ejecución**: `mvn -q -Dtest=NotifierTest test` → `Tests run: 2, Failures: 0`. **Verificación**: rompe validación y confirma rojo.

### Tema 5: Pruebas de integración reproducibles · Avanzado · 45 min

**Caso guía**: unit pasa, integración con DB real falla.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Prueba de integración | Verifica interacción con componentes reales. | Foco en contratos críticos | Reemplazar todo unit por integración |
| Reproducibilidad | Entorno controlado (contenedores/fixtures). | Efímero, repetible en CI | Depender de DB local compartida |
| Testcontainers | Contenedores efímeros para tests. | Docker activo, cleanup automático | Olvidar prerrequisitos |
| Aislamiento de datos | Sin estado compartido entre tests. | Transacciones/DB efímera | Tests dependientes |

**Implementación desde cero**: test con `PostgreSQLContainer` try-with-resources. **Ejecución**: `mvn -q -Dtest=RepoIntegracionTest test` (requiere Docker). **Verificación**: ejecutar dos veces con mismo resultado.

### Tema 6: SLF4J, Logback, MDC y logging estructurado · Avanzado · 40 min

**Caso guía**: logs sin requestId no permiten rastrear incidente.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| SLF4J | Fachada de logging. | Código contra API | Acoplar a implementación |
| Logback | Implementación/config de logging. | Patrón/appenders/niveles claros | Config por defecto en prod |
| MDC | Contexto por hilo para logs. | `put/remove` en finally | Fuga en thread pool |
| Logging estructurado | Campos consistentes consultables. | requestId, nivel, evento, error | Loggear secretos o texto ambiguo |

**Implementación desde cero**: `DemoLog` con `MDC.put/remove`, `log.error(...,e)`, `logback.xml` con `%X{requestId}`. **Ejecución**: `mvn -q compile exec:java -Dexec.mainClass=DemoLog`. **Salida real**: líneas con `[req-1]` y `[req-2]`. **Verificación**: cambia nivel root y observa verbosidad.


## Cierre del módulo

Build, tests y observabilidad son el sistema inmunológico del proyecto: detectan regresiones, garantizan reproducibilidad y dejan evidencia diagnóstica. En el siguiente módulo pasarás a Spring Boot para construir servicios web sobre estas bases.
tas bases.
