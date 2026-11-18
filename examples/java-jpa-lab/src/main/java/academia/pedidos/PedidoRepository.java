package academia.pedidos;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    @Query(value = "select new academia.pedidos.PedidoResumen(p.referencia, p.cliente.nombre) "
        + "from Pedido p where p.referencia like 'RT-PAGE-%' order by p.referencia",
        countQuery = "select count(p) from Pedido p where p.referencia like 'RT-PAGE-%'")
    Page<PedidoResumen> listarResumenes(Pageable pageable);
}
