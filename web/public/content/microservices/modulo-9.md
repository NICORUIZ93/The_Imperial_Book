# Módulo 5 · Introducción a microservicios y DDD

**Fase 1 · Spring Boot de cero a experto** (semanas 7 y 8 de 12). **Duración:** 13 h (6 temas de 1,5–3 h).
**Dificultad:** 3 de 5 (4 de 5 en DDD y Strangler Fig). **Dependencias:** Módulos 1 a 4 (Java moderno, Spring IoC,
perfiles, Spring MVC, JDBC/JPA, PostgreSQL, testing con JUnit y MockMvc). **Herramientas:** **JDK 25 LTS (25.0.5)**,
**Spring Boot 4.1.3** (Spring Framework 7.0.11, JUnit Jupiter 6.0.3), **Spring Modulith 2.1.3**, PostgreSQL 18.7 en
Docker Compose y Gradle 9.9.2 mediante el wrapper `./gradlew`. **Laboratorio:** `examples/microservicios/modulo-9/` (un
subproyecto Gradle por tema; `./verificar.sh` ejecuta todos los tests).

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

**Cómo usar el laboratorio.** Entra en `examples/microservicios/modulo-9` y ejecuta `./verificar.sh`: arranca
PostgreSQL con Docker Compose, corre los tests de las seis carpetas y apaga el contenedor. Para un solo tema:
`cd f042-ddd && ../gradlew test`. Las fichas F041 y F042 (y la parte de Java puro de F044 y F045) corren también solo con
el JDK, sin Gradle: el comando exacto está en cada ficha.

---

### Monolito vs Microservicios vs SOA

#### 1. UBICACIÓN

Módulo 5, Lección 1 de 6 · Fase 1 · `web/public/content/microservices/modulo-9.md` · Laboratorio
`examples/microservicios/modulo-9/f041-estilos/`.

#### 2. PRERREQUISITOS

- Haber construido una API con Spring MVC y una base de datos (Módulo 2).
- Saber ejecutar tests con `./gradlew test` y leer un `assertEquals` (Módulo 3).
- Tener el JDK 25: `java -version` debe responder `openjdk version "25...`.

#### 3. OBJETIVO DE APRENDIZAJE

**Comparar** monolito (modular), microservicios y SOA con seis criterios (equipos, dominio, escalado, despliegue,
integración y plataforma) y **justificar** por escrito cuál conviene en un caso concreto; lo compruebas cuando
`EvaluadorDeArquitecturaTest` pasa 5 de 5, incluido el ejercicio cuya respuesta es no usar microservicios.

#### 4. ANALOGÍA VISUAL

Dibuja tres formas de dar de comer a una ciudad, una al lado de la otra:

1. **Un restaurante grande con una sola cocina** (monolito). Todos los cocineros comparten fogones, nevera y
   despensa. Si la cocina está ordenada por estaciones (carnes, postres, ensaladas) y cada estación tiene su mesa,
   es un **monolito modular**: rápido de coordinar, una sola puerta, una sola factura de luz. Si se incendia la
   cocina, cierra todo el restaurante.
2. **Una plazoleta de comidas** (microservicios). Diez locales pequeños, cada uno con su cocina, su nevera, su caja y
   su horario. Las arepas pueden abrir un local más el sábado sin tocar a la pizzería; si se daña el horno de pizzas,
   las arepas siguen vendiendo. A cambio, hay diez neveras que mantener, diez inspecciones sanitarias y un pasillo
   común (la red) donde los meseros se cruzan.
3. **Un centro de convenciones con catering central** (SOA). Grandes áreas (banquetes, bebidas, panadería) se
   comparten entre muchos eventos, y un **coordinador central con radio** (el bus de servicios, ESB) recibe cada
   pedido, lo traduce y lo reparte. Todo pasa por él: cuando el coordinador se satura, se detienen todos los eventos.

Debajo de los tres dibujos, una balanza: a la izquierda «facilidad de coordinar», a la derecha «independencia».

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** tres cajas. «Monolito modular»: una API llama a los módulos pedidos e inventario, que comparten
una sola base de datos. «Microservicios»: un gateway llama a un servicio de pedidos y a uno de inventario, cada uno con
su propia base de datos, y pedidos avisa a inventario con eventos (flecha punteada). «SOA»: aplicaciones como ERP, CRM y
portal hablan con un bus central (ESB) que enruta, transforma y orquesta, y que llama a servicios corporativos de
Clientes y Facturación que comparten una base de datos corporativa.

#### 6. EXPLICACIÓN NIVEL 0

Cuando un programa crece, hay que decidir **cómo se reparte**:

- **Monolito:** todo el sistema es **un solo programa** que se instala de una vez. No es malo: es lo más simple de
  construir, probar y operar. Si por dentro está bien ordenado en partes con fronteras claras, se llama **monolito
  modular**.
- **Microservicios:** el sistema se divide en **varios programas pequeños** que se instalan por separado, cada uno con
  sus propios datos, y que se comunican por la red. Permiten que muchos equipos trabajen sin pisarse, pero hay que
  operar muchas piezas.
- **SOA (arquitectura orientada a servicios):** la idea de los años 2000 para **conectar las aplicaciones de toda una
  empresa** (contabilidad, ventas, bodega) mediante servicios reutilizables y un bus central que traduce entre ellas.

La pregunta no es «¿cuál es mejor?», sino «¿cuál resuelve **mi** problema con el menor costo?».

#### 7. EXPLICACIÓN INTERMEDIA

| Criterio | Monolito modular | Microservicios | SOA |
|---|---|---|---|
| Unidad de despliegue | 1 artefacto | 1 por servicio | 1 por servicio, más el ESB |
| Datos | 1 base (esquemas por módulo) | 1 base por servicio | bases corporativas compartidas |
| Comunicación interna | llamadas a métodos (nanosegundos) | HTTP, gRPC, mensajes (milisegundos) | SOAP/XML a través del ESB |
| Tamaño del servicio | — | pequeño: un contexto del negocio | grande: una capacidad de la empresa |
| Lógica de integración | en el código | en los servicios («extremos inteligentes, tuberías tontas») | en el bus («tubería inteligente») |
| Escalado | todo el artefacto | por servicio | por servicio |
| Equipo típico | 1 a 3 equipos | muchos equipos autónomos | área de integración central |
| Costo operativo | bajo | alto (CI/CD, observabilidad, red, guardias) | alto (ESB, gobierno central) |

El evaluador del laboratorio convierte la tabla en reglas que puedes discutir con un test:

1. Si el reto es **integrar aplicaciones existentes** de varias áreas y nadie necesita desplegar por separado → SOA
   (hoy suele hacerse con una plataforma de integración o APIs corporativas).
2. Para recomendar **microservicios** deben cumplirse **todas** estas condiciones: al menos 3 equipos que necesitan
   avanzar sin coordinarse cada día, fronteras del dominio conocidas, una plataforma operativa (CI/CD, contenedores,
   monitoreo, guardias) y una necesidad real de escalar o desplegar partes por separado.
3. En cualquier otro caso → **monolito modular**, explicando qué falta.

El orden importa: **empiezas por el monolito modular y exiges evidencia para salir de él**. Partir es caro de deshacer;
unir dos módulos de un monolito es barato.

#### 8. EXPLICACIÓN MAESTRA

- **El costo oculto de los microservicios.** Cada llamada en memoria se vuelve una llamada de red que puede tardar,
  fallar o duplicarse (las falacias de la computación distribuida). Aparecen problemas que el monolito no tenía:
  consistencia eventual, versionado de contratos, trazas distribuidas, despliegues coordinados, costos de nube por
  servicio. Si no tienes plataforma para absorberlos, los pagas en incidentes.
- **El beneficio real es organizacional.** Los microservicios compran **autonomía de equipos** (Ley de Conway,
  Módulo 29): cada equipo despliega cuando quiere. Con un solo equipo no hay a quién darle autonomía.
