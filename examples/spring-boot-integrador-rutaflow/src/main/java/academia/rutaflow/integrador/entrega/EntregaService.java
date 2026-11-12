package academia.rutaflow.integrador.entrega;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntregaService {
    private final EntregaRepository entregas;
    private final Counter entregasCreadas;

    public EntregaService(EntregaRepository entregas, MeterRegistry registry) {
        this.entregas = entregas;
        this.entregasCreadas = Counter.builder("entregas.creadas")
            .description("Entregas creadas correctamente")
            .register(registry);
    }

    @Transactional
    public Entrega crear(String destinatario) {
        Entrega creada = entregas.save(Entrega.crear(destinatario));
        entregasCreadas.increment();
        return creada;
    }
}
