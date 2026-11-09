package academia.rutaflow.scheduling;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PedidosScheduler {
    private final RevisionPedidos revision;

    public PedidosScheduler(RevisionPedidos revision) {
        this.revision = revision;
    }

    @Scheduled(fixedDelayString = "${app.revision.delay-ms}",
               initialDelayString = "${app.revision.initial-delay-ms}")
    public void revisarPendientes() {
        revision.marcarVencidos();
    }
}