- **Alternativas intermedias:** (1) **monolito modular** con fronteras verificadas (Spring Modulith, tema 3), que
  conserva una sola unidad de despliegue y prepara la extracción futura; (2) **pocos servicios grandes**
  («macroservicios») alrededor de los subdominios más distintos; (3) **extraer solo lo que escala distinto** (por
  ejemplo, el procesamiento de imágenes) y dejar el resto junto.
- **SOA hoy.** El ESB centralizado cayó en desuso porque concentraba lógica de negocio en el bus y se volvía un cuello
  de botella organizacional. Lo que sobrevive de SOA es la idea de contratos de servicio y de integración entre
  aplicaciones heredadas; los microservicios la reformularon con «extremos inteligentes, tuberías tontas».
- **Cuándo NO usar microservicios:** producto nuevo cuyo dominio todavía cambia cada semana, un solo equipo, sin
  CI/CD ni monitoreo, o cuando el motivo es «escalar» sin una medición que muestre qué parte no escala. Lo verás de
  nuevo en el Módulo 30 (anti-patrones) y en el Módulo 31 (migración).

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Compila y ejecuta el comparador solo con el JDK:
   ```bash
   cd examples/microservicios/modulo-9/f041-estilos
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

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9/f041-estilos
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

**Output esperado:** 5 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*. **Pregunta de
comprobación:** una empresa de 120 desarrolladores en 12 equipos no tiene CI/CD ni monitoreo. ¿Qué recomienda el
evaluador y por qué? *(Monolito modular: sin plataforma operativa, cada servicio nuevo multiplica los incidentes; lo
primero es construir la plataforma.)*

#### 12. ERROR COMÚN

**Síntoma:** el equipo partió el sistema en servicios y ahora **cada cambio pequeño exige desplegar tres o cuatro
servicios a la vez**, en un orden concreto. **Cómo se ve:** en el tablero de despliegues aparecen tickets como
«Desplegar pedidos 2.3 **después** de inventario 1.8 y **antes** de facturación 4.1»; en el diagrama de dependencias
hay flechas en ambos sentidos entre los mismos servicios. **Diagnóstico:** cortaste por capas técnicas o por entidades
(un «servicio de clientes» que todos llaman) en vez de por contextos del negocio, o partiste antes de conocer el
dominio. Cuenta en el historial de Git cuántos *commits* tocan más de un servicio: si son la mayoría, las fronteras
están mal. **Arreglo:** vuelve a unir los servicios que cambian juntos en un monolito modular, encuentra las fronteras
con DDD (tema 2) y verifícalas con Spring Modulith (tema 3) antes de volver a separar.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cuál es la diferencia entre SOA y microservicios, si ambos hablan de servicios?»

**Respuesta modelo:** SOA nace para **integrar las aplicaciones de una empresa**: servicios grandes y reutilizables a
nivel corporativo, contratos formales (SOAP/WSDL) y un ESB que enruta, transforma y a menudo orquesta, es decir, lógica
en la tubería y datos corporativos compartidos. Los microservicios buscan **autonomía de equipos dentro de un producto**:
servicios pequeños alineados a un contexto del negocio, cada uno con su base de datos, desplegables por separado y con
comunicación simple (HTTP, gRPC, mensajes) donde la lógica vive en los extremos. Antes de elegir microservicios
preguntaría cuántos equipos hay, si el dominio está claro y si existe plataforma operativa; si no, empezaría con un
monolito modular.

#### 14. ANTI-PATRÓN RELACIONADO

**Microservicios por moda (*résumé-driven architecture*):**

```text
equipo: 4 personas · usuarios: 200 al día
servicios: usuarios, auth, perfiles, direcciones, pedidos, items, precios, notificaciones, auditoría  (9)
bases de datos: 9 · repositorios: 9 · pipelines: 9 · guardias: nadie
```

Se ve como un diagrama con más cajas que personas en el equipo, despliegues que tardan una tarde y errores que nadie
sabe en qué servicio buscar. Evítalo midiendo antes de partir: si no puedes nombrar qué parte necesita escalar o
desplegarse por separado, y quién la operará de noche, quédate en el monolito modular.

---

### DDD: Bounded Contexts, Agregados, Eventos de Dominio

#### 1. UBICACIÓN

Módulo 5, Lección 2 de 6 · Fase 1 · Laboratorio `examples/microservicios/modulo-9/f042-ddd/`.

#### 2. PRERREQUISITOS

- Records, `List.copyOf` y excepciones en Java (Módulo 1).
- Beans, `@Service` y `ApplicationEventPublisher` de Spring (Módulo 1, IoC y DI).
- Tema anterior: por qué las fronteras importan más que el número de servicios.

#### 3. OBJETIVO DE APRENDIZAJE

**Modelar** un agregado que protege sus invariantes, **emitir** un evento de dominio al cambiar de estado y
**traducirlo** al modelo de otro contexto delimitado; lo compruebas cuando los 6 tests de dominio (`PedidoTest`,
`PlanificadorDeEnviosTest`) y el test de integración `FlujoEntreContextosTest` pasan.

#### 4. ANALOGÍA VISUAL

Dibuja **una tienda de muebles con dos edificios**. En el edificio de **Ventas**, una asesora habla de «pedido»,
«cliente», «descuento» y «cuotas»; en su escritorio hay una carpeta roja por cada pedido, con un **candado**: solo ella
puede agregar o quitar hojas, y no deja confirmar una carpeta vacía (el **agregado** y sus reglas). En el edificio de
**Bodega y Despacho**, nadie dice «pedido»: hablan de «guía», «bultos» y «ruta». Entre los dos edificios hay un
**tubo neumático**: cuando la asesora confirma un pedido, mete en el tubo una tarjeta amarilla que dice «Pedido P-100
confirmado, 7 unidades, Cra 7 # 40-62» (el **evento de dominio**). En Bodega, un empleado lee la tarjeta y llena **su
propio formulario** de despacho, en su idioma: «Guía 1, 2 bultos, por despachar». Cada edificio tiene su diccionario
colgado en la pared (el **lenguaje ubicuo** de cada **contexto delimitado**).

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** dos cajas. En «Contexto Ventas», Pedido es la raíz del agregado y contiene dos líneas de pedido;
cada línea usa el objeto de valor Dinero. Al llamar a confirmar(), el Pedido produce el evento PedidoConfirmado. Una
flecha rotulada «lenguaje publicado» lleva el evento a la caja «Contexto Envíos», donde PlanificadorDeEnvios crea un
Envio con guía, destino y bultos.

#### 6. EXPLICACIÓN NIVEL 0

**DDD** (*Domain-Driven Design*, diseño guiado por el dominio) es una forma de escribir software empezando por
entender **el negocio** y sus palabras. Tres ideas bastan para empezar:

- **Contexto delimitado (*Bounded Context*):** una zona del negocio donde cada palabra significa una sola cosa. «Pedido»
  en Ventas es una lista de productos con precio; en Envíos no existe, allí se habla de «guía». Cada contexto tiene su
  propio modelo, y es el mejor candidato a módulo o a microservicio.
- **Agregado:** un grupo de objetos que cambian juntos y que tiene **una raíz** que hace cumplir las reglas. Nadie
  modifica una línea de pedido directamente: se le pide al `Pedido`.
- **Evento de dominio:** un registro de **algo que ya pasó** y que le importa a alguien más: «PedidoConfirmado». Se
  escribe en pasado.

#### 7. EXPLICACIÓN INTERMEDIA

- **Objeto de valor (`Dinero`):** inmutable, se compara por su valor y se valida al crearse (`new Dinero(-1)` lanza
  excepción). Un `record` de Java es la forma natural de escribirlo.
- **Agregado (`Pedido`):** solo la raíz es pública para modificar. Sus **invariantes** (reglas que siempre se cumplen)
  viven en sus métodos: no agregar líneas a un pedido confirmado, no superar 20 unidades, no confirmar vacío. `lineas()`
  devuelve una copia inmutable para que nadie se salte las reglas desde fuera.
- **Una transacción = un agregado.** Se carga, se cambia y se guarda **completo**. Si un caso de uso necesita cambiar
  dos agregados, el segundo cambio se hace en otra transacción, reaccionando a un evento.
- **Eventos de dominio:** el agregado los **registra** (`eventos.add(...)`) y el **servicio de aplicación** los
  **publica** después de guardar (`extraerEventos().forEach(publicador::publishEvent)`). Así el dominio no depende de
  Spring y cada evento sale una sola vez.
- **Mapa de contextos:** Envíos depende del evento de Ventas (el **lenguaje publicado**), no de la clase `Pedido`. El
  `PlanificadorDeEnvios` traduce: 7 unidades → 2 bultos (uno por cada 5 unidades). Si Ventas cambia su modelo interno,
  Envíos no se entera mientras el evento se conserve.

#### 8. EXPLICACIÓN MAESTRA

- **Tamaño del agregado.** Agregados grandes (un `Cliente` con todos sus pedidos) generan conflictos de concurrencia y
  cargas lentas; agregados diminutos dejan reglas sin dueño. Regla práctica: el agregado más pequeño que puede hacer
  cumplir sus invariantes **en una sola transacción**; entre agregados, referencias por id y consistencia eventual.
- **Eventos de dominio frente a eventos de integración.** Un evento de dominio vive dentro del contexto y puede cambiar
  con el código; uno de integración cruza servicios por un broker y es un **contrato versionado**. En un microservicio
  sueles traducir el primero al segundo en la frontera (y publicarlo con *outbox*, Módulo 25).
- **Alternativas para publicar eventos:** (1) el patrón de este laboratorio (el agregado registra, la aplicación
  publica); (2) `AbstractAggregateRoot` de Spring Data, que publica al llamar a `save()`, más cómodo pero acopla el
  dominio a Spring; (3) devolver los eventos como resultado del método (`List<Evento> confirmar(...)`), lo más
  explícito para tests.
- **Patrones de relación entre contextos:** cliente-proveedor, conformista, **capa anticorrupción** (tema 5), núcleo
  compartido. Elegir mal el patrón es la causa típica de acoplamiento entre microservicios.
- **Cuándo NO hacer DDD táctico completo:** CRUD sin reglas (un catálogo de países), prototipos o subdominios
  genéricos que compras hechos (correo, pagos). Ahí basta un modelo simple; reserva los agregados para el **subdominio
  central**, donde está la ventaja competitiva. El DDD **estratégico** (contextos y lenguaje) sí conviene siempre que
  vayas a partir un sistema.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Ejecuta el recorrido del dominio solo con el JDK (los paquetes `ventas` y `envios` no necesitan Spring):
   ```bash
   cd examples/microservicios/modulo-9/f042-ddd
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

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9/f042-ddd
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

