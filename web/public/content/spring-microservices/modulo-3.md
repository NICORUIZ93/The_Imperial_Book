# Módulo 3 · Caché distribuido con Redis en Tienda Aurora

Tienda Aurora tiene un catálogo de 50.000 productos. Cada vez que un usuario abre la página de un producto, el servicio consulta PostgreSQL. Con 10.000 usuarios concurrentes viendo los mismos 500 productos populares, la base de datos ejecuta la misma consulta miles de veces por segundo. El síntoma es latencia creciente y CPU de base de datos al 90%. La causa es que el sistema no recuerda lo que ya leyó. La solución no es comprar un servidor más grande: es guardar el resultado en memoria y servirlo sin tocar la base de datos.

Redis es una base de datos en memoria que sirve datos en microsegundos. Spring Cache abstrae el acceso a Redis mediante anotaciones: `@Cacheable` lee del caché o ejecuta el método y guarda el resultado; `@CacheEvict` elimina una entrada cuando los datos cambian. El TTL (time to live) define cuánto tiempo vive un dato en caché antes de expirar automáticamente. La pregunta que un arquitecto debe responder antes de cachear es: ¿cuánta frescura necesita el dato? Un catálogo de productos puede tolerar 5 minutos de stale. Un precio en Black Friday puede requerir invalidación inmediata. Un stock disponible no debería cachearse sin invalidación por evento.

### Tema 1: @Cacheable, @CacheEvict y TTL · Intermedio · 180 min

## Redis como memoria de trabajo

Redis almacena datos en memoria principal, lo que lo hace órdenes de magnitud más rápido que cualquier base de datos en disco. Para Tienda Aurora, Redis sirve como caché de lectura para el catálogo: cuando un usuario consulta un producto, el servicio busca primero en Redis; si no está, consulta PostgreSQL, guarda el resultado en Redis con TTL de 5 minutos y responde al usuario. La siguiente consulta del mismo producto se sirve desde Redis en ~2ms en vez de ~80ms desde PostgreSQL.

