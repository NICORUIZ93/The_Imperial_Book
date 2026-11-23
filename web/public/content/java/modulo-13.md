# Módulo 13: Proyecto integrador

Este módulo junta piezas que antes se trabajaron por separado: dominio, casos de uso, infraestructura, concurrencia, pruebas y build. El objetivo no es hacer un CRUD grande, sino construir una pieza pequeña, completa y verificable que se pueda clonar, ejecutar y entender. En Tienda Aurora, el caso es procesar pedidos pendientes en paralelo sin perder claridad de diseño.

## Visual del módulo

**Visual (diagram-design, estático; fuente `visuals/temas/java/modulo-13-arquitectura.html`; regeneración: editar el HTML/SVG en esa ruta):** [Arquitectura por capas con dependencias apuntando al dominio](/visuals/temas/java/modulo-13-arquitectura.html)

Lectura: Las dependencias apuntan al dominio. La infraestructura implementa puertos; la app solo compone.

## Proyecto desde cero: `tienda-aurora-java-m13`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### Bootstrap

```bash
mkdir -p tienda-aurora-java-m13/src/main/java/com/aurora/integrador/{dominio,aplicacion,infraestructura,app}
mkdir -p tienda-aurora-java-m13/src/test/java/com/aurora/integrador/aplicacion
cd tienda-aurora-java-m13
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-05-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, Mockito 5.18.0, toolchain Java 25.

#### Estructura final

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

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m13"
```

#### `build.gradle.kts`

Fija toolchain Java 25 y dependencias de prueba. El wrapper fija Gradle; con eso el proyecto se construye con los mismos comandos en otra máquina con JDK compatible.

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

#### `dominio/EstadoPedido.java`

Enum del dominio: estados explícitos, sin strings mágicos.

```java
package com.aurora.integrador.dominio;
public enum EstadoPedido { PENDIENTE, PROCESADO, FALLIDO }
```

#### `dominio/Pedido.java`

Record de dominio con invariantes en el constructor compacto. `procesar()/fallar()` devuelven nuevas instancias; no mutan estado. Esto hace más fácil razonar sobre concurrencia y pruebas.

```java
package com.aurora.integrador.dominio;

import java.math.BigDecimal;
import java.util.Objects;

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

    public Pedido procesar() { return new Pedido(id, cliente, total, EstadoPedido.PROCESADO); }
    public Pedido fallar()   { return new Pedido(id, cliente, total, EstadoPedido.FALLIDO); }
}
```

#### `dominio/ResultadoProcesamiento.java`

`sealed interface` con variantes `Ok` y `Error`. El `switch` exhaustivo obliga a manejar ambos casos; si se agrega una variante, el compilador señala dónde falta tratarla.

```java
package com.aurora.integrador.dominio;

public sealed interface ResultadoProcesamiento permits ResultadoProcesamiento.Ok, ResultadoProcesamiento.Error {
    String pedidoId();
    record Ok(String pedidoId, String detalle) implements ResultadoProcesamiento {}
    record Error(String pedidoId, String mensaje) implements ResultadoProcesamiento {}
}
```

#### `dominio/PedidoRepositorio.java`

Puerto de salida: la aplicación depende de esta interfaz, no de una BD concreta. Eso permite probar el caso de uso con Mockito y cambiar la infraestructura sin tocar reglas.

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

#### `infraestructura/RepositorioPedidosEnMemoria.java`

