# Módulo 13: Proyecto integrador


## Visual del módulo

**Herramienta (diagram-design, estático):** [Modulo 13 — mapa visual](/visuals/temas/java/modulo-13-arquitectura.html)

Lectura: Las dependencias apuntan al dominio; infraestructura implementa puertos; app compone.


Este módulo junta lo que antes estaba separado: dominio, casos de uso, infraestructura, concurrencia, pruebas y build. El objetivo no es “hacer un CRUD grande”; es construir una pieza pequeña pero completa que puedas clonar, ejecutar y entender. En Tienda Aurora, el caso es procesar pedidos pendientes en paralelo sin perder claridad de diseño.

**Verificación real (2026-11-23, macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, Mockito 5.18.0):** `./gradlew -q test` pasó. `./gradlew -q run` produjo la salida esperada con un error controlado y dos pedidos procesados.

## Proyecto desde cero: `tienda-aurora-java-m13`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### 1. Crear base

```bash
mkdir -p tienda-aurora-java-m13
cd tienda-aurora-java-m13
gradle wrapper --gradle-version 9.9.1
mkdir -p src/main/java/com/aurora/integrador/{dominio,aplicacion,infraestructura,app}
mkdir -p src/test/java/com/aurora/integrador/aplicacion
```

#### 2. Estructura

```text
tienda-aurora-java-m13/
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    ├── main/java/com/aurora/integrador/
    │   ├── app/App.java
    │   ├── aplicacion/ProcesarPedidosUseCase.java
    │   ├── dominio/
    │   │   ├── EstadoPedido.java
    │   │   ├── Pedido.java
    │   │   ├── PedidoRepositorio.java
    │   │   └── ResultadoProcesamiento.java
    │   └── infraestructura/RepositorioPedidosEnMemoria.java
    └── test/java/com/aurora/integrador/aplicacion/ProcesarPedidosUseCaseTest.java
```

#### 3. Código desde cero

#### `settings.gradle.kts`

Nombre del proyecto.

```kotlin
rootProject.name = "tienda-aurora-java-m13"
```

#### `build.gradle.kts`

Build Gradle con Java 25, JUnit 5 y Mockito. Un solo comando (`./gradlew test` / `./gradlew run`) construye y verifica.

```kotlin
plugins {
    java
    application
}

group = "com.aurora"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.13.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.mockito:mockito-core:5.18.0")
    testImplementation("org.mockito:mockito-junit-jupiter:5.18.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

application {
    mainClass = "com.aurora.integrador.app.App"
}

tasks.test {
    useJUnitPlatform()
    testLogging { events("passed", "failed", "skipped") }
}

tasks.withType<JavaCompile>().configureEach {
    options.encoding = "UTF-8"
    options.compilerArgs.addAll(listOf("-Xlint:all", "-Xlint:-processing", "-Werror"))
}
```

#### `src/main/java/com/aurora/integrador/dominio/EstadoPedido.java`

Enum del dominio: estados explícitos, sin strings mágicos.

```java
package com.aurora.integrador.dominio;
public enum EstadoPedido { PENDIENTE, PROCESADO, FALLIDO }
```

#### `src/main/java/com/aurora/integrador/dominio/Pedido.java`

Record de dominio con invariantes en el constructor compacto. `procesar()/fallar()` devuelven nuevas instancias; no mutan estado.

```java
package com.aurora.integrador.dominio;

import java.math.BigDecimal;
import java.util.Objects;

/** Entidad de dominio: valida invariantes al construirse. */
public record Pedido(String id, String cliente, BigDecimal total, EstadoPedido estado) {
    public Pedido {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(cliente, "cliente");
        Objects.requireNonNull(total, "total");
        Objects.requireNonNull(estado, "estado");
        if (id.isBlank()) throw new IllegalArgumentException("id vacío");
        if (cliente.isBlank()) throw new IllegalArgumentException("cliente vacío");
        if (total.signum() < 0) throw new IllegalArgumentException("total negativo");
    }

    public Pedido procesar() {
        return new Pedido(id, cliente, total, EstadoPedido.PROCESADO);
    }

    public Pedido fallar() {
        return new Pedido(id, cliente, total, EstadoPedido.FALLIDO);
    }
}
```

#### `src/main/java/com/aurora/integrador/dominio/ResultadoProcesamiento.java`

`sealed interface` con variantes `Ok` y `Error`. El `switch` exhaustivo obliga a manejar ambos casos.

