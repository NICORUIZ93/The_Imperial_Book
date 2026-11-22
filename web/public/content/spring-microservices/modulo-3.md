# Módulo 3 · Caching con Redis en Spring

El cache mejora latencia y reduce carga, pero introduce consistencia eventual, invalidación y modos de fallo nuevos. Este módulo cubre Spring Cache/Redis, patrones de lectura/escritura, locks distribuidos y stampede, con criterio operativo.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Redis/Spring Cache real requieren Redis y dependencias Spring; los ejemplos ejecutan la lógica de cache/locks/stampede en Java puro, con **Nota de verificación** para integración real.

## Aprende construyendo

### Tema 1: Caching con Redis: @Cacheable, @CacheEvict, TTL · Intermedio · 180 min

Caso guía: cachear catálogo por `productId`.

#### Spring Cache + Redis

**Definición formal.** Spring Cache abstrae caching mediante anotaciones. `@Cacheable` devuelve valor cacheado o ejecuta método y guarda resultado; `@CacheEvict` invalida; TTL controla expiración.

**Cuándo usarlo / cuándo no.** Úsalo en lecturas frecuentes y costosas. No caches datos altamente volátiles o críticos sin invalidación clara.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm3-cache
cd sm3-cache
```

Crea el archivo `CacheDemo.java`:

```java
import java.util.*;
public class CacheDemo {
  static Map<String,String> cache = new HashMap<>();
  static int dbCalls = 0;
  static String get(String id) {
    if (cache.containsKey(id)) return cache.get(id);
    dbCalls++; String v = "product-" + id; cache.put(id, v); return v;
  }
  public static void main(String[] args) {
    System.out.println(get("1"));
    System.out.println(get("1"));
    System.out.println(dbCalls);
  }
}
```

```bash
javac CacheDemo.java
java CacheDemo
```

**Caso de uso real.** `@Cacheable(value="products", key="#id")`.

**Error común.** Cache sin TTL ni invalidación.

**Síntoma.** datos stale. **Causa.** entradas nunca expiran/invalidan. **Corrección.** TTL, eviction por evento, versionado. **Señal observable.** usuarios ven datos viejos tras actualización.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `product-1`, `product-1`, `1`. **Nota de verificación:** Redis/Spring Cache real requiere dependencia y Redis.

### Tema 2: Patrones: Read-Through, Write-Behind, Write-Through · Intermedio · 150 min

Caso guía: elegir cómo sincronizar cache y DB.

#### Patrones

**Definición formal.** Read-through carga desde DB al cache en miss. Write-through escribe DB y cache sincrónicamente. Write-behind escribe cache y difiere DB asincrónicamente.

**Cuándo usarlo / cuándo no.** Read-through para lecturas; write-through para consistencia más simple; write-behind solo si toleras riesgo de pérdida/reordenamiento y tienes durabilidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm3-patterns
cd sm3-patterns
```

Crea el archivo `Patterns.java`:

```java
import java.util.*;
public class Patterns {
  static Map<String,String> db = new HashMap<>(), cache = new HashMap<>();
  static void writeThrough(String k,String v){ db.put(k,v); cache.put(k,v); }
  static String readThrough(String k){ return cache.computeIfAbsent(k, db::get); }
  public static void main(String[] args) {
    db.put("a","1"); System.out.println(readThrough("a"));
    writeThrough("b","2"); System.out.println(cache.get("b"));
  }
}
```

```bash
javac Patterns.java
java Patterns
```

**Caso de uso real.** Write-through para configuración; write-behind para contadores con tolerancia.

**Error común.** Write-behind sin durabilidad.

**Síntoma.** pérdida de escrituras al caer el proceso. **Causa.** buffer no persistido. **Corrección.** cola duradera, retry, idempotencia. **Señal observable.** datos desaparecen tras restart.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `1`, `2`.

### Tema 3: Distributed Locking con Redlock y fencing tokens · Avanzado · 180 min

Caso guía: solo un worker debe recalcular un recurso.

#### Locks distribuidos

**Definición formal.** Un lock distribuido coordina exclusión entre procesos. Redlock es un algoritmo para Redis; los fencing tokens son contadores monotónicos que previenen writes de un lock holder stale.

**Cuándo usarlo / cuándo no.** Evítalo si puedes diseñar idempotencia/concurrencia optimista. Úsalo con cautela y entiende sus límites.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm3-lock
cd sm3-lock
```

Crea el archivo `Lock.java`:

```java
import java.util.concurrent.atomic.*;
public class Lock {
  static AtomicBoolean locked = new AtomicBoolean(false);
  static AtomicLong fence = new AtomicLong(0);
  static long tryLock() { return locked.compareAndSet(false,true) ? fence.incrementAndGet() : -1; }
  static void unlock() { locked.set(false); }
  public static void main(String[] args) {
    long t1 = tryLock(); System.out.println(t1 > 0);
    long t2 = tryLock(); System.out.println(t2 == -1);
    unlock(); System.out.println(tryLock() > 0);
  }
}
```

```bash
javac Lock.java
java Lock
```

**Caso de uso real.** Leader election o tarea única; preferir fencing token en el recurso.

**Error común.** Confiar en lock sin fencing.

**Síntoma.** dos workers escriben tras pausa GC/clock. **Causa.** lock stale. **Corrección.** fencing token, timeouts, diseño idempotente. **Señal observable.** sobrescrituras fuera de orden.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `true`, `true`. **Nota de verificación:** Redlock real requiere Redis y discusión cuidadosa de garantías.

### Tema 4: Cache stampede y mitigación · Avanzado · 120 min

Caso guía: expira una key caliente y 500 requests golpean DB.

#### Stampede

**Definición formal.** Cache stampede ocurre cuando muchas requests concurrentes ven un miss al mismo tiempo y regeneran el mismo valor, sobrecargando el origen.

**Cuándo usarlo / cuándo no.** Mitiga en keys calientes. No sobreingenierices keys frías.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm3-stampede
cd sm3-stampede
```

Crea el archivo `Stampede.java`:

```java
import java.util.concurrent.atomic.*;
public class Stampede {
  static AtomicInteger dbCalls = new AtomicInteger(0);
  static AtomicBoolean loading = new AtomicBoolean(false);
  static String value = null;
  static String get() {
    if (value != null) return value;
    if (loading.compareAndSet(false,true)) { dbCalls.incrementAndGet(); value = "v"; loading.set(false); }
    return value == null ? "miss" : value;
  }
  public static void main(String[] args) {
    System.out.println(get());
    System.out.println(get());
    System.out.println(dbCalls.get());
  }
}
```

```bash
javac Stampede.java
java Stampede
```

**Caso de uso real.** singleflight/mutex por key, stale-while-revalidate, jitter en TTL.

**Error común.** TTL igual para todas las keys calientes.

**Síntoma.** picos periódicos de carga. **Causa.** expiración sincronizada. **Corrección.** jitter, warmup, lock por key. **Señal observable.** spikes de DB al vencer TTL.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `v`, `v`, `1`.

## Cierre

Caching es una optimización con costo semántico. Usa TTL/invalidation claros, mide hit ratio y latencia, y trata stampede/locks como problemas de diseño, no parches.

## Checklist

- Sé qué cacheo y por qué.
- Defino TTL e invalidación.
- Entiendo trade-offs write-through/write-behind.
- Uso locks distribuidos con cautela.
- Mitigo stampede en keys calientes.
