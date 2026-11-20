package academia.cache;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class ProductoServicio {

    private final RepositorioLento repositorio;

    public ProductoServicio(RepositorioLento repositorio) {
        this.repositorio = repositorio;
    }

    /** 1.ª llamada: MISS -> va al repositorio y guarda en Redis la clave "productos::<id>". Siguientes: HIT. */
    @Cacheable(cacheNames = "productos", key = "#id")
    public Producto buscar(long id) {
        return repositorio.buscar(id);
    }

    /** Cambia el precio y BORRA la entrada: la próxima lectura recarga el valor nuevo. */
    @CacheEvict(cacheNames = "productos", key = "#id")
    public void cambiarPrecio(long id, int precio) {
        Producto actual = repositorio.buscar(id);
        repositorio.guardar(new Producto(id, actual.nombre(), precio));
    }

    /** Caché con TTL propio de 2 s (CacheConfig). La clave es "ofertas::SimpleKey []" (método sin parámetros). */
    @Cacheable(cacheNames = "ofertas")
    public Producto ofertaDelDia() {
        return repositorio.buscar(2);
    }
}
