# Módulo 9: Concurrencia avanzada en Spring

Spring simplifica concurrencia con `@Async`, ejecutores y utilidades, pero las reglas de Java siguen aplicando: visibilidad, locks, pools, colas y propagación de contexto. Este módulo conecta la concurrencia de la JVM con el modelo de Spring.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0. Features de Spring Framework 7 se marcan por versión.

## Aprende construyendo

### Tema 1: @Async y ejecutores: trabajo en segundo plano con límites · Avanzado · 35 min

Caso guía: enviar notificación sin bloquear la request HTTP.

#### `@Async` y `TaskExecutor`

**Definición formal.** `@Async` ejecuta un método en otro hilo usando un `TaskExecutor`. Requiere `@EnableAsync` y manejo de executor.

**Contrato.** Métodos `void` o `Future/CompletableFuture`. Excepciones en `void` no suben al caller; necesitan handler.

```mermaid
flowchart LR
  R[HTTP request] --> S[Service]
  S -->|@Async| E[TaskExecutor]
  R --> Q[Response rápida]
  E --> N[Notificación]
```

**Ejemplo mínimo (conceptual Boot).**

```java
@Async("mailExecutor")
public CompletableFuture<Void> enviar(String to) { ... }
```

**Error común.** Usar executor por defecto sin límites. Corrección: definir `ThreadPoolTaskExecutor` con core/max/queue, naming y rechazo.

### Tema 2: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 45 min

Caso guía: llamas un método `@Async` desde otro método del mismo bean y se ejecuta en el mismo hilo.

#### Self-invocation

**Definición formal.** Spring AOP aplica proxies en llamadas entrantes por el proxy. Una llamada interna `this.metodoAsync()` no pasa por el proxy.

**Ejemplo mínimo enfocado (Java puro, ejecutable, ilustra el problema de bypass).**

```bash
mkdir -p java-sb9-self
cd java-sb9-self
```

Crea el archivo `DemoSelf.java`:

```java
class Service {
  String asyncLike(){ return Thread.currentThread().getName(); }
  String callDirect(){ return asyncLike(); } // bypass
}
public class DemoSelf {
  public static void main(String[] args) throws Exception {
    Service s = new Service();
    System.out.println(s.callDirect().equals(Thread.currentThread().getName()));
  }
}
```

```bash
javac DemoSelf.java
java DemoSelf
```

**Error común.** Esperar asincronía en self-invocation. Corrección: inyectar el bean, separar en otro bean, o usar self-reference con cuidado.

**Verificación (JDK 27, 2026-05-22).** `true` (misma hilo; en Spring con proxy, la llamada directa también bypassaría el proxy).

### Tema 3: Locks, deadlocks, semáforos y MDC en concurrencia · Avanzado · 45 min

Caso guía: proteger contador compartido y mantener correlation id en logs.

#### Locks y semáforos

**Definición formal.** `Lock` da exclusión/condiciones; `Semaphore` limita concurrencia por permisos.

**Ejemplo mínimo (ejecutable).**

```bash
mkdir -p java-sb9-lock
cd java-sb9-lock
```

Crea el archivo `DemoLock.java`:

```java
import java.util.concurrent.*; import java.util.concurrent.locks.*;
public class DemoLock {
  static int c=0; static final Lock lock=new ReentrantLock();
  public static void main(String[] args) throws Exception {
    ExecutorService ex = Executors.newFixedThreadPool(4);
    for(int i=0;i<1000;i++) ex.submit(() -> { lock.lock(); try{ c++; } finally{ lock.unlock(); }});
    ex.shutdown(); ex.awaitTermination(5, TimeUnit.SECONDS);
    System.out.println(c);
  }
}
```

```bash
javac DemoLock.java
java DemoLock
```

**MDC.** En hilos async, el MDC no se propaga automáticamente. Usa `TaskDecorator` para copiar/restaurar contexto.

**Error común.** Perder traceId en async. Corrección: TaskDecorator/Micrometer context propagation.

**Verificación (JDK 27, 2026-05-22).** `1000`.

### Tema 4: Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) · Avanzado · 40 min

Caso guía: reintentar llamada transitoria y limitar concurrencia de un método sensible.

#### Resiliencia declarativa

**Definición formal.** Spring Framework 7 introduce capacidades nativas de resiliencia como `@Retryable` y `@ConcurrencyLimit` (según versión/módulo). Permiten políticas declarativas cerca del código.

**Nota de versión.** Verifica si el proyecto usa Spring Framework 7/Boot 4. En Boot 3.5.x puede requerir librerías o enfoques distintos (Resilience4j, Spring Retry).

**Error común.** Reintentar operaciones no idempotentes. Corrección: solo reintentar idempotentes o con idempotency key.

**Nota de verificación.** Feature dependiente de versión; no ejecutar como API garantizada en Boot 3.5.0 sin confirmar.

## Cierre

La concurrencia en Spring hereda todas las reglas de Java y agrega proxies/contexto. Diseña pools, maneja self-invocation y propaga observabilidad.

## Checklist

- Configuro `TaskExecutor` con límites.
- Evito self-invocation con `@Async`.
- Propago MDC/contexto.
- Reintento solo operaciones seguras.
