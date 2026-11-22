# Módulo 9: Concurrencia, @Async y resiliencia en el núcleo de Spring

## Aprende construyendo

Construirás cotizaciones que combinan llamadas asíncronas con `CompletableFuture`, descubrirás por qué `@Async` deja de funcionar cuando una clase se llama a sí misma, provocarás un deadlock real con dos locks tomados en orden inverso y lo corregirás con un orden consistente, y acotarás concurrencia con un `Semaphore`. El hilo conductor es RutaFlow cotizando tarifas de varios proveedores a la vez. El último tema usa lo que Spring Framework 7 trae en el núcleo para reintentar (`@Retryable`) y limitar concurrencia (`@ConcurrencyLimit`) sin dependencias extra.


### Dos ejemplos: primero visible, luego real

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por dos ejemplos: primero visible, luego real con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender dos ejemplos: primero visible, luego real te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dos ejemplos: primero visible, luego real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dos ejemplos: primero visible, luego real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dos ejemplos: primero visible, luego real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dos ejemplos: primero visible, luego real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dos ejemplos: primero visible, luego real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dos ejemplos: primero visible, luego real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dos ejemplos: primero visible, luego real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dos ejemplos: primero visible, luego real en tu contexto?
2. ¿Cómo sabrías que dos ejemplos: primero visible, luego real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dos ejemplos: primero visible, luego real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar dos ejemplos: primero visible, luego real.

</details>

### Tema 1: @Async y ejecutores: trabajo en segundo plano con límites · Avanzado · 35 min

