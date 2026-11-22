# Módulo 5 · Introducción a microservicios y DDD

**Fase 1 · Spring Boot de cero a experto** (semanas 7 y 8 de 12). **Duración:** 13 h (6 temas de 1,5–3 h).
**Dificultad:** 3 de 5 (4 de 5 en DDD y Strangler Fig). **Dependencias:** Módulos 1 a 4 (Java moderno, Spring IoC,
perfiles, Spring MVC, JDBC/JPA, PostgreSQL, testing con JUnit y MockMvc). **Herramientas:** **JDK 25 LTS (25.0.5)**,
**Spring Boot 4.1.3** (Spring Framework 7.0.11, JUnit Jupiter 6.0.3), **Spring Modulith 2.1.3**, PostgreSQL 18.7 en
Docker Compose y Gradle 9.9.2 mediante el wrapper `./gradlew`..

Hasta aquí construiste **una** aplicación Spring Boot. Este módulo responde la pregunta que viene después: ¿cuándo
conviene partirla en varios servicios, por dónde se corta y cómo se migra sin apagar el negocio? Vas a aprender a
decir «todavía no» con argumentos (monolito modular, Spring Modulith), a encontrar las fronteras correctas (DDD), a
preparar cada servicio para la nube (12-Factor), a migrar poco a poco (Strangler Fig) y a darle a cada servicio sus
propios datos (Database-per-service).

```mermaid
flowchart LR
    subgraph DECIDIR["¿Partir o no partir?"]
      T1["1 · Monolito vs<br/>Microservicios vs SOA"]
    end
    subgraph CORTAR["¿Por dónde cortar?"]
      T2["2 · DDD: Bounded Contexts,<br/>Agregados, Eventos"] --> T3["3 · Spring Modulith<br/>(monolito modular)"]
    end
    subgraph OPERAR["¿Cómo se construye cada pieza?"]
      T4["4 · 12-Factor App"]
    end
    subgraph MIGRAR["¿Cómo se migra?"]
      T5["5 · Strangler Fig"] --> T6["6 · Database-per-service"]
    end
    T1 --> T2
    T3 --> T5
    T4 --> T5
```

**Texto alternativo:** mapa del módulo en cuatro bloques. «¿Partir o no partir?» contiene el tema 1 (Monolito vs
Microservicios vs SOA), que lleva al bloque «¿Por dónde cortar?»: tema 2 (DDD) y tema 3 (Spring Modulith). El tema 3 y
el tema 4 (12-Factor App, bloque «¿Cómo se construye cada pieza?») llevan al bloque «¿Cómo se migra?»: tema 5 (Strangler
Fig), que lleva al tema 6 (Database-per-service).

---


### Monolito vs Microservicios vs SOA

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Comparar monolito (modular), microservicios y SOA con seis criterios (equipos, dominio, escalado, despliegue, integración y plataforma) y justificar por escrito cuál conviene en un caso concreto; lo compruebas cuando EvaluadorDeArquitecturaTest pasa 5 de 5, incluido el ejercicio…

#### ► LA IDEA EN UNA FRASE
**Comparar monolito (modular), microservicios y SOA con seis criterios (equipos, dominio, escalado, despliegue, integración y plataforma) y justificar por escrito cuál conviene en un caso concreto; lo compruebas cuando EvaluadorDeArquitecturaTest pasa 5 de 5, incluido el ejercicio cuya respuesta es no usar microservicios.**

#### ► POR QUÉ EXISTE ESTO
Cuando un programa crece, hay que decidir cómo se reparte:

#### ► LA ANALOGÍA
Piensa en monolito vs microservicios vs soa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    subgraph M["Monolito modular"]
      direction LR
      UI1["API"] --> MP["módulo pedidos"]
      UI1 --> MI["módulo inventario"]
      MP --> BD1[("1 base de datos")]
      MI --> BD1
    end
    subgraph MS["Microservicios"]
      direction LR
      GW["gateway"] --> SP["servicio pedidos"] --> BDP[("BD pedidos")]
      GW --> SI["servicio inventario"] --> BDI[("BD inventario")]
      SP -. "eventos" .-> SI
    end
    subgraph SOA["SOA"]
      direction LR
      APPS["ERP · CRM · portal"] --> ESB{{"ESB: enruta,<br/>transforma, orquesta"}}
      ESB --> SC["servicio Clientes<br/>(empresa)"]
      ESB --> SF["servicio Facturación<br/>(empresa)"]
      SC --> BDC[("BD corporativa")]
      SF --> BDC
    end
```

1. **Monolito:** todo el sistema es **un solo programa** que se instala de una vez. No es malo: es lo más simple de
2. **Microservicios:** el sistema se divide en **varios programas pequeños** que se instalan por separado, cada uno con
3. **SOA (arquitectura orientada a servicios):** la idea de los años 2000 para **conectar las aplicaciones de toda una

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Monolito vs Microservicios vs SOA se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Monolito vs Microservicios vs SOA | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Microservicios por moda (*résumé-driven architecture*):

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: monolito vs microservicios vs soa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Monolito:** todo el sistema es **un solo programa** que se instala de una vez. No es malo: es lo más simple de
- **Microservicios:** el sistema se divide en **varios programas pequeños** que se instalan por separado, cada uno con
- **SOA (arquitectura orientada a servicios):** la idea de los años 2000 para **conectar las aplicaciones de toda una

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve monolito vs microservicios vs soa en tu contexto?
2. ¿Cómo sabrías que monolito vs microservicios vs soa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar monolito vs microservicios vs soa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
**Comparar** monolito (modular), microservicios y SOA con seis criterios (equipos, dominio, escalado, despliegue,
integración y plataforma) y **justificar** por escrito cuál conviene en un caso concreto; lo compruebas cuando
`EvaluadorDeArquitecturaTest` pasa 5 de 5, incluido el ejercicio cuya respuesta es no usar microservicios.

#### Construcción guiada
1. Compila y ejecuta el comparador solo con el JDK:
   ```bash
   javac -d /tmp/f041 src/main/java/academia/estilos/*.java
   java -cp /tmp/f041 academia.estilos.CompararEstilos
   ```
2. **Ejercicio de decisión (Respuesta correcta: no usar microservicios).** «Agenda Salud» es una startup de citas
   médicas: 6 desarrolladores en 1 equipo, unas 300 citas al día, el modelo de negocio cambia cada mes y no hay
   guardias 24/7. El CTO quiere microservicios «para escalar». Escribe en una hoja tu decisión con tres razones y
   después compárala con el test `ejercicioAgendaSaludRespuestaCorrectaNoUsarMicroservicios`.
3. Cambia el caso «Billetera digital» en `CompararEstilos` a `plataformaOperativa = false`, vuelve a compilar y
   ejecutar: observa que la recomendación pasa a `MONOLITO_MODULAR` y que la razón que aparece es la plataforma.

**Output esperado** (paso 1, salida real con JDK 25.0.5):

```text
Tienda de café en línea -> MONOLITO_MODULAR
   · solo 1 equipo(s): la coordinación cabe en una reunión
   · las fronteras del dominio aún no están claras: cortarías por el lugar equivocado
   · no hay plataforma operativa (CI/CD, contenedores, monitoreo, guardias)
   · ninguna parte necesita escalar ni desplegarse por separado
Billetera digital -> MICROSERVICIOS
   · 9 equipos necesitan desplegar sin esperarse
   · el dominio tiene fronteras conocidas y hay plataforma para operar muchos servicios
Aseguradora con ERP, CRM y cotizador -> SOA
   · el reto es integrar aplicaciones existentes de varias áreas
   · un contrato de servicio compartido (bus o API corporativa) evita integraciones punto a punto
```

**Captura comentada:** cada caso imprime el estilo y, debajo, sus razones. En la tienda de café aparecen **cuatro**
carencias: el evaluador no solo dice «no», dice **qué tendría que cambiar** para reconsiderarlo. En el paso 3 la
billetera muestra una sola línea: `· no hay plataforma operativa (CI/CD, contenedores, monitoreo, guardias)`.

#### Código de referencia / ejecutable
Versiones: **JDK 25 LTS (25.0.5)**, Spring Boot 4.1.3 como *parent* (solo para heredar versiones de plugins y de JUnit
Jupiter 6.0.3). El evaluador es Java puro y corre tal cual con `javac` y `java`. `f041-estilos/build.gradle.kts`:

```kotlin
// F041 · Monolito vs Microservicios vs SOA
plugins {
    java
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // BOM de Spring Boot como plataforma de Gradle: fija las versiones sin aplicar el plugin de Boot
    testImplementation(platform(libs.spring.boot.dependencies))
    // Solo JUnit Jupiter 6.0.3 (gestionado por Spring Boot 4.1.3): el evaluador es Java puro.
    testImplementation(libs.junit.jupiter)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

> **Build con Gradle (y su equivalencia en Maven).** Este laboratorio se construye con **Gradle 9.9.2** y Kotlin DSL
> mediante el wrapper `./gradlew` (no instalas Gradle). `settings.gradle.kts` lista los subproyectos (en Maven,
> `<modules>` del POM agregador), cada carpeta tiene su `build.gradle.kts` (su `pom.xml`) y
> `gradle/libs.versions.toml` es el **catálogo de versiones** (las `<properties>` y el `dependencyManagement`): por eso
> las dependencias se escriben `libs.…`. Equivalencias: `./mvnw test` → `./gradlew test` ·
> `./mvnw package -DskipTests` → `./gradlew bootJar` · `./mvnw spring-boot:run` → `./gradlew bootRun` ·
> `-Dtest=Clase` → `--tests Clase` · `target/` → `build/` (el jar queda en `build/libs/`). Gradle escribe una línea
> `PASSED` por test y termina con `BUILD SUCCESSFUL` (Maven: `Tests run: N` y `BUILD SUCCESS`).

`modulo-9/settings.gradle.kts`:

```kotlin
// Módulo 5 (modulo-9) · Build multi-proyecto: "./gradlew test" ejecuta los tests de todos los subproyectos.
// Cada carpeta tiene su propio build.gradle.kts; las versiones viven en gradle/libs.versions.toml
// (catálogo "libs"). Equivale al POM agregador con <modules> de Maven.
pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}
// Sin esto, un alumno sin JDK 25 instalado ve el build morir en la configuración, antes de cualquier test.
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}


dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
}

rootProject.name = "modulo-9-laboratorios"

include(
    "f041-estilos",
    "f042-ddd",
    "f043-modulith",
    "f044-doce-factores",
    "f045-strangler-fig",
    "f046-bd-por-servicio",
)
```

`modulo-9/gradle/libs.versions.toml`:

```toml
# Módulo 5 (modulo-9)
# Catálogo de versiones del laboratorio: una sola fuente para plugins y librerías.
# Las librerías SIN versión las fija el BOM de Spring Boot (spring-boot-dependencies) o el BOM que importe el proyecto.

[versions]
spring-boot = "4.1.3"
# Spring Modulith 2.1.3 se construye sobre Spring Boot 4.1.3 (no lo gestiona el BOM de Boot)
spring-modulith = "2.1.3"

[libraries]
junit-jupiter = { module = "org.junit.jupiter:junit-jupiter" }
spring-boot-dependencies = { module = "org.springframework.boot:spring-boot-dependencies", version.ref = "spring-boot" }
junit-platform-launcher = { module = "org.junit.platform:junit-platform-launcher" }
spring-boot-starter = { module = "org.springframework.boot:spring-boot-starter" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test" }
spring-modulith-starter-core = { module = "org.springframework.modulith:spring-modulith-starter-core" }
spring-modulith-events-api = { module = "org.springframework.modulith:spring-modulith-events-api" }
spring-boot-starter-jdbc = { module = "org.springframework.boot:spring-boot-starter-jdbc" }
h2 = { module = "com.h2database:h2" }
spring-modulith-starter-test = { module = "org.springframework.modulith:spring-modulith-starter-test" }
spring-boot-starter-webmvc = { module = "org.springframework.boot:spring-boot-starter-webmvc" }
spring-boot-starter-validation = { module = "org.springframework.boot:spring-boot-starter-validation" }
spring-boot-starter-actuator = { module = "org.springframework.boot:spring-boot-starter-actuator" }
spring-boot-starter-webmvc-test = { module = "org.springframework.boot:spring-boot-starter-webmvc-test" }
spring-boot-starter-restclient = { module = "org.springframework.boot:spring-boot-starter-restclient" }
postgresql = { module = "org.postgresql:postgresql" }

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
spring-dependency-management = { id = "io.spring.dependency-management", version = "1.1.7" }
```

`src/main/java/academia/estilos/Contexto.java`, `Estilo.java` y `Recomendacion.java`:

```java
package academia.estilos;

/**
 * Lo que sabes de tu organización y de tu producto antes de elegir un estilo de arquitectura.
 *
 * @param nombre                        nombre del caso
 * @param desarrolladores               personas que escriben código en el producto
 * @param equipos                       equipos que necesitan avanzar sin coordinarse cada día
 * @param partesEscalanDistinto         ¿una parte recibe 10 veces más carga que el resto?
 * @param despliegueIndependiente       ¿cada equipo necesita desplegar sin esperar a los demás?
 * @param dominioEntendido              ¿ya sabes dónde están las fronteras del negocio?
 * @param integraAplicacionesDeVariasAreas ¿el reto es conectar aplicaciones existentes (ERP, CRM...)?
 * @param plataformaOperativa           ¿hay CI/CD, contenedores, monitoreo y guardias 24/7?
 */
