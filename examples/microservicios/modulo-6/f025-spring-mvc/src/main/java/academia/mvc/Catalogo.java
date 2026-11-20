package academia.mvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

/** Almacén en memoria (la persistencia real llega en F028). Seguro para varios hilos. */
@Service
public class Catalogo {
    private final Map<Long, Producto> productos = new ConcurrentHashMap<>();
    private final AtomicLong secuencia = new AtomicLong();

    public Producto crear(CrearProducto datos) {
        long id = secuencia.incrementAndGet();
        Producto nuevo = new Producto(id, datos.nombre(), datos.precio());
        productos.put(id, nuevo);
        return nuevo;
    }

    public Optional<Producto> buscar(long id) { return Optional.ofNullable(productos.get(id)); }

    public List<Producto> todos() { return List.copyOf(productos.values()); }
}