**Output esperado:** 7 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)* (5 de `PedidoTest`, 1 de
`PlanificadorDeEnviosTest` y 1 de `FlujoEntreContextosTest`). **Pregunta de comprobación:** ¿por qué `Envio` no tiene
un campo de tipo `Pedido`? *(Porque pertenece a otro contexto: depende solo del evento publicado; si tuviera `Pedido`,
cualquier cambio interno de Ventas rompería Envíos.)*

#### 12. ERROR COMÚN

**Síntoma:** el agregado tiene *getters* y *setters* para todo y las reglas están repartidas en servicios
(«modelo anémico»). Un día aparece un pedido confirmado con 0 líneas o con 35 unidades. **Cómo se ve:**

```java
// ✘ El servicio decide; el objeto solo guarda datos.
pedido.setEstado("CONFIRMADO");          // nadie comprobó que tuviera líneas
pedido.getLineas().add(lineaGratis);     // la lista interna queda expuesta
```

En el paso 2 del laboratorio lo ves como un test rojo (salida real de JUnit):

```text
org.opentest4j.AssertionFailedError: Expected java.lang.UnsupportedOperationException to be thrown, but nothing was thrown.
```
 **Diagnóstico:** busca *setters* públicos en la raíz y colecciones
devueltas sin copia; busca reglas del negocio en clases `*Service` que reciben el agregado y le cambian campos.
**Arreglo:** métodos con intención (`confirmar`, `agregar`) que validan antes de cambiar, y colecciones devueltas con
`List.copyOf`.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo usarías DDD para decidir las fronteras de tus microservicios?»

**Respuesta modelo:** empezaría por el DDD estratégico: talleres con el negocio (por ejemplo, *Event Storming*) para
descubrir los eventos, el lenguaje y los subdominios; donde una misma palabra cambia de significado hay una frontera de
contexto delimitado. Cada contexto es candidato a módulo y, si hace falta autonomía de despliegue, a microservicio; un
servicio nunca debe partir un agregado, porque sus invariantes necesitan una sola transacción. Entre contextos usaría
eventos de dominio traducidos a eventos de integración versionados, y una capa anticorrupción frente a sistemas
heredados. Antes de separar físicamente, validaría las fronteras dentro de un monolito modular.

#### 14. ANTI-PATRÓN RELACIONADO

**Modelo canónico compartido (un solo `Cliente` para toda la empresa):**

```java
// ✘ librería «modelo-comun» que usan Ventas, Envíos, Facturación y Soporte
public class Cliente {
    String nombre; String direccionEnvio; String nit; String regimenTributario;
    String limiteCredito; String nivelDeSoporte; String canalPreferido; /* ... 60 campos más */
}
```

Se ve como una dependencia que todos los servicios importan y que nadie se atreve a cambiar, porque cualquier campo
nuevo obliga a recompilar y desplegar a todos. Cada contexto debe tener **su** modelo del cliente con los campos que
necesita y comunicarse por eventos o contratos pequeños.

---

### Spring Modulith

#### 1. UBICACIÓN

Módulo 5, Lección 3 de 6 · Fase 1 · Laboratorio `examples/microservicios/modulo-9/f043-modulith/`.

#### 2. PRERREQUISITOS

- Contextos delimitados y eventos de dominio (tema 2).
- `@Transactional` y una base de datos con Spring (Módulo 2).
- `@SpringBootTest` y AssertJ (Módulo 3).

#### 3. OBJETIVO DE APRENDIZAJE

**Organizar** una aplicación Spring Boot en módulos de aplicación, **verificar** automáticamente que ningún módulo usa
las clases internas de otro y **comunicar** módulos con eventos; lo compruebas cuando `ModularidadTest` e
`InventarioTest` pasan y cuando provocas (y lees) una violación de `ApplicationModules.verify()`.

#### 4. ANALOGÍA VISUAL

Dibuja **un edificio de oficinas de coworking**. Todas las empresas comparten el mismo edificio, la misma recepción y
el mismo ascensor (un solo despliegue). Cada empresa tiene su piso con una **puerta de vidrio**: la recepción de cada
piso (el paquete raíz del módulo, su API) es visible para todos, pero las oficinas del fondo tienen **puerta con
tarjeta** (los subpaquetes internos). En la portería hay un **guardia con un plano** del edificio (Spring Modulith):
recorre los pasillos y, si ve a alguien de la empresa «Inventario» metido en una oficina con tarjeta de la empresa
«Pedidos», lo anota en su libreta y hace sonar una alarma (el test falla). En el pasillo hay un **tablero de anuncios**
donde cada empresa pega avisos («Pedido completado») y las demás los leen cuando pueden (eventos entre módulos).

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** una aplicación con dos módulos. El módulo pedidos tiene dos tipos públicos, Pedidos y
PedidoCompletado, y un subpaquete privado pedidos.interno con CalculadoraDeDescuentos, que Pedidos usa. El módulo
inventario tiene Inventario, un listener de módulo. Una flecha muestra que Pedidos publica un evento que recibe
Inventario al confirmarse la transacción. Una flecha punteada de Inventario a CalculadoraDeDescuentos está marcada como
prohibida: verify() falla.

#### 6. EXPLICACIÓN NIVEL 0

Un **monolito modular** es un solo programa dividido por dentro en **módulos** con fronteras claras, como si cada uno
fuera un pequeño servicio pero sin la red de por medio. El problema es que Java deja que cualquier clase pública use
cualquier otra, así que las fronteras se rompen sin que nadie lo note.