public record Contexto(String nombre, int desarrolladores, int equipos, boolean partesEscalanDistinto,
        boolean despliegueIndependiente, boolean dominioEntendido,
        boolean integraAplicacionesDeVariasAreas, boolean plataformaOperativa) {
}
```

```java
package academia.estilos;

/** Los tres estilos que compara la ficha F041. */
public enum Estilo {
    /** Un solo desplegable, dividido por dentro en módulos con fronteras claras. */
    MONOLITO_MODULAR,
    /** Servicios pequeños, cada uno con sus datos y su despliegue independiente. */
    MICROSERVICIOS,
    /** Servicios de negocio grandes, reutilizados por toda la empresa a través de un bus (ESB). */
    SOA
}
```

```java
package academia.estilos;

import java.util.List;

/** Estilo elegido y las razones que lo justifican (o lo que falta para otro estilo). */
public record Recomendacion(Estilo estilo, List<String> razones) {
}
```

`src/main/java/academia/estilos/EvaluadorDeArquitectura.java`:

```java
package academia.estilos;

import java.util.ArrayList;
import java.util.List;

/**
 * Regla de decisión de F041. No es una ley universal: resume los criterios de la ficha para que puedas
 * discutirlos con un test en la mano. Empieza siempre por el monolito modular y exige evidencia para salir de él.
 */
public final class EvaluadorDeArquitectura {

    /** Por debajo de 3 equipos, la coordinación cabe en una reunión: separar despliegues no compensa. */
    static final int EQUIPOS_MINIMOS = 3;

    private EvaluadorDeArquitectura() {
    }

    public static Recomendacion evaluar(Contexto c) {
        // SOA: el problema es integrar aplicaciones existentes de varias áreas, no dividir un producto propio.
        if (c.integraAplicacionesDeVariasAreas() && !c.despliegueIndependiente()) {
            return new Recomendacion(Estilo.SOA, List.of(
                    "el reto es integrar aplicaciones existentes de varias áreas",
                    "un contrato de servicio compartido (bus o API corporativa) evita integraciones punto a punto"));
        }
        List<String> faltan = new ArrayList<>();
        if (c.equipos() < EQUIPOS_MINIMOS) {
            faltan.add("solo " + c.equipos() + " equipo(s): la coordinación cabe en una reunión");
        }
        if (!c.dominioEntendido()) {
            faltan.add("las fronteras del dominio aún no están claras: cortarías por el lugar equivocado");
        }
        if (!c.plataformaOperativa()) {
            faltan.add("no hay plataforma operativa (CI/CD, contenedores, monitoreo, guardias)");
        }
        if (!c.partesEscalanDistinto() && !c.despliegueIndependiente()) {
            faltan.add("ninguna parte necesita escalar ni desplegarse por separado");
        }
        if (faltan.isEmpty()) {
            return new Recomendacion(Estilo.MICROSERVICIOS, List.of(
                    c.equipos() + " equipos necesitan desplegar sin esperarse",
                    "el dominio tiene fronteras conocidas y hay plataforma para operar muchos servicios"));
        }
        return new Recomendacion(Estilo.MONOLITO_MODULAR, List.copyOf(faltan));
    }
}
```

`src/main/java/academia/estilos/CompararEstilos.java`:

```java
package academia.estilos;

import java.util.List;

/** Ejecuta el evaluador sobre tres organizaciones de ejemplo e imprime la recomendación de cada una. */
public final class CompararEstilos {

    public static void main(String[] args) {
        List<Contexto> casos = List.of(
                new Contexto("Tienda de café en línea", 4, 1, false, false, false, false, false),
                new Contexto("Billetera digital", 70, 9, true, true, true, false, true),
                new Contexto("Aseguradora con ERP, CRM y cotizador", 30, 5, false, false, true, true, true));
        for (Contexto caso : casos) {
            Recomendacion r = EvaluadorDeArquitectura.evaluar(caso);
            System.out.println(caso.nombre() + " -> " + r.estilo());
            r.razones().forEach(razon -> System.out.println("   · " + razon));
        }
    }
}
```

#### Verificación
```bash
../gradlew test
```

`src/test/java/academia/estilos/EvaluadorDeArquitecturaTest.java`:

```java
package academia.estilos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class EvaluadorDeArquitecturaTest {

    @Test
    void unEquipoPequenoSinPlataformaSeQuedaEnMonolitoModular() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Tienda", 4, 1, false, false, false, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
        assertEquals(4, r.razones().size(), "debe explicar las cuatro carencias");
    }

    @Test
    void variosEquiposConDominioClaroYPlataformaVanAMicroservicios() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Billetera", 70, 9, true, true, true, false, true));
        assertEquals(Estilo.MICROSERVICIOS, r.estilo());
    }

    @Test
    void integrarAplicacionesDeVariasAreasEsTerrenoDeSoa() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Aseguradora", 30, 5, false, false, true, true, true));
        assertEquals(Estilo.SOA, r.estilo());
    }

    @Test
    void sinPlataformaOperativaNoHayMicroserviciosAunqueHayaMuchosEquipos() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Banco sin DevOps", 120, 12, true, true, true, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
        assertTrue(r.razones().getFirst().contains("plataforma operativa"));
    }

    /**
     * Ejercicio de decisión (Módulo 5): «Agenda Salud», 6 desarrolladores en 1 equipo, 300 citas al día,
     * dominio aún cambiante, sin guardias 24/7. El CTO quiere microservicios «para escalar».
     * Respuesta correcta: no usar microservicios.
     */
    @Test
    void ejercicioAgendaSaludRespuestaCorrectaNoUsarMicroservicios() {
        var r = EvaluadorDeArquitectura.evaluar(
                new Contexto("Agenda Salud", 6, 1, false, false, false, false, false));
        assertEquals(Estilo.MONOLITO_MODULAR, r.estilo());
    }
}
```

**Output esperado:** 5 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*. **Pregunta de
comprobación:** una empresa de 120 desarrolladores en 12 equipos no tiene CI/CD ni monitoreo. ¿Qué recomienda el
evaluador y por qué? *(Monolito modular: sin plataforma operativa, cada servicio nuevo multiplica los incidentes; lo
primero es construir la plataforma.)*

</details>

### DDD: Bounded Contexts, Agregados, Eventos de Dominio

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Modelar un agregado que protege sus invariantes, emitir un evento de dominio al cambiar de estado y traducirlo al modelo de otro contexto delimitado; lo compruebas cuando los 6 tests de dominio (PedidoTest, PlanificadorDeEnviosTest) y el test de integración FlujoEntreContextosTes…

#### ► LA IDEA EN UNA FRASE
**Modelar un agregado que protege sus invariantes, emitir un evento de dominio al cambiar de estado y traducirlo al modelo de otro contexto delimitado; lo compruebas cuando los 6 tests de dominio (PedidoTest, PlanificadorDeEnviosTest) y el test de integración FlujoEntreContextosTest pasan.**

#### ► POR QUÉ EXISTE ESTO
DDD (*Domain-Driven Design*, diseño guiado por el dominio) es una forma de escribir software empezando por entender el negocio y sus palabras. Tres ideas bastan para empezar:

#### ► LA ANALOGÍA
Piensa en ddd: bounded contexts, agregados, eventos de dominio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph VENTAS["Contexto Ventas"]
      direction TB
      P["Pedido<br/>(raíz del agregado)"] --> L1["LineaDePedido"]
      P --> L2["LineaDePedido"]
      L1 --> D["Dinero<br/>(objeto de valor)"]
      P -- "confirmar()" --> E[["PedidoConfirmado<br/>(evento de dominio)"]]
    end
    subgraph ENVIOS["Contexto Envíos"]
      direction TB
      PL["PlanificadorDeEnvios"] --> EN["Envio<br/>guía · destino · bultos"]
    end
    E -- "lenguaje publicado" --> PL
```

1. **Contexto delimitado (*Bounded Context*):** una zona del negocio donde cada palabra significa una sola cosa. «Pedido»
2. **Agregado:** un grupo de objetos que cambian juntos y que tiene **una raíz** que hace cumplir las reglas. Nadie
3. **Evento de dominio:** un registro de **algo que ya pasó** y que le importa a alguien más: «PedidoConfirmado». Se

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| DDD: Bounded Contexts, Agregados, Eventos de Dominio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar DDD: Bounded Contexts, Agregados, Eventos de Dominio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Modelo canónico compartido (un solo Cliente para toda la empresa):

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ddd: bounded contexts, agregados, eventos de dominio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **Contexto delimitado (*Bounded Context*):** una zona del negocio donde cada palabra significa una sola cosa. «Pedido»
- **Agregado:** un grupo de objetos que cambian juntos y que tiene **una raíz** que hace cumplir las reglas. Nadie
- **Evento de dominio:** un registro de **algo que ya pasó** y que le importa a alguien más: «PedidoConfirmado». Se

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ddd: bounded contexts, agregados, eventos de dominio en tu contexto?
2. ¿Cómo sabrías que ddd: bounded contexts, agregados, eventos de dominio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ddd: bounded contexts, agregados, eventos de dominio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
**Modelar** un agregado que protege sus invariantes, **emitir** un evento de dominio al cambiar de estado y
**traducirlo** al modelo de otro contexto delimitado; lo compruebas cuando los 6 tests de dominio (`PedidoTest`,
`PlanificadorDeEnviosTest`) y el test de integración `FlujoEntreContextosTest` pasan.

#### Construcción guiada
1. Ejecuta el recorrido del dominio solo con el JDK (los paquetes `ventas` y `envios` no necesitan Spring):
   ```bash
   javac -d /tmp/f042 src/main/java/academia/ddd/ventas/*.java src/main/java/academia/ddd/envios/*.java \
         src/main/java/academia/ddd/app/DemoDdd.java
   java -cp /tmp/f042 academia.ddd.app.DemoDdd
   ```
