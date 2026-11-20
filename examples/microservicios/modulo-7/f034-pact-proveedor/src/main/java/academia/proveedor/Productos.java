package academia.proveedor;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class Productos {

    private final Map<Long, Producto> filas = new ConcurrentHashMap<>();

    public Optional<Producto> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }

    public void guardar(Producto p) {
        filas.put(p.id(), p);
    }

    public void borrar(long id) {
        filas.remove(id);
    }
}