**Spring Modulith** es una librería de Spring que:

1. Entiende que cada paquete directo bajo tu clase principal (`academia.modulith.pedidos`,
   `academia.modulith.inventario`) es un **módulo**.
2. Considera **API** lo que está en el paquete raíz del módulo, y **privado** lo que está en subpaquetes.
3. Te da un test (`verify()`) que falla si un módulo entra en lo privado de otro o si hay dependencias en círculo.
4. Facilita que los módulos se avisen con **eventos** en lugar de llamarse directamente.

#### 7. EXPLICACIÓN INTERMEDIA

- **Detección de módulos:** `ApplicationModules.of(ModulithApp.class)` analiza el *bytecode* con ArchUnit y crea un
  módulo por cada subpaquete directo del paquete de la clase `@SpringBootApplication`.
- **Reglas que comprueba `verify()`:** sin ciclos entre módulos; ningún módulo depende de un tipo **no expuesto** de
  otro (los subpaquetes como `pedidos.interno`); y, si declaras `allowedDependencies` en `@ApplicationModule`, solo esas
  dependencias.
- **`@ApplicationModuleListener`** es la combinación de `@TransactionalEventListener` (se ejecuta **después de que la
  transacción que publicó el evento se confirma**), `@Async` (en otro hilo; por eso la aplicación tiene `@EnableAsync`)
  y `@Transactional(propagation = REQUIRES_NEW)` (el listener tiene su propia transacción). Si la transacción de
  `Pedidos.completar` falla, inventario nunca recibe el evento.
- **Qué artefactos necesitas:** `spring-modulith-starter-core` trae `ApplicationModules` y la verificación, pero
  **no** el paquete `org.springframework.modulith.events`; `@ApplicationModuleListener` está en
  `spring-modulith-events-api`, que se declara aparte (o llega con los *starters* del registro de eventos, como
  `spring-modulith-starter-jdbc`).
- **Por qué hay H2 en `build.gradle.kts`:** un listener transaccional necesita un gestor de transacciones; con
  `spring-boot-starter-jdbc` y H2, Spring Boot crea uno sin configuración.
- **`@ApplicationModuleTest`** arranca **solo el módulo** del paquete del test (modo `STANDALONE`), y el parámetro
  `Scenario` permite publicar un evento y esperar a que cambie un estado (`andWaitForStateChange`).

#### 8. EXPLICACIÓN MAESTRA

- **Del monolito modular a microservicios.** Un módulo que solo se comunica con eventos y no comparte tablas es un
  candidato a extraerse con poco dolor: cambias el evento en memoria por un mensaje en un broker (Módulo 6). Por eso
  Spring Modulith es el paso intermedio recomendado antes de partir.
- **Registro de publicaciones de eventos.** Con `spring-modulith-starter-jdbc` (o `-jpa`, `-mongodb`), cada evento se
  guarda en una tabla en la misma transacción y se marca como completado cuando el listener termina; si la aplicación
  se cae, los eventos pendientes se pueden reenviar. Es una forma de *outbox* dentro del monolito (Módulo 25).
- **Alternativas para hacer cumplir fronteras:** (1) **subproyectos de Gradle separados** (Módulo 1, multi-módulo): el
  compilador impide las dependencias, pero cambiar una frontera exige mover código entre artefactos; (2) **JPMS**
  (`module-info.java`): fuerte, pero incómodo con la reflexión de Spring; (3) **ArchUnit a mano** (Módulo 3): flexible,
  pero escribes y mantienes las reglas tú; Spring Modulith te las da hechas para la convención de paquetes.