2. **Rómpelo a propósito:** en `Pedido.lineas()` cambia `return List.copyOf(lineas);` por `return lineas;` y ejecuta
   los tests (`../gradlew test --tests PedidoTest`). El test `lasLineasNoSePuedenModificarDesdeFuera` falla: cualquiera
   podría agregar 100 unidades gratis saltándose la regla de las 20 unidades. Deshaz el cambio.
3. Ejecuta el flujo con Spring: `../gradlew test --tests FlujoEntreContextosTest`.

**Output esperado** (paso 1, salida real con JDK 25.0.5):

```text
Total: 170000 COP en 7 unidades
Eventos: [PedidoConfirmado[pedidoId=P-100, clienteId=CL-7, direccion=Cra 7 # 40-62, Bogotá, totalPesos=170000, unidades=7]]
Envíos creó: Envio[guia=GUIA-1, referenciaVenta=P-100, destino=Cra 7 # 40-62, Bogotá, bultos=2, estado=POR_DESPACHAR]
Rechazado: el pedido P-100 ya está CONFIRMADO
```

**Captura comentada:** la segunda línea es el evento: un registro en pasado con los datos que Envíos necesita
(dirección, unidades), no el agregado completo. La tercera es el modelo de **otro** contexto: Envíos habla de guía y
bultos. La última muestra la invariante en acción: un pedido confirmado ya no acepta líneas.

#### Código de referencia / ejecutable
Versiones: **JDK 25 LTS (25.0.5)**, **Spring Boot 4.1.3** (`spring-boot-starter` para el contenedor y los eventos;
JUnit Jupiter 6.0.3 y AssertJ 3.27.7 en los tests). Los paquetes `ventas` y `envios` son Java puro; solo `app` usa
Spring. `f042-ddd/build.gradle.kts`:

```kotlin
// F042 · DDD: Bounded Contexts, Agregados, Eventos de Dominio
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Contenedor de Spring y ApplicationEventPublisher. El dominio (ventas, envios) NO depende de Spring.
    implementation(libs.spring.boot.starter)
    // JUnit Jupiter 6.0.3, AssertJ 3.27.7 y Spring Test
    testImplementation(libs.spring.boot.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

Contexto Ventas · `src/main/java/academia/ddd/ventas/Dinero.java`, `LineaDePedido.java`, `PedidoConfirmado.java`,
`ReglaDeNegocioViolada.java` y `Pedido.java`:

```java
package academia.ddd.ventas;

/** Objeto de valor: se compara por su valor, es inmutable y se valida al nacer. Pesos colombianos sin decimales. */
public record Dinero(long pesos) {

    public Dinero {
        if (pesos < 0) {
            throw new IllegalArgumentException("el dinero no puede ser negativo: " + pesos);
        }
    }

    public static final Dinero CERO = new Dinero(0);

    public Dinero mas(Dinero otro) {
        return new Dinero(Math.addExact(pesos, otro.pesos));
    }

    public Dinero por(int cantidad) {
        return new Dinero(Math.multiplyExact(pesos, cantidad));
    }
}
```

```java
package academia.ddd.ventas;

/** Entidad interna del agregado: solo se crea y se modifica a través de Pedido. */
public record LineaDePedido(String sku, int cantidad, Dinero precioUnitario) {

    Dinero subtotal() {
        return precioUnitario.por(cantidad);
    }
}
```

```java
package academia.ddd.ventas;

/**
 * Evento de dominio: algo que YA pasó en Ventas, en pasado y con los datos que otros contextos necesitan.
 * Es el «lenguaje publicado» de Ventas: los demás contextos dependen de este registro, no de Pedido.
 */
public record PedidoConfirmado(String pedidoId, String clienteId, String direccion, long totalPesos, int unidades) {
}
```

```java
package academia.ddd.ventas;

/** El agregado rechaza un cambio que rompería una de sus invariantes. */
public class ReglaDeNegocioViolada extends RuntimeException {

    public ReglaDeNegocioViolada(String mensaje) {
        super(mensaje);
    }
}
```

```java
package academia.ddd.ventas;

import java.util.ArrayList;
import java.util.List;

/**
 * Raíz del agregado Pedido (contexto Ventas). Todas las reglas del pedido viven aquí:
 *  1. Solo se agregan líneas mientras el pedido está en BORRADOR.
 *  2. Un pedido no puede superar 20 unidades en total (regla del negocio de ejemplo).
 *  3. Un pedido vacío no se puede confirmar.
 * Al confirmarse, registra el evento PedidoConfirmado; quien guarda el agregado lo publica.
 */
public final class Pedido {

    public enum Estado { BORRADOR, CONFIRMADO }

    static final int MAXIMO_UNIDADES = 20;

    private final String id;
    private final String clienteId;
    private final List<LineaDePedido> lineas = new ArrayList<>();
    private final List<Object> eventos = new ArrayList<>();
    private Estado estado = Estado.BORRADOR;

    public Pedido(String id, String clienteId) {
        this.id = id;
        this.clienteId = clienteId;
    }

    public void agregar(String sku, int cantidad, Dinero precioUnitario) {
        exigirBorrador();
        if (cantidad <= 0) {
            throw new ReglaDeNegocioViolada("la cantidad debe ser mayor que 0");
        }
        if (unidades() + cantidad > MAXIMO_UNIDADES) {
            throw new ReglaDeNegocioViolada("un pedido no puede superar " + MAXIMO_UNIDADES + " unidades");
        }
        lineas.add(new LineaDePedido(sku, cantidad, precioUnitario));
    }

    public void confirmar(String direccion) {
        exigirBorrador();
        if (lineas.isEmpty()) {
            throw new ReglaDeNegocioViolada("un pedido vacío no se puede confirmar");
        }
        estado = Estado.CONFIRMADO;
        eventos.add(new PedidoConfirmado(id, clienteId, direccion, total().pesos(), unidades()));
    }

    /** Entrega los eventos pendientes y los borra: cada evento se publica una sola vez. */
    public List<Object> extraerEventos() {
        List<Object> pendientes = List.copyOf(eventos);
        eventos.clear();
        return pendientes;
    }

    public Dinero total() {
        return lineas.stream().map(LineaDePedido::subtotal).reduce(Dinero.CERO, Dinero::mas);
    }

    public int unidades() {
        return lineas.stream().mapToInt(LineaDePedido::cantidad).sum();
    }

    /** Copia inmutable: desde fuera nadie puede saltarse las reglas agregando líneas a la lista. */
    public List<LineaDePedido> lineas() {
        return List.copyOf(lineas);
    }

    public String id() {
        return id;
    }

    public Estado estado() {
        return estado;
    }

    private void exigirBorrador() {
        if (estado != Estado.BORRADOR) {
            throw new ReglaDeNegocioViolada("el pedido " + id + " ya está " + estado);
        }
    }
}
```

Contexto Envíos · `src/main/java/academia/ddd/envios/Envio.java` y `PlanificadorDeEnvios.java`:

```java
package academia.ddd.envios;

/**
 * Modelo de Envíos. Aquí «pedido» no existe: Envíos habla de paquetes, destinos y bultos.
 * La misma realidad (lo que compró el cliente) tiene otro modelo en otro contexto delimitado.
 */
public record Envio(String guia, String referenciaVenta, String destino, int bultos, Estado estado) {

    public enum Estado { POR_DESPACHAR, EN_RUTA, ENTREGADO }
}
```

```java
package academia.ddd.envios;

import academia.ddd.ventas.PedidoConfirmado;
import java.util.ArrayList;
import java.util.List;

/**
 * Política de Envíos: «cuando Ventas confirma un pedido, planifica un envío».
 * Traduce el evento de Ventas al modelo propio (capa de traducción mínima): 1 bulto por cada 5 unidades.
 */
public final class PlanificadorDeEnvios {

    private final List<Envio> envios = new ArrayList<>();

    public Envio alConfirmarsePedido(PedidoConfirmado evento) {
        int bultos = (evento.unidades() + 4) / 5;
        Envio envio = new Envio("GUIA-" + (envios.size() + 1), evento.pedidoId(), evento.direccion(), bultos,
                Envio.Estado.POR_DESPACHAR);
        envios.add(envio);
        return envio;
    }

    public List<Envio> envios() {
        return List.copyOf(envios);
    }
}
```

Recorrido sin Spring · `src/main/java/academia/ddd/app/DemoDdd.java`:

```java
package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import academia.ddd.ventas.Dinero;
import academia.ddd.ventas.Pedido;
import academia.ddd.ventas.PedidoConfirmado;
import academia.ddd.ventas.ReglaDeNegocioViolada;

/** Recorrido sin Spring: el dominio funciona solo. Ejecuta: java -cp build/classes/java/main academia.ddd.app.DemoDdd */
public final class DemoDdd {

    public static void main(String[] args) {
        Pedido pedido = new Pedido("P-100", "CL-7");
        pedido.agregar("CAFE-HUILA-500G", 3, new Dinero(32_000));
        pedido.agregar("TAZA-BARRO", 4, new Dinero(18_500));
        System.out.println("Total: " + pedido.total().pesos() + " COP en " + pedido.unidades() + " unidades");

        pedido.confirmar("Cra 7 # 40-62, Bogotá");
        var eventos = pedido.extraerEventos();
        System.out.println("Eventos: " + eventos);

        var envios = new PlanificadorDeEnvios();
        for (Object evento : eventos) {
            if (evento instanceof PedidoConfirmado confirmado) {
                System.out.println("Envíos creó: " + envios.alConfirmarsePedido(confirmado));
            }
        }
        try {
            pedido.agregar("FILTRO", 1, new Dinero(9_000));
        } catch (ReglaDeNegocioViolada e) {
            System.out.println("Rechazado: " + e.getMessage());
        }
    }
}
```

Capa de aplicación con Spring · `DddApp.java`, `ServicioDeVentas.java` y `OyenteDeEnvios.java`:

```java
package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/** Capa de aplicación con Spring: conecta los dos contextos sin que el dominio conozca a Spring. */
@SpringBootApplication
public class DddApp {

    @Bean
    PlanificadorDeEnvios planificadorDeEnvios() {
        return new PlanificadorDeEnvios();
    }

    public static void main(String[] args) {
        SpringApplication.run(DddApp.class, args);
    }
}
```

```java
package academia.ddd.app;

import academia.ddd.ventas.Dinero;
import academia.ddd.ventas.Pedido;
import java.util.HashMap;
import java.util.Map;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Servicio de aplicación: carga el agregado, le pide el cambio, lo guarda y publica sus eventos.
 * El repositorio es un mapa en memoria para que el foco esté en el modelo (persistencia: Módulo 2).
 */
@Service
public class ServicioDeVentas {

    private final Map<String, Pedido> repositorio = new HashMap<>();
    private final ApplicationEventPublisher publicador;

    public ServicioDeVentas(ApplicationEventPublisher publicador) {
        this.publicador = publicador;
    }

    public Pedido crear(String id, String clienteId) {
        Pedido pedido = new Pedido(id, clienteId);
        repositorio.put(id, pedido);
        return pedido;
    }

    public void agregar(String pedidoId, String sku, int cantidad, long precioPesos) {
        repositorio.get(pedidoId).agregar(sku, cantidad, new Dinero(precioPesos));
    }

