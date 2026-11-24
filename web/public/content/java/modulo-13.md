# Módulo 13: Proyecto integrador

Este módulo junta piezas trabajadas por separado: dominio, casos de uso, infraestructura, concurrencia, pruebas y build. El objetivo no es un CRUD grande, sino una pieza pequeña, completa y verificable. En Tienda Aurora, el caso es procesar pedidos pendientes con virtual threads sin perder claridad de diseño.

## Visual del módulo

**Visual:** [Arquitectura por capas con dependencias apuntando al dominio](/visuals/temas/java/modulo-13-arquitectura.html)

Lectura: Las dependencias apuntan al dominio. La infraestructura implementa puertos; la app solo compone.

## Proyecto desde cero: `tienda-aurora-java-m13`

#### Prerrequisitos

```bash
java -version
gradle --version
```

#### Bootstrap

Ejecuta estos comandos desde el directorio donde quieras crear el proyecto. Las rutas son completas y relativas a ese directorio; no hay rutas abreviadas.

```bash
mkdir -p tienda-aurora-java-m13/src/main/java/com/aurora/integrador/dominio
mkdir -p tienda-aurora-java-m13/src/main/java/com/aurora/integrador/aplicacion
mkdir -p tienda-aurora-java-m13/src/main/java/com/aurora/integrador/infraestructura
mkdir -p tienda-aurora-java-m13/src/main/java/com/aurora/integrador/app
mkdir -p tienda-aurora-java-m13/src/test/java/com/aurora/integrador/aplicacion
cd tienda-aurora-java-m13
gradle wrapper --gradle-version 9.9.1
```

**Entorno de referencia verificado (2026-11-23):** macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, JUnit 5.13.4, Mockito 5.18.0, toolchain Java 25.

#### Estructura final

```text
tienda-aurora-java-m13/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
└── src/
    ├── main/java/com/aurora/integrador/
    │   ├── app/App.java
    │   ├── aplicacion/ProcesarPedidosUseCase.java
    │   ├── dominio/EstadoPedido.java
    │   ├── dominio/Pedido.java
    │   ├── dominio/PedidoRepositorio.java
    │   ├── dominio/ResultadoProcesamiento.java
    │   └── infraestructura/RepositorioPedidosEnMemoria.java
    └── test/java/com/aurora/integrador/aplicacion/ProcesarPedidosUseCaseTest.java
```

## Código completo, archivo por archivo

#### `settings.gradle.kts`

```kotlin
rootProject.name = "tienda-aurora-java-m13"
```

#### `build.gradle.kts`

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

```java
package com.aurora.integrador.dominio;
public enum EstadoPedido { PENDIENTE, PROCESADO, FALLIDO }
```

#### `src/main/java/com/aurora/integrador/dominio/Pedido.java`

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

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

**Mecanismo.** Cuatro paquetes con una regla de dependencia: `app` compone; `aplicacion` orquesta el caso de uso; `dominio` define reglas y puertos; `infraestructura` implementa puertos. `ProcesarPedidosUseCase` recibe `PedidoRepositorio` (interfaz), nunca `RepositorioPedidosEnMemoria`.

**Por qué existe.** Si negocio, IO y salida están en la misma clase, un cambio de almacenamiento rompe reglas y un test necesita levantar toda la aplicación. La separación permite cambiar el adaptador sin tocar la regla.

**Implicaciones.** Hay más archivos y una composición explícita en `App`. El beneficio se verifica con un mock del puerto: la prueba `procesaPedidosPendientesYReportaErrores` no necesita una base de datos. El criterio para aceptar la arquitectura es: ¿puedo sustituir `RepositorioPedidosEnMemoria` sin editar `ProcesarPedidosUseCase`?

**Confusión común.** Tener carpetas por capas sin regla de dependencia. Si `infraestructura` importa `aplicacion` concreta y `aplicacion` importa `infraestructura` concreta, solo hay carpetas. Aquí la dirección es siempre hacia `dominio`.

### Tema 2: Build reproducible e integrando concurrencia, modelado y testing · Intermedio · 40 min

**Mecanismo (concurrencia).** `ProcesarPedidosUseCase.ejecutar()` crea un `ExecutorService` con `Executors.newVirtualThreadPerTaskExecutor()`, convierte cada pedido en un `Callable`, usa `invokeAll` y recoge resultados con `future.get()`. El `try-with-resources` cierra el executor. `InterruptedException` restaura el flag de interrupción y se propaga como `IllegalStateException`.

**Por qué existe (concurrencia).** Los pedidos pueden procesarse en paralelo sin compartir un pool limitado de platform threads. `RepositorioPedidosEnMemoria` usa `ConcurrentHashMap` porque varios virtual threads guardan resultados a la vez.

**Implicaciones (concurrencia).** El orden de las tres líneas de `run` puede variar; el contenido no: `P-2` falla por total cero y `P-1`/`P-3` terminan OK. La prueba no depende del orden: usa `anyMatch` sobre los resultados. No se usan virtual threads para CPU-bound puro; aquí simulan tareas que en producción serían IO o llamadas remotas.

**Confusión común (concurrencia).** Creer que `ConcurrentHashMap` vuelve atómica una secuencia de varias operaciones. Cada operación del mapa es segura; la secuencia “leer, decidir, guardar” necesita diseño adicional si varios hilos compiten por el mismo id.

**Mecanismo (modelado).** `Pedido` es un `record` con invariantes en el constructor compacto y métodos `procesar()`/`fallar()` que devuelven nuevas instancias. `ResultadoProcesamiento` es un `sealed interface` con `Ok` y `Error`; el `switch` del `App` es exhaustivo sin `default`.

