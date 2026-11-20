package academia.capas.repositorio;

import java.util.Map;
import java.util.Optional;

import academia.capas.modelo.Pedido;
import org.springframework.stereotype.Repository;

@Repository
class PedidoRepositorioEnMemoria implements PedidoRepositorio {

    private final Map<Long, Pedido> filas = Map.of(1L, new Pedido(1, "Ana", 900));

    @Override
    public Optional<Pedido> buscar(long id) {
        return Optional.ofNullable(filas.get(id));
    }
}