Spring Boot configura Redis mediante `spring.data.redis.host` y `spring.data.redis.port`. El `RedisCacheManager` se configura con TTL por caché, serialización JSON y prefijo de claves. La serialización JSON es importante porque permite inspeccionar los datos en Redis con `redis-cli` y porque evita problemas de compatibilidad de clases entre versiones.

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(5))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));

        Map<String, RedisCacheConfiguration> configs = Map.of(
            "products", defaultConfig.entryTtl(Duration.ofMinutes(5)),
            "prices", defaultConfig.entryTtl(Duration.ofSeconds(30))
        );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(configs)
            .build();
    }
}
```

El servicio de catálogo usa `@Cacheable` para leer y `@CacheEvict` para invalidar cuando se actualiza un producto. El patrón es Cache-Aside: la aplicación busca en caché; si no está, busca en BD y guarda en caché.

```java
@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "products", key = "#productId")
    public ProductDto findById(String productId) {
        return repository.findById(productId)
            .map(this::toDto)
            .orElseThrow(() -> new NotFoundException("Product not found: " + productId));
    }

    @CacheEvict(value = "products", key = "#productId")
    public ProductDto update(String productId, UpdateProductRequest request) {
        Product updated = repository.save(toEntity(productId, request));
        return toDto(updated);
    }
}
```

El TTL de 5 minutos garantiza que los datos stale no persisten indefinidamente. La invalidación explícita (`@CacheEvict`) asegura que un update se refleje inmediatamente en la siguiente lectura. El parámetro `unless = "#result == null"` evita cachear resultados null (productos inexistentes).

### Tema 2: Read-through, write-through, write-behind · Avanzado · 120 min

## Patrones de caché: Cache-Aside, Read-Through, Write-Through y Write-Behind

El patrón Cache-Aside (`@Cacheable`) deja la responsabilidad de cargar el caché a la aplicación. Pero hay otros patrones con trade-offs distintos. Read-Through delega la carga al caché mismo: la aplicación solo pide al caché, y el caché busca en BD si no tiene el dato. Write-Through escribe en caché y BD sincrónicamente. Write-Behind escribe en caché y actualiza BD asincrónicamente.

En Tienda Aurora, el catálogo de productos cambia pocas veces al día. Cache-Aside con TTL es suficiente. Pero el inventario (stock) cambia con cada venta. Si usas Cache-Aside para stock, cada venta invalida la caché y la siguiente lectura golpea la BD. Write-Through mantiene caché y BD sincronizados en cada escritura, pero agrega latencia a la escritura. Write-Behind es más rápido (solo caché), pero arriesga pérdida de datos si el caché cae antes de persistir.

La elección depende de la tolerancia a inconsistencia y la latencia aceptable. Cache-Aside es el default en Spring porque es simple y flexible. Write-Through se usa cuando la consistencia caché-DB es crítica. Write-Behind se usa para alta escritura con tolerancia a pérdida temporal. Write-Behind no es apropiado para datos financieros: si el caché cae antes de persistir, el saldo se pierde.

### Tema 3: Distributed locking y fencing tokens · Avanzado · 120 min

## Distributed locking y fencing tokens

Cuando dos instancias de Tienda Aurora intentan actualizar el mismo producto simultáneamente, el caché y la BD pueden quedar inconsistentes. Un distributed lock garantiza que solo una instancia modifica el recurso a la vez. Redis implementa locks con `SET NX EX` (set if not exists, with expiry). Pero un lock sin protección contra expiración es peligroso: si el proceso que tiene el lock se bloquea, el lock expira y otro proceso lo toma, resultando en dos escrituras concurrentes.

El fencing token es la solución: cada vez que se adquiere un lock, se genera un token monótonamente creciente. El recurso (BD) verifica que el token del escritor sea mayor que el último token aplicado. Si un proceso lento intenta escribir con un token viejo, la BD lo rechaza. Este mecanismo es esencial para cualquier recurso mutable con escrituras concurrentes.

La construcción con Redis usa `SET key value NX EX ttl` para adquirir el lock y un token incremental (puede ser un contador en Redis o un timestamp). El recurso (BD) almacena el último token aplicado y rechaza escrituras con token menor.

### Tema 4: Cache stampede y mitigaciones · Avanzado · 120 min

## Cache stampede y mitigaciones

Cuando el TTL de un caché popular expira, cientos de requests simultáneas golpean la base de datos al mismo tiempo. Este fenómeno se llama cache stampede (o thundering herd). Si el endpoint de producto recibe 1000 req/s y el caché expira, las 1000 requests ejecutan la query a BD simultáneamente, saturándola.

Las mitigaciones principales son: mutex por clave (solo una request consulta la BD; las demás esperan el resultado), TTL con jitter (agregar variación aleatoria al TTL para que las expiraciones se dispersen), refresh-ahead (recalcular el valor antes de que expire, con probabilidad creciente) y stale-while-revalidate (servir el valor stale mientras se recalcula en background).

La elección depende de la tolerancia a stale y la concurrencia. Mutex por clave es la mitigación más directa para cachés de alta concurrencia con TTL corto. TTL con jitter es simple y efectivo para cachés con muchas claves similares. Stale-while-revalidate es ideal cuando la frescura no es crítica. Refresh-ahead es útil cuando el recálculo es predecible.

## Verificación y evidencia

La siguiente clase modela la lógica de decisión de caché (hit/miss/expired) sin Redis real. Representa el comportamiento de `@Cacheable` con TTL.

```java
public class CacheDecisionSmoke {
    static String cache = null;
    static long expiry = 0;

    static String get(String key, long now, long ttlMs, java.util.function.Supplier<String> dbQuery) {
        if (cache != null && now < expiry) return "HIT:" + cache;
        cache = dbQuery.get();
        expiry = now + ttlMs;
        return "MISS:" + cache;
    }

