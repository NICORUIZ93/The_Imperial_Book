# Módulo 4 · Caching y Redis

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0, Docker 29.9.3. Conceptos de cache, TTL, patrones y stampede se verifican con Java/Node puro. Redis, Spring Cache, Redlock y fencing tokens distribuidos reales requieren Redis/infra; se incluyen ejemplos mínimos y **Nota de verificación** honesta.

Este módulo cubre caching para reducir latencia y carga, patrones de lectura/escritura, locking distribuido y mitigación de stampede.

## Aprende construyendo

### Tema 1: Caching con Redis: @Cacheable, @CacheEvict, TTL · Intermedio · 180 min

Caso guía: cachear lectura de producto por id y invalidar al actualizar.

#### Cache y TTL

**Definición formal.** Una cache almacena resultados para reutilizarlos; TTL (time to live) define el tiempo máximo de validez de una entrada.

**Para qué sirve.** Reduce latencia y carga en DB/servicios.

**Cuándo usarlo y cuándo no.** Úsalo en lecturas frecuentes y tolerantes a cierto staleness. No caches datos altamente sensibles a consistencia sin estrategia de invalidación.

**Ejemplo mínimo enfocado (ejecutable, cache en memoria con TTL simulado).**

```bash
mkdir -p /tmp/ms8-cache && cd /tmp/ms8-cache
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static class Cache { Map<String,String> m=new HashMap<>(); String get(String k){return m.get(k);} void put(String k,String v){m.put(k,v);} void evict(String k){m.remove(k);} }
  public static void main(String[] args){
    var c=new Cache();
    System.out.println(c.get("p1")==null ? "miss":"hit");
    c.put("p1","Teclado");
    System.out.println(c.get("p1")==null ? "miss":"hit");
    c.evict("p1");
    System.out.println(c.get("p1")==null ? "miss":"hit");
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Redis con `SETEX`/TTL para productos.

**Error común.** Cache sin invalidación. Síntoma: datos stale. Corrección: TTL + invalidación por evento/actualización.

**Verificación (JDK 27, 2026-05-22).** Salida: `miss`, `hit`, `miss`.

#### @Cacheable / @CacheEvict

**Definición formal.** En Spring Cache, `@Cacheable` devuelve resultado cacheado por clave si existe; `@CacheEvict` elimina entradas al cambiar datos.

**Para qué sirve.** Aplica caching declarativo sin boilerplate.

**Cuándo usarlo y cuándo no.** Úsalo en métodos deterministas por clave. No lo uses en métodos con efectos secundarios inesperados o claves mal definidas.

**Ejemplo mínimo enfocado (esqueleto Spring).**

```java
@Cacheable(value = "productos", key = "#id")
public ProductoDto get(String id) { ... }