- **Cuándo NO:** aplicaciones muy pequeñas donde todo es un solo contexto (un módulo no aporta nada), o equipos que ya
  despliegan servicios independientes y no comparten un artefacto. Tampoco es un sustituto de buenas fronteras: si los
  módulos están mal cortados, `verify()` solo te dirá que las dependencias son muchas.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Ejecuta la verificación de la estructura e inspecciona lo que Spring Modulith detectó:
   ```bash
   cd examples/microservicios/modulo-9/f043-modulith
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
  Termina con 1 línea `PASSED` y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*.
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

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9/f043-modulith
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

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*. **Pregunta de
comprobación:** si `Pedidos.completar` lanza una excepción después de `publishEvent`, ¿inventario reserva stock? *(No:
`@ApplicationModuleListener` es transaccional y solo recibe el evento si la transacción se confirma.)*

#### 12. ERROR COMÚN

**Síntoma:** el evento se publica, pero el listener **nunca se ejecuta** y el test con `Scenario` se queda esperando
hasta agotar el tiempo. **Cómo se ve:** el log no muestra `Reservadas ...` y el test termina con una
`org.awaitility.core.ConditionTimeoutException` (Scenario usa Awaitility para esperar). **Diagnóstico:** el método que
publica **no tiene transacción** (le falta `@Transactional`, o lo llamas desde la misma clase y el proxy no actúa), y un
`@TransactionalEventListener` descarta los eventos publicados fuera de una transacción. Pon un punto de interrupción
en `publishEvent` y mira si en la pila aparece `TransactionInterceptor`. **Arreglo:** publica desde un método
`@Transactional` llamado a través del bean (como `Pedidos.completar`), o usa `Scenario.publish(...)`, que ya abre una
transacción.

Otro error real, al compilar en el Mac con solo `spring-modulith-starter-core`:
`Inventario.java:[8,43] package org.springframework.modulith.events does not exist` y `[21,6] cannot find symbol:
class ApplicationModuleListener`. **Diagnóstico:** la anotación vive en otro artefacto. **Arreglo:** agrega
`spring-modulith-events-api` (versión del BOM de Spring Modulith), como en el `build.gradle.kts` de esta ficha.

#### 13. PREGUNTA DE ENTREVISTA

«Tu equipo quiere pasar a microservicios mañana. ¿Por qué propondrías primero un monolito modular con Spring Modulith?»

**Respuesta modelo:** porque valida las fronteras al costo más bajo: cambiar una frontera mal puesta dentro de un
artefacto es mover paquetes, mientras que entre servicios es migrar datos y versionar APIs. Spring Modulith hace las
fronteras **verificables** con un test que falla ante dependencias internas o ciclos, y empuja a comunicar módulos con
eventos transaccionales y un registro de publicaciones, que es justo lo que después se convierte en mensajería entre
servicios. Cuando un módulo demuestra que es independiente y hay una razón de negocio para desplegarlo aparte, se
extrae con el Strangler Fig.

#### 14. ANTI-PATRÓN RELACIONADO

**El paquete `util` o `common` que todos usan:**

```text
academia.tienda
├── common        ← 40 clases: EntidadBase, PedidoHelper, CalculosInventario, Constantes...
├── pedidos       → usa common
├── inventario    → usa common
└── facturacion   → usa common   (y common usa clases de pedidos: ciclo)
```

Se ve como un módulo «compartido» que crece sin dueño y por el que pasan todas las dependencias, de modo que cualquier
cambio rompe a todos y `verify()` reporta ciclos. Deja en `common` solo utilidades técnicas sin reglas de negocio (o
nada); lo que es de un contexto vive en su módulo y se comparte por su API o por eventos.

---

### 12-Factor App

#### 1. UBICACIÓN

Módulo 5, Lección 4 de 6 · Fase 1 · Laboratorio `examples/microservicios/modulo-9/f044-doce-factores/`.

#### 2. PRERREQUISITOS

- Variables de entorno (Módulo 0.4) y perfiles y configuración externalizada (Módulo 1).
- `@ConfigurationProperties`, Bean Validation y MockMvc (Módulos 1, 2 y 3).
- Docker básico (Módulo 0.5): qué es una imagen y un contenedor.

#### 3. OBJETIVO DE APRENDIZAJE

**Aplicar** los doce factores a un servicio Spring Boot (configuración por entorno validada al arrancar, puerto
asignado por la plataforma, logs a la salida estándar, procesos sin estado y apagado ordenado) y **detectar**
violaciones del factor III en un archivo de propiedades; lo compruebas cuando `DoceFactoresTest` y
`RevisorDeConfiguracionTest` pasan 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja **un contenedor de carga marítimo** junto a **una casa de ladrillo**. La casa (aplicación tradicional) tiene la
dirección pintada en la pared, la llave del vecino colgada en la puerta y el diario escrito en un cuaderno del cajón: si
la quieres mover a otra ciudad, hay que derribarla. El contenedor (aplicación de doce factores) es **idéntico en todos
los puertos**: por fuera lleva una **etiqueta pegada** con el destino y el código de la carga (variables de entorno),
no tiene nada pintado; dentro no guarda recuerdos del viaje anterior (sin estado); un **tubo** saca todo lo que pasa
adentro hacia una central de monitoreo del puerto (logs a *stdout*); y cuando la grúa toca la bocina, el contenedor
cierra sus puertas ordenadamente antes de que lo levanten (apagado ordenado). La grúa puede poner diez contenedores
iguales uno al lado del otro (escalar horizontalmente).

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** flujo de izquierda a derecha. El código de un solo repositorio se construye una vez en un JAR
inmutable. Ese JAR se combina con variables de desarrollo en un release DEV y con variables de producción en un release
PROD. El release PROD corre como dos procesos iguales en el puerto 8080; ambos envían sus logs por la salida estándar a
la plataforma de logs y se conectan a PostgreSQL mediante la variable BD_URL. Un orquestador consulta el health de un
proceso y le envía SIGTERM para apagarlo.

#### 6. EXPLICACIÓN NIVEL 0

**La aplicación de doce factores** (*The Twelve-Factor App*, publicada por ingenieros de Heroku en 2011) es una lista de
12 buenas costumbres para que un programa se pueda **desplegar en la nube muchas veces, en muchos entornos, sin
cambiar su código**. Las más importantes para empezar:

- **III · Configuración:** lo que cambia entre entornos (direcciones, contraseñas) **no se escribe en el código**: llega
  por variables de entorno.
- **VI · Procesos sin estado:** el programa no guarda nada importante en su memoria entre peticiones; si se reinicia,
  no se pierde nada.
- **VII · Asignación de puertos:** el programa trae su propio servidor web y escucha en el puerto que le digan.
- **IX · Desechabilidad:** arranca rápido y se apaga ordenadamente cuando se lo piden.
- **XI · Logs:** escribe lo que pasa en la pantalla (salida estándar); otro sistema se encarga de guardarlo.

#### 7. EXPLICACIÓN INTERMEDIA

| # | Factor | Cómo se ve en Spring Boot 4 |
|---|---|---|
| I | Un código base, muchos despliegues | un repositorio por servicio (o carpeta en un monorepo), el mismo commit en dev y prod |
| II | Dependencias declaradas | `build.gradle.kts` + catálogo de versiones + `./gradlew` (Gradle Wrapper): nada instalado «a mano» en el servidor |
| III | Configuración en el entorno | `TIENDA_MONEDA` → `tienda.moneda` (enlace relajado); `@ConfigurationProperties` + `@Validated` |
| IV | Servicios de respaldo como recursos | `spring.datasource.url=${BD_URL}`: cambiar de base es cambiar una variable |
| V | Build, release, run separados | `./gradlew build` produce un JAR; el release es JAR + configuración; nunca se edita en producción |
| VI | Procesos sin estado | sin sesión HTTP en memoria; el estado va a la base de datos o a Redis (Módulo 4) |
| VII | Asignación de puertos | Tomcat embebido; `server.port=${PORT:8080}` |
| VIII | Concurrencia | más réplicas del mismo proceso (Kubernetes, Módulo 12), no hilos gigantes |
| IX | Desechabilidad | apagado ordenado (`server.shutdown=graceful` es el valor por defecto en Boot 4) y arranque rápido (CRaC, nativo: Módulo 1) |
| X | Paridad dev/prod | la misma PostgreSQL 18.7 en Docker Compose que en producción, no H2 «porque es más fácil» |
| XI | Logs como flujos de eventos | Logback escribe en la consola; nada de archivos locales rotados a mano |
| XII | Procesos de administración | migraciones (Flyway, Módulo 2) como tareas de una sola vez con el mismo código |

En el laboratorio: `TiendaProperties` valida `moneda` (3 letras mayúsculas) y `descuentoMaximo` (0 a 50); si una
variable trae un valor inválido, **la aplicación no arranca**. El `RevisorDeConfiguracion` es un pequeño programa Java
puro que lee un `application.properties` y señala secretos y direcciones fijas.

#### 8. EXPLICACIÓN MAESTRA

- **Variables de entorno frente a otras fuentes.** Las variables son universales pero planas y visibles con `ps e` o
  `docker inspect`. Para **secretos** conviene un gestor (Vault, Módulo 9; Kubernetes Secrets montados como archivos con
  `spring.config.import=configtree:`); para configuración **compartida y dinámica**, un Config Server (Módulo 7). Los
  doce factores fijan el principio (separar configuración de código), no la herramienta.
- **Paridad dev/prod contra comodidad.** H2 en memoria arranca en milisegundos, pero sus diferencias de SQL con
  PostgreSQL esconden errores hasta producción; Testcontainers o Docker Compose cuestan unos segundos y eliminan esa
  clase de fallos.
- **Más allá de los doce.** Kevin Hoffman propuso en *Beyond the Twelve-Factor App* (2016) agregar «API primero»,
  «telemetría» y «autenticación y autorización». En microservicios, la observabilidad (Módulo 10) es tan obligatoria como
  los logs.
- **Cuándo NO aplicarlos al pie de la letra:** herramientas de escritorio, trabajos *batch* que corren una vez en una
  máquina conocida o sistemas embebidos. Y el factor VI no prohíbe el estado: prohíbe guardarlo **en el proceso**; una
  base de datos o una caché distribuida son el lugar correcto.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Revisa dos archivos de configuración con el revisor (solo JDK):
   ```bash
   cd examples/microservicios/modulo-9/f044-doce-factores
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

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9/f044-doce-factores
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

**Output esperado:** 5 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*. **Pregunta de
comprobación:** ¿qué factor violas si guardas el carrito de compras en un `HashMap` del controlador y tienes dos
réplicas? *(El VI: cada réplica tiene un carrito distinto y un reinicio lo borra; el estado debe ir a un servicio de
respaldo como Redis o la base de datos.)*

#### 12. ERROR COMÚN

**Síntoma:** en tu máquina todo funciona, pero en el servidor la aplicación se conecta a una base equivocada o falla al
arrancar con `Connection to localhost:5432 refused`. **Cómo se ve:** el revisor lo detecta antes de desplegar (salida
real):

```text
✘ línea 2: dirección de un entorno concreto (spring.datasource.url)
```

**Diagnóstico:** una dirección o un secreto del entorno de desarrollo quedó escrito en `application.properties` y viajó
dentro del JAR. Revisa las propiedades efectivas con `/actuator/env` (en un entorno seguro) o busca `localhost` y
`password` en `src/main/resources`. **Arreglo:** usa `${VARIABLE}` para todo lo que cambia por entorno, define las
variables en el despliegue (Docker Compose, Kubernetes) y deja en el archivo solo valores por defecto inocuos.

Otro error real, de la primera versión del test `unaConfiguracionInvalidaImpideArrancar` en el Mac:

```text
Expecting code to raise a throwable.
```

**Diagnóstico:** el test arrancaba la aplicación con `new SpringApplicationBuilder(...).properties("tienda.moneda=pesos")`,
y `properties(...)` define **propiedades por defecto**, la fuente con **menos** prioridad de Spring Boot: el
`tienda.moneda=COP` de `application.properties` la tapaba, la configuración era válida y la aplicación arrancaba sin
lanzar nada. La validación sí estaba activa (`@Validated` y `spring-boot-starter-validation`). **Arreglo:** pasar el
valor por una fuente con más prioridad que el archivo, como argumentos de línea de comandos
(`.run("--tienda.moneda=pesos")`) o variables de entorno. Regla para recordar: línea de comandos > variables de
entorno > `application.properties` > propiedades por defecto.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué significa que un microservicio sea *stateless* y por qué importa para escalar?»

