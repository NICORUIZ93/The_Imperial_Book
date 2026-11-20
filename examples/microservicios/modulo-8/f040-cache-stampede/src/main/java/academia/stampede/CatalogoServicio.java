package academia.stampede;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CatalogoServicio {

    private static final Duration TTL = Duration.ofMinutes(5);
    private final StringRedisTemplate redis;
    private final BaseLenta base;
    private final CargadorConCandado cargador;

    CatalogoServicio(StringRedisTemplate redis, BaseLenta base, CargadorConCandado cargador) {
        this.redis = redis;
        this.base = base;
        this.cargador = cargador;
    }

    /** Cache-aside ingenuo: con la clave fría, TODAS las peticiones simultáneas van a la base. */
    public String sinProteccion(long id) {
        String clave = "catalogo::" + id;
        String valor = redis.opsForValue().get(clave);
        if (valor == null) {
            valor = base.descripcion(id);
            redis.opsForValue().set(clave, valor, TTL);
        }
        return valor;
    }

    /** Igual, pero la recarga pasa por el candado: una sola consulta a la base. */
    public String conCandado(long id) {
        return cargador.obtener("catalogo::" + id, TTL, () -> base.descripcion(id));
    }
}
