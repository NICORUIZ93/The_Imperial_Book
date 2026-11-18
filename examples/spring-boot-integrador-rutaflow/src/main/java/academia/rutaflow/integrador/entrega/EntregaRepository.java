package academia.rutaflow.integrador.entrega;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EntregaRepository extends JpaRepository<Entrega, Long> {
    boolean existsByDestinatario(String destinatario);
}