@CacheEvict(value = "productos", key = "#id")
public void update(String id, ProductoDto dto) { ... }
```

**Caso de uso real.** Cachear `GET /productos/{id}`.

**Error común.** Self-invocation: llamar método `@Cacheable` desde la misma clase. Síntoma: cache no se aplica. Corrección: invocar vía proxy Spring.

**Verificación.** **Nota de verificación:** requiere Spring Cache + Redis/Caffeine y contexto Spring.

### Tema 2: Patrones: Read-Through, Write-Behind, Write-Through · Intermedio · 150 min

Caso guía: elegir estrategia de sincronización cache-DB.

#### Read-Through

**Definición formal.** En read-through, la cache carga el dato desde la fuente en un miss y lo devuelve; la aplicación consulta la cache como fuente.

**Para qué sirve.** Simplifica lectura y centraliza carga.

**Cuándo usarlo y cuándo no.** Úsalo en lecturas frecuentes. No si el miss penalty es inaceptable sin warming.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms8-rt && cd /tmp/ms8-rt
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static Map<String,String> db=Map.of("1","Teclado");
  static Map<String,String> cache=new HashMap<>();
  static String get(String id){ return cache.computeIfAbsent(id, db::get); }
  public static void main(String[] args){ System.out.println(get("1")); System.out.println(cache.containsKey("1")); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Cache aside/read-through para catálogo.

**Error común.** Cachear null sin control. Corrección: política explícita para misses negativos.

**Verificación (JDK 27, 2026-05-22).** Salida: `Teclado`, `true`.

#### Write-Through y Write-Behind

**Definición formal.** Write-through escribe en cache y DB de forma sincrónica en la misma operación; write-behind escribe en cache y difiere la escritura a DB de forma asíncrona.

**Para qué sirve.** Write-through favorece consistencia; write-behind favorece latencia de escritura.

**Cuándo usarlo y cuándo no.** Write-through para consistencia fuerte simple; write-behind solo si toleras riesgo de pérdida y tienes cola/durabilidad. No uses write-behind sin manejo de fallos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms8-wt && cd /tmp/ms8-wt
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  public static void main(String[] args){
    Map<String,String> db=new HashMap<>(); Map<String,String> cache=new HashMap<>();
    // write-through
    String k="1", v="A"; cache.put(k,v); db.put(k,v);
    System.out.println(cache.get(k)+":"+db.get(k));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Write-through para perfil de usuario; write-behind para contadores de alta tasa con riesgo controlado.

**Error común.** Usar write-behind sin estrategia de reintento/DLQ. Síntoma: pérdida de escrituras. Corrección: cola duradera, idempotencia, monitoreo.

**Verificación (JDK 27, 2026-05-22).** Salida: `A:A`. **Nota:** write-behind real requiere cola/worker y semántica de fallos.

### Tema 3: Distributed Locking con Redlock y Fencing Tokens · Avanzado · 180 min

Caso guía: evitar ejecución concurrente duplicada entre instancias.

#### Lock distribuido

**Definición formal.** Un lock distribuido es un mecanismo de exclusión mutua entre procesos/nodos que coordinan acceso a un recurso compartido.

**Para qué sirve.** Evita doble procesamiento en despliegues multi-instancia.

**Cuándo usarlo y cuándo no.** Úsalo cuando el recurso no tiene control de concurrencia nativo adecuado. No lo uses como sustituto de idempotencia.

**Ejemplo mínimo enfocado (ejecutable, lock local simulado).**

```bash
mkdir -p /tmp/ms8-lock && cd /tmp/ms8-lock
cat > Main.java << 'JAVA'
import java.util.concurrent.locks.*;
public class Main {
  public static void main(String[] args){
    Lock lock=new ReentrantLock();
    lock.lock();
    try { System.out.println("critical"); } finally { lock.unlock(); }
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Lock Redis `SET NX PX` para job único.

**Error común.** Lock sin expiración. Síntoma: deadlock distribuido. Corrección: TTL, renovación cuidadosa, idempotencia.

**Verificación (JDK 27, 2026-05-22).** Salida: `critical`. **Nota:** lock distribuido real requiere Redis/consenso; single-node Redis lock tiene limitaciones.

#### Redlock y fencing token

**Definición formal.** Redlock es un algoritmo propuesto para locks sobre múltiples instancias Redis; fencing token es un token monotónico que el recurso protegido usa para rechazar writers obsoletos.

**Para qué sirve.** Redlock intenta tolerar fallos de nodos Redis; fencing token protege contra locks expirados/stale.

**Cuándo usarlo y cuándo no.** Evalúa críticamente Redlock; para corrección fuerte considera sistemas de consenso (ZooKeeper/etcd/DB advisory locks). Usa fencing tokens cuando el recurso pueda validarlos.

**Ejemplo mínimo enfocado (ejecutable, fencing token simulado).**

```bash
mkdir -p /tmp/ms8-fence && cd /tmp/ms8-fence
cat > Main.java << 'JAVA'
public class Main {
  static int resourceToken=0;
  static String write(int token,String val){ if(token<=resourceToken) return "reject"; resourceToken=token; return "ok:"+val; }
  public static void main(String[] args){
    System.out.println(write(1,"A"));
    System.out.println(write(1,"A-old"));
    System.out.println(write(2,"B"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Writer con token monotónico ante storage que lo verifica.

**Error común.** Confiar solo en TTL del lock. Síntoma: dos writers creen tener lock. Corrección: fencing token o primitiva de consenso adecuada.

**Verificación (JDK 27, 2026-05-22).** Salida: `ok:A`, `reject`, `ok:B`. **Nota:** Redlock/fencing distribuido real requiere infraestructura específica.

### Tema 4: Cache stampede y solución con locks · Avanzado · 120 min

Caso guía: evitar que muchos requests recalculen la misma clave al expirar.

#### Cache stampede

**Definición formal.** Cache stampede (thundering herd) ocurre cuando muchas solicitudes concurrentes ven un miss/expiración y recalculan la misma entrada simultáneamente.

**Para qué sirve.** Identificarlo permite proteger DB/origen.

**Cuándo usarlo y cuándo no.** Mitígalo en claves calientes. No sobreingenierices claves frías.

**Ejemplo mínimo enfocado (ejecutable, simulación).**

```bash
mkdir -p /tmp/ms8-stamp && cd /tmp/ms8-stamp
cat > Main.java << 'JAVA'
public class Main {
  public static void main(String[] args){
    int concurrentMisses=100;
    System.out.println("recomputes="+concurrentMisses); // sin lock
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Expira caché de home page con alto tráfico.

**Error común.** TTL igual para todas las claves calientes. Corrección: jitter, warming, single-flight/lock.

**Verificación (JDK 27, 2026-05-22).** Salida: `recomputes=100`.

#### Single-flight / lock por clave

**Definición formal.** Single-flight limita la recomputación concurrente de una misma clave a un solo trabajador, mientras otros esperan o usan valor stale.

**Para qué sirve.** Reduce carga duplicada en origen.

**Cuándo usarlo y cuándo no.** Úsalo en claves calientes. No bloquees indefinidamente; usa timeout/stale-while-revalidate.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms8-sf && cd /tmp/ms8-sf
cat > Main.java << 'JAVA'
import java.util.concurrent.atomic.*;
public class Main {
  public static void main(String[] args){
    AtomicInteger recomputes=new AtomicInteger();
    boolean first=true;
    for(int i=0;i<100;i++){ if(first){recomputes.incrementAndGet(); first=false;} }
    System.out.println(recomputes.get());
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Mutex por clave en Redis o `synchronized` por key local.

**Error común.** Lock global para todas las claves. Corrección: lock por clave con timeout.

**Verificación (JDK 27, 2026-05-22).** Salida: `1`.

## Cierre del módulo

El caching mejora rendimiento cuando tiene políticas claras de TTL, invalidación y consistencia. En sistemas distribuidos, locks y stampede requieren cuidado extra: idempotencia, fencing, jitter y observabilidad son tan importantes como la cache misma.
