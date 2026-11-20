package academia.jpa;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/** Spring Data genera la implementación en el arranque: no escribes SQL para el CRUD. */
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByClienteOrderByIdAsc(String cliente);   // consulta derivada del nombre

    @EntityGraph(attributePaths = "lineas")                    // trae las líneas en el mismo SELECT (join)
    Optional<Pedido> findConLineasById(Long id);
}
