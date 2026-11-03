package academia.pedidos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("select p from Pedido p where p.cliente.id = :clienteId order by p.referencia")
    List<Pedido> listarPorCliente(long clienteId);

    @EntityGraph(attributePaths = "cliente")
    List<Pedido> findAllWithClienteByOrderByReferenciaAsc();

    @EntityGraph(attributePaths = "cliente")
    Optional<Pedido> findByReferencia(String referencia);
}
