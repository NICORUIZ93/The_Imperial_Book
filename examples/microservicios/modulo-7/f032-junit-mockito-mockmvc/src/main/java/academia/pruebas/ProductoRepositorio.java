package academia.pruebas;

import java.util.Optional;

/** El servicio depende de esta interfaz, no de una base concreta: por eso se puede simular con Mockito. */
public interface ProductoRepositorio {
    Optional<Producto> buscar(long id);

    void guardar(Producto producto);
}