**Respuesta modelo:** que ninguna petición depende de algo guardado en la memoria o el disco local de **esa**
instancia: sesiones, carritos, archivos subidos o cachés locales con datos que no se pueden perder viven en servicios de
respaldo (base de datos, Redis, almacenamiento de objetos). Así el balanceador puede mandar cada petición a cualquier
réplica, el orquestador puede matar y crear réplicas en cualquier momento (factores VIII y IX) y un reinicio no pierde
datos. Las cachés locales siguen siendo válidas si son solo una optimización reconstruible.

#### 14. ANTI-PATRÓN RELACIONADO

**Un artefacto distinto por entorno:**

```text
✘ tienda-dev.jar   (application.properties con la BD de desarrollo)
✘ tienda-qa.jar    (recompilado con la BD de QA)
✘ tienda-prod.jar  (recompilado «igual» pero un viernes a las 6 p. m.)
```

Se ve como un pipeline que compila tres veces y como errores que solo aparecen en producción porque lo que se probó en
QA no es exactamente lo que se desplegó. Construye **un** artefacto, versiónalo y promuévelo entre entornos cambiando
solo la configuración.

---

### Strangler Fig Pattern

#### 1. UBICACIÓN

Módulo 5, Lección 5 de 6 · Fase 1 · Laboratorio `examples/microservicios/modulo-9/f045-strangler-fig/`. Lo retomas a
escala real en el Módulo 31 (migración desde un monolito).

#### 2. PRERREQUISITOS

- HTTP: métodos, códigos de estado y cabeceras (Módulo 0.4).
- Spring MVC y `@ConfigurationProperties` (Módulos 1 y 2).
- Contextos delimitados (tema 2): la capa anticorrupción protege el modelo del contexto nuevo.

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** una fachada que enruta cada petición al monolito o al servicio nuevo según una tabla de rutas,
**migrar** una funcionalidad cambiando una sola regla y **traducir** los datos heredados con una capa anticorrupción;
lo compruebas cuando `TablaDeRutasTest`, `CapaAnticorrupcionTest` y `FachadaStranglerTest` pasan 10 de 10.

#### 4. ANALOGÍA VISUAL

Dibuja **un higuerón estrangulador** (*strangler fig*) creciendo sobre un árbol viejo en la selva. En el primer cuadro,
una semilla cae en la copa del árbol viejo y baja una raíz delgada. En el segundo, varias raíces abrazan el tronco: el
árbol viejo sigue vivo y dando sombra. En el tercero, el higuerón forma una malla de raíces gruesas y el árbol viejo
se ve cada vez menos. En el cuarto, el árbol viejo desapareció y el higuerón está en pie solo, con la forma del tronco
original hueca por dentro. Al pie de cada cuadro, un letrero: «la selva nunca se quedó sin sombra». Ahora superpón un
**portero** en la entrada del bosque (la fachada) con un tablero que dice qué caminos ya llevan al higuerón.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    C["Clientes<br/>(web, app)"] --> F{"Fachada Strangler<br/>tabla de rutas"}
    F -- "/cotizaciones/** → nuevo" --> N["Servicio nuevo<br/>Cotización"]
    F -- "todo lo demás → monolito" --> M["Monolito"]
    N --> ACL["Capa anticorrupción<br/>COD_ZONA=Z03 → METROPOLITANA"]
    ACL -. "lee tarifas heredadas" .-> M
