package academia.redlock;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Entrega un número que SIEMPRE crece (INCR es atómico). Quien obtiene el candado pide un token;
 * el almacén rechaza cualquier escritura con un token menor o igual al último que aceptó.
 * Aquí sale de un solo Redis por simplicidad; en producción conviene una fuente con consenso
 * (revisión de etcd, zxid de ZooKeeper o una secuencia de la propia base de datos).
 */
@Component
public class FencingTokens {

    private final StringRedisTemplate redis;

    FencingTokens(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public long siguiente(String recurso) {
        return redis.opsForValue().increment("fencing:" + recurso);
    }
}
