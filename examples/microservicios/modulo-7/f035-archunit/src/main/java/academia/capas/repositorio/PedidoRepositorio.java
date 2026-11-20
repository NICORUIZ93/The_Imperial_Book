package academia.capas.repositorio;

import java.util.Optional;

import academia.capas.modelo.Pedido;

public interface PedidoRepositorio {
    Optional<Pedido> buscar(long id);
}