    public void confirmar(String pedidoId, String direccion) {
        Pedido pedido = repositorio.get(pedidoId);
        pedido.confirmar(direccion);
        repositorio.put(pedidoId, pedido);                          // «guardar» el agregado completo
        pedido.extraerEventos().forEach(publicador::publishEvent);  // y después publicar lo que pasó
    }
}
```

```java
package academia.ddd.app;

import academia.ddd.envios.PlanificadorDeEnvios;
import academia.ddd.ventas.PedidoConfirmado;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Adaptador: escucha el evento de Ventas y se lo entrega a la política de Envíos. */
@Component
class OyenteDeEnvios {

    private final PlanificadorDeEnvios planificador;

    OyenteDeEnvios(PlanificadorDeEnvios planificador) {
        this.planificador = planificador;
    }

    @EventListener
    void on(PedidoConfirmado evento) {
        planificador.alConfirmarsePedido(evento);
    }
}
```

#### Verificación
```bash
../gradlew test
```

`src/test/java/academia/ddd/ventas/PedidoTest.java`:

```java
package academia.ddd.ventas;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import org.junit.jupiter.api.Test;

class PedidoTest {

    private Pedido pedidoConDosLineas() {
        Pedido p = new Pedido("P-1", "CL-1");
        p.agregar("CAFE", 3, new Dinero(32_000));
        p.agregar("TAZA", 4, new Dinero(18_500));
        return p;
    }

    @Test
    void calculaElTotalDesdeSusLineas() {
        assertEquals(new Dinero(170_000), pedidoConDosLineas().total());
    }

    @Test
    void confirmarRegistraUnSoloEventoConLosDatosQueOtrosNecesitan() {
        Pedido p = pedidoConDosLineas();
        p.confirmar("Calle 1");
        assertEquals(List.of(new PedidoConfirmado("P-1", "CL-1", "Calle 1", 170_000, 7)), p.extraerEventos());
        assertTrue(p.extraerEventos().isEmpty(), "los eventos se entregan una sola vez");
    }

    @Test
    void noSePuedeModificarUnPedidoConfirmado() {
        Pedido p = pedidoConDosLineas();
        p.confirmar("Calle 1");
        var e = assertThrows(ReglaDeNegocioViolada.class, () -> p.agregar("FILTRO", 1, new Dinero(9_000)));
        assertEquals("el pedido P-1 ya está CONFIRMADO", e.getMessage());
    }

    @Test
    void noSuperaVeinteUnidadesNiSeConfirmaVacio() {
        Pedido p = new Pedido("P-2", "CL-1");
        assertThrows(ReglaDeNegocioViolada.class, () -> p.confirmar("Calle 1"));
        p.agregar("CAFE", 20, new Dinero(1_000));
        assertThrows(ReglaDeNegocioViolada.class, () -> p.agregar("CAFE", 1, new Dinero(1_000)));
    }

    @Test
    void lasLineasNoSePuedenModificarDesdeFuera() {
        Pedido p = pedidoConDosLineas();
        assertThrows(UnsupportedOperationException.class,
                () -> p.lineas().add(new LineaDePedido("GRATIS", 100, Dinero.CERO)));
    }
}
```

`src/test/java/academia/ddd/envios/PlanificadorDeEnviosTest.java` y
`src/test/java/academia/ddd/app/FlujoEntreContextosTest.java`:

```java
package academia.ddd.envios;

import static org.junit.jupiter.api.Assertions.assertEquals;

import academia.ddd.ventas.PedidoConfirmado;
import org.junit.jupiter.api.Test;

class PlanificadorDeEnviosTest {

    @Test
    void traduceElEventoDeVentasASuPropioModelo() {
        var planificador = new PlanificadorDeEnvios();
        Envio envio = planificador.alConfirmarsePedido(new PedidoConfirmado("P-9", "CL-1", "Calle 9", 50_000, 7));
        assertEquals(new Envio("GUIA-1", "P-9", "Calle 9", 2, Envio.Estado.POR_DESPACHAR), envio);
    }
}
```

```java
package academia.ddd.app;

import static org.assertj.core.api.Assertions.assertThat;

import academia.ddd.envios.PlanificadorDeEnvios;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** Con Spring: confirmar en Ventas produce un envío en Envíos sin que Ventas conozca a Envíos. */
@SpringBootTest
class FlujoEntreContextosTest {

    @Autowired
    ServicioDeVentas ventas;

    @Autowired
    PlanificadorDeEnvios envios;

    @Test
    void confirmarUnPedidoPlanificaSuEnvio() {
        ventas.crear("P-7", "CL-3");
        ventas.agregar("P-7", "CAFE", 6, 32_000);
        ventas.confirmar("P-7", "Av. 68 # 10-20");
        assertThat(envios.envios()).singleElement()
                .satisfies(e -> assertThat(e.referenciaVenta()).isEqualTo("P-7"))
                .satisfies(e -> assertThat(e.bultos()).isEqualTo(2));
    }
}
```

**Output esperado:** 7 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)* (5 de `PedidoTest`, 1 de
`PlanificadorDeEnviosTest` y 1 de `FlujoEntreContextosTest`). **Pregunta de comprobación:** ¿por qué `Envio` no tiene
un campo de tipo `Pedido`? *(Porque pertenece a otro contexto: depende solo del evento publicado; si tuviera `Pedido`,
cualquier cambio interno de Ventas rompería Envíos.)*

</details>

### Spring Modulith

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Organizar una aplicación Spring Boot en módulos de aplicación, verificar automáticamente que ningún módulo usa las clases internas de otro y comunicar módulos con eventos; lo compruebas cuando ModularidadTest e InventarioTest pasan y cuando provocas (y lees) una violación de Appl…

#### ► LA IDEA EN UNA FRASE
**Organizar una aplicación Spring Boot en módulos de aplicación, verificar automáticamente que ningún módulo usa las clases internas de otro y comunicar módulos con eventos; lo compruebas cuando ModularidadTest e InventarioTest pasan y cuando provocas (y lees) una violación de ApplicationModules.verify().**

#### ► POR QUÉ EXISTE ESTO
Un monolito modular es un solo programa dividido por dentro en módulos con fronteras claras, como si cada uno fuera un pequeño servicio pero sin la red de por medio. El problema es que Java deja que cualquier clase pública use cualquier otra, así que las fronteras se rompen sin que nadie lo note.

#### ► LA ANALOGÍA
Piensa en spring modulith como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph APP["ModulithApp (1 despliegue)"]
      subgraph PED["módulo pedidos"]
        PA["Pedidos<br/>(API pública)"]
        PE["PedidoCompletado<br/>(API pública)"]
        subgraph INT["pedidos.interno (privado)"]
          CD["CalculadoraDeDescuentos"]
        end
        PA --> CD
      end
      subgraph INV["módulo inventario"]
        IV["Inventario<br/>@ApplicationModuleListener"]
      end
      PA -- "publishEvent (al confirmar la transacción)" --> IV
      IV -. "✘ prohibido: verify() falla" .-> CD
    end
```

1. Un monolito modular es un solo programa dividido por dentro en módulos con fronteras claras, como si cada uno fuera un pequeño servicio pero sin la red de por medio.
2. El problema es que Java deja que cualquier clase pública use cualquier otra, así que las fronteras se rompen sin que nadie lo note.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Spring Modulith se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Spring Modulith | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El paquete util o common que todos usan:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: spring modulith funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un monolito modular es un solo programa dividido por dentro en módulos con fronteras claras, como si cada uno fuera un pequeño servicio pero sin la red de por medio.
- El problema es que Java deja que cualquier clase pública use cualquier otra, así que las fronteras se rompen sin que nadie lo note.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve spring modulith en tu contexto?
2. ¿Cómo sabrías que spring modulith no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar spring modulith?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
1. Ejecuta la verificación de la estructura e inspecciona lo que Spring Modulith detectó:
   ```bash
   ../gradlew test --tests ModularidadTest
   ```
2. **Rómpelo a propósito:** en `Inventario.java` agrega el import
   `import academia.modulith.pedidos.interno.CalculadoraDeDescuentos;`, un campo
   `private final CalculadoraDeDescuentos descuentos;` y un constructor que lo reciba. Vuelve a ejecutar el paso 1.
3. Deshaz el cambio y ejecuta el test del módulo inventario aislado:
   ```bash
   ../gradlew test --tests InventarioTest
   ```

**Output esperado:**

- Paso 1: dos bloques que empiezan por `# ` con el nombre del módulo, cada uno con `> Logical name: pedidos` (o
  `inventario`), `> Base package: academia.modulith.pedidos` (o `...inventario`), `> Excluded packages: none`,
  `> Direct module dependencies:` (inventario muestra a pedidos; pedidos, `none`) y `> Spring beans:` con sus beans.
  Termina con 1 línea `PASSED` y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*.
- Paso 3: en el log, `Reservadas 3 unidades de CAFE-500G para P-1`, y 1 línea `PASSED`.

Paso 2: el test falla con `org.springframework.modulith.core.Violations` y un mensaje que empieza por

```text
- Module 'inventario' depends on non-exposed type academia.modulith.pedidos.interno.CalculadoraDeDescuentos within module 'pedidos'!
```

seguido de una línea que describe la dependencia encontrada (el campo o el constructor de `Inventario`).

**Captura comentada:** el texto de la violación es la plantilla `Module '%s' depends on non-exposed type %s within
module '%s'!` de Spring Modulith 2.1.3 (clase `ApplicationModule`): primero el módulo que viola la regla, luego la
clase interna y al final el módulo dueño. En el paso 3 no aparece ningún bean de `pedidos`: el test arrancó solo el
módulo inventario.

#### Código de referencia / ejecutable
Versiones: **JDK 25 LTS**, **Spring Boot 4.1.3**, **Spring Modulith 2.1.3** (su propio BOM; esta versión está
construida sobre Spring Boot 4.1.3), H2 2.4.240 (gestionado por Boot). `f043-modulith/build.gradle.kts`:

```kotlin
// F043 · Spring Modulith
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencyManagement {
    imports {
        mavenBom("org.springframework.modulith:spring-modulith-bom:${libs.versions.spring.modulith.get()}")
    }
}

dependencies {
    // API de módulos (ApplicationModules) y verificación de la estructura
    implementation(libs.spring.modulith.starter.core)
    // @ApplicationModuleListener vive en spring-modulith-events-api: el starter core NO lo incluye
    implementation(libs.spring.modulith.events.api)
    // @ApplicationModuleListener es un listener transaccional: necesita un gestor de transacciones
    implementation(libs.spring.boot.starter.jdbc)
    runtimeOnly(libs.h2)
    // @ApplicationModuleTest, Scenario y spring-boot-starter-test
    testImplementation(libs.spring.modulith.starter.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`src/main/java/academia/modulith/ModulithApp.java`:

```java
package academia.modulith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Cada paquete hijo directo (pedidos, inventario) es un MÓDULO de aplicación.
 * Lo que está en el paquete raíz del módulo es su API; los subpaquetes (pedidos.interno) son privados.
 * @EnableAsync: @ApplicationModuleListener es @Async, así el inventario no frena al que confirma el pedido.
 */
@EnableAsync
@SpringBootApplication
public class ModulithApp {

    public static void main(String[] args) {
        SpringApplication.run(ModulithApp.class, args);
    }
}
```

Módulo `pedidos` · `PedidoCompletado.java`, `Pedidos.java` e `interno/CalculadoraDeDescuentos.java`:

```java
package academia.modulith.pedidos;

/** Evento publicado por el módulo pedidos. Está en el paquete raíz: es parte de su API. */
public record PedidoCompletado(String pedidoId, String sku, int cantidad) {
}
```

```java
package academia.modulith.pedidos;