**Por qué existe (modelado).** El registro evita escribir getters, `equals`, `hashCode` y `toString` a mano; el constructor compacto centraliza las reglas. `sealed` convierte los casos posibles en una lista cerrada que el compilador comprueba.

**Implicaciones (modelado).** `procesar()` y `fallar()` no mutan el pedido original, lo que simplifica razonar sobre hilos y pruebas. Si se añade una variante a `ResultadoProcesamiento`, el compilador obliga a cubrirla en `App`.

**Confusión común (modelado).** Pensar que `record` es solo azúcar sintáctico. El valor real está en los invariantes y en la inmutabilidad; un `record` con campos mutables no aporta esa garantía.

**Mecanismo (testing).** JUnit 5 comprueba el dominio sin mocks y el caso de uso con `@Mock PedidoRepositorio` más `MockitoExtension`. `when(repositorio.pendientes())` define la entrada y `verify(repositorio, atLeastOnce()).guardar(any(Pedido.class))` comprueba la interacción con el puerto.

**Por qué existe (testing).** El dominio puro se prueba directamente; la orquestación se prueba con el puerto sustituido. Mockear el dominio produciría pruebas frágiles que no demuestran las reglas.

**Implicaciones (testing).** Dos pruebas cubren el caso de uso y los invariantes. `Mockito` 5.18.0 y JUnit 5.13.4 están fijados en `build.gradle.kts`; el Gradle wrapper fija Gradle 9.9.1.

**Confusión común (testing).** Mockear `Pedido` o `ResultadoProcesamiento`. Son tipos de dominio: se construyen y se comprueban, no se sustituyen.

**Mecanismo (build reproducible).** `gradlew` fija Gradle; `build.gradle.kts` fija toolchain 25 y versiones de dependencias. El comando único local verificado es `cd ~/labs/aurora-m13 && ./gradlew -q test run`.

**Por qué existe (build reproducible).** “Funciona en mi máquina” desaparece cuando la versión de Gradle, el JDK y las dependencias quedan declarados.

**Implicaciones (build reproducible).** Quien clone el proyecto solo necesita el wrapper y los archivos de build de este módulo: con `./gradlew -q test run` obtiene la misma versión de Gradle, el mismo toolchain y las mismas dependencias, sin instalar nada a mano.

**Confusión común (build reproducible).** Confundir “wrapper” con “repositorio remoto”. El wrapper fija la herramienta; la clonada depende de un remoto que aquí no existe.

## Verificación real

Ejecutado el 2026-11-23 en `~/labs/aurora-m13` (macOS arm64, JDK 27.0.1.0.2, Gradle 9.9.1, toolchain Java 25, JUnit 5.13.4, Mockito 5.18.0). Salida observada:

```text
$ ./gradlew -q test
(salida vacía: Gradle -q solo muestra errores)
$ grep -h "<testsuite " build/test-results/test/*.xml
<testsuite name="com.aurora.integrador.aplicacion.ProcesarPedidosUseCaseTest" tests="2" skipped="0" failures="0" errors="0" timestamp="2026-11-23T08:17:21.036Z" hostname="MacBook-Pro-de-Nicolas.local" time="0.423">
$ ./gradlew -q run
ERR P-2 total cero no permitido
OK P-1 procesado
OK P-3 procesado
$ cd ~/labs/aurora-m13 && ./gradlew -q test run
ERR P-2 total cero no permitido
OK P-1 procesado
OK P-3 procesado
```

Listado de pruebas (`./gradlew test --rerun-tasks`, filtrado):

```text
ProcesarPedidosUseCaseTest > procesaPedidosPendientesYReportaErrores() PASSED
ProcesarPedidosUseCaseTest > dominioNoAceptaInvariantesInvalidos() PASSED
BUILD SUCCESSFUL in 3s
```

Nota honesta sobre la clonada: no hay remoto Git en el proyecto verificado, así que no se puede mostrar una salida real de `git clone`. El comando único verificado es el indicado arriba; si publicas el proyecto, la forma equivalente sería clonar, entrar al directorio resultante y ejecutar `./gradlew test run`.

## Errores comunes y diagnóstico

| Síntoma | Causa probable | Diagnóstico | Corrección |
|---|---|---|---|
| Test necesita BD o infra real | Caso de uso acoplado a la implementación | Revisar imports | Depender de `PedidoRepositorio` |
| `switch` no exhaustivo tras un cambio | Nueva variante `sealed` sin cubrir | Error de compilación | Cubrir la variante en `App` |
| Resultado inconsistente en concurrencia | Estado mutable compartido | Revisar colecciones | `ConcurrentHashMap` o confinamiento |
| Orden de salida distinto entre corridas | `invokeAll` + virtual threads | Comparar contenido, no orden | Pruebas con `anyMatch` |
| “Funciona en mi máquina” | Versiones no fijadas | Comparar wrapper, toolchain y dependencias | Declarar las tres cosas |
| Se mockea el dominio | Prueba frágil y sin valor | Revisar qué se mockea | Mock solo en puertos |
| Se espera una clonada verificable | No hay repositorio remoto | `git remote -v` falla | Crear archivos desde el módulo y usar el comando único local |

## Checklist de cierre

- [ ] Puedo explicar la dirección de dependencias entre dominio, aplicación e infraestructura.
- [ ] Puedo justificar por qué `PedidoRepositorio` es una interfaz.
- [ ] Puedo explicar qué aportan `record` y `sealed` aquí.
- [ ] Sé por qué el orden de `run` puede variar y el resultado no.
- [ ] Ejecuté `./gradlew -q test` y `./gradlew -q run` con salida real.
- [ ] Entiendo que no hay remoto Git verificado y que la clonada no se muestra como salida inventada.
