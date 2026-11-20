package academia.patrones;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;

/** WRITE-THROUGH: la escritura termina cuando la base Y la caché tienen el valor nuevo. */
@Component
public class WriteThrough {

    private final Cache cache;
    private final BaseDeDatos bd;

    WriteThrough(CacheManager caches, BaseDeDatos bd) {
        this.cache = caches.getCache("productos");
        this.bd = bd;
    }

    public void cambiarPrecio(long id, int precio) {
        bd.cambiarPrecio(id, precio);                   // 1. fuente de verdad primero
        Producto actual = bd.leer(id);
        cache.put(id, actual);                          // 2. caché sincronizada antes de responder
    }
}