import academia.modulith.pedidos.interno.CalculadoraDeDescuentos;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** API pública del módulo pedidos. */
@Service
public class Pedidos {

    private final ApplicationEventPublisher eventos;
    private final CalculadoraDeDescuentos descuentos;

    public Pedidos(ApplicationEventPublisher eventos, CalculadoraDeDescuentos descuentos) {
        this.eventos = eventos;
        this.descuentos = descuentos;
    }

    /** El evento sale al confirmar la transacción: si la transacción falla, inventario nunca se entera. */
    @Transactional
    public int completar(String pedidoId, String sku, int cantidad) {
        eventos.publishEvent(new PedidoCompletado(pedidoId, sku, cantidad));
        return descuentos.porcentajePara(cantidad);
    }
}
```

```java
package academia.modulith.pedidos.interno;

import org.springframework.stereotype.Component;

/** Detalle interno de pedidos: ningún otro módulo debe usarlo (Spring Modulith lo comprueba). */
@Component
public class CalculadoraDeDescuentos {

    public int porcentajePara(int cantidad) {
        return cantidad >= 10 ? 5 : 0;
    }
}
```

Módulo `inventario` · `Inventario.java`:

```java
package academia.modulith.inventario;

import academia.modulith.pedidos.PedidoCompletado;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;

/**
 * Módulo inventario: reacciona al evento de pedidos sin llamarlo ni conocer sus clases internas.
 * Depende solo del tipo PedidoCompletado (API publicada de pedidos).
 */
@Service
public class Inventario {

    private static final Logger log = LoggerFactory.getLogger(Inventario.class);
    private final Map<String, Integer> reservado = new ConcurrentHashMap<>();

    @ApplicationModuleListener
    void on(PedidoCompletado evento) {
        reservado.merge(evento.sku(), evento.cantidad(), Integer::sum);
        log.info("Reservadas {} unidades de {} para {}", evento.cantidad(), evento.sku(), evento.pedidoId());
    }

    public int reservadoDe(String sku) {
        return reservado.getOrDefault(sku, 0);
    }
}
```

`src/main/resources/application.properties`: `spring.application.name=f043-modulith` (H2 se configura solo).

#### Verificación
```bash
../gradlew test
```

`src/test/java/academia/modulith/ModularidadTest.java` y
`src/test/java/academia/modulith/inventario/InventarioTest.java`:

```java
package academia.modulith;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/** Falla si un módulo usa clases internas de otro o si hay ciclos entre módulos. */
class ModularidadTest {

    ApplicationModules modulos = ApplicationModules.of(ModulithApp.class);

    @Test
    void laEstructuraModularEsValida() {
        modulos.forEach(m -> System.out.println(m.toString(modulos)));   // cada módulo, sus beans y dependencias
        modulos.verify();
    }
}
```

```java
package academia.modulith.inventario;

import static org.assertj.core.api.Assertions.assertThat;

import academia.modulith.pedidos.PedidoCompletado;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;

/** Arranca SOLO el módulo inventario (modo STANDALONE) y le publica el evento de pedidos. */
@ApplicationModuleTest
class InventarioTest {

    @Autowired
    Inventario inventario;

    @Test
    void reservaStockCuandoSeCompletaUnPedido(Scenario escenario) {
        escenario.publish(new PedidoCompletado("P-1", "CAFE-500G", 3))
                .andWaitForStateChange(() -> inventario.reservadoDe("CAFE-500G"), reservado -> reservado > 0)
                .andVerify(reservado -> assertThat(reservado).isEqualTo(3));
    }
}
```

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*. **Pregunta de
comprobación:** si `Pedidos.completar` lanza una excepción después de `publishEvent`, ¿inventario reserva stock? *(No:
`@ApplicationModuleListener` es transaccional y solo recibe el evento si la transacción se confirma.)*

</details>

### 12-Factor App

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Aplicar los doce factores a un servicio Spring Boot (configuración por entorno validada al arrancar, puerto asignado por la plataforma, logs a la salida estándar, procesos sin estado y apagado ordenado) y detectar violaciones del factor III en un archivo de propiedades; lo compru…

#### ► LA IDEA EN UNA FRASE
**Aplicar los doce factores a un servicio Spring Boot (configuración por entorno validada al arrancar, puerto asignado por la plataforma, logs a la salida estándar, procesos sin estado y apagado ordenado) y detectar violaciones del factor III en un archivo de propiedades; lo compruebas cuando DoceFactoresTest y RevisorDeConfiguracionTest pasan 5 de 5.**

#### ► POR QUÉ EXISTE ESTO
La aplicación de doce factores (*The Twelve-Factor App*, publicada por ingenieros de Heroku en 2011) es una lista de 12 buenas costumbres para que un programa se pueda desplegar en la nube muchas veces, en muchos entornos, sin cambiar su código. Las más importantes para empezar:

#### ► LA ANALOGÍA
Piensa en 12-factor app como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    COD["Código<br/>(1 repo, factor I)"] --> BUILD["build: ./gradlew build<br/>JAR inmutable (V)"]
    BUILD --> REL1["release DEV =<br/>JAR + variables DEV"]
    BUILD --> REL2["release PROD =<br/>JAR + variables PROD (III)"]
    REL2 --> RUN1["proceso 1<br/>PORT=8080 (VII)"]
    REL2 --> RUN2["proceso 2<br/>PORT=8080 (VIII)"]
    RUN1 -- "stdout (XI)" --> LOGS[("plataforma de logs")]
    RUN2 -- "stdout (XI)" --> LOGS
    RUN1 -- "BD_URL (IV)" --> BD[("servicio de respaldo:<br/>PostgreSQL")]
    RUN2 -- "BD_URL (IV)" --> BD
    ORQ["orquestador"] -- "SIGTERM (IX) /<br/>GET /actuator/health" --> RUN1
```

1. **III · Configuración:** lo que cambia entre entornos (direcciones, contraseñas) **no se escribe en el código**: llega
2. **VI · Procesos sin estado:** el programa no guarda nada importante en su memoria entre peticiones; si se reinicia,
3. **VII · Asignación de puertos:** el programa trae su propio servidor web y escucha en el puerto que le digan.
4. **IX · Desechabilidad:** arranca rápido y se apaga ordenadamente cuando se lo piden.
5. **XI · Logs:** escribe lo que pasa en la pantalla (salida estándar); otro sistema se encarga de guardarlo.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| 12-Factor App se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar 12-Factor App | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Un artefacto distinto por entorno:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: 12-factor app funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- **III · Configuración:** lo que cambia entre entornos (direcciones, contraseñas) **no se escribe en el código**: llega
- **VI · Procesos sin estado:** el programa no guarda nada importante en su memoria entre peticiones; si se reinicia,
- **VII · Asignación de puertos:** el programa trae su propio servidor web y escucha en el puerto que le digan.
- **IX · Desechabilidad:** arranca rápido y se apaga ordenadamente cuando se lo piden.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve 12-factor app en tu contexto?
2. ¿Cómo sabrías que 12-factor app no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar 12-factor app?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
**Aplicar** los doce factores a un servicio Spring Boot (configuración por entorno validada al arrancar, puerto
asignado por la plataforma, logs a la salida estándar, procesos sin estado y apagado ordenado) y **detectar**
violaciones del factor III en un archivo de propiedades; lo compruebas cuando `DoceFactoresTest` y
`RevisorDeConfiguracionTest` pasan 5 de 5.

#### Construcción guiada
1. Revisa dos archivos de configuración con el revisor (solo JDK):
   ```bash
   java src/main/java/academia/factores/RevisorDeConfiguracion.java ejemplos/mal.properties; echo "código: $?"
   java src/main/java/academia/factores/RevisorDeConfiguracion.java src/main/resources/application.properties
   ```
2. Arranca el mismo JAR con dos configuraciones distintas (factores III, V y VII):
   ```bash
   ../gradlew -q bootJar
   PORT=8081 TIENDA_MONEDA=USD TIENDA_DESCUENTO_MAXIMO=25 java -jar build/libs/f044-doce-factores-1.0.0.jar &
   sleep 5 && curl -s localhost:8081/config; echo
   kill %1
   ```
3. **Rómpelo a propósito:** `TIENDA_MONEDA=pesos java -jar build/libs/f044-doce-factores-1.0.0.jar`.

**Output esperado:**

Paso 1 (salida real con JDK 25.0.5):

```text
✘ línea 2: dirección de un entorno concreto (spring.datasource.url)
✘ línea 3: secreto en el archivo (spring.datasource.password)
✘ línea 4: secreto en el archivo (pagos.api-key)
3 violaciones
código: 1
✔ sin violaciones del factor III
```

- Paso 2: `{"moneda":"USD","descuentoMaximo":25}`, y en la consola de la aplicación una línea de log con
  `consulta de configuración moneda=USD descuentoMaximo=25`. Al hacer `kill`, el log muestra que Tomcat inicia el
  apagado ordenado (*graceful shutdown*) antes de terminar.
- Paso 3: la aplicación **no arranca**; el informe de Spring Boot dice `APPLICATION FAILED TO START`, nombra la
  propiedad `tienda.moneda` con el valor `pesos`, el motivo `debe ser un código ISO 4217 de 3 letras` y la acción
  sugerida de corregir la configuración.

**Captura comentada:** el revisor devuelve código 1 cuando encuentra violaciones, así que puedes ponerlo en un
pipeline de CI. En el paso 2 no recompilaste nada: el mismo artefacto cambió de puerto, moneda y descuento solo con
variables de entorno.

#### Código de referencia / ejecutable
Versiones: **JDK 25 LTS**, **Spring Boot 4.1.3** (Spring MVC, Tomcat 11, Hibernate Validator, Actuator). El revisor es
Java puro y se ejecuta con `java Archivo.java`. `f044-doce-factores/build.gradle.kts`:

```kotlin
// F044 · 12-Factor App
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // Factor VII (port binding): Tomcat 11 embebido dentro del JAR
    implementation(libs.spring.boot.starter.webmvc)
    // Factor III: la configuración se valida al arrancar
    implementation(libs.spring.boot.starter.validation)
    // Factor IX: /actuator/health para que el orquestador sepa si el proceso está listo
    implementation(libs.spring.boot.starter.actuator)
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`src/main/resources/application.properties`:

```properties
# F044 · Solo valores por defecto NO secretos. Todo lo que cambia entre entornos llega por variables de entorno.
spring.application.name=f044-doce-factores
# Factor VII: el puerto lo decide la plataforma (PORT); 8080 solo si no hay variable.
server.port=${PORT:8080}
# Factor IX: al recibir SIGTERM termina las peticiones en curso (graceful es el valor por defecto en Boot 4).
spring.lifecycle.timeout-per-shutdown-phase=20s
# Factor III: TIENDA_MONEDA y TIENDA_DESCUENTO_MAXIMO sobrescriben estas claves (enlace relajado).
tienda.moneda=COP
tienda.descuento-maximo=10
management.endpoints.web.exposure.include=health
```

`src/main/java/academia/factores/TiendaProperties.java`, `ConfigController.java` y `DoceFactoresApp.java`:

```java
package academia.factores;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Factor III (Config): la configuración vive en el entorno, tipada y validada al arrancar.
 * Si falta o es inválida, el proceso no arranca (mejor que fallar a las 3 a. m. con el primer cliente).
 */
@Validated
@ConfigurationProperties("tienda")
public record TiendaProperties(
        @NotBlank @Pattern(regexp = "[A-Z]{3}", message = "debe ser un código ISO 4217 de 3 letras") String moneda,
        @Min(0) @Max(50) int descuentoMaximo) {
}
```

```java
package academia.factores;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Factor VI (procesos sin estado): no guarda nada entre peticiones; cualquier réplica responde igual. */
@RestController
class ConfigController {

