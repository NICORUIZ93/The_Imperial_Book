package academia.stampede;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

/**
 * Si la clave no está, SOLO quien gana el candado "lock:<clave>" va a la base;
 * los demás esperan unos milisegundos y vuelven a mirar la caché.
 */
@Component
public class CargadorConCandado {

    private static final RedisScript<Long> LIBERAR = RedisScript.of(
            "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
            Long.class);
    private static final Duration TTL_CANDADO = Duration.ofSeconds(2);   // > lo que tarda la carga, < paciencia del cliente
    private static final Duration ESPERA = Duration.ofMillis(20);
    private static final Duration PACIENCIA = Duration.ofSeconds(5);

    private final StringRedisTemplate redis;

    CargadorConCandado(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public String obtener(String clave, Duration ttl, Supplier<String> cargar) {
        long limite = System.nanoTime() + PACIENCIA.toNanos();
        while (System.nanoTime() < limite) {
            String valor = redis.opsForValue().get(clave);
            if (valor != null) {
                return valor;                                           // HIT
            }
            String candado = "lock:" + clave;
            String yo = UUID.randomUUID().toString();
            if (Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(candado, yo, TTL_CANDADO))) {
                try {
                    valor = redis.opsForValue().get(clave);             // doble comprobación
                    if (valor == null) {
                        valor = cargar.get();
                        redis.opsForValue().set(clave, valor, conJitter(ttl));
                    }
                    return valor;
                } finally {
                    redis.execute(LIBERAR, List.of(candado), yo);
                }
            }
            dormir(ESPERA);                                             // perdí: espero y vuelvo a mirar
        }
        throw new IllegalStateException("La clave " + clave + " no se llenó en " + PACIENCIA.toSeconds() + " s");
    }

    /** TTL ± 10 %: claves creadas juntas no caducan juntas (evita la estampida sincronizada). */
    static Duration conJitter(Duration ttl) {
        long ms = ttl.toMillis();
        long delta = ms / 10;
        return Duration.ofMillis(ms - delta + ThreadLocalRandom.current().nextLong(2 * delta + 1));
    }

    private static void dormir(Duration d) {
        try {
            Thread.sleep(d);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