```

**Texto alternativo:** los clientes llaman a una fachada con una tabla de rutas. La fachada envía las rutas que
empiezan por /cotizaciones al servicio nuevo de Cotización y todo lo demás al monolito. El servicio nuevo usa una capa
anticorrupción que traduce los códigos heredados (por ejemplo, la zona Z03 a METROPOLITANA) cuando lee tarifas del
monolito.

#### 6. EXPLICACIÓN NIVEL 0

Reescribir un sistema grande desde cero y cambiarlo «de un solo golpe» casi siempre sale mal: tarda años, el negocio
no se detiene y el sistema nuevo nunca alcanza al viejo. El **patrón Strangler Fig** (nombrado por Martin Fowler en
2004) propone otra cosa:

1. Pones una **fachada** delante del sistema viejo: todo el tráfico pasa por ella.
2. Construyes **una** funcionalidad en el sistema nuevo.
3. Cambias la fachada para que **esa** funcionalidad vaya al sistema nuevo; el resto sigue yendo al viejo.
4. Repites hasta que el sistema viejo no reciba tráfico y lo apagas.

Si algo sale mal, **revertir es cambiar una línea** de la tabla de rutas.

#### 7. EXPLICACIÓN INTERMEDIA

- **La tabla de rutas** (`TablaDeRutas`) recibe reglas `prefijo->destino`. Compara por **segmentos**:
  `/cotizaciones` atrapa `/cotizaciones/7` pero **no** `/cotizaciones-pdf/7`. Si varias reglas coinciden, gana el
  **prefijo más largo**, lo que permite devolver una subruta al monolito (`/cotizaciones/masivas->monolito`).
- **La fachada** (`FachadaStrangler`) es un controlador `@RequestMapping("/**")` que reenvía método, ruta, *query
  string*, `Content-Type` y cuerpo con `RestClient`, y devuelve el código de estado del destino tal cual (los 4xx/5xx no
  se convierten en excepción gracias a `onStatus(estado -> true, ...)`). Añade la cabecera `X-Servido-Por` para que
  veas quién atendió.
- **La configuración** sale de `strangler.destinos.*` y `strangler.rutas`; como es configuración, se puede cambiar por
  entorno: `STRANGLER_RUTAS="/cotizaciones->nuevo,/clientes->nuevo"`.
- **La capa anticorrupción** (`CapaAnticorrupcion`) traduce el registro heredado
  `COD_ZONA=Z03|TARIFA_X_KG=1250,50|BASE=5000|IND_ACTIVO=S` a `Tarifa(METROPOLITANA, 1250.50, 5000)`. Los nombres
  heredados, la coma decimal y los códigos `Z01/Z03/Z07` mueren en esa clase: el dominio nuevo nunca los ve. Un código
  desconocido se rechaza en la frontera.

#### 8. EXPLICACIÓN MAESTRA

- **¿Dónde va la fachada?** Opciones: (1) un controlador Spring como el del laboratorio, didáctico y fácil de probar;
  (2) **Spring Cloud Gateway** (Módulo 7), con rutas declarativas, filtros y reintentos; (3) el **proxy inverso** que ya
  tienes (NGINX, un *ingress* de Kubernetes, un API Gateway en la nube). En producción suele ser (2) o (3); lo que
  importa es que el enrutamiento sea configuración versionada y reversible.
- **Técnicas de corte del tráfico:** por ruta (este laboratorio), por porcentaje (*canary*, Módulo 12), por usuario o
  por cabecera. Antes de mover tráfico real se usa el **modo sombra**: la fachada responde con el monolito y en
  paralelo llama al servicio nuevo solo para comparar respuestas.
- **El problema difícil son los datos.** Mientras conviven, el servicio nuevo necesita datos que viven en la base del
  monolito: los lee a través de una API del monolito con capa anticorrupción, los replica con CDC (Debezium, Módulo 25)
  o escribe en ambos lados durante una ventana controlada. La escritura doble sin *outbox* es una fuente clásica de
  inconsistencias.
- **Alternativas al Strangler Fig:** *big bang rewrite* (alto riesgo; solo para sistemas pequeños), *branch by
  abstraction* (la sustitución ocurre dentro del código del monolito detrás de una interfaz; útil cuando la
  funcionalidad no tiene una ruta HTTP propia) y *parallel run* (ambos sistemas procesan todo y se comparan; caro, pero
  usado en dominios regulados).
- **Cuándo NO:** si el monolito no tiene una costura por donde interceptar (todo es un proceso *batch* nocturno), si el
  sistema es pequeño y se reescribe en semanas, o si la razón para migrar no está clara: el patrón reduce el riesgo de
  la migración, no la justifica.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Prueba la capa anticorrupción (solo JDK):
   ```bash
   cd examples/microservicios/modulo-9/f045-strangler-fig
   java src/main/java/academia/strangler/CapaAnticorrupcion.java
   ```
2. Levanta el «monolito» y el «servicio nuevo» en dos terminales, y la fachada en una tercera:
   ```bash
   java servidores-falsos/ServidorFalso.java monolito 8081      # terminal 1
   java servidores-falsos/ServidorFalso.java nuevo 8082         # terminal 2
   ../gradlew -q bootRun                                   # terminal 3 (fachada en :8080)
   ```
3. En una cuarta terminal, pide tres rutas a la fachada:
   ```bash
   curl -s -i localhost:8080/cotizaciones/7 | grep -E "X-Servido-Por|atendió"
   curl -s localhost:8080/cotizaciones-pdf/7; echo
   curl -s localhost:8080/clientes/1; echo
   ```
4. **Migra `/clientes`:** detén la fachada (`Ctrl+C`) y arráncala con la regla nueva, sin tocar código:
   ```bash
   STRANGLER_RUTAS="/cotizaciones->nuevo,/clientes->nuevo" ../gradlew -q bootRun
   ```
   Repite `curl -s localhost:8080/clientes/1`. Para **revertir**, vuelve a arrancar sin la variable.

**Output esperado:**

Paso 1 (salida real con JDK 25.0.5):

```text
OK      Tarifa[zona=METROPOLITANA, precioPorKg=1250.50, basePesos=5000]
RECHAZO zona heredada desconocida: Z09
RECHAZO tarifa inactiva para Z07
```

- Paso 2: cada servidor falso imprime su línea de arranque (salida real):
  ```text
  monolito escuchando en http://127.0.0.1:8081
  nuevo escuchando en http://127.0.0.1:8082
  ```
- Paso 3: `X-Servido-Por: nuevo` y `nuevo atendió GET /cotizaciones/7`; después `monolito atendió GET
  /cotizaciones-pdf/7` y `monolito atendió GET /clientes/1`. En el log de la fachada: `GET /cotizaciones/7 -> nuevo
  (200)` y así para cada petición.
- Paso 4: `nuevo atendió GET /clientes/1`.

**Captura comentada:** `/cotizaciones-pdf/7` fue al monolito aunque empieza por las mismas letras: la comparación es
por segmentos. En el paso 4 migraste una funcionalidad completa cambiando una variable de entorno, y revertir es igual
de barato.

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9/f045-strangler-fig
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

**Output esperado:** 10 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)* (5 + 2 + 3). **Pregunta de
comprobación:** ¿qué regla agregas para que `/cotizaciones/masivas` siga en el monolito mientras el resto de
`/cotizaciones` va al servicio nuevo, y por qué funciona? *(`/cotizaciones/masivas->monolito`: gana el prefijo más
largo.)*

#### 12. ERROR COMÚN

**Síntoma:** después de migrar `/cotizaciones`, la descarga de PDF de cotizaciones (que el servicio nuevo todavía no
tiene) empieza a responder 404. **Cómo se ve:** con una comparación de texto ingenua (`ruta.startsWith(prefijo)`), la
petición `GET /cotizaciones-pdf/7` se enruta al servicio nuevo, que no conoce esa ruta; en el log de la fachada aparece
`GET /cotizaciones-pdf/7 -> nuevo (404)`. **Diagnóstico:** mira la cabecera `X-Servido-Por` de la respuesta y el log de
la fachada: el destino no es el que esperabas. Escribe un test con la ruta exacta. **Arreglo:** compara por segmentos
(`ruta.equals(prefijo) || ruta.startsWith(prefijo + "/")`), como `TablaDeRutas`, y cubre con tests las rutas
«vecinas» de cada regla.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo migrarías un monolito de 10 años a microservicios sin detener el negocio?»

**Respuesta modelo:** con el Strangler Fig. Primero, una fachada delante del monolito (gateway o proxy) y
observabilidad para tener una línea base. Después elegiría la primera funcionalidad a extraer por valor y bajo
acoplamiento (una frontera de contexto clara, pocas escrituras compartidas), la construiría en un servicio nuevo con
una capa anticorrupción frente a los datos y conceptos heredados, la probaría en modo sombra comparando respuestas y
movería tráfico de forma gradual y reversible desde la tabla de rutas. Resolvería los datos con APIs, CDC u *outbox*,
nunca leyendo directamente las tablas del otro. Repetiría por funcionalidad, mediría el éxito (errores, latencia,
frecuencia de despliegue) y apagaría las partes del monolito que dejan de recibir tráfico.

#### 14. ANTI-PATRÓN RELACIONADO

**El higuerón que nunca termina de estrangular («migración eterna»):**

```text
2024: fachada + servicio de cotizaciones  ✔
2025: servicio de clientes (pero el monolito sigue escribiendo clientes también)
2026: 7 servicios nuevos · 0 funcionalidades apagadas en el monolito · 2 sistemas que mantener
```

Se ve como un sistema híbrido permanente: el monolito no se apaga nunca, cada cambio se hace en dos lados y el equipo
paga el costo de ambos mundos. Cada extracción debe terminar con el **código y los datos viejos retirados** y una
métrica que lo pruebe (tráfico 0 hacia esa ruta del monolito).

---

### Database-per-service

#### 1. UBICACIÓN

Módulo 5, Lección 6 de 6 · Fase 1 · Laboratorio `examples/microservicios/modulo-9/f046-bd-por-servicio/` (con
`docker-compose.yml` e `initdb/` en la carpeta del módulo).

#### 2. PRERREQUISITOS

- SQL básico, PostgreSQL y JDBC con Spring (Módulo 2).
- Docker Compose (Módulo 0.5).
- Contextos delimitados (tema 2) y Strangler Fig (tema 5).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** una base de datos y un usuario por servicio, **demostrar** que un servicio no puede leer ni unir datos
de otro y **responder** consultas con una copia local alimentada por eventos; lo compruebas cuando `BdPorServicioTest`
pasa 2 de 2 y los tres guiones SQL producen el resultado esperado.

#### 4. ANALOGÍA VISUAL

Dibuja **un edificio de apartamentos**. Cada familia (servicio) tiene su apartamento con **su propia nevera** y su
llave; nadie entra a la cocina del vecino a sacar leche. Si la familia de Facturación necesita saber qué paquetes ya
llegaron, no abre la nevera de Envíos: lee el **tablero del pasillo** donde Envíos pega una nota cada vez que algo
cambia («E-1 entregado») y la copia en **su libreta** (copia local). En el sótano hay un único edificio de servicios
(la instancia de PostgreSQL) con medidores separados por apartamento: comparten la infraestructura, no la comida. En
una esquina del dibujo, un contraejemplo tachado: una nevera comunal en el pasillo donde todos meten y sacan cosas y
nadie sabe quién se comió el queso (la base compartida).

#### 5. DIAGRAMA TÉCNICO

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

**Texto alternativo:** una instancia de PostgreSQL contiene dos bases: envios_db, cuyo dueño es svc_envios y que tiene
la tabla envios, y facturacion_db, cuyo dueño es svc_facturacion y que tiene las tablas cargos y envios_conocidos. El
servicio Envíos usa solo envios_db y el servicio Facturación solo facturacion_db. Una flecha punteada de Facturación a
envios_db está marcada «CONNECT denegado». Envíos envía a Facturación el evento EnvioEntregado.

#### 6. EXPLICACIÓN NIVEL 0

**Database-per-service** (una base de datos por servicio) significa que **cada microservicio es el único dueño de sus
datos**: solo él lee y escribe sus tablas. Si otro servicio necesita esa información, se la **pide** (por una API) o la
**recibe** (por eventos) y guarda su propia copia.

¿Por qué tanto cuidado? Porque si dos servicios comparten tablas, ya no son independientes: un cambio de columna en
uno rompe al otro, y tienen que desplegarse juntos. Es como si dos equipos compartieran el mismo cuaderno: nadie puede
reorganizarlo sin preguntar a todos.

#### 7. EXPLICACIÓN INTERMEDIA

- **Niveles de aislamiento** (de menor a mayor costo): (1) **esquema por servicio** en una misma base, con un rol por
  servicio y permisos solo sobre su esquema; (2) **base de datos por servicio** en la misma instancia (este
  laboratorio); (3) **instancia por servicio**, que aísla también CPU, memoria y versión del motor.
- **Lo que hace cumplir la regla** es el **usuario de base de datos**, no la buena voluntad: `svc_facturacion` no
  tiene `CONNECT` sobre `envios_db` (`REVOKE CONNECT ... FROM PUBLIC`), así que el intento falla con
  `permission denied for database "envios_db"`.
- **Sin JOIN entre servicios.** PostgreSQL no permite consultas que crucen bases de datos (`cross-database references
  are not implemented`). La consulta «factura con estado del envío» se responde con la **copia local**
  `envios_conocidos`, que el servicio actualiza al recibir eventos de Envíos (Módulo 6).
- **En Spring Boot** cada servicio tiene su propio `spring.datasource.url`, usuario y contraseña, que llegan por
  variables de entorno (`FACTURACION_BD_URL`...). `JdbcClient` (Spring Framework 6.1+) hace la consulta.

#### 8. EXPLICACIÓN MAESTRA

- **Consecuencias que debes asumir:** consistencia eventual entre servicios (la copia local va unos milisegundos o
  segundos por detrás), transacciones distribuidas reemplazadas por **sagas** con compensaciones (Módulos 22 y 25),
  consultas transversales mediante **composición de APIs** o **CQRS** con vistas materializadas, y duplicación
  controlada de datos.
- **Cómo mantener las copias:** eventos de dominio publicados con *outbox* (evita la escritura doble), CDC con Debezium
  sobre el WAL de PostgreSQL, o consultas a la API con caché. Cada opción cambia frescura, acoplamiento y costo.
- **Políglota cuando aporta:** cada servicio puede elegir el motor que mejor encaja (PostgreSQL para pagos, MongoDB para
  catálogos, Redis para sesiones), pero cada motor nuevo es un motor más que respaldar, monitorear y actualizar.
- **Cuándo NO (o todavía no):** en un monolito modular basta con **un esquema por módulo** y la regla de no consultar
  tablas ajenas (verificable con Spring Modulith); en sistemas con fuertes necesidades de reportes transaccionales
  cruzados, o con un solo equipo, separar bases agrega costo sin beneficio. Durante un Strangler Fig, la base del
  monolito se comparte temporalmente con una fecha de fin.

#### 9. CÓDIGO EJECUTABLE

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

#### 10. MINI-LABORATORIO

1. Levanta PostgreSQL (el script de `initdb/` crea las dos bases, los usuarios y los datos):
   ```bash
   cd examples/microservicios/modulo-9
   docker compose up -d --wait
   ```
2. Intenta que Facturación entre a la base de Envíos, luego un JOIN entre bases y por último la consulta correcta
   (`psql` del contenedor, así no necesitas instalarlo):
   ```bash
   docker compose exec -T postgres psql "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/envios_db" -f - < f046-bd-por-servicio/sql/02-facturacion-entra-a-envios.sql
   docker compose exec -T postgres psql "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/facturacion_db" -f - < f046-bd-por-servicio/sql/03-join-entre-bases.sql
   docker compose exec -T postgres psql "postgresql://svc_facturacion:facturacion@127.0.0.1:5432/facturacion_db" -f - < f046-bd-por-servicio/sql/04-consulta-con-copia-local.sql
   ```
3. Arranca el servicio y pide una factura: `cd f046-bd-por-servicio && ../gradlew -q bootRun`, y en otra terminal
   `curl -s localhost:8086/facturas/E-1; echo`. Al terminar, `docker compose down`.

**Output esperado** (paso 2; salida real de `psql` con PostgreSQL 16.15, mismos mensajes en 18.7):

```text
psql: error: connection to server at "127.0.0.1", port 5432 failed: FATAL:  permission denied for database "envios_db"
DETAIL:  User does not have CONNECT privilege.
psql:<stdin>:4: ERROR:  cross-database references are not implemented: "envios_db.public.envios"
LINE 2: FROM cargos c JOIN envios_db.public.envios e ON e.id = c.env...
                           ^
 envio_id | total_cop |   estado