    private static final Logger log = LoggerFactory.getLogger(ConfigController.class);
    private final TiendaProperties tienda;

    ConfigController(TiendaProperties tienda) {
        this.tienda = tienda;
    }

    /** Un record conserva el orden de los campos en el JSON (un Map.of no lo garantiza). */
    record Config(String moneda, int descuentoMaximo) {
    }

    @GetMapping("/config")
    Config config() {
        // Factor XI (logs): se escribe en la salida estándar; la plataforma recoge y enruta el flujo.
        log.info("consulta de configuración moneda={} descuentoMaximo={}", tienda.moneda(), tienda.descuentoMaximo());
        return new Config(tienda.moneda(), tienda.descuentoMaximo());
    }
}
```

```java
package academia.factores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Factor V (build, release, run): ./gradlew bootJar construye UN jar; el mismo jar corre en todos los entornos. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class DoceFactoresApp {

    public static void main(String[] args) {
        SpringApplication.run(DoceFactoresApp.class, args);
    }
}
```

`src/main/java/academia/factores/RevisorDeConfiguracion.java`:

```java
package academia.factores;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Revisa un application.properties y señala violaciones típicas del factor III:
 * secretos escritos en el archivo y direcciones de un entorno concreto (localhost, IP fijas).
 * Java puro: ejecútalo con  java src/main/java/academia/factores/RevisorDeConfiguracion.java <archivo>
 */
public final class RevisorDeConfiguracion {

    private static final Pattern CLAVE_SECRETA = Pattern.compile("(?i).*(password|secret|token|api-key|apikey).*");
    private static final Pattern DIRECCION_FIJA =
            Pattern.compile("(?i).*(localhost|127\\.0\\.0\\.1|\\b\\d{1,3}(\\.\\d{1,3}){3}\\b).*");

    private RevisorDeConfiguracion() {
    }

    public static List<String> revisar(List<String> lineas) {
        List<String> hallazgos = new ArrayList<>();
        for (int i = 0; i < lineas.size(); i++) {
            String linea = lineas.get(i).strip();
            if (linea.isEmpty() || linea.startsWith("#") || !linea.contains("=")) {
                continue;
            }
            String clave = linea.substring(0, linea.indexOf('=')).strip();
            String valor = linea.substring(linea.indexOf('=') + 1).strip();
            boolean vieneDelEntorno = valor.startsWith("${");
            if (CLAVE_SECRETA.matcher(clave).matches() && !vieneDelEntorno) {
                hallazgos.add("línea " + (i + 1) + ": secreto en el archivo (" + clave + ")");
            } else if (DIRECCION_FIJA.matcher(valor).matches() && !vieneDelEntorno) {
                hallazgos.add("línea " + (i + 1) + ": dirección de un entorno concreto (" + clave + ")");
            }
        }
        return hallazgos;
    }

    public static void main(String[] args) throws IOException {
        List<String> hallazgos = revisar(Files.readAllLines(Path.of(args[0])));
        hallazgos.forEach(h -> System.out.println("✘ " + h));
        System.out.println(hallazgos.isEmpty() ? "✔ sin violaciones del factor III" : hallazgos.size() + " violaciones");
        System.exit(hallazgos.isEmpty() ? 0 : 1);
    }
}
```

`ejemplos/mal.properties` (el revisor debe rechazarlo):

```properties
# Anti-patrón: configuración de UN entorno y secretos dentro del código
spring.datasource.url=jdbc:postgresql://localhost:5432/tienda
spring.datasource.password=Sup3rS3creta
pagos.api-key=sk_live_123
tienda.moneda=COP
```

#### Verificación
```bash
../gradlew test
```

`src/test/java/academia/factores/DoceFactoresTest.java` y `RevisorDeConfiguracionTest.java`:

```java
package academia.factores;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.properties.bind.validation.BindValidationException;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** Las propiedades del test hacen el papel de las variables de entorno de cada despliegue. */
@SpringBootTest(properties = {"tienda.moneda=USD", "tienda.descuento-maximo=25"})
@AutoConfigureMockMvc
class DoceFactoresTest {

    @Autowired
    MockMvc mvc;

