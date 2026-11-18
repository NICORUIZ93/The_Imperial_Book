package academia.rutaflow.temporal;

import io.temporal.activity.ActivityInterface;

@ActivityInterface
public interface PedidoActivities {
    String reservarInventario(String pedidoId);
    void liberarInventario(String pedidoId);
    String asignarRepartidor(String pedidoId);
    void liberarRepartidor(String repartidorId);
    void cobrar(String pedidoId, long centavos);
    void devolverCobro(String pedidoId, long centavos);
    void notificar(String pedidoId);
}
