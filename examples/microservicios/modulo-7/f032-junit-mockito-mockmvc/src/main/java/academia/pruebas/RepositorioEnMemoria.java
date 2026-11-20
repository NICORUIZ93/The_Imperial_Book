package academia.pruebas;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

@Repository
class RepositorioEnMemoria implements ProductoRepositorio {

    private final Map<Long, Producto> filas = new ConcurrentHashMap<>(Map.of(
            1L, new Producto(1, "Teclado", 100, 5)));

    @Override
    public Optional<Producto> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }

    @Override
    public void guardar(Producto producto) {
        filas.put(producto.id(), producto);
    }
}