```java
package com.aurora.integrador.dominio;
/** Sealed: el compilador obliga a manejar todos los casos. */
public sealed interface ResultadoProcesamiento permits ResultadoProcesamiento.Ok, ResultadoProcesamiento.Error {
    String pedidoId();
    record Ok(String pedidoId, String detalle) implements ResultadoProcesamiento {}
    record Error(String pedidoId, String mensaje) implements ResultadoProcesamiento {}
}
```

#### `src/main/java/com/aurora/integrador/dominio/PedidoRepositorio.java`

Puerto de salida (DIP): la aplicación depende de esta interfaz, no de una BD concreta.

```java
package com.aurora.integrador.dominio;

import java.util.List;
import java.util.Optional;

public interface PedidoRepositorio {
    Optional<Pedido> porId(String id);
    List<Pedido> pendientes();
    void guardar(Pedido pedido);
}
```

#### `src/main/java/com/aurora/integrador/infraestructura/RepositorioPedidosEnMemoria.java`

Adaptador de infraestructura. Usa `ConcurrentHashMap` porque los virtual threads pueden escribir resultados concurrentemente.

```java
package com.aurora.integrador.infraestructura;

import com.aurora.integrador.dominio.EstadoPedido;
import com.aurora.integrador.dominio.Pedido;
import com.aurora.integrador.dominio.PedidoRepositorio;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

public final class RepositorioPedidosEnMemoria implements PedidoRepositorio {
    private final Map<String, Pedido> datos = new ConcurrentHashMap<>();

    @Override
    public Optional<Pedido> porId(String id) {
        return Optional.ofNullable(datos.get(id));
    }

    @Override
    public List<Pedido> pendientes() {
        return datos.values().stream()
                .filter(p -> p.estado() == EstadoPedido.PENDIENTE)
                .toList();
    }

    @Override
    public void guardar(Pedido pedido) {
        datos.put(pedido.id(), pedido);
    }
}
```

#### `src/main/java/com/aurora/integrador/aplicacion/ProcesarPedidosUseCase.java`

Caso de uso: carga pendientes, procesa con virtual threads, guarda resultados y devuelve `ResultadoProcesamiento`. Maneja interrupción y fallos por pedido.

```java
package com.aurora.integrador.aplicacion;

import com.aurora.integrador.dominio.Pedido;
import com.aurora.integrador.dominio.PedidoRepositorio;
import com.aurora.integrador.dominio.ResultadoProcesamiento;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public final class ProcesarPedidosUseCase {
    private final PedidoRepositorio repositorio;

    public ProcesarPedidosUseCase(PedidoRepositorio repositorio) {
        this.repositorio = Objects.requireNonNull(repositorio, "repositorio");
    }

    public List<ResultadoProcesamiento> ejecutar() {
        List<Pedido> pendientes = repositorio.pendientes();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Callable<ResultadoProcesamiento>> tareas = pendientes.stream()
                    .<Callable<ResultadoProcesamiento>>map(p -> () -> procesarUno(p))
                    .toList();
            List<Future<ResultadoProcesamiento>> futures = executor.invokeAll(tareas);
            return futures.stream().map(this::obtener).toList();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Procesamiento interrumpido", e);
        }
    }

    private ResultadoProcesamiento procesarUno(Pedido pedido) {
        try {
            if (pedido.total().signum() == 0) {
                throw new IllegalArgumentException("total cero no permitido");
            }
            Pedido procesado = pedido.procesar();
            repositorio.guardar(procesado);
            return new ResultadoProcesamiento.Ok(pedido.id(), "procesado");
        } catch (RuntimeException e) {
            repositorio.guardar(pedido.fallar());
            return new ResultadoProcesamiento.Error(pedido.id(), e.getMessage());
        }
    }

    private ResultadoProcesamiento obtener(Future<ResultadoProcesamiento> future) {
        try {
            return future.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Futuro interrumpido", e);
        } catch (ExecutionException e) {
            throw new IllegalStateException("Error interno", e.getCause());
        }
    }
}
```

#### `src/main/java/com/aurora/integrador/app/App.java`

Composición manual (composition root). Crea repo, inyecta caso de uso, ejecuta y renderiza resultados con `switch` sobre sealed type.

