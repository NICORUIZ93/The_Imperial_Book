package academia.rutaflow.temporal;

import io.temporal.spring.boot.ActivityImpl;
import org.springframework.stereotype.Component;

@Component
@ActivityImpl(workers = "pedidos")
public class PedidoActivitiesImpl implements PedidoActivities {
    private final ActivityRecorder recorder;

    public PedidoActivitiesImpl(ActivityRecorder recorder) {
        this.recorder = recorder;
    }

    @Override public String reservarInventario(String pedidoId) {
        recorder.record("reservar:" + pedidoId);
        return "INV-" + pedidoId;
    }
    @Override public void liberarInventario(String pedidoId) { recorder.record("liberar-inventario:" + pedidoId); }
    @Override public String asignarRepartidor(String pedidoId) {
        recorder.record("asignar:" + pedidoId);
        return "REP-" + pedidoId;
    }
    @Override public void liberarRepartidor(String repartidorId) { recorder.record("liberar-repartidor:" + repartidorId); }
    @Override public void cobrar(String pedidoId, long centavos) { recorder.charge(pedidoId); }
    @Override public void devolverCobro(String pedidoId, long centavos) { recorder.record("devolver-cobro:" + pedidoId); }
    @Override public void notificar(String pedidoId) { recorder.notifyCustomer(pedidoId); }
}