**Caso guía**: enviar notificaciones sin bloquear el request HTTP, pero sin crear hilos infinitos.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@Async` | Ejecuta método en otro hilo via proxy Spring. | Trabajo background no bloqueante. | Habilitar `@EnableAsync` y executor nombrado. | Llamada interna no pasa por proxy. |
| `Executor`/`TaskExecutor` | Pool/estrategia de ejecución. | Limitar concurrencia y colas. | Definir tamaños, cola, rechazo. | Usar executor default sin límites. |
| Backpressure/rechazo | Qué pasa cuando la cola se llena. | Proteger sistema. | Política explícita (`CallerRuns`, rechazo). | Cola ilimitada => OOM. |
| Límites | Max hilos, cola, timeout. | Estabilidad. | Medir y acotar. | “Async” como cura mágica. |

**Implementación desde cero** (`spring-boot-starter-web`)
```java
@Configuration @EnableAsync
class AsyncConfig {
  @Bean(name="notificaciones")
  Executor notificaciones() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(2); ex.setMaxPoolSize(4); ex.setQueueCapacity(50); ex.setThreadNamePrefix("notif-");
    ex.initialize(); return ex;
  }
}
@Service
class NotificacionService {
  @Async("notificaciones")
  public CompletableFuture<String> enviar(String guia) {
    return CompletableFuture.completedFuture(Thread.currentThread().getName());
  }
}
```
**Ejecución real**: `./mvnw -Dtest=AsyncBehaviorTest test` o endpoint que invoque y loggee hilo. **Verificación**: llamada externa corre en hilo `notif-*`; auto-invocación corre en hilo llamador.

### Tema 2: CompletableFuture, @Async y el bug de la autoinvocación · Avanzado · 45 min

**Caso guía**: cotizar en paralelo dos proveedores y combinar resultado; manejar fallo con fallback.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `CompletableFuture` | Futuro componible para async. | Combinar, transformar, manejar errores. | `thenCombine`, `exceptionally`, `orTimeout`. | Bloquear con `get()` en request thread sin timeout. |
| Composición | Combinar tareas independientes. | Latencia total menor. | Iniciar antes de combinar. | Ejecutar secuencial por accidente. |
| Bug de autoinvocación | Llamar método `@Async` desde la misma clase con `this`. | Explica por qué no hay async. | Llamar vía bean/proxy o separar clase. | Asumir que anotación basta. |
| Fallback/timeout | Valor alternativo o límite de tiempo. | Resiliencia. | Timeout + manejo explícito. | Espera infinita. |

**Implementación desde cero**
```java
@Service
class TarifaAsyncService {
  @Async("tareaAsincrona") public CompletableFuture<BigDecimal> base(String ruta){ dormir(100); return completedFuture(new BigDecimal("120.00")); }
  @Async("tareaAsincrona") public CompletableFuture<BigDecimal> recargo(String ruta){ dormir(80); return completedFuture(new BigDecimal("15.50")); }
  public CompletableFuture<BigDecimal> bugAutoinvocacion(String ruta){ return this.base(ruta); } // no async
}
@Service
class Cotizador {
  private final TarifaAsyncService s; Cotizador(TarifaAsyncService s){this.s=s;}
  public CompletableFuture<BigDecimal> total(String ruta){ return s.base(ruta).thenCombine(s.recargo(ruta), BigDecimal::add); }
}
```
**Ejecución real**: `./mvnw -Dtest=CotizadorAsyncTest test`. **Verificación**: `thenCombine` retorna `135.50`; autoinvocación se ejecuta en mismo hilo (assert por nombre de hilo).

### Tema 3: Locks, deadlocks, semáforos y MDC en concurrencia · Avanzado · 45 min

**Caso guía**: transferencias concurrentes entre cuentas provocan deadlock; logs pierden requestId en hilos async.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Lock (`ReentrantLock`) | Exclusión mutua explícita. | Proteger sección crítica. | Lock/unlock en `try/finally`. | Olvidar unlock. |
| Deadlock | Dos hilos esperan locks en orden opuesto. | Fallo catastrófico. | Orden global de locks o `tryLock` con timeout. | Tomar locks en orden inconsistente. |
| Semáforo | Limita número de permisos concurrentes. | Controlar acceso a recurso limitado. | `acquire/release` en finally. | Fuga de permiso. |
| MDC en concurrencia | Contexto de logging por hilo. | Trazabilidad. | Propagar MDC con `TaskDecorator`. | Perder correlation id en async. |

**Implementación desde cero**
```java
public void transferir(Cuenta a, Cuenta b, BigDecimal monto){
  Cuenta primera = a.getId().compareTo(b.getId()) <= 0 ? a : b;
  Cuenta segunda = primera == a ? b : a;
  primera.lock.lock(); try { segunda.lock.lock(); try { a.restar(monto); b.sumar(monto); } finally { segunda.lock.unlock(); } } finally { primera.lock.unlock(); }
}
```
```java
class MdcTaskDecorator implements TaskDecorator {
  public Runnable decorate(Runnable r){ var ctx=MDC.getCopyOfContextMap(); return () -> { var prev=MDC.getCopyOfContextMap(); try { if(ctx!=null) MDC.setContextMap(ctx); r.run(); } finally { if(prev!=null) MDC.setContextMap(prev); else MDC.clear(); } }; }
}
```
**Ejecución real**: `./mvnw -Dtest=TransferenciaDeadlockTest test`. **Verificación**: versión insegura timeouts/deadlock bajo prueba de estrés; versión con orden pasa; MDC visible en hilo async.

### Tema 4: Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) · Avanzado · 40 min

**Caso guía**: proveedor externo falla intermitente; otro endpoint debe limitar concurrencia.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@Retryable` (Spring Framework 7 core) | Reintenta método ante excepciones configuradas. | Transitorios. | Solo idempotentes; max retries y delay. | Reintentar operación no idempotente. |
| Backoff/jitter | Espera entre reintentos, con variación. | Evitar thundering herd. | Configurar delay/multiplier/jitter. | Reintento inmediato agresivo. |
| `@ConcurrencyLimit` | Limita ejecuciones concurrentes de un método. | Proteger recurso. | Límite acorde a capacidad. | Límite demasiado alto/bajo sin medir. |
| `@EnableResilientMethods` | Habilita procesamiento de anotaciones resilientes. | Activar feature. | Agregar config. | Anotación sin habilitar. |

**Implementación desde cero**
```java
@Configuration @EnableResilientMethods
class ResilienciaConfig {}
@Service
class CotizadorConReintento {
  private final ProveedorTarifas proveedor;
  CotizadorConReintento(ProveedorTarifas p){this.proveedor=p;}
  @Retryable(includes = ProveedorNoDisponible.class, maxRetries = 2, delay = 50)
  public long cotizar(String ruta){ return proveedor.tarifa(ruta); }
}
```
**Ejecución real**: `./mvnw -Dtest=CotizadorConReintentoTest test` con Mockito lanza 2 fallos luego éxito. **Verificación**: 3 invocaciones totales; si agota, propaga excepción.

