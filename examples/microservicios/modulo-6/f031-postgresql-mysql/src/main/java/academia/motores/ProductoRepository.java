package academia.motores;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findBySku(String sku);
    long countByNombre(String nombre);
}
