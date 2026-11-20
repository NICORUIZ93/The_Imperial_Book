package academia.patrones;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

/**
 * READ-THROUGH: quien llama solo pide a la caché; la caché recibe el "cargador" y va a la base en un MISS.
 * Cache.get(clave, cargador) es la API de Spring para eso (es lo que usa @Cacheable(sync = true)).
 */
@Component
public class ReadThrough {

    private final Cache cache;
    private final BaseDeDatos bd;

    ReadThrough(CacheManager caches, BaseDeDatos bd) {
        this.cache = caches.getCache("productos");
        this.bd = bd;
    }

    public Producto obtener(long id) {
        return cache.get(id, () -> bd.leer(id));
    }
}
