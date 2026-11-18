package academia.rutaflow.scheduling;

import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;

@Service
public class RevisionPedidos {
    private final AtomicInteger ejecuciones = new AtomicInteger();

    public void marcarVencidos() {
        ejecuciones.incrementAndGet();
    }

    int ejecuciones() {
        return ejecuciones.get();
    }
}
