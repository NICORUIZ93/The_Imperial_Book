package academia.rutaflow.modulith.notificaciones;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class BandejaNotificaciones {
    private final List<String> avisos = new CopyOnWriteArrayList<>();

    void agregar(String pedidoId) {
        avisos.add("Pedido recibido: " + pedidoId);
    }

    public List<String> todos() {
        return List.copyOf(avisos);
    }
}