    public static void main(String[] args) {
        System.out.println(get("p1", 0, 5000, () -> "product-42"));
        System.out.println(get("p1", 1000, 5000, () -> "product-42"));
        System.out.println(get("p1", 6000, 5000, () -> "product-42"));
    }
}
```

```bash
javac CacheDecisionSmoke.java
java CacheDecisionSmoke
```

Salida esperada:

```text
MISS:product-42
HIT:product-42
MISS:product-42
```

El primer acceso es MISS (consulta BD). El segundo es HIT (cache). El tercero es MISS porque el TTL de 5000ms expiró.

La siguiente clase modela el patrón de mutex por clave para mitigar stampede. Solo una request consulta la BD; las demás esperan y leen del caché.

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class StampedeSmoke {
    static Map<String, String> cache = new ConcurrentHashMap<>();
    static Map<String, AtomicLong> dbHits = new ConcurrentHashMap<>();
    static Map<String, Lock> locks = new ConcurrentHashMap<>();

    static String get(String key) {
        String cached = cache.get(key);
        if (cached != null) return "HIT:" + cached;

        Lock lock = locks.computeIfAbsent(key, k -> new ReentrantLock());
        boolean acquired = lock.tryLock();
        if (acquired) {
            try {
                dbHits.computeIfAbsent(key, k -> new AtomicLong()).incrementAndGet();
                String value = "db-value-" + key;
                cache.put(key, value);
                return "MISS-DB:" + value;
            } finally {
                lock.unlock();
            }
        } else {
            try { Thread.sleep(50); } catch (InterruptedException ignored) {}
            String v = cache.get(key);
            return v != null ? "WAIT-HIT:" + v : "WAIT-MISS";
        }
    }

    public static void main(String[] args) throws Exception {
        ExecutorService ex = Executors.newFixedThreadPool(4);
        List<Future<String>> futures = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            futures.add(ex.submit(() -> get("product-42")));
        }
        for (Future<String> f : futures) {
            System.out.println(f.get());
        }
        System.out.println("db-hits=" + dbHits.get("product-42").get());
        ex.shutdown();
    }
}
```

```bash
javac StampedeSmoke.java
java StampedeSmoke
```

Salida esperada:

```text
MISS-DB:db-value-product-42
WAIT-HIT:db-value-product-42
WAIT-HIT:db-value-product-42
WAIT-HIT:db-value-product-42
db-hits=1
```

Solo 1 request consulta la BD; las otras 3 esperan y leen del caché. Esto demuestra que el mutex por clave previene el stampede.

## Cierre

El caché distribuido con Redis resuelve el problema de lecturas repetidas en Tienda Aurora. Cache-Aside con TTL es el patrón default en Spring. La elección de TTL depende de la frescura requerida: 5 minutos para catálogo, 30 segundos para precios. La invalidación por evento (`@CacheEvict`) garantiza consistencia cuando los datos cambian. Los distributed locks con fencing tokens protegen contra escrituras concurrentes. La mitigación de stampede con mutex por clave evita que la BD se sature cuando un caché popular expira.

El error más común es cachear sin TTL ni invalidación: los datos nunca se actualizan y los usuarios ven información stale indefinidamente. La señal observable es que un producto actualizado en BD sigue mostrando el precio viejo.

Las decisiones clave son: qué cachear (lecturas frecuentes, tolerancia a stale), cuánto TTL (según frescura), cómo invalidar (por evento o por TTL corto), y cómo proteger contra concurrencia (locks, fencing, stampede protection). Cada decisión tiene trade-offs que deben evaluarse con métricas reales: hit rate, latencia p95 y carga de BD.

**Cuándo usarlo / cuándo no.** Usa `@Cacheable` para datos de lectura frecuente con tolerancia a stale. Usa TTL corto cuando la frescura importa. Usa `@CacheEvict` en toda operación de escritura. Usa distributed lock para recursos mutables con escrituras concurrentes. Usa stampede protection para cachés de alta concurrencia. No caches datos de autenticación o seguridad. No uses lock sin expiry. No uses Write-Behind para datos financieros. No uses stampede protection para cachés de baja concurrencia.

**Pregunta de entrevista.** ¿Qué diferencia hay entre `@Cacheable` y `@CachePut`?  
**Respuesta modelo.** `@Cacheable` ejecuta el método solo en cache miss y almacena el resultado. `@CachePut` siempre ejecuta el método y actualiza el caché con el resultado. Usas `@CachePut` cuando necesitas el valor fresco del método pero quieres actualizar el caché (por ejemplo, después de un update que retorna el nuevo valor).

**Transferencia.**

1. **[NO-USAR-X]** Cachear el resultado de un endpoint de autenticación con TTL de 1 hora. Respuesta: **No cachear datos de auth**; la seguridad no tolera stale.
2. Un producto cambia de precio cada 5 minutos por una promoción dinámica. ¿Qué TTL y estrategia de invalidación usarías?
3. ¿Cómo invalidarías la caché de un producto si 3 servicios distintos pueden modificarlo?

## Checklist

- TTL configurado por caché según frescura requerida.
- `@CacheEvict` en toda operación de escritura.
- Lock con expiry para operaciones críticas.
- Fencing token para recursos mutables con escrituras concurrentes.
- Stampede protection para cachés de alta concurrencia.
- Hit rate medido con Micrometer.
- Verificación honesta cuando falta Redis/Spring Cache real.
