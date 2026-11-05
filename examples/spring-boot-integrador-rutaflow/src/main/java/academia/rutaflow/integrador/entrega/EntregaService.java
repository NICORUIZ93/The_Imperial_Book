package academia.rutaflow.integrador.entrega;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntregaService {
    private final EntregaRepository entregas;

    public EntregaService(EntregaRepository entregas) {
        this.entregas = entregas;
    }

    @Transactional
    public Entrega crear(String destinatario) {
        return entregas.save(Entrega.crear(destinatario));
    }
}