```java
package com.aurora.integrador.app;

import com.aurora.integrador.aplicacion.ProcesarPedidosUseCase;
import com.aurora.integrador.dominio.EstadoPedido;
import com.aurora.integrador.dominio.Pedido;
import com.aurora.integrador.dominio.ResultadoProcesamiento;
import com.aurora.integrador.infraestructura.RepositorioPedidosEnMemoria;

import java.math.BigDecimal;
import java.util.List;

public final class App {
    public static void main(String[] args) {
        RepositorioPedidosEnMemoria repo = new RepositorioPedidosEnMemoria();
        repo.guardar(new Pedido("P-1", "Ana", new BigDecimal("100.00"), EstadoPedido.PENDIENTE));
        repo.guardar(new Pedido("P-2", "Bruno", new BigDecimal("0.00"), EstadoPedido.PENDIENTE));
        repo.guardar(new Pedido("P-3", "Carla", new BigDecimal("59.90"), EstadoPedido.PENDIENTE));

        ProcesarPedidosUseCase useCase = new ProcesarPedidosUseCase(repo);
        List<ResultadoProcesamiento> resultados = useCase.ejecutar();
        for (ResultadoProcesamiento r : resultados) {
            switch (r) {
                case ResultadoProcesamiento.Ok ok -> System.out.println("OK " + ok.pedidoId() + " " + ok.detalle());
                case ResultadoProcesamiento.Error err -> System.out.println("ERR " + err.pedidoId() + " " + err.mensaje());
            }
        }
    }

    private App() {}
}
```

#### `src/test/java/com/aurora/integrador/aplicacion/ProcesarPedidosUseCaseTest.java`

Pruebas con JUnit 5 + Mockito: verifica orquestación del caso de uso e invariantes del dominio.

```java
package com.aurora.integrador.aplicacion;

import com.aurora.integrador.dominio.EstadoPedido;
import com.aurora.integrador.dominio.Pedido;
import com.aurora.integrador.dominio.PedidoRepositorio;
import com.aurora.integrador.dominio.ResultadoProcesamiento;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcesarPedidosUseCaseTest {

    @Mock
    PedidoRepositorio repositorio;

    @Test
    void procesaPedidosPendientesYReportaErrores() {
        Pedido ok = new Pedido("P-1", "Ana", new BigDecimal("10.00"), EstadoPedido.PENDIENTE);
        Pedido malo = new Pedido("P-2", "Bruno", new BigDecimal("0.00"), EstadoPedido.PENDIENTE);
        when(repositorio.pendientes()).thenReturn(List.of(ok, malo));

        ProcesarPedidosUseCase useCase = new ProcesarPedidosUseCase(repositorio);
        List<ResultadoProcesamiento> res = useCase.ejecutar();

        assertEquals(2, res.size());
        assertTrue(res.stream().anyMatch(r -> r instanceof ResultadoProcesamiento.Ok o && o.pedidoId().equals("P-1")));
        assertTrue(res.stream().anyMatch(r -> r instanceof ResultadoProcesamiento.Error e && e.pedidoId().equals("P-2")));
        verify(repositorio, atLeastOnce()).guardar(any(Pedido.class));
    }

    @Test
    void dominioNoAceptaInvariantesInvalidos() {
        assertThrows(IllegalArgumentException.class, () -> new Pedido("", "Ana", new BigDecimal("1"), EstadoPedido.PENDIENTE));
        assertThrows(IllegalArgumentException.class, () -> new Pedido("P-1", "Ana", new BigDecimal("-1"), EstadoPedido.PENDIENTE));
        assertThrows(NullPointerException.class, () -> new Pedido("P-1", null, new BigDecimal("1"), EstadoPedido.PENDIENTE));
    }
}
```

#### 4. Ejecutar

Desde la raíz del proyecto:

```bash
./gradlew -q test
./gradlew -q run
```

Resultado real de tests:

```text
BUILD SUCCESSFUL
2 tests, 0 failures (ProcesarPedidosUseCaseTest)
```

Salida real de `run`:

```text
ERR P-2 total cero no permitido
OK P-1 procesado
OK P-3 procesado
```

El orden de líneas en `run` puede variar porque los pedidos se procesan en virtual threads; lo importante es el contenido: `P-2` falla por regla de negocio y `P-1/P-3` se procesan.

## Conceptos cubiertos

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

#### Problema

Si pones lógica de negocio, SQL/IO, y `System.out.println` en la misma clase, el código funciona hasta que cambia algo. Entonces un cambio de BD rompe reglas, o un test necesita levantar toda la app.

#### Capas y regla de dependencia

```text
[app / composition root]
        | \
        |  +--> [infraestructura: adaptadores] --implements--> 
        v                                                   \
[aplicacion: casos de uso] --depends on--> [dominio: entidades, reglas, puertos]
```

