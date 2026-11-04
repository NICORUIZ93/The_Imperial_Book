# Módulo 8: Build tools — Maven y Gradle


## Aprende construyendo

### Tema 1: pom.xml vs build.gradle.kts

**¿Por qué es importante?** el build describe cómo cualquier persona del equipo compila el mismo programa y obtiene sus dependencias.

#### Subtema 1.1: Compila una clase con Maven · 10 min

**1. Contexto**

Un proyecto necesita reproducir su compilación en tu portátil y en CI.

**2. Hazlo tú**

Crea `pom.xml` con `groupId` `academia`, `artifactId` `rutas`, versión `1.0` y `maven.compiler.release` `25`. Crea `src/main/java/Saludo.java` con `public class Saludo { public static void main(String[] args) { System.out.println("Ruta lista"); } }`. Ejecuta `mvn package` y `java -cp target/classes Saludo`.

**Resultado esperado:** Maven compila y aparece `Ruta lista`.

**Fallo deliberado:** cambia el release a un JDK no instalado. **Diagnóstico:** Maven no encuentra ese compilador; compara `mvn --version` con el JDK activo.

**3. Entiende**

`pom.xml` declara coordenadas, dependencias, plugins y opciones del proyecto en XML.

**4. Cierra**

Conserva `pom.xml` y la salida de Maven.

#### Subtema 1.2: Declara el mismo proyecto con Gradle · 10 min

**1. Contexto**

El equipo compara una segunda herramienta de build para el mismo código Java.

**2. Hazlo tú**

En una carpeta nueva crea `settings.gradle.kts` con `rootProject.name = "rutas"` y `build.gradle.kts` con `plugins { application }`, `java { toolchain { languageVersion.set(JavaLanguageVersion.of(25)) } }`, `application { mainClass.set("Saludo") }`. Copia `src/main/java/Saludo.java`. Ejecuta `gradle wrapper` y `./gradlew run`.

**Resultado esperado:** sale `Ruta lista`; el wrapper fija la versión de Gradle usada por el proyecto.

**Fallo deliberado:** cambia `mainClass` por `SaludoInexistente`. **Diagnóstico:** Gradle puede compilar la fuente, pero no puede iniciar una clase principal que no existe.

**3. Entiende**

Gradle usa Kotlin DSL; el wrapper permite que CI y el equipo usen la misma versión de Gradle.

**4. Cierra**

Compara las instrucciones Maven y Gradle necesarias para compilar y arrancar.

#### Subtema 1.3: Fija una dependencia directa · 10 min

**1. Contexto**

La aplicación necesita Jackson para convertir un objeto de entrega a JSON.

**2. Hazlo tú**

En `pom.xml` declara Jackson Databind `2.22.4`; en el build Gradle declara `implementation("com.fasterxml.jackson.core:jackson-databind:2.22.4")`. Crea `src/main/java/Entrega.java` que importe `ObjectMapper` y serialice `Map.of("guia", "RT-1")`. Corre `mvn package` y `./gradlew build` en sus carpetas correspondientes.

**Resultado esperado:** ambos builds resuelven la misma versión y compilan el import de Jackson.

**Fallo deliberado:** usa `99.99.99`. **Diagnóstico:** el repositorio no ofrece esa versión; restaura una versión publicada.

**3. Entiende**

Una dependencia directa debe tener versión controlada. Las transitivas que trae esa librería se muestran con `mvn dependency:tree` o `./gradlew dependencies`.

**4. Cierra**