Adaptador de infraestructura. Usa `ConcurrentHashMap` porque los virtual threads pueden guardar resultados concurrentemente.

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

    @Override public Optional<Pedido> porId(String id) { return Optional.ofNullable(datos.get(id)); }

    @Override
    public List<Pedido> pendientes() {
        return datos.values().stream().filter(p -> p.estado() == EstadoPedido.PENDIENTE).toList();
    }

    @Override public void guardar(Pedido pedido) { datos.put(pedido.id(), pedido); }
}
```

#### `aplicacion/ProcesarPedidosUseCase.java`

Caso de uso: carga pendientes, procesa con virtual threads, guarda resultados y devuelve `ResultadoProcesamiento`. Maneja interrupción y fallos por pedido. El dominio decide qué es válido; la aplicación orquesta.

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
            if (pedido.total().signum() == 0) throw new IllegalArgumentException("total cero no permitido");
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

#### `app/App.java`

Composition root: crea repositorio, inyecta caso de uso, ejecuta y renderiza resultados con `switch` exhaustivo sobre sealed type.

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

#### `test/.../ProcesarPedidosUseCaseTest.java`

Pruebas con JUnit 5 + Mockito. Verifican orquestación del caso de uso e invariantes del dominio. El dominio se prueba sin mocks; el caso de uso mockea el puerto.

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

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

Si pones lógica de negocio, SQL/IO y `System.out.println` en la misma clase, el código funciona hasta que cambia algo. Entonces un cambio de BD rompe reglas, o un test necesita levantar toda la app. La arquitectura por capas busca separar responsabilidades y controlar la dirección de dependencias.

En este proyecto, la regla es: `app` compone; `aplicacion` orquesta casos de uso; `dominio` define reglas y puertos; `infraestructura` implementa puertos. Las dependencias apuntan hacia el dominio, no al revés. Esta es la aplicación práctica de Dependency Inversion: `ProcesarPedidosUseCase` depende de `PedidoRepositorio` (interfaz), no de `RepositorioPedidosEnMemoria`.

`Pedido` es un record con invariantes: rechaza id vacío, total negativo o nulos. `ResultadoProcesamiento` es sealed: el compilador obliga a cubrir `Ok` y `Error`. Estos detalles no son “azúcar sintáctico”; hacen que el modelo exprese reglas y que el compilador ayude a no olvidar casos.

El error común es tener carpetas por capas pero sin regla de dependencia. Si infraestructura importa aplicación concreta y aplicación importa infraestructura concreta, solo tienes carpetas. El criterio es: ¿puedo cambiar el adaptador sin tocar la regla de negocio?

### Tema 2: Build reproducible y cierre del track · Intermedio · 40 min

Un proyecto reproducible no depende de “funciona en mi máquina”. El wrapper fija Gradle; `build.gradle.kts` fija toolchain y dependencias; los comandos son explícitos. Cualquier persona con JDK compatible puede clonar y ejecutar.

En el cierre del track Java, la concurrencia, el modelado y el testing se integran en el mismo flujo: virtual threads procesan pedidos, `ConcurrentHashMap` soporta escrituras concurrentes, el dominio mantiene invariantes, y las pruebas cubren dominio puro y orquestación con mocks. No se usan virtual threads para CPU-bound puro; aquí el modelo es útil porque simula tareas que en producción serían I/O o llamadas remotas.

La verificación del cierre debe incluir: build con wrapper, tests verdes, ejecución real, salida observada y límites conocidos. Si un resultado depende del orden concurrente, se documenta: en `run` el orden de líneas puede variar, pero el contenido esperado (`P-2` falla, `P-1/P-3` OK) debe mantenerse.

## Verificación real

Ejecutado el 2026-05-23 en `/tmp/opencode/aurora-m13` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, JUnit 5.13.4, Mockito 5.18.0).

```bash
./gradlew -q test
./gradlew -q run
```

Resultados observados:

- `test`: 2 pruebas, 0 fallas.
- `run`: `ERR P-2 total cero no permitido`, `OK P-1 procesado`, `OK P-3 procesado`. El orden puede variar por concurrencia.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Test necesita BD/infra real | Caso de uso acoplado a implementación | Revisar imports/dependencias | Depender de puerto/interfaz |
| `switch` no exhaustivo tras cambio | Se agregó variante sealed sin cubrir | Error de compilación | Cubrir variante en todos los `switch` |
| Resultado inconsistente en concurrente | Estado mutable compartido sin protección | Revisar colecciones/estado | Usar estructuras concurrentes o confinamiento |
| “Funciona en mi máquina” | Gradle/JDK/deps no fijados | Comparar versiones | Wrapper, toolchain, versiones declaradas |
| Mockear dominio | Test frágil y sin valor | Revisar qué se mockea | Dominio puro; mock solo en puertos |

## Checklist de cierre

- [ ] Puedo explicar la dirección de dependencias entre dominio, aplicación e infraestructura.
- [ ] Puedo justificar por qué `PedidoRepositorio` es una interfaz.
- [ ] Puedo explicar qué aporta `record` y `sealed` aquí.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` con salida real.
- [ ] Entiendo el límite de concurrencia: el orden puede variar, el resultado no.
