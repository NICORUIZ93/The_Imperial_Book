package academia.redlock;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

/**
 * Redlock: el candado existe si se tomó en la MAYORÍA de N nodos Redis independientes
 * y aún queda tiempo de validez (algoritmo de https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/).
 * NO da fencing tokens: para eso está FencingTokens + AlmacenProtegido.
 */
public class Redlock implements AutoCloseable {

    /** Solo borra si el valor sigue siendo el MÍO: nunca suelto el candado de otro. */
    private static final RedisScript<Long> LIBERAR = RedisScript.of(
            "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
            Long.class);
    private static final double FACTOR_DERIVA = 0.01;   // 1 % del TTL + 2 ms por deriva de relojes

    private final List<LettuceConnectionFactory> fabricas = new ArrayList<>();
    private final List<StringRedisTemplate> nodos = new ArrayList<>();

    public Redlock(List<String> hostsYPuertos) {
        // Tiempos cortos: un nodo caído no debe comerse la validez del candado.
        LettuceClientConfiguration cliente = LettuceClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(100))
                .clientOptions(ClientOptions.builder()
                        .socketOptions(SocketOptions.builder().connectTimeout(Duration.ofMillis(100)).build())
                        .build())
                .build();
        for (String hp : hostsYPuertos) {
            String[] partes = hp.trim().split(":");
            var fabrica = new LettuceConnectionFactory(
                    new RedisStandaloneConfiguration(partes[0], Integer.parseInt(partes[1])), cliente);
            fabrica.afterPropertiesSet();
            fabrica.start();
            fabricas.add(fabrica);
            StringRedisTemplate plantilla = new StringRedisTemplate(fabrica);
            try {
                plantilla.execute((RedisCallback<String>) conexion -> conexion.ping());   // abre la conexión ya
            } catch (RuntimeException nodoCaido) {
                // se reintentará en cada adquirir(); cuenta como "no"
            }
            nodos.add(plantilla);
        }
    }

    public int quorum() {
        return nodos.size() / 2 + 1;
    }

    /** Intenta tomar el candado. Devuelve un Candado con valor null si no lo consiguió. */
    public Candado adquirir(String recurso, Duration ttl) {
        String valor = UUID.randomUUID().toString();
        long inicio = System.nanoTime();
        int aciertos = 0;
        for (StringRedisTemplate nodo : nodos) {
            try {
                // SET recurso valor NX PX ttl
                if (Boolean.TRUE.equals(nodo.opsForValue().setIfAbsent(recurso, valor, ttl))) {
                    aciertos++;
                }
            } catch (RuntimeException nodoCaido) {
                // un nodo que no responde cuenta como "no": seguimos con los demás
            }
        }
        long transcurridoMs = (System.nanoTime() - inicio) / 1_000_000;
        long validezMs = ttl.toMillis() - transcurridoMs - (long) (ttl.toMillis() * FACTOR_DERIVA) - 2;
        if (aciertos >= quorum() && validezMs > 0) {
            return new Candado(recurso, valor, aciertos, validezMs);
        }
        liberar(recurso, valor);                            // sin mayoría: deshaz lo parcial
        return new Candado(recurso, null, aciertos, 0);
    }

    /** Devuelve en cuántos nodos se borró el candado (0 si ya no era mío). */
    public int liberar(String recurso, String valor) {
        int liberados = 0;
        for (StringRedisTemplate nodo : nodos) {
            try {
                Long r = nodo.execute(LIBERAR, List.of(recurso), valor);
                liberados += r == null ? 0 : r.intValue();
            } catch (RuntimeException nodoCaido) {
                // el TTL lo borrará solo
            }
        }
        return liberados;
    }

    @Override
    public void close() {
        fabricas.forEach(LettuceConnectionFactory::destroy);
    }

    public record Candado(String recurso, String valor, int nodos, long validezMs) {
        public boolean adquirido() {
            return valor != null;
        }
    }
}
