package academia.redlock;

import java.util.List;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

/** El recurso compartido. Es ÉL quien comprueba el token: el cliente no puede saber que su candado caducó. */
@Component
public class AlmacenProtegido {

    private static final RedisScript<Long> ESCRIBIR = RedisScript.of("""
            local ultimo = tonumber(redis.call('GET', KEYS[2]) or '0')
            if tonumber(ARGV[1]) > ultimo then
              redis.call('SET', KEYS[2], ARGV[1])
              redis.call('SET', KEYS[1], ARGV[2])
              return 1
            end
            return 0
            """, Long.class);

    private final StringRedisTemplate redis;

    AlmacenProtegido(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** true si aceptó la escritura; false si el token es viejo. */
    public boolean escribir(String clave, String valor, long token) {
        Long r = redis.execute(ESCRIBIR, List.of(clave, clave + ":token"), String.valueOf(token), valor);
        return r != null && r == 1L;
    }

    /** Escritura SIN comprobación: lo que hace la mayoría del código que confía solo en el candado. */
    public void escribirSinFencing(String clave, String valor) {
        redis.opsForValue().set(clave, valor);
    }

    public String leer(String clave) {
        return redis.opsForValue().get(clave);
    }

    public void borrar(String clave) {
        redis.delete(List.of(clave, clave + ":token"));
    }
}
