# Módulo 9: Concurrencia, @Async y resiliencia en el núcleo de Spring

Cubre ejecución asíncrona, executors, `CompletableFuture`, locks, deadlocks, semáforos, MDC y resiliencia declarativa. La concurrencia sin límites degrada el sistema.

**Entorno de referencia (2026-05-22):** JDK 27. APIs Spring `@Async`, `@Retryable`, `@ConcurrencyLimit` requieren Spring Framework 6/7+ según caso.

## Aprende construyendo

### Tema 1: @Async y ejecutores: trabajo en segundo plano con límites · Avanzado · 35 min

#### `@Async`
**Definición formal.** Anotación Spring que ejecuta un método en otro hilo usando un `TaskExecutor`.
**Para qué sirve.** Descargar trabajo no bloqueante de la request.
**Cuándo usarlo.** Tareas cortas/background con límites. No para operaciones críticas sin persistencia/confirmación.
**Ejemplo mínimo enfocado (ejecutable, Java puro executor).**
```bash
mkdir -p /tmp/sb9-async && cd /tmp/sb9-async
cat > DemoAsync.java << 'JAVA'
import java.util.concurrent.*;
public class DemoAsync { public static void main(String[] args) throws Exception { ExecutorService ex=Executors.newSingleThreadExecutor(); Future<String> f=ex.submit(() -> "ok"); System.out.println(f.get()); ex.shutdown(); } }
JAVA
javac DemoAsync.java && java DemoAsync
```
**Caso de uso real.** Enviar notificación después de responder HTTP.
**Error común.** Usar executor ilimitado. Corrección: pool acotado y cola con política.
**Verificación (JDK 27, 2026-05-22).** Salida: `ok`.

#### `TaskExecutor`
**Definición formal.** Abstracción Spring para ejecutar tareas asincrónicas.
**Para qué sirve.** Configurar pools por tipo de carga.
**Cuándo usarlo.** Siempre que uses `@Async` en producción.
**Ejemplo mínimo enfocado (Spring).** `ThreadPoolTaskExecutor` con `core/max/queue`.
**Caso de uso real.** Pool separado para emails.
**Error común.** `SimpleAsyncTaskExecutor` sin límites. Corrección: pool acotado.
**Verificación.** **Nota:** requiere contexto Spring.

### Tema 2: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 45 min

#### `CompletableFuture`
**Definición formal.** API Java para composición asincrónica de etapas con callbacks, combinación y manejo de errores.
**Para qué sirve.** Orquestar tareas async sin bloquear.
**Cuándo usarlo.** Composición de I/O concurrente. Evita cadenas incomprensibles.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb9-cf && cd /tmp/sb9-cf
cat > DemoCf.java << 'JAVA'
import java.util.concurrent.*;
public class DemoCf { public static void main(String[] args){ System.out.println(CompletableFuture.supplyAsync(() -> 2).thenApply(x->x*3).join()); } }
JAVA
javac DemoCf.java && java DemoCf
```
**Caso de uso real.** Combinar llamadas remotas.
**Error común.** Bloquear con `get()` en request thread sin necesidad. Corrección: componer o usar timeout.
**Verificación (JDK 27, 2026-05-22).** Salida: `6`.

#### Self-invocation en `@Async`
**Definición formal.** Llamada interna a método del mismo objeto (`this.metodoAsync()`), que evita el proxy Spring.
**Para qué sirve.** Identificar por qué no hay asincronía/proxy.
**Cuándo evitarla.** Al usar anotaciones basadas en proxy.
**Ejemplo mínimo enfocado (conceptual).** Mover método a otro bean o auto-inyectar con cuidado.
**Caso de uso real.** `@Async`, `@Transactional`, `@Cacheable`.
**Error común.** Esperar que self-call sea async. Corrección: invocar a través del proxy.
**Verificación.** **Nota:** observable comparando thread name/logs.

### Tema 3: Locks, deadlocks, semáforos y MDC en concurrencia · Avanzado · 45 min

#### Lock y deadlock
**Definición formal.** Lock excluye acceso concurrente; deadlock es espera circular donde dos+ hilos no avanzan.
**Para qué sirve.** Proteger estado compartido y reconocer bloqueos.
**Cuándo usarlo.** Estado mutable compartido. Prefiere inmutabilidad o estructuras concurrentes.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb9-lock && cd /tmp/sb9-lock
cat > DemoLock.java << 'JAVA'
import java.util.concurrent.locks.*;
public class DemoLock { public static void main(String[] args){ Lock l=new ReentrantLock(); l.lock(); try{ System.out.println("ok"); } finally { l.unlock(); } } }
JAVA
javac DemoLock.java && java DemoLock
```
**Caso de uso real.** Proteger contador compartido.
**Error común.** Tomar locks en orden distinto. Corrección: orden global de adquisición.
**Verificación (JDK 27, 2026-05-22).** Salida: `ok`.

#### Semáforo y MDC
**Definición formal.** Semáforo limita número de permisos concurrentes; MDC guarda contexto diagnóstico por hilo.
**Para qué sirve.** Limitar concurrencia y mantener trazabilidad en logs.
**Cuándo usarlo.** Semáforo para limitar recursos; MDC en requests, propagándolo a hilos async.
**Ejemplo mínimo enfocado (ejecutable semáforo).**
```bash
mkdir -p /tmp/sb9-sem && cd /tmp/sb9-sem
cat > DemoSem.java << 'JAVA'
import java.util.concurrent.*;
public class DemoSem { public static void main(String[] args) throws Exception { Semaphore s=new Semaphore(1); s.acquire(); System.out.println("in"); s.release(); } }
JAVA
javac DemoSem.java && java DemoSem
```
**Caso de uso real.** Limitar llamadas a API externa.
**Error común.** Perder MDC al pasar a otro hilo. Corrección: TaskDecorator/propagación.
**Verificación (JDK 27, 2026-05-22).** Salida: `in`.

### Tema 4: Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) · Avanzado · 40 min

#### `@Retryable`
**Definición formal.** Anotación/mecanismo declarativo para reintentar una operación ante fallos configurados.
**Para qué sirve.** Tolerar fallos transitorios.
**Cuándo usarlo.** Idempotente, transitorio, con backoff. No en operaciones no idempotentes sin salvaguarda.
**Ejemplo mínimo enfocado (ejecutable simulación).**
```bash
mkdir -p /tmp/sb9-ret && cd /tmp/sb9-ret
cat > DemoRet.java << 'JAVA'
public class DemoRet { static int n; static String call(){ if(++n<3) throw new RuntimeException(); return "ok"; }
  public static void main(String[] args){ for(int i=0;i<5;i++){ try{ System.out.println(call()); break; } catch(Exception e){} } } }
JAVA
javac DemoRet.java && java DemoRet
```
**Caso de uso real.** Timeout transitorio HTTP.
**Error común.** Reintentar sin backoff ni límite. Corrección: max attempts + backoff + jitter.
**Verificación (JDK 27, 2026-05-22).** Salida: `ok`.

#### `@ConcurrencyLimit`
**Definición formal.** Límite declarativo de concurrencia para proteger un recurso/método.
**Para qué sirve.** Evitar saturación.
**Cuándo usarlo.** Recursos escasos. Disponibilidad depende de versión Spring Framework; validar docs.
**Ejemplo mínimo enfocado (conceptual).** `@ConcurrencyLimit(10)` en método.
**Caso de uso real.** Limitar acceso concurrente a servicio externo.
**Error común.** Límites infinitos por defecto. Corrección: backpressure/límites explícitos.
**Verificación.** **Nota:** requiere Spring Framework 7+.