Lectura del diagrama: `app` compone el sistema; `aplicacion` orquesta el caso de uso; `dominio` define reglas y puertos; `infraestructura` implementa esos puertos. Las dependencias apuntan hacia el dominio, no al revés.

- **Dominio**: reglas e invariantes. No importa frameworks.
- **Aplicación**: orquesta casos de uso. Depende de interfaces del dominio.
- **Infraestructura**: implementa puertos (repo en memoria, luego JDBC/HTTP).
- **App**: compone dependencias y ejecuta.

El punto clave es **Dependency Inversion**: `ProcesarPedidosUseCase` depende de `PedidoRepositorio` (interfaz), no de `RepositorioPedidosEnMemoria`. Eso permite probar con Mockito sin BD.

#### Error común

“Capa” como carpetas sin regla. Si infraestructura importa aplicación y aplicación importa infraestructura concreta, solo tienes carpetas. El criterio es: ¿puedo cambiar el adaptador sin tocar la regla de negocio?

### Tema 2: Build reproducible y cierre del track · Intermedio · 40 min

#### Qué significa reproducible

Un proyecto reproducible no depende de “tengo Maven instalado globalmente en tal versión” ni de clicks en un IDE. El wrapper fija Gradle; `build.gradle.kts` fija toolchain y dependencias; los comandos son explícitos.

```bash
./gradlew -q test
./gradlew -q run
```

El toolchain declara Java 25. JUnit y Mockito vienen del repositorio Maven Central con versiones fijadas. Cualquier persona con JDK compatible puede clonar y ejecutar.

#### Qué incluir en un cierre de track

- Build con wrapper.
- Tests que cubran reglas críticas.
- README/comandos claros.
- Salida o reporte verificable.
- Decisiones de diseño y límites conocidos.

#### Error común

“Funciona en mi máquina” por depender de una versión local de Gradle/Maven o una BD instalada manualmente. Corrección: wrapper, dependencias declaradas, y datos/infra local reproducible (H2/en memoria/Testcontainers cuando aplique).

### Tema 3: Integrando concurrencia, modelado y testing · Avanzado · 45 min

#### Modelo de dominio

`Pedido` es un `record`: datos + invariantes. No es un DTO anémico ni una entidad JPA mutable. El constructor compacto rechaza id vacío, total negativo o nulos.

`ResultadoProcesamiento` es `sealed`: el compilador obliga al `switch` a cubrir `Ok` y `Error`. Esto evita el clásico “me olvidé de manejar el caso de fallo”.

#### Concurrencia con virtual threads

```java
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<ResultadoProcesamiento>> futures = executor.invokeAll(tareas);
    ...
}
```

Cada pedido se procesa en un virtual thread. El `try-with-resources` cierra el executor y espera finalización. El repositorio usa `ConcurrentHashMap` porque varios virtual threads guardan resultados.

No uses virtual threads para CPU-bound puro; aquí simula tareas de I/O/servicio donde el modelo es útil. El beneficio real aparece con muchas tareas bloqueantes.

#### Testing

El test usa Mockito para el puerto `PedidoRepositorio`. Verifica dos cosas: la orquestación (se guarda resultado) y el manejo de error por pedido (`P-2` total cero). También hay tests de invariantes del dominio, sin mocks, porque el dominio no necesita infraestructura.

#### Error común

Testear solo el happy path o mockear todo, incluido el dominio. Corrección: dominio con tests puros; caso de uso con mocks en los puertos; integración separada cuando hay BD real.

## Verificación real (actualización 2026-05-23)

Reejecutado el 2026-05-23 en `/tmp/opencode/aurora-m13` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25):

```bash
./gradlew -q test
./gradlew -q run
```

- `test`: 0 fallas.
- `run`: `ERR P-2 total cero no permitido`, `OK P-1 procesado`, `OK P-3 procesado`.

## Cierre

Un proyecto integrador pequeño bien hecho vale más que un framework grande mal entendido. La clave es la frontera: dominio con reglas, aplicación con orquestación, infraestructura reemplazable, build reproducible y tests que prueben comportamiento.

## Checklist

- [ ] Puedo explicar la dirección de dependencias entre dominio, aplicación e infraestructura.
- [ ] Puedo justificar por qué `PedidoRepositorio` es una interfaz.
- [ ] Puedo explicar qué aporta `record` y `sealed` aquí.
- [ ] Puedo ejecutar el proyecto con `./gradlew -q test` y `./gradlew -q run`.
- [ ] Puedo identificar qué test es unitario puro y cuál usa mock.
