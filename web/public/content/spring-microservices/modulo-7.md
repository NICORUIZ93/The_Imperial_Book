# Módulo 7 · Resiliencia y tolerancia a fallos con Spring

En distribución, el fallo parcial es normal. Resiliencia significa diseñar para degradación controlada, no para la ilusión de disponibilidad perfecta. Este módulo cubre Resilience4j, timeouts, bulkheads, fallbacks y chaos engineering.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Se ejecutan patrones de breaker/retry/timeout/bulkhead/fallback en Java puro. Resilience4j/Toxiproxy requieren dependencias/infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Circuit breaker, retry, rate limiter, bulkhead, time limiter · Avanzado · 180 min

Caso guía: `orders` depende de `inventory` inestable.

#### Patrones Resilience4j

**Definición formal.** Circuit breaker corta llamadas ante fallos; retry reintenta transitorios; rate limiter limita tasa; bulkhead aísla capacidad; time limiter acota espera.

**Cuándo usarlo / cuándo no.** Úsalos juntos con criterio. No reintentes todo ni pongas breakers sin fallback.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm7-res
cd sm7-res
```

Crea el archivo `Res.java`:

```java
public class Res {
  static String breaker(boolean open){ return open ? "fallback" : "call"; }
  static boolean retryable(int status){ return status == 503 || status == 429; }
  public static void main(String[] args){ System.out.println(breaker(true)); System.out.println(retryable(503)); System.out.println(retryable(400)); }
}
```

```bash
javac Res.java
java Res
```

**Caso de uso real.** Resilience4j con `@CircuitBreaker`, `@Retry`.

**Error común.** Retry sin backoff en operaciones no idempotentes.

**Síntoma.** duplicados o tormenta. **Causa.** reintento ciego. **Corrección.** retry solo transitorio/idempotente, jitter, límite. **Señal observable.** ráfagas de requests tras error.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `fallback`, `true`, `false`.

### Tema 2: Timeouts en cascada · Avanzado · 120 min

Caso guía: A llama B llama C; C tarda 10s.

#### Presupuesto de tiempo

**Definición formal.** Un timeout budget define cuánto puede esperar cada salto y el total end-to-end. Sin budget, la latencia se propaga.

**Cuándo usarlo / cuándo no.** Siempre en llamadas remotas. No uses valores por defecto sin medir.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm7-timeout
cd sm7-timeout
```

Crea el archivo `Budget.java`:

```java
public class Budget {
  static boolean withinBudget(int totalMs, int a, int b, int c){ return (a+b+c) <= totalMs; }
  public static void main(String[] args){ System.out.println(withinBudget(1000,200,300,400)); System.out.println(withinBudget(1000,500,500,500)); }
}
```

```bash
javac Budget.java
java Budget
```

**Caso de uso real.** time limiter Resilience4j + timeout HTTP.

**Error común.** Timeout mayor que el del cliente.

**Síntoma.** trabajo inútil tras cancelación. **Causa.** budgets desalineados. **Corrección.** propagar deadline/budget. **Señal observable.** respuestas tardías descartadas.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

### Tema 3: Fallback strategies · Intermedio · 120 min

Caso guía: recomendaciones caídas, checkout debe seguir.

#### Fallback

**Definición formal.** Fallback es una respuesta alternativa segura ante fallo o timeout.

**Cuándo usarlo / cuándo no.** Úsalo en dependencias no críticas. No lo uses para ocultar fallos críticos de negocio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm7-fb
cd sm7-fb
```

Crea el archivo `Fb.java`:

```java
import java.util.*;
public class Fb {
  static List<String> recs(boolean fail){ if(fail) return List.of(); return List.of("a","b"); }
  public static void main(String[] args){ System.out.println(recs(true).size()); System.out.println(recs(false).size()); }
}
```

```bash
javac Fb.java
java Fb
```

**Caso de uso real.** devolver cache stale marcado o lista vacía.

**Error común.** Fallback que viola negocio.

**Síntoma.** datos incorrectos aceptados. **Causa.** degradación mal elegida. **Corrección.** clasificar criticidad. **Señal observable.** respuestas “ok” con datos inválidos.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `0`, `2`.

### Tema 4: Chaos engineering · Avanzado · 120 min

Caso guía: probar qué pasa si inventory tiene 2s de latencia.

#### Chaos

**Definición formal.** Chaos engineering experimenta con fallos controlados para validar hipótesis de resiliencia.

**Cuándo usarlo / cuándo no.** Úsalo en entornos controlados con observabilidad y rollback. No empieces en producción sin madurez.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm7-chaos
cd sm7-chaos
```

Crea el archivo `Chaos.java`:

```java
public class Chaos {
  static String outcome(boolean timeoutInjected, boolean fallback){ if(timeoutInjected && fallback) return "degraded"; if(timeoutInjected) return "error"; return "ok"; }
  public static void main(String[] args){ System.out.println(outcome(true,true)); System.out.println(outcome(true,false)); }
}
```

```bash
javac Chaos.java
java Chaos
```

**Caso de uso real.** Toxiproxy/Chaos Monkey con hipótesis y métricas.

**Error común.** Inyectar caos sin hipótesis.

**Síntoma.** ruido sin aprendizaje. **Causa.** experimento no definido. **Corrección.** hipótesis, blast radius, abort conditions. **Señal observable.** incidentes sin conclusiones.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `degraded`, `error`. **Nota de verificación:** Toxiproxy/Chaos tools reales no ejecutados.

## Cierre

Resiliencia es un conjunto de límites y degradaciones explícitas. Timeouts, breakers, retries y fallbacks deben configurarse con métricas y probarse con fallos reales.

## Checklist

- Timeouts en todos los hops.
- Retries limitados e idempotentes.
- Fallbacks seguros.
- Chaos con hipótesis y observabilidad.