    @Test
    void laConfiguracionVieneDelEntornoNoDelCodigo() throws Exception {
        mvc.perform(get("/config"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.moneda").value("USD"))
            .andExpect(jsonPath("$.descuentoMaximo").value(25));
    }

    @Test
    void elHealthEstaDisponibleParaElOrquestador() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void unaConfiguracionInvalidaImpideArrancar() {
        // Argumentos de línea de comandos: tienen MÁS prioridad que application.properties.
        // (Con .properties(...) serían «propiedades por defecto», la fuente de MENOS prioridad:
        //  tienda.moneda=COP del archivo las taparía y la aplicación arrancaría sin error.)
        assertThatThrownBy(() -> new SpringApplicationBuilder(DoceFactoresApp.class)
                .run("--server.port=0", "--tienda.moneda=pesos").close())
            .hasRootCauseInstanceOf(BindValidationException.class);
    }
}
```

```java
package academia.factores;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import org.junit.jupiter.api.Test;

class RevisorDeConfiguracionTest {

    @Test
    void detectaSecretosYDireccionesFijas() {
        var hallazgos = RevisorDeConfiguracion.revisar(List.of(
                "spring.datasource.url=jdbc:postgresql://localhost:5432/tienda",
                "spring.datasource.password=Sup3rS3creta",
                "tienda.moneda=COP"));
        assertEquals(List.of(
                "línea 1: dirección de un entorno concreto (spring.datasource.url)",
                "línea 2: secreto en el archivo (spring.datasource.password)"), hallazgos);
    }

    @Test
    void aceptaValoresQueVienenDelEntorno() {
        assertEquals(List.of(), RevisorDeConfiguracion.revisar(List.of(
                "spring.datasource.url=${BD_URL}", "spring.datasource.password=${BD_PASSWORD}")));
    }
}
```

**Output esperado:** 5 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*. **Pregunta de
comprobación:** ¿qué factor violas si guardas el carrito de compras en un `HashMap` del controlador y tienes dos
réplicas? *(El VI: cada réplica tiene un carrito distinto y un reinicio lo borra; el estado debe ir a un servicio de
respaldo como Redis o la base de datos.)*

</details>

### Strangler Fig Pattern

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir una fachada que enruta cada petición al monolito o al servicio nuevo según una tabla de rutas, migrar una funcionalidad cambiando una sola regla y traducir los datos heredados con una capa anticorrupción; lo compruebas cuando TablaDeRutasTest, CapaAnticorrupcionTest y F…

#### ► LA IDEA EN UNA FRASE
**Construir una fachada que enruta cada petición al monolito o al servicio nuevo según una tabla de rutas, migrar una funcionalidad cambiando una sola regla y traducir los datos heredados con una capa anticorrupción; lo compruebas cuando TablaDeRutasTest, CapaAnticorrupcionTest y FachadaStranglerTest pasan 10 de 10.**

#### ► POR QUÉ EXISTE ESTO
Reescribir un sistema grande desde cero y cambiarlo «de un solo golpe» casi siempre sale mal: tarda años, el negocio no se detiene y el sistema nuevo nunca alcanza al viejo. El patrón Strangler Fig (nombrado por Martin Fowler en 2004) propone otra cosa:

#### ► LA ANALOGÍA
Piensa en strangler fig pattern como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    C["Clientes<br/>(web, app)"] --> F{"Fachada Strangler<br/>tabla de rutas"}
    F -- "/cotizaciones/** → nuevo" --> N["Servicio nuevo<br/>Cotización"]
    F -- "todo lo demás → monolito" --> M["Monolito"]
    N --> ACL["Capa anticorrupción<br/>COD_ZONA=Z03 → METROPOLITANA"]
    ACL -. "lee tarifas heredadas" .-> M
```

1. Reescribir un sistema grande desde cero y cambiarlo «de un solo golpe» casi siempre sale mal: tarda años, el negocio no se detiene y el sistema nuevo nunca alcanza al viejo.
2. El patrón Strangler Fig (nombrado por Martin Fowler en 2004) propone otra cosa:

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Strangler Fig Pattern se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Strangler Fig Pattern | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El higuerón que nunca termina de estrangular («migración eterna»):

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: strangler fig pattern funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Reescribir un sistema grande desde cero y cambiarlo «de un solo golpe» casi siempre sale mal: tarda años, el negocio no se detiene y el sistema nuevo nunca alcanza al viejo.
- El patrón Strangler Fig (nombrado por Martin Fowler en 2004) propone otra cosa:

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve strangler fig pattern en tu contexto?
2. ¿Cómo sabrías que strangler fig pattern no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar strangler fig pattern?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
**Construir** una fachada que enruta cada petición al monolito o al servicio nuevo según una tabla de rutas,
**migrar** una funcionalidad cambiando una sola regla y **traducir** los datos heredados con una capa anticorrupción;
lo compruebas cuando `TablaDeRutasTest`, `CapaAnticorrupcionTest` y `FachadaStranglerTest` pasan 10 de 10.

#### Código de referencia / ejecutable
Versiones: **JDK 25 LTS**, **Spring Boot 4.1.3** (`spring-boot-starter-webmvc` y `spring-boot-starter-restclient`,
Spring Framework 7.0.11). `TablaDeRutas` y `CapaAnticorrupcion` son Java puro. `f045-strangler-fig/build.gradle.kts`:

```kotlin
// F045 · Strangler Fig Pattern: fachada que enruta entre el monolito y el servicio nuevo
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    // La fachada recibe HTTP (Spring MVC) ...
    implementation(libs.spring.boot.starter.webmvc)
    // ... y reenvía con RestClient (Spring Framework 7)
    implementation(libs.spring.boot.starter.restclient)
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`src/main/resources/application.properties`:

```properties
spring.application.name=f045-strangler-fig
server.port=8080
# Dónde vive cada destino (en producción llegan por variables de entorno: factor III).
strangler.destinos.monolito=http://localhost:8081
strangler.destinos.nuevo=http://localhost:8082
# Tabla de enrutamiento: «prefijo->destino». Lo que no coincide va al monolito.
# Migrar una funcionalidad = cambiar UNA línea; revertir = volver a cambiarla.
strangler.rutas=/cotizaciones->nuevo
```

`src/main/java/academia/strangler/TablaDeRutas.java`:

```java
package academia.strangler;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Corazón del Strangler Fig: decide, para cada ruta, si la atiende el monolito o el servicio nuevo.
 * Coincide por SEGMENTOS ("/cotizaciones" atrapa "/cotizaciones/7" pero no "/cotizaciones-pdf")
 * y gana el prefijo más largo. Todo lo que no está en la tabla sigue en el monolito.
 */
public final class TablaDeRutas {

    public static final String MONOLITO = "monolito";
    private final Map<String, String> reglas = new LinkedHashMap<>();

    /** @param reglas entradas con la forma "prefijo->destino", por ejemplo "/cotizaciones->nuevo" */
    public TablaDeRutas(List<String> reglas) {
        for (String regla : reglas) {
            String[] partes = regla.split("->", 2);
            if (partes.length != 2 || !partes[0].startsWith("/")) {
                throw new IllegalArgumentException("regla inválida: '" + regla + "' (usa /prefijo->destino)");
            }
            this.reglas.put(partes[0].strip(), partes[1].strip());
        }
    }

    public String destinoPara(String ruta) {
        String elegido = MONOLITO;
        int largo = -1;
        for (var regla : reglas.entrySet()) {
            String prefijo = regla.getKey();
            boolean coincide = ruta.equals(prefijo) || ruta.startsWith(prefijo + "/");
            if (coincide && prefijo.length() > largo) {
                elegido = regla.getValue();
                largo = prefijo.length();
            }
        }
        return elegido;
    }
}
```

`src/main/java/academia/strangler/FachadaStrangler.java`, `StranglerProperties.java` y `StranglerApp.java`:

```java
package academia.strangler;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

/** La fachada: TODO el tráfico entra aquí y se reenvía al destino que dicta la tabla de rutas. */
@RestController
class FachadaStrangler {

    private static final Logger log = LoggerFactory.getLogger(FachadaStrangler.class);
    private final RestClient http;
    private final TablaDeRutas tabla;
    private final StranglerProperties props;

    FachadaStrangler(RestClient.Builder builder, StranglerProperties props) {
        this.http = builder.build();
        this.props = props;
        this.tabla = new TablaDeRutas(props.rutas());
    }

    @RequestMapping("/**")
    ResponseEntity<String> reenviar(HttpServletRequest peticion, @RequestBody(required = false) String cuerpo) {
        String ruta = peticion.getRequestURI();
        String destino = tabla.destinoPara(ruta);
        String url = props.destinos().get(destino) + ruta
                + (peticion.getQueryString() == null ? "" : "?" + peticion.getQueryString());
        var solicitud = http.method(HttpMethod.valueOf(peticion.getMethod())).uri(url);
        if (peticion.getContentType() != null) {
            solicitud.header(HttpHeaders.CONTENT_TYPE, peticion.getContentType());
        }
        if (cuerpo != null) {
            solicitud.body(cuerpo);
        }
        // onStatus(... -> true): los 4xx/5xx del destino se devuelven tal cual, no se convierten en excepción.
        ResponseEntity<String> respuesta = solicitud.retrieve()
                .onStatus(estado -> true, (req, res) -> { })
                .toEntity(String.class);
        log.info("{} {} -> {} ({})", peticion.getMethod(), ruta, destino, respuesta.getStatusCode().value());
        var salida = ResponseEntity.status(respuesta.getStatusCode()).header("X-Servido-Por", destino);
        String tipo = respuesta.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        if (tipo != null) {
            salida.header(HttpHeaders.CONTENT_TYPE, tipo);
        }
        return salida.body(respuesta.getBody());
    }
}
```

```java
package academia.strangler;

import java.util.List;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** strangler.destinos.* (nombre -> URL base) y strangler.rutas (lista "prefijo->destino"). */
@ConfigurationProperties("strangler")
public record StranglerProperties(Map<String, String> destinos, List<String> rutas) {
}
```

```java
package academia.strangler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class StranglerApp {

    public static void main(String[] args) {
        SpringApplication.run(StranglerApp.class, args);
    }
}
```

`src/main/java/academia/strangler/CapaAnticorrupcion.java`:

```java
package academia.strangler;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Capa anticorrupción (ACL): traduce el registro heredado del monolito
 * "COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S" al modelo del servicio nuevo.
 * Ninguna clase del servicio nuevo conoce los nombres ni los formatos del monolito.
 */
public final class CapaAnticorrupcion {

    public enum Zona { URBANA, METROPOLITANA, REGIONAL }

    public record Tarifa(Zona zona, BigDecimal precioPorKg, long basePesos) {
    }

    public static final class RegistroHeredadoInvalido extends RuntimeException {
        RegistroHeredadoInvalido(String mensaje) {
            super(mensaje);
        }
    }

    // Única tabla de equivalencias: si el monolito inventa una zona nueva, falla aquí y no en el dominio.
    private static final Map<String, Zona> ZONAS = Map.of("Z01", Zona.URBANA, "Z03", Zona.METROPOLITANA,
            "Z07", Zona.REGIONAL);

    private CapaAnticorrupcion() {
    }

    public static Tarifa traducir(String registro) {
        Map<String, String> campos = new HashMap<>();
        for (String par : registro.strip().split("\\|")) {
            String[] kv = par.split("=", 2);
            if (kv.length == 2) {
                campos.put(kv[0], kv[1]);
            }
        }
        for (String obligatorio : List.of("COD_ZONA", "TARIFA_X_KG", "BASE", "IND_ACTIVO")) {
            if (!campos.containsKey(obligatorio)) {
                throw new RegistroHeredadoInvalido("falta " + obligatorio + " en '" + registro + "'");
            }
        }
        if (!"S".equals(campos.get("IND_ACTIVO"))) {
            throw new RegistroHeredadoInvalido("tarifa inactiva para " + campos.get("COD_ZONA"));
        }
        Zona zona = ZONAS.get(campos.get("COD_ZONA"));
        if (zona == null) {
            throw new RegistroHeredadoInvalido("zona heredada desconocida: " + campos.get("COD_ZONA"));
        }
        // El monolito escribe decimales con coma (1250,50). Se convierte UNA vez, aquí, con BigDecimal.
        BigDecimal precio = new BigDecimal(campos.get("TARIFA_X_KG").replace(',', '.'));
        return new Tarifa(zona, precio, Long.parseLong(campos.get("BASE")));
    }

    public static void main(String[] args) {
        for (String registro : List.of(
                "COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S",
                "COD_ZONA=Z09|TARIFA_X_KG=3000,00|BASE=9000|IND_ACTIVO=S",
                "COD_ZONA=Z07|TARIFA_X_KG=2100,75|BASE=9000|IND_ACTIVO=N")) {
            try {
                System.out.println("OK      " + traducir(registro));
            } catch (RegistroHeredadoInvalido e) {
                System.out.println("RECHAZO " + e.getMessage());
            }
        }
    }
}
```

`servidores-falsos/ServidorFalso.java` (hace de monolito y de servicio nuevo en el laboratorio manual):

```java
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

/**
 * Hace de «monolito» o de «servicio nuevo» en el laboratorio F045 (Java puro, sin dependencias).
 * Uso: java ServidorFalso.java <nombre> <puerto>     p. ej. java ServidorFalso.java monolito 8081
 * Responde a cualquier ruta con «<nombre> atendió GET /ruta».
 */
public class ServidorFalso {

    public static void main(String[] args) throws Exception {
        String nombre = args[0];
        int puerto = Integer.parseInt(args[1]);
        HttpServer servidor = HttpServer.create(new InetSocketAddress("127.0.0.1", puerto), 0);
        servidor.createContext("/", ex -> {
            String texto = nombre + " atendió " + ex.getRequestMethod() + " " + ex.getRequestURI().getPath();
            byte[] cuerpo = texto.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
            ex.sendResponseHeaders(200, cuerpo.length);
            ex.getResponseBody().write(cuerpo);
            ex.close();
        });
        servidor.start();
        System.out.println(nombre + " escuchando en http://127.0.0.1:" + puerto);
    }
}
```

#### Verificación
```bash
../gradlew test
```

`src/test/java/academia/strangler/TablaDeRutasTest.java`:

```java
package academia.strangler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import org.junit.jupiter.api.Test;

class TablaDeRutasTest {

    private final TablaDeRutas tabla = new TablaDeRutas(List.of("/cotizaciones->nuevo"));

    @Test
    void laRutaMigradaVaAlServicioNuevo() {
        assertEquals("nuevo", tabla.destinoPara("/cotizaciones"));
        assertEquals("nuevo", tabla.destinoPara("/cotizaciones/7"));
    }

    @Test
    void loQueNoSeMigroSigueEnElMonolito() {
        assertEquals("monolito", tabla.destinoPara("/clientes/1"));
    }

    @Test
    void coincidePorSegmentosNoPorTexto() {
        assertEquals("monolito", tabla.destinoPara("/cotizaciones-pdf/7"));
    }

    @Test
    void ganaElPrefijoMasLargoParaDevolverUnaSubrutaAlMonolito() {
        var t = new TablaDeRutas(List.of("/cotizaciones->nuevo", "/cotizaciones/masivas->monolito"));
        assertEquals("monolito", t.destinoPara("/cotizaciones/masivas/3"));
        assertEquals("nuevo", t.destinoPara("/cotizaciones/3"));
    }

    @Test
    void rechazaReglasMalEscritas() {
        assertThrows(IllegalArgumentException.class, () -> new TablaDeRutas(List.of("cotizaciones=nuevo")));
    }
}
```

`src/test/java/academia/strangler/CapaAnticorrupcionTest.java` y `FachadaStranglerTest.java`:

```java
package academia.strangler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CapaAnticorrupcionTest {

    @Test
    void traduceElRegistroHeredadoAlModeloNuevo() {
        var tarifa = CapaAnticorrupcion.traducir("COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S");
        assertEquals(new CapaAnticorrupcion.Tarifa(CapaAnticorrupcion.Zona.METROPOLITANA,
                new BigDecimal("1250.50"), 5000), tarifa);
    }

    @Test
    void unaZonaDesconocidaSeDetieneEnLaFrontera() {
        var e = assertThrows(CapaAnticorrupcion.RegistroHeredadoInvalido.class,
                () -> CapaAnticorrupcion.traducir("COD_ZONA=Z09|TARIFA_X_KG=1,0|BASE=1|IND_ACTIVO=S"));
        assertEquals("zona heredada desconocida: Z09", e.getMessage());
    }
}
```

```java
package academia.strangler;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/** Dos servidores HTTP de mentira (monolito y nuevo) en puertos libres; la fachada real decide a cuál ir. */
@SpringBootTest
@AutoConfigureMockMvc
class FachadaStranglerTest {

    static final HttpServer MONOLITO = servidor("monolito");
    static final HttpServer NUEVO = servidor("nuevo");

    static HttpServer servidor(String nombre) {
        try {
            HttpServer s = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            s.createContext("/", ex -> {
                int codigo = ex.getRequestURI().getPath().endsWith("/999") ? 404 : 200;
                byte[] cuerpo = ("respondió " + nombre).getBytes(StandardCharsets.UTF_8);
                ex.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                ex.sendResponseHeaders(codigo, cuerpo.length);
                ex.getResponseBody().write(cuerpo);
                ex.close();
            });
            s.start();
            return s;
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @DynamicPropertySource
    static void destinos(DynamicPropertyRegistry registro) {
        registro.add("strangler.destinos.monolito", () -> "http://127.0.0.1:" + MONOLITO.getAddress().getPort());
        registro.add("strangler.destinos.nuevo", () -> "http://127.0.0.1:" + NUEVO.getAddress().getPort());
    }

    @AfterAll
    static void apagar() {
        MONOLITO.stop(0);
        NUEVO.stop(0);
    }

    @Autowired
    MockMvc mvc;

    @Test
    void lasCotizacionesYaLasAtiendeElServicioNuevo() throws Exception {
        mvc.perform(get("/cotizaciones/7"))
            .andExpect(status().isOk())
            .andExpect(header().string("X-Servido-Por", "nuevo"))
            .andExpect(content().string("respondió nuevo"));
    }

    @Test
    void elRestoSigueEnElMonolito() throws Exception {
        mvc.perform(get("/clientes/1")).andExpect(header().string("X-Servido-Por", "monolito"));
        mvc.perform(get("/cotizaciones-pdf/7")).andExpect(header().string("X-Servido-Por", "monolito"));
    }

    @Test
    void losErroresDelDestinoLleganSinTransformarse() throws Exception {
        mvc.perform(get("/cotizaciones/999")).andExpect(status().isNotFound());
    }
}
```

**Output esperado:** 10 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)* (5 + 2 + 3). **Pregunta de
comprobación:** ¿qué regla agregas para que `/cotizaciones/masivas` siga en el monolito mientras el resto de
`/cotizaciones` va al servicio nuevo, y por qué funciona? *(`/cotizaciones/masivas->monolito`: gana el prefijo más
largo.)*

</details>

### Database-per-service

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar una base de datos y un usuario por servicio, demostrar que un servicio no puede leer ni unir datos de otro y responder consultas con una copia local alimentada por eventos; lo compruebas cuando BdPorServicioTest pasa 2 de 2 y los tres guiones SQL producen el resultado…

#### ► LA IDEA EN UNA FRASE
**Configurar una base de datos y un usuario por servicio, demostrar que un servicio no puede leer ni unir datos de otro y responder consultas con una copia local alimentada por eventos; lo compruebas cuando BdPorServicioTest pasa 2 de 2 y los tres guiones SQL producen el resultado esperado.**

#### ► POR QUÉ EXISTE ESTO
Database-per-service (una base de datos por servicio) significa que cada microservicio es el único dueño de sus datos: solo él lee y escribe sus tablas. Si otro servicio necesita esa información, se la pide (por una API) o la recibe (por eventos) y guarda su propia copia.

#### ► LA ANALOGÍA
Piensa en database-per-service como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph PG["Instancia PostgreSQL 18.7"]
      BE[("envios_db<br/>dueño: svc_envios<br/>tabla envios")]
      BF[("facturacion_db<br/>dueño: svc_facturacion<br/>cargos · envios_conocidos")]
    end
    SE["Servicio Envíos"] --> BE
    SF["Servicio Facturación"] --> BF
    SF -. "✘ CONNECT denegado" .-> BE
    SE -- "evento EnvioEntregado" --> SF
```

1. Database-per-service (una base de datos por servicio) significa que cada microservicio es el único dueño de sus datos: solo él lee y escribe sus tablas.
2. Si otro servicio necesita esa información, se la pide (por una API) o la recibe (por eventos) y guarda su propia copia.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Database-per-service se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Database-per-service | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Base de datos compartida como mecanismo de integración:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: database-per-service funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Database-per-service (una base de datos por servicio) significa que cada microservicio es el único dueño de sus datos: solo él lee y escribe sus tablas.
- Si otro servicio necesita esa información, se la pide (por una API) o la recibe (por eventos) y guarda su propia copia.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve database-per-service en tu contexto?
2. ¿Cómo sabrías que database-per-service no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar database-per-service?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
Versiones: **PostgreSQL 18.7** (imagen `postgres:18.7`; los guiones se probaron también en PostgreSQL 16.15),
**JDK 25 LTS**, **Spring Boot 4.1.3** (`spring-boot-starter-jdbc`, driver PostgreSQL gestionado por Boot). Script de
inicio `modulo-9/initdb/01-bd-por-servicio.sql`:

```sql
-- F046 · Database-per-service: una base de datos y un usuario por servicio en la misma instancia de PostgreSQL.
-- Docker Compose lo ejecuta al crear el contenedor (docker-entrypoint-initdb.d). También: psql -f este-archivo
DROP DATABASE IF EXISTS envios_db;
DROP DATABASE IF EXISTS facturacion_db;
DROP ROLE IF EXISTS svc_envios;
DROP ROLE IF EXISTS svc_facturacion;

CREATE ROLE svc_envios LOGIN PASSWORD 'envios';
CREATE ROLE svc_facturacion LOGIN PASSWORD 'facturacion';

-- Cada base pertenece a su servicio; nadie más puede ni siquiera conectarse.
CREATE DATABASE envios_db OWNER svc_envios;
CREATE DATABASE facturacion_db OWNER svc_facturacion;
REVOKE CONNECT ON DATABASE envios_db FROM PUBLIC;
REVOKE CONNECT ON DATABASE facturacion_db FROM PUBLIC;

\connect envios_db svc_envios
CREATE TABLE envios (
  id         text PRIMARY KEY,
  cliente_id text NOT NULL,
  estado     text NOT NULL
);
INSERT INTO envios VALUES ('E-1', 'CL-9', 'ENTREGADO'), ('E-2', 'CL-9', 'EN_TRANSITO');

\connect facturacion_db svc_facturacion
CREATE TABLE cargos (
  envio_id  text PRIMARY KEY,
  total_cop bigint NOT NULL
);
-- Copia local de lo que Facturación necesita saber de Envíos, alimentada por eventos (Módulo 6).
CREATE TABLE envios_conocidos (
  envio_id text PRIMARY KEY,
  estado   text NOT NULL
);
INSERT INTO cargos VALUES ('E-1', 8126), ('E-2', 4980);
INSERT INTO envios_conocidos VALUES ('E-1', 'ENTREGADO'), ('E-2', 'EN_TRANSITO');
```

`modulo-9/docker-compose.yml`:

```yaml
# Módulo 5 (modulo-9) · Infraestructura del laboratorio de Database-per-service (F046).
# Arranca:  docker compose up -d --wait   (espera a que el healthcheck esté "healthy")
# Detén:    docker compose down           (sin volúmenes: los datos se recrean en cada arranque)
services:
  postgres:
    image: postgres:18.7
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes:
      # Crea envios_db (svc_envios) y facturacion_db (svc_facturacion) con sus tablas y datos de ejemplo.
      - ./initdb/01-bd-por-servicio.sql:/docker-entrypoint-initdb.d/01-bd-por-servicio.sql:ro
    healthcheck:
      # Sano cuando la base de Facturación ya acepta a su usuario (el script de inicio terminó).
      test: ["CMD-SHELL", "PGPASSWORD=facturacion psql -h 127.0.0.1 -U svc_facturacion -d facturacion_db -c 'select 1' >/dev/null"]
      interval: 2s
      timeout: 3s
      retries: 30
```

Servicio de Facturación · `f046-bd-por-servicio/build.gradle.kts`:

```kotlin
// F046 · Database-per-service: el servicio de Facturación solo ve SU base de datos
plugins {
    java
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.spring.dependency.management)
}

group = "academia.microservicios"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

dependencies {
    implementation(libs.spring.boot.starter.webmvc)
    // JdbcTemplate + HikariCP
    implementation(libs.spring.boot.starter.jdbc)
    // Driver JDBC de PostgreSQL 42.7.14 (gestionado por Boot)
    runtimeOnly(libs.postgresql)
    testImplementation(libs.spring.boot.starter.webmvc.test)
    // Gradle 9 exige declarar el lanzador de JUnit Platform (ya no lo añade por su cuenta)
    testRuntimeOnly(libs.junit.platform.launcher)
}

tasks.withType<Test> {
    useJUnitPlatform()
    testLogging {
        events("passed", "skipped", "failed")   // una línea por test en la consola
        // el mensaje completo de cada fallo (valor esperado y obtenido), no solo el tipo de excepción
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
    }
}
```

`src/main/resources/application.properties`:

```properties
spring.application.name=facturacion
server.port=${PORT:8086}
# Facturación conoce UNA sola base: la suya. Las credenciales llegan del entorno (factor III).
spring.datasource.url=${FACTURACION_BD_URL:jdbc:postgresql://localhost:5432/facturacion_db}
spring.datasource.username=${FACTURACION_BD_USUARIO:svc_facturacion}
spring.datasource.password=${FACTURACION_BD_CLAVE:facturacion}
```

`src/main/java/academia/facturacion/FacturaController.java` y `FacturacionApp.java`:

```java
package academia.facturacion;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Responde con datos propios: la tabla cargos y la copia local envios_conocidos.
 * NO consulta la base de Envíos: no puede (no tiene permiso) y no debe (acoplamiento por esquema).
 */
@RestController
class FacturaController {

    private final JdbcClient jdbc;

    FacturaController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    record Factura(String envioId, long totalCop, String estadoEnvio) {
    }

    @GetMapping("/facturas/{envioId}")
    ResponseEntity<Factura> factura(@PathVariable String envioId) {
        return jdbc.sql("""
                SELECT c.envio_id, c.total_cop, e.estado
                FROM cargos c JOIN envios_conocidos e USING (envio_id)
                WHERE c.envio_id = :id""")
            .param("id", envioId)
            .query((rs, n) -> new Factura(rs.getString("envio_id"), rs.getLong("total_cop"), rs.getString("estado")))
            .optional()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
```

```java
package academia.facturacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FacturacionApp {

    public static void main(String[] args) {
        SpringApplication.run(FacturacionApp.class, args);
    }
}
```

Guiones del laboratorio (`f046-bd-por-servicio/sql/`):

```sql
-- F046 · Fallo deliberado 1: Facturación intenta conectarse a la base de Envíos.
-- Ejecuta: psql "postgresql://svc_facturacion:facturacion@localhost:5432/envios_db" -f este-archivo
SELECT * FROM envios;
```

```sql
-- F046 · Fallo deliberado 2: un JOIN que cruza bases de datos no existe en PostgreSQL.
-- Ejecuta: psql "postgresql://svc_facturacion:facturacion@localhost:5432/facturacion_db" -f este-archivo
SELECT c.envio_id, c.total_cop, e.estado
FROM cargos c JOIN envios_db.public.envios e ON e.id = c.envio_id;
```

```sql
-- F046 · Lo correcto: Facturación responde con SUS datos (cargos + copia local alimentada por eventos).
-- Ejecuta: psql "postgresql://svc_facturacion:facturacion@localhost:5432/facturacion_db" -f este-archivo
SELECT c.envio_id, c.total_cop, e.estado
FROM cargos c JOIN envios_conocidos e USING (envio_id)
ORDER BY c.envio_id;
```

#### Verificación
```bash
docker compose up -d --wait
cd f046-bd-por-servicio && ../gradlew test
```

`src/test/java/academia/facturacion/BdPorServicioTest.java`:

```java
package academia.facturacion;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

/** Requiere el PostgreSQL de docker-compose.yml (ver README): docker compose up -d --wait */
@SpringBootTest
@AutoConfigureMockMvc
class BdPorServicioTest {

    @Autowired
    MockMvc mvc;

    @Test
    void facturacionRespondeConSusPropiosDatos() throws Exception {
        mvc.perform(get("/facturas/E-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalCop").value(8126))
            .andExpect(jsonPath("$.estadoEnvio").value("ENTREGADO"));
    }

    @Test
    void facturacionNoPuedeEntrarALaBaseDeEnvios() {
        assertThatThrownBy(() -> DriverManager.getConnection(
                "jdbc:postgresql://localhost:5432/envios_db", "svc_facturacion", "facturacion").close())
            .isInstanceOf(SQLException.class)
            .hasMessageContaining("permission denied for database \"envios_db\"");
    }
}
```

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle verificada en el Mac del dueño el 2026-11-21 con Gradle 9.9.2, Java 25.0.5.1 autoaprovisto y Docker Compose v5.7.1)*. El mensaje que comprueba el
segundo test es el del driver JDBC (salida real con el driver 42.7.2 sobre PostgreSQL 16.15):
`FATAL: permission denied for database "envios_db"` seguido de `Detail: User does not have CONNECT privilege.` (código
SQLState `42501`). los comandos de verificación indicados además ejecuta los tres guiones y exige que los dos primeros fallen y el tercero
devuelva `(2 rows)`. **Pregunta de comprobación:** Facturación necesita el nombre del cliente que está en el servicio
de Clientes. Da dos formas de obtenerlo sin leer su base. *(Llamar a la API de Clientes al facturar, con caché y
timeout, o mantener una copia local actualizada con eventos ClienteActualizado.)*

</details>