Guarda el árbol de dependencias de una herramienta. Fuentes: [guía Maven](https://maven.apache.org/guides/) y [manual Gradle](https://docs.gradle.org/current/userguide/).

### Tema 2: Ciclo de vida de build y scopes

**¿Por qué es importante?** una dependencia de prueba no debe filtrarse al artefacto de producción.

#### Subtema 2.1: Sigue las fases de Maven · 10 min

**1. Contexto**

Quieres saber qué ejecuta Maven cuando empaqueta una aplicación.

**2. Hazlo tú**

Usa `src/main/java/Saludo.java` del Tema 1. Ejecuta `mvn clean compile test package` y después lista el resultado con `jar tf target/rutas-1.0.jar`.

**Resultado esperado:** aparece el `.class` dentro del JAR; Maven ejecuta cada fase anterior al llegar a `package`.

**Fallo deliberado:** borra el archivo de origen antes de compilar. **Diagnóstico:** el build falla en compilación antes de empaquetar; revisa la primera fase fallida.

**3. Entiende**

`clean`, `compile`, `test` y `package` son fases del ciclo Maven; `package` ejecuta las anteriores del mismo ciclo.

**4. Cierra**

Guarda el listado del JAR y el primer error deliberado.

#### Subtema 2.2: Mantén JUnit en test scope · 10 min

**1. Contexto**

JUnit solo se necesita para ejecutar pruebas, no para correr el programa.

**2. Hazlo tú**

Añade JUnit Jupiter a `pom.xml` con `<scope>test</scope>`, crea `src/test/java/SaludoTest.java` con un test pequeño y ejecuta `mvn test` y `mvn package`.

**Resultado esperado:** JUnit corre durante las pruebas, mientras `Saludo` funciona con `java -cp target/classes Saludo`.

**Fallo deliberado:** elimina `<scope>test</scope>` y prueba a empaquetar. **Diagnóstico:** la dependencia pasa al classpath de producción; devuelve el scope `test`.

**3. Entiende**

El scope indica cuándo una dependencia está disponible. El JAR Maven normal no empaqueta por sí solo todas sus dependencias; verifica el tipo de artefacto antes de sacar conclusiones sobre su contenido.

**4. Cierra**

Guarda el `pom.xml` final y la salida de `mvn test`.

#### Subtema 2.3: Inspecciona scopes en Gradle · 10 min

**1. Contexto**

La misma regla se debe expresar en el build Gradle.

**2. Hazlo tú**

En `build.gradle.kts` agrega JUnit a `testImplementation`, activa `useJUnitPlatform()` para `tasks.test` y coloca una prueba en `src/test/java/SaludoTest.java`. Ejecuta `./gradlew test` y `./gradlew dependencies --configuration runtimeClasspath`.

**Resultado esperado:** JUnit está en `testRuntimeClasspath`, no en `runtimeClasspath`.

**Fallo deliberado:** declara JUnit con `implementation`. **Diagnóstico:** aparece en runtime; usa `testImplementation` para dependencia exclusiva de pruebas.

**3. Entiende**

`testImplementation` restringe la librería de prueba a las configuraciones del test.

**4. Cierra**

Anota una diferencia entre `implementation` y `testImplementation`.

**Compara classpaths:** `mvn package` ejecuta fases previas y genera artefacto; scope `test` solo participa en pruebas. En Gradle, `testImplementation` expresa una intención parecida y `runtimeClasspath` muestra lo disponible al ejecutar. No supongas que un JAR normal incluye todas sus dependencias: revisa cómo se empaqueta y qué comando lo inicia. Así evitas filtrar JUnit a producción o desplegar sin una librería necesaria. Fuentes: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html y https://docs.gradle.org/current/userguide/declaring_configurations.html.

### Tema 3: Proyectos multi-módulo

**¿Por qué es importante?** separar contratos y aplicación ayuda a detectar dependencias circulares antes de crecer el producto.

#### Subtema 3.1: Separa modelo y aplicación con Maven · 10 min

**1. Contexto**

La aplicación y los tipos de dominio cambian a ritmos distintos, pero comparten el mismo contrato.

**2. Hazlo tú**

Crea un `pom.xml` padre con packaging `pom` y módulos `modelo` y `app`. Crea `modelo/pom.xml` con artefacto `modelo`, `modelo/src/main/java/Guia.java`, y `app/pom.xml` que dependa de `academia:modelo:1.0`. Crea `app/src/main/java/Main.java` que use `Guia`. Ejecuta `mvn -q -pl app -am package` desde la raíz.

**Resultado esperado:** Maven compila primero `modelo` y luego `app`.

**Fallo deliberado:** elimina la dependencia `modelo` del POM de `app`. **Diagnóstico:** el tipo no está disponible en el classpath de ese módulo.

**3. Entiende**

El POM padre ordena módulos; la dependencia entre módulos declara el flujo del build.

**4. Cierra**

Dibuja con flechas qué módulo necesita a cuál.

#### Subtema 3.2: Encuentra y rompe un ciclo · 10 min

**1. Contexto**

Si el modelo depende de la aplicación y la aplicación del modelo, el build no puede ordenar una compilación limpia.

**2. Hazlo tú**

En `app/src/main/java/Main.java` y el ejemplo `modelo`/`app`, añade una dependencia inversa solo para observar el ciclo y ejecuta `mvn validate`. Luego quítala. Busca las dependencias declaradas con `mvn dependency:tree`.

**Resultado esperado:** el ciclo es visible y se elimina al dejar el contrato en `modelo`.

**Fallo deliberado:** resuelve la dependencia inversa copiando clases entre módulos. **Diagnóstico:** duplicar contratos crea divergencia; mueve el contrato compartido a un módulo que no dependa de ambos lados.

**3. Entiende**

Un grafo de dependencias dirigido debe tener un orden de construcción; los ciclos borran ese orden.

**4. Cierra**

Guarda el árbol antes y después de eliminar el ciclo.

#### Subtema 3.3: Construye solo lo que necesita cambio · 10 min

**1. Contexto**

En CI un cambio pequeño de `app` no debería obligar a reconstruir a mano cada componente sin relación.

**2. Hazlo tú**

Modifica `app/src/main/java/Main.java`, ejecuta `mvn -pl app -am test` y observa qué módulos se construyen. Ejecuta `mvn -pl app test` para comparar si `modelo` ya está instalado en el repositorio local.

**Resultado esperado:** `-am` incluye los módulos requeridos por `app` en el reactor actual.

**Fallo deliberado:** omite `-am` cuando la dependencia local no está instalada. **Diagnóstico:** Maven no puede resolver el módulo hermano; incluye sus dependencias en el reactor.

**3. Entiende**

Los filtros de módulos aceleran tareas, pero el entorno debe contener o construir todas las dependencias necesarias.

**4. Cierra**

Registra el comando que usarías en CI para validar la app y sus dependencias.

**Crea módulos por frontera:** separa `modelo` y `app` si la aplicación consume el modelo, no solo porque haya carpetas distintas. Revisa dependencias con `mvn dependency:tree` o `./gradlew :app:dependencies`; el módulo compartido no debe depender de la aplicación. El orden del build sale de esas relaciones declaradas, no de ejecutar comandos en un orden memorizado. Fuentes: https://maven.apache.org/guides/mini/guide-multiple-modules.html y https://docs.gradle.org/current/userguide/multi_project_builds.html.

### Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas

**¿Por qué es importante?** elegir build requiere comparar resultados y mantenimiento, no solo la longitud de la configuración.

#### Subtema 4.1: Ejecuta el mismo test en ambas herramientas · 10 min

**1. Contexto**

El equipo debe saber si el proyecto entrega el mismo resultado tras migrar de build.

**2. Hazlo tú**

Usa la clase `src/main/java/Saludo.java` y el test `src/test/java/SaludoTest.java` en una carpeta Maven y otra Gradle. Corre `mvn clean test` y `./gradlew clean test`.

**Resultado esperado:** las dos herramientas reportan la misma prueba aprobada.

**Fallo deliberado:** cambia el texto esperado solo en uno de los proyectos. **Diagnóstico:** la diferencia es del código o expectativa, no del build; sincroniza la prueba.

**3. Entiende**

Mismos fuentes y pruebas permiten que la comparación mida la herramienta, no dos aplicaciones distintas.

**4. Cierra**

Guarda ambas salidas de test.

#### Subtema 4.2: Compara dependencias resueltas · 10 min

**1. Contexto**

Una migración puede cambiar una dependencia transitiva aunque el código fuente siga igual.

**2. Hazlo tú**

Declara la misma versión de Jackson en `pom.xml`, `build.gradle.kts` y el consumidor `src/main/java/Entrega.java`. Ejecuta `mvn dependency:tree` y `./gradlew dependencies --configuration runtimeClasspath`.

**Resultado esperado:** la dependencia directa aparece en ambos reportes con la versión declarada.

**Fallo deliberado:** fija Jackson en una versión diferente en Gradle. **Diagnóstico:** compara coordenadas y versión directa antes de atribuir diferencias a transitivas.

**3. Entiende**

El árbol completo incluye dependencias que llegan a través de otras librerías; mantener la misma directa no garantiza idéntico grafo total.

**4. Cierra**

Anota una diferencia encontrada en los árboles.

#### Subtema 4.3: Decide con evidencia del equipo · 10 min

**1. Contexto**

El equipo mantiene un servicio durante años; la elección de build afecta a todo cambio futuro.

**2. Hazlo tú**

En `src/main/java/Saludo.java` verifica que la fuente es igual en ambos proyectos; en `docs/build-comparison.md` registra los comandos de test, duración observada localmente, dificultad de añadir una dependencia y versión fijada del wrapper. Ejecuta `mvn test` y `./gradlew test` antes de cerrar la nota.

**Resultado esperado:** la recomendación incluye evidencia reproducible, no solo “XML vs Kotlin”.

**Fallo deliberado:** recomienda una herramienta según una sola medición. **Diagnóstico:** repite la comparación en CI y cuenta la experiencia del equipo.

**3. Entiende**

Maven ofrece convenciones estrictas; Gradle da un DSL programable y wrapper. Ninguno es automáticamente más rápido para todo proyecto.

**4. Cierra**

Entrega la nota y la razón de la elección. Fuentes: [Maven](https://maven.apache.org/guides/) y [Gradle](https://docs.gradle.org/current/userguide/).

En esa nota registra versión del JDK, versión de ambos wrappers, comando exacto y salida del test. Si el resultado difiere, compara primero las dependencias resueltas y los argumentos de ejecución. No elijas por una sola medición de duración: repite los builds limpios y considera qué formato entiende y puede mantener el equipo. Revisa también cómo cada herramienta incorpora pruebas y dependencias al artefacto final.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir un proyecto multi-módulo con Gradle (o Maven) con dependencias bien acotadas.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto con Maven y otro con Gradle | `mvn archetype:generate` / `gradle init` | Compara la estructura generada |
| 2 | Agregar una dependencia externa en ambos | Ver Tema 1 | Ejecuta el build en ambos casos |
| 3 | Ejecutar el ciclo de vida completo de Maven | `mvn clean compile test package` | Verifica el orden de las fases |
| 4 | Configurar un scope test-only | Ver Tema 2 | Verifica que no va al artefacto final |
| 5 | Estructurar un proyecto multi-módulo | Ver Tema 3 | `core` + `api` dependiente de `core` |

**Verificación:** el laboratorio se considera exitoso si el artefacto final de producción no incluye dependencias declaradas con scope de test, y si el módulo `api` compila correctamente su dependencia explícita hacia `core`.

**Errores comunes y soluciones**

- **Declarar una dependencia de testing sin el scope apropiado.** Usa `testImplementation`/`<scope>test</scope>` para que no se incluya en el artefacto final.
- **Permitir que un módulo `core` dependa de un módulo `api`.** Verifica que la dirección de dependencia refleje la arquitectura por capas deseada.
- **Confundir la sintaxis entre `pom.xml` y `build.gradle.kts`.** Practica ambos formatos hasta sentirte cómodo con sus diferencias sintácticas.

---