----------+-----------+-------------
 E-1      |      8126 | ENTREGADO
 E-2      |      4980 | EN_TRANSITO
(2 rows)
```

Paso 3: `{"envioId":"E-1","totalCop":8126,"estadoEnvio":"ENTREGADO"}`.

**Captura comentada:** el primer error lo produce PostgreSQL **al conectarse**: Facturación ni siquiera llega a ver
las tablas de Envíos. El segundo muestra que no existe el atajo del JOIN. El tercero es la forma correcta: la respuesta
sale solo de tablas que Facturación posee.

#### 11. VERIFICACIÓN

```bash
cd examples/microservicios/modulo-9
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

**Output esperado:** 2 líneas `PASSED` (una por test) y `BUILD SUCCESSFUL` *(salida de Gradle pendiente de verificación en el Mac)*. El mensaje que comprueba el
segundo test es el del driver JDBC (salida real con el driver 42.7.2 sobre PostgreSQL 16.15):
`FATAL: permission denied for database "envios_db"` seguido de `Detail: User does not have CONNECT privilege.` (código
SQLState `42501`). `./verificar.sh` además ejecuta los tres guiones y exige que los dos primeros fallen y el tercero
devuelva `(2 rows)`. **Pregunta de comprobación:** Facturación necesita el nombre del cliente que está en el servicio
de Clientes. Da dos formas de obtenerlo sin leer su base. *(Llamar a la API de Clientes al facturar, con caché y
timeout, o mantener una copia local actualizada con eventos ClienteActualizado.)*

#### 12. ERROR COMÚN

**Síntoma:** «para ir rápido», los servicios usan el mismo usuario `postgres` y una sola base, y alguien hace un JOIN
contra las tablas de otro servicio. Meses después, el equipo de Envíos renombra la columna `estado` a `estado_envio` y
**Facturación se cae en producción** sin haber desplegado nada. **Cómo se ve:** en los logs de Facturación,
`ERROR: column e.estado does not exist` y un pico de errores 500 justo después del despliegue de **otro** servicio.
**Diagnóstico:** busca en el código de cada servicio nombres de tablas que no le pertenecen y revisa con qué usuario se
conecta (`SELECT current_user;`). **Arreglo:** un usuario por servicio con permisos solo sobre su base o esquema, y los
datos ajenos por API o eventos con copia local.

#### 13. PREGUNTA DE ENTREVISTA

«Si cada servicio tiene su base de datos, ¿cómo haces un reporte que necesita datos de cinco servicios?»

**Respuesta modelo:** no con un JOIN entre bases. Para consultas en línea, composición de APIs en un BFF o gateway
(con timeouts y datos parciales aceptables). Para reportes y búsquedas, CQRS: cada servicio publica eventos (con outbox
o CDC) y un servicio de lectura o un *data warehouse* construye vistas materializadas optimizadas para esa consulta,
aceptando consistencia eventual. Si el negocio exige consistencia fuerte en ese reporte, es una señal de que esos datos
quizá pertenezcan al mismo contexto y deban vivir en el mismo servicio.

#### 14. ANTI-PATRÓN RELACIONADO

**Base de datos compartida como mecanismo de integración:**

```sql
-- ✘ El servicio de Facturación, conectado como «postgres», lee y ESCRIBE en tablas de Envíos
UPDATE envios SET estado = 'FACTURADO' WHERE id = 'E-1';
```

Se ve como un diagrama en el que todos los servicios apuntan al mismo cilindro, y como despliegues que requieren
«congelar el esquema» y coordinar a cinco equipos. Es un **monolito distribuido**: tienes la complejidad de la red y el
acoplamiento del monolito a la vez (Módulo 30).

---
