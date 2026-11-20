package academia.patrones;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * WRITE-BEHIND (write-back): la escritura va a la caché y a una cola (Redis Stream "cola:precios");
 * un trabajador programado vacía la cola en lotes hacia PostgreSQL.
 */
@Component
public class WriteBehind {

    static final String COLA = "cola:precios";
    private final Cache cache;
    private final BaseDeDatos bd;
    private final StringRedisTemplate redis;

    WriteBehind(CacheManager caches, BaseDeDatos bd, StringRedisTemplate redis) {
        this.cache = caches.getCache("productos");
        this.bd = bd;
        this.redis = redis;
    }

    public void cambiarPrecio(long id, String nombre, int precio) {
        cache.put(id, new Producto(id, nombre, precio));                       // el lector ya ve el valor nuevo
        redis.opsForStream().add(COLA, Map.of("id", String.valueOf(id), "precio", String.valueOf(precio)));
    }

    /** Lee toda la cola, se queda con el ÚLTIMO precio de cada producto y escribe un solo lote. */
    @Scheduled(fixedDelayString = "${write-behind.intervalo-ms}")
    public int vaciarCola() {
        List<MapRecord<String, Object, Object>> pendientes = redis.opsForStream().range(COLA, Range.unbounded());
        if (pendientes == null || pendientes.isEmpty()) {
            return 0;
        }
        Map<Long, Integer> ultimos = new LinkedHashMap<>();
        for (MapRecord<String, Object, Object> r : pendientes) {
            ultimos.put(Long.valueOf((String) r.getValue().get("id")), Integer.valueOf((String) r.getValue().get("precio")));
        }
        bd.cambiarPrecios(ultimos);                                              // si falla, la cola sigue intacta
        redis.opsForStream().delete(COLA, pendientes.stream().map(MapRecord::getId).toArray(RecordId[]::new));
        return pendientes.size();
    }
}
